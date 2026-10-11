import crypto from 'node:crypto';
import { analyticsStore, linksStore } from './storage.mjs';

/**
 * Filter out obvious automated bots from analytics
 */
export function isBotTraffic(userAgent = '') {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes('bot') ||
    ua.includes('crawl') ||
    ua.includes('spider') ||
    ua.includes('slurp') ||
    ua.includes('facebookexternalhit') ||
    ua.includes('twitterbot') ||
    ua.includes('headless') ||
    ua.includes('postman') ||
    ua.includes('curl') ||
    ua.includes('wget')
  );
}

/**
 * Concurrency-safe event recorder.
 * Writes an append-only unique event blob. Zero read-modify-write lost updates.
 */
export async function recordEvent(eventType, code, reqHeaders = {}) {
  const ua = reqHeaders['user-agent'] || reqHeaders['User-Agent'] || '';
  if (isBotTraffic(ua)) {
    return { recorded: false, reason: 'bot' };
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const eventId = crypto.randomUUID();
  const key = `event:${dateStr}:${eventType}:${code}:${eventId}`;

  const eventPayload = {
    id: eventId,
    type: eventType, // 'visit' | 'step2' | 'redirect'
    code,
    timestamp: now.toISOString(),
    date: dateStr
  };

  try {
    await analyticsStore.set(key, eventPayload);

    // Also update cached link record asynchronously if link exists
    // (tolerant of concurrent updates as event log is the authoritative source)
    updateLinkQuickStats(code, eventType, dateStr).catch(() => {});

    return { recorded: true, id: eventId };
  } catch (err) {
    console.error(`Failed to record analytics event ${eventType} for ${code}:`, err);
    return { recorded: false, error: err.message };
  }
}

/**
 * Asynchronously update link counters for fast UI presentation
 */
async function updateLinkQuickStats(code, eventType, dateStr) {
  try {
    const link = await linksStore.get(`link:${code}`);
    if (!link) return;

    if (eventType === 'visit') {
      link.totalVisits = (link.totalVisits || 0) + 1;
      const lastDate = link.lastVisitedAt ? link.lastVisitedAt.split('T')[0] : null;
      if (lastDate === dateStr) {
        link.todayVisits = (link.todayVisits || 0) + 1;
      } else {
        link.todayVisits = 1;
      }
      link.lastVisitedAt = new Date().toISOString();
    } else if (eventType === 'step2') {
      link.step2Visits = (link.step2Visits || 0) + 1;
    } else if (eventType === 'redirect') {
      link.redirects = (link.redirects || 0) + 1;
    }

    await linksStore.set(`link:${code}`, link);
  } catch (err) {
    // Non-critical, as event log is canonical
  }
}

/**
 * Get daily rollup summary. If cached, returns cached. Otherwise aggregates events.
 */
export async function getDailySummary(dateStr, isToday = false) {
  const cacheKey = `summary:${dateStr}`;

  if (!isToday) {
    const cached = await analyticsStore.get(cacheKey);
    if (cached) return cached;
  }

  // Aggregate by scanning all events for this date
  const events = await analyticsStore.list({ prefix: `event:${dateStr}:` });
  let totalVisits = 0;
  let step1Visits = 0;
  let step2Visits = 0;
  let redirects = 0;
  const linkVisits = {};

  for (const blob of events) {
    // key format: event:YYYY-MM-DD:type:code:uuid
    const parts = blob.key.split(':');
    if (parts.length >= 5) {
      const type = parts[2];
      const code = parts[3];

      if (type === 'visit') {
        step1Visits++;
        totalVisits++;
        linkVisits[code] = (linkVisits[code] || 0) + 1;
      } else if (type === 'step2') {
        step2Visits++;
      } else if (type === 'redirect') {
        redirects++;
      }
    }
  }

  const summary = {
    date: dateStr,
    totalVisits,
    step1Visits,
    step2Visits,
    redirects,
    linkVisits,
    aggregatedAt: new Date().toISOString()
  };

  // If past date, cache the rollup so subsequent queries are instant
  if (!isToday && events.length > 0) {
    await analyticsStore.set(cacheKey, summary).catch(() => {});
  }

  return summary;
}

/**
 * Get aggregated analytics across the last N days
 */
export async function getAggregatedAnalytics(days = 7) {
  const now = new Date();
  const dates = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const todayStr = dates[0];
  const summaries = await Promise.all(
    dates.map((dateStr) => getDailySummary(dateStr, dateStr === todayStr))
  );

  let grandTotalVisits = 0;
  let grandTotalStep1 = 0;
  let grandTotalStep2 = 0;
  let grandTotalRedirects = 0;
  let todayVisits = 0;
  const globalLinkCounts = {};

  const dailyTrend = [];

  for (const s of summaries) {
    grandTotalVisits += s.totalVisits || 0;
    grandTotalStep1 += s.step1Visits || 0;
    grandTotalStep2 += s.step2Visits || 0;
    grandTotalRedirects += s.redirects || 0;

    if (s.date === todayStr) {
      todayVisits = s.totalVisits || 0;
    }

    dailyTrend.unshift({
      date: s.date,
      visits: s.totalVisits || 0,
      step2: s.step2Visits || 0,
      redirects: s.redirects || 0
    });

    if (s.linkVisits) {
      for (const [code, count] of Object.entries(s.linkVisits)) {
        globalLinkCounts[code] = (globalLinkCounts[code] || 0) + count;
      }
    }
  }

  return {
    todayVisits,
    last7DaysVisits: grandTotalVisits,
    funnel: {
      step1Visits: grandTotalStep1,
      step2Visits: grandTotalStep2,
      redirects: grandTotalRedirects,
      conversionRate: grandTotalStep1 > 0 ? Math.round((grandTotalRedirects / grandTotalStep1) * 100) : 0
    },
    dailyTrend,
    globalLinkCounts
  };
}
