import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  ArrowRight,
  ShieldCheck,
  Download,
  RefreshCw,
  ExternalLink,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  function handleExportCsv() {
    if (!data) return;
    const topLinks = data.topLinks || [];
    const headers = ['Short Code', 'Title', 'Destination URL', 'Total Visits', 'Today Visits', 'Status'];
    const rows = topLinks.map((l) => [
      l.code,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${l.destinationUrl.replace(/"/g, '""')}"`,
      l.totalVisits || 0,
      l.todayVisits || 0,
      l.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `movieshouse4u_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Analytics exported to CSV', 'success');
  }

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
        <RefreshCw className="spin" size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '0.75rem' }}>Loading analytics metrics...</span>
      </div>
    );
  }

  const overview = data?.overview || {};
  const funnel = data?.funnel || { step1Visits: 0, step2Visits: 0, redirects: 0, conversionRate: 0 };
  const dailyTrend = data?.dailyTrend || [];
  const topLinks = data?.topLinks || [];

  // Find max visit value for SVG chart scaling
  const maxVisits = Math.max(1, ...dailyTrend.map((d) => d.visits));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Click & Funnel Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Genuine visit tracking, multi-step progression funnel, and traffic distribution.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchAnalytics} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Data</span>
          </button>
          <button onClick={handleExportCsv} className="btn btn-secondary btn-sm">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Monetization Funnel Progression */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--primary)" />
          Visitor Monetization Funnel
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
          Real progression breakdown through interstitial countdown steps to asset destination
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{
            background: 'var(--bg-card-sub)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Step 1: Interstitial Views
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.25rem 0' }}>
              {funnel.step1Visits}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#F87171' }}>
              100% Top of Funnel
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card-sub)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Step 2: Progressions
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F87171', margin: '0.25rem 0' }}>
              {funnel.step2Visits}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Completed step 1 countdown
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card-sub)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Outbound Asset Redirects
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', margin: '0.25rem 0' }}>
              {funnel.redirects}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Arrived at destination URL
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card-sub)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Overall Completion Rate
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38BDF8', margin: '0.25rem 0' }}>
              {funnel.conversionRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Finished all interstitial steps
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Traffic Trend Chart */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} color="var(--primary)" />
          7-Day Traffic Trend
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
          Daily visitor counts recorded across all active short links
        </p>

        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          {dailyTrend.map((day) => {
            const heightPercent = maxVisits > 0 ? Math.max(8, (day.visits / maxVisits) * 100) : 8;
            return (
              <div
                key={day.date}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  gap: '0.5rem'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {day.visits}
                </div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '48px',
                    height: `${heightPercent}%`,
                    backgroundColor: day.visits > 0 ? 'var(--primary)' : 'var(--bg-card-sub)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.4s ease',
                    boxShadow: day.visits > 0 ? '0 0 12px var(--primary-glow)' : 'none'
                  }}
                  title={`${day.date}: ${day.visits} visits, ${day.redirects} redirects`}
                />
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                  {day.date.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Links Table */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '0.375rem' }}>Top Performing Links</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
          Leaderboard ranked by total recorded visitor traffic
        </p>

        {topLinks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No traffic recorded on any link yet.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Title & Short Code</th>
                  <th>Destination URL</th>
                  <th>Today Clicks</th>
                  <th>Total Clicks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topLinks.map((link, index) => (
                  <tr key={link.code}>
                    <td style={{ fontWeight: 800, color: index < 3 ? '#F87171' : 'var(--text-dim)' }}>
                      #{index + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{link.title}</div>
                      <code style={{ color: '#F87171', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                        /{link.code}
                      </code>
                    </td>
                    <td>
                      <a
                        href={link.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.8125rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          maxWidth: '260px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>{link.destinationUrl}</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {link.todayVisits || 0}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                        {link.totalVisits || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${link.status === 'active' ? 'badge-active' : 'badge-disabled'}`}>
                        {link.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
