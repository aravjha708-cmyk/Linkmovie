import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Globe,
  Shield,
  Layers,
  FileText,
  KeyRound,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [settings, setSettings] = useState({
    websiteName: 'MoviesHouse4u',
    tagline: 'Links of MoviesHouse4u - HD Movie Download Gateway',
    brandColor: '#E50914',
    defaultCountdownStep1: 10,
    defaultCountdownStep2: 8,
    defaultFlowType: 'two-step',
    termsContent: '',
    privacyContent: ''
  });

  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getSettings();
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        addToast(err.message || 'Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.saveSettings(settings);
      if (res.success) {
        addToast('MoviesHouse4u configuration saved to Netlify Blobs', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleExportJson() {
    setExporting(true);
    try {
      const res = await api.getLinks({ limit: 1000 });
      if (res.success) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.links, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `movieshouse4u_links_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        addToast('Exported all link records as JSON backup', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  }

  async function handleExportCsv() {
    setExporting(true);
    try {
      const res = await api.getLinks({ limit: 1000 });
      if (res.success) {
        const headers = ['Code', 'Title', 'Destination URL', 'Flow Type', 'Status', 'Total Visits', 'Today Visits', 'Created At'];
        const rows = res.links.map((l) => [
          l.code,
          `"${(l.title || '').replace(/"/g, '""')}"`,
          `"${l.destinationUrl.replace(/"/g, '""')}"`,
          l.flowType,
          l.status,
          l.totalVisits || 0,
          l.todayVisits || 0,
          l.createdAt
        ]);
        const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csv));
        link.setAttribute('download', `movieshouse4u_links_backup_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        addToast('Exported links as CSV', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Platform Settings</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Branding, global countdown defaults, terms, custom domains, and data backups.
          </p>
        </div>
        <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
          <Save size={14} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave}>
        {/* Branding & Appearance */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} color="var(--primary)" />
            Branding & Appearance
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
            Displayed on public interstitial pages and visitor headers
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Platform Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.websiteName}
                onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subheading / Tagline</label>
              <input
                type="text"
                className="form-input"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Accent Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={settings.brandColor}
                  onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                  style={{ width: '42px', height: '38px', padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={settings.brandColor}
                  onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Defaults */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--primary)" />
            Default Link Monetization Behavior
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
            Default values prefilled when creating new short links
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Default Flow Type</label>
              <select
                className="form-select"
                value={settings.defaultFlowType}
                onChange={(e) => setSettings({ ...settings, defaultFlowType: e.target.value })}
              >
                <option value="one-step">One-step Flow (1 countdown)</option>
                <option value="two-step">Two-step Flow (2 countdowns)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Step 1 Countdown (Seconds)</label>
              <input
                type="number"
                min="3"
                max="60"
                className="form-input"
                value={settings.defaultCountdownStep1}
                onChange={(e) => setSettings({ ...settings, defaultCountdownStep1: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Step 2 Countdown (Seconds)</label>
              <input
                type="number"
                min="3"
                max="60"
                className="form-input"
                value={settings.defaultCountdownStep2}
                onChange={(e) => setSettings({ ...settings, defaultCountdownStep2: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Terms & Privacy Policies */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--primary)" />
            Terms of Service & Privacy Disclosure
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
            Shown at the bottom of public interstitial pages for regulatory and network compliance
          </p>

          <div className="form-group">
            <label className="form-label">Terms of Service Notice</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={settings.termsContent}
              onChange={(e) => setSettings({ ...settings, termsContent: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Privacy Policy Statement</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={settings.privacyContent}
              onChange={(e) => setSettings({ ...settings, privacyContent: e.target.value })}
            />
          </div>
        </div>

        {/* Data Export & Backup */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} color="var(--primary)" />
            Database Backup & Link Export
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
            Export all stored links and settings to portable JSON or CSV files for disaster recovery or migration.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleExportJson}
              className="btn btn-secondary"
              disabled={exporting}
            >
              <Download size={14} />
              <span>Export Full JSON Backup</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="btn btn-secondary"
              disabled={exporting}
            >
              <Download size={14} />
              <span>Export Links as CSV</span>
            </button>
          </div>
        </div>

        {/* Custom Domain Instructions */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} color="var(--primary)" />
            Custom Domain & Netlify Configuration
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            Instructions for connecting your custom branding domain (e.g., <code>go.yourbrand.com</code>)
          </p>

          <div style={{
            background: 'var(--bg-input)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6
          }}>
            <div>1. In Netlify Dashboard, navigate to <strong>Site configuration &gt; Domain management</strong>.</div>
            <div>2. Click <strong>Add a custom domain</strong> and enter your custom hostname.</div>
            <div>3. Point your DNS CNAME record: <code>CNAME go -&gt; your-site-name.netlify.app</code>.</div>
            <div>4. Automatic SSL / TLS certificates are provisioned for free via Let's Encrypt within minutes.</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
