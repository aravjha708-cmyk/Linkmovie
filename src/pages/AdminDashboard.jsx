import React, { useState, useEffect } from 'react';
import {
  Link2,
  MousePointerClick,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  Copy,
  ExternalLink,
  PlusCircle,
  Film,
  Clapperboard,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function AdminDashboard({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [quickUrl, setQuickUrl] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const { addToast } = useToast();

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function handleQuickShorten(e) {
    e.preventDefault();
    if (!quickUrl) return;

    setQuickLoading(true);
    try {
      const res = await api.createLink({
        destinationUrl: quickUrl,
        title: quickTitle || 'Movie Download Link'
      });
      if (res.success) {
        addToast(`Short movie link created: /${res.link.code}`, 'success');
        setQuickUrl('');
        setQuickTitle('');
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create short link', 'error');
    } finally {
      setQuickLoading(false);
    }
  }

  function copyToClipboard(text) {
    const fullUrl = `${window.location.origin}/${text}`;
    navigator.clipboard.writeText(fullUrl);
    addToast(`Copied short link to clipboard: ${fullUrl}`, 'success');
  }

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
        <RefreshCw className="spin" size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '0.75rem' }}>Loading MoviesHouse4u analytics...</span>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const overview = data?.overview || {
    totalLinks: 0,
    activeLinks: 0,
    disabledLinks: 0,
    expiredLinks: 0,
    totalVisits: 0,
    todayVisits: 0,
    last7DaysVisits: 0
  };

  const recentLinks = data?.recentLinks || [];

  return (
    <div>
      {/* Metric Cards Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Total Movie Links</span>
            <Film size={16} color="var(--primary)" />
          </div>
          <div className="stat-value">{overview.totalLinks}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            All-time short links generated
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Total Visits</span>
            <MousePointerClick size={16} color="#F87171" />
          </div>
          <div className="stat-value">{overview.totalVisits}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Total visitor interactions
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Visits Today</span>
            <Clock size={16} color="var(--success)" />
          </div>
          <div className="stat-value">{overview.todayVisits}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Recorded today (UTC)
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Last 7 Days</span>
            <Calendar size={16} color="#FCA5A5" />
          </div>
          <div className="stat-value">{overview.last7DaysVisits}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Trailing 7-day traffic
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Active Links</span>
            <CheckCircle2 size={16} color="var(--success)" />
          </div>
          <div className="stat-value">{overview.activeLinks}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Currently available
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Disabled / Expired</span>
            <XCircle size={16} color="var(--warning)" />
          </div>
          <div className="stat-value">{overview.disabledLinks + overview.expiredLinks}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Non-monetizing links
          </div>
        </div>
      </div>

      {/* Quick Shorten Bar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clapperboard size={18} color="var(--primary)" />
          Quick Movie Link Shortener
        </h3>
        <form onSubmit={handleQuickShorten} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <input
            type="url"
            className="form-input"
            placeholder="Paste destination movie URL (e.g. https://drive.google.com/file/... or https://mirror.com/movie.mkv)..."
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
            required
            style={{ flex: '2', minWidth: '260px' }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Movie Title (e.g. Inception 2010 1080p BluRay)..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            style={{ flex: '1', minWidth: '180px' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={quickLoading}
            style={{ minWidth: '140px' }}
          >
            {quickLoading ? 'Shortening...' : 'Shorten Movie Link'}
          </button>
        </form>
      </div>

      {/* Recent Links Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.0625rem' }}>Recent Movie Links</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Latest links created and real-time click volume
            </p>
          </div>
          <button
            onClick={() => onNavigate('links')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <span>View All Links</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentLinks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Film size={36} color="var(--border-light)" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              No movie links created yet
            </div>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
              Paste your first movie download link above to start generating monetized short links!
            </p>
            <button onClick={() => onNavigate('create')} className="btn btn-primary btn-sm">
              Create First Movie Link
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Movie Title & Short Link</th>
                  <th>Destination URL</th>
                  <th>Total Clicks</th>
                  <th>Today Clicks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentLinks.map((link) => (
                  <tr key={link.code}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{link.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <code style={{ color: '#F87171', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                          /{link.code}
                        </code>
                        <span className="badge badge-step" style={{ fontSize: '0.6875rem', padding: '0.1rem 0.4rem' }}>
                          {link.flowType || 'two-step'}
                        </span>
                      </div>
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
                          gap: '0.375rem',
                          maxWidth: '260px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={link.destinationUrl}
                      >
                        <span>{link.destinationUrl}</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {link.totalVisits || 0}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {link.todayVisits || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${link.status === 'active' ? 'badge-active' : 'badge-disabled'}`}>
                        {link.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => copyToClipboard(link.code)}
                          className="btn btn-secondary btn-sm"
                          title="Copy Public Short Link"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Copy size={13} />
                        </button>
                        <a
                          href={`/${link.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Open Interstitial Page"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
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
