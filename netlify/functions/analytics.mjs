import { authenticateRequest } from './lib/auth.mjs';
import { getAggregatedAnalytics } from './lib/analytics.mjs';
import { linksStore } from './lib/storage.mjs';
import {
  jsonResponse,
  errorResponse,
  getNormalizedHeaders
} from './lib/handler-helper.mjs';

export default async function handler(req) {
  const headers = getNormalizedHeaders(req);
  const auth = await authenticateRequest({ headers });
  if (!auth.authenticated) {
    return errorResponse(auth.error, 401);
  }

  // Fetch all links to calculate link status breakdown
  const blobList = await linksStore.list({ prefix: 'link:' });
  let totalLinks = 0;
  let activeLinks = 0;
  let disabledLinks = 0;
  let expiredLinks = 0;
  const linkList = [];

  const now = Date.now();
  for (const item of blobList) {
    const link = await linksStore.get(item.key);
    if (link) {
      totalLinks++;
      const isExpired = link.expiresAt && new Date(link.expiresAt).getTime() < now;
      if (isExpired) {
        expiredLinks++;
      } else if (link.status === 'disabled') {
        disabledLinks++;
      } else {
        activeLinks++;
      }
      linkList.push(link);
    }
  }

  // Get aggregated event stats for the last 7 days
  const analyticsData = await getAggregatedAnalytics(7);

  // Calculate top links
  linkList.sort((a, b) => (b.totalVisits || 0) - (a.totalVisits || 0));
  const topLinks = linkList.slice(0, 10).map((l) => ({
    code: l.code,
    title: l.title,
    destinationUrl: l.destinationUrl,
    totalVisits: l.totalVisits || 0,
    todayVisits: l.todayVisits || 0,
    status: l.status,
    createdAt: l.createdAt
  }));

  // Calculate recent activity
  const recentLinks = [...linkList]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  // Overall visits count
  const allTimeVisits = linkList.reduce((sum, l) => sum + (l.totalVisits || 0), 0);

  return jsonResponse({
    success: true,
    overview: {
      totalLinks,
      activeLinks,
      disabledLinks,
      expiredLinks,
      totalVisits: Math.max(allTimeVisits, analyticsData.last7DaysVisits),
      todayVisits: analyticsData.todayVisits,
      last7DaysVisits: analyticsData.last7DaysVisits
    },
    funnel: analyticsData.funnel,
    dailyTrend: analyticsData.dailyTrend,
    topLinks,
    recentLinks
  });
}
