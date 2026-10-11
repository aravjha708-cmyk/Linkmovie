import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldAlert,
  Code,
  Image,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import AdSlotRenderer from '../components/AdSlotRenderer';

export default function AdsSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ads, setAds] = useState({
    step1: { enabled: false, title: 'Step 1 Sponsor', type: 'banner', bannerUrl: '', targetUrl: '', html: '' },
    step2: { enabled: false, title: 'Step 2 Sponsor', type: 'banner', bannerUrl: '', targetUrl: '', html: '' },
    banner: { enabled: false, title: 'Site Banner', type: 'banner', bannerUrl: '', targetUrl: '', html: '' }
  });
  const [activePreview, setActivePreview] = useState('step1');
  const { addToast } = useToast();

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getSettings();
        if (res.success && res.settings?.ads) {
          setAds(res.settings.ads);
        }
      } catch (err) {
        addToast(err.message || 'Failed to load ad configuration', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.saveSettings({ ads });
      if (res.success) {
        addToast('Ad placement settings saved successfully', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  function updateSlot(slotKey, field, value) {
    setAds((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        [field]: value
      }
    }));
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading ad settings...</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Advertisement Placements</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Configure monetization slots for Step 1, Step 2, and interstitial banners.
          </p>
        </div>
        <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
          <Save size={14} />
          <span>{saving ? 'Saving...' : 'Save Ad Settings'}</span>
        </button>
      </div>

      {/* Compliance Guidelines Alert */}
      <div style={{
        background: 'rgba(229, 9, 20, 0.08)',
        border: '1px solid rgba(229, 9, 20, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <ShieldAlert size={20} color="#E50914" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
            Ad Network Policy Compliance & Sandbox Security
          </strong>
          Advertisements are rendered in an isolated sandbox. Never disguise advertisements as download buttons or force automatic clicks. Distinct "Sponsored / Advertisement" labeling is automatically attached.
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Step 1 Ad Slot */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Step 1 Advertisement Slot</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Displayed on the primary countdown interstitial page
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={ads.step1.enabled}
                onChange={(e) => updateSlot('step1', 'enabled', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              <span>{ads.step1.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          {ads.step1.enabled && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Sponsor Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={ads.step1.title || ''}
                    onChange={(e) => updateSlot('step1', 'title', e.target.value)}
                    placeholder="e.g. Recommended Cloud Storage"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Slot Type</label>
                  <select
                    className="form-select"
                    value={ads.step1.type}
                    onChange={(e) => updateSlot('step1', 'type', e.target.value)}
                  >
                    <option value="banner">Image Banner (URL + Target Link)</option>
                    <option value="html">Custom HTML / Ad Network Script</option>
                  </select>
                </div>
              </div>

              {ads.step1.type === 'banner' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Banner Image URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={ads.step1.bannerUrl || ''}
                      onChange={(e) => updateSlot('step1', 'bannerUrl', e.target.value)}
                      placeholder="https://example.com/banner.png"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination Landing URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={ads.step1.targetUrl || ''}
                      onChange={(e) => updateSlot('step1', 'targetUrl', e.target.value)}
                      placeholder="https://sponsor.com/offer"
                    />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">
                    <span>Ad Network Code Snippet</span>
                    <span className="form-help">Executed inside a sandboxed iframe</span>
                  </label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    value={ads.step1.html || ''}
                    onChange={(e) => updateSlot('step1', 'html', e.target.value)}
                    placeholder="<script>...</script> or ad network iframe code"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2 Ad Slot */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Step 2 Advertisement Slot</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Displayed during the second countdown for 2-step flows
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={ads.step2.enabled}
                onChange={(e) => updateSlot('step2', 'enabled', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              <span>{ads.step2.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          {ads.step2.enabled && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Sponsor Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={ads.step2.title || ''}
                    onChange={(e) => updateSlot('step2', 'title', e.target.value)}
                    placeholder="e.g. Free Developer Tools"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Slot Type</label>
                  <select
                    className="form-select"
                    value={ads.step2.type}
                    onChange={(e) => updateSlot('step2', 'type', e.target.value)}
                  >
                    <option value="banner">Image Banner (URL + Target Link)</option>
                    <option value="html">Custom HTML / Ad Network Script</option>
                  </select>
                </div>
              </div>

              {ads.step2.type === 'banner' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Banner Image URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={ads.step2.bannerUrl || ''}
                      onChange={(e) => updateSlot('step2', 'bannerUrl', e.target.value)}
                      placeholder="https://example.com/banner-step2.png"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination Landing URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={ads.step2.targetUrl || ''}
                      onChange={(e) => updateSlot('step2', 'targetUrl', e.target.value)}
                      placeholder="https://sponsor.com/deal"
                    />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Ad Network Code Snippet</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    value={ads.step2.html || ''}
                    onChange={(e) => updateSlot('step2', 'html', e.target.value)}
                    placeholder="<script>...</script> or ad network tag"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Banner Slot (Sitewide Bottom Banner) */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Sitewide Footer Banner Slot</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Displayed below the countdown button on all interstitial pages
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={ads.banner.enabled}
                onChange={(e) => updateSlot('banner', 'enabled', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              <span>{ads.banner.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          {ads.banner.enabled && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Banner Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={ads.banner.bannerUrl || ''}
                    onChange={(e) => updateSlot('banner', 'bannerUrl', e.target.value)}
                    placeholder="https://example.com/footer-banner.png"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={ads.banner.targetUrl || ''}
                    onChange={(e) => updateSlot('banner', 'targetUrl', e.target.value)}
                    placeholder="https://sponsor.com"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Placement Sandbox Preview */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={18} color="var(--primary)" />
              Sandboxed Ad Slot Preview
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${activePreview === 'step1' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActivePreview('step1')}
              >
                Step 1 Slot
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activePreview === 'step2' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActivePreview('step2')}
              >
                Step 2 Slot
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activePreview === 'banner' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActivePreview('banner')}
              >
                Footer Banner
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <AdSlotRenderer adConfig={ads[activePreview]} slotName={activePreview.toUpperCase()} isPreview={true} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save All Ad Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
