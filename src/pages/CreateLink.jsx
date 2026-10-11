import React, { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  Copy,
  ExternalLink,
  PlusCircle,
  Clock,
  Sparkles,
  Layers,
  Calendar,
  Film,
  Clapperboard,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function CreateLink({ onNavigate }) {
  const [destinationUrl, setDestinationUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('active');
  const [flowType, setFlowType] = useState('two-step');
  const [countdownStep1, setCountdownStep1] = useState(10);
  const [countdownStep2, setCountdownStep2] = useState(8);
  const [expiresAt, setExpiresAt] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdLink, setCreatedLink] = useState(null);

  const { addToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!destinationUrl) {
      setError('Please provide the original destination URL.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.createLink({
        destinationUrl,
        customCode: customCode || undefined,
        title: title || 'Movie Download Link',
        status,
        flowType,
        countdownStep1: parseInt(countdownStep1, 10),
        countdownStep2: parseInt(countdownStep2, 10),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
      });

      if (res.success) {
        setCreatedLink(res.link);
        addToast(`Short movie link /${res.link.code} created successfully!`, 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to create short link');
      addToast(err.message || 'Creation failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setDestinationUrl('');
    setCustomCode('');
    setTitle('');
    setStatus('active');
    setFlowType('two-step');
    setCountdownStep1(10);
    setCountdownStep2(8);
    setExpiresAt('');
    setCreatedLink(null);
    setError('');
  }

  function copyShortLink(code) {
    const fullUrl = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(fullUrl);
    addToast('Movie short link copied to clipboard!', 'success');
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>Create Movie Short Link</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Configure movie download destination, custom short codes, countdown duration, and interstitial ad monetization flow.
        </p>
      </div>

      {createdLink ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--success-bg)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <CheckCircle2 size={30} color="var(--success)" />
          </div>

          <h3 style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>
            Movie Link Ready to Share!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Your short link has been published on MoviesHouse4u. Visitors will complete your {createdLink.flowType} before accessing the download.
          </p>

          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <code style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.0625rem',
              color: '#F87171',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {window.location.origin}/{createdLink.code}
            </code>

            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button
                onClick={() => copyShortLink(createdLink.code)}
                className="btn btn-primary btn-sm"
              >
                <Copy size={14} />
                <span>Copy Link</span>
              </button>
              <a
                href={`/${createdLink.code}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <ExternalLink size={14} />
                <span>Open Link</span>
              </a>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            textAlign: 'left',
            marginBottom: '2rem',
            background: 'var(--bg-card-sub)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Destination</span>
              <span style={{ color: 'var(--text-main)', wordBreak: 'break-all' }}>{createdLink.destinationUrl}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Flow Type</span>
              <span style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{createdLink.flowType}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Step 1 Countdown</span>
              <span style={{ color: 'var(--text-main)' }}>{createdLink.countdownStep1} seconds</span>
            </div>
            {createdLink.flowType === 'two-step' && (
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Step 2 Countdown</span>
                <span style={{ color: 'var(--text-main)' }}>{createdLink.countdownStep2} seconds</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={handleReset} className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Create Another Link</span>
            </button>
            <button onClick={() => onNavigate('links')} className="btn btn-secondary">
              <span>Manage All Links</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          {error && (
            <div style={{
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#F87171',
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. Destination URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="dest-url">
                <span>Original Destination URL <span style={{ color: 'var(--danger)' }}>*</span></span>
                <span className="form-help">Must start with http:// or https://</span>
              </label>
              <input
                id="dest-url"
                type="url"
                className="form-input"
                placeholder="https://drive.google.com/file/d/1aBcDeFg... or https://cloud.org/movie.mp4"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* 2. Custom Short Code */}
              <div className="form-group">
                <label className="form-label" htmlFor="custom-code">
                  <span>Custom Short Code</span>
                  <span className="form-help">Optional (e.g. oppenheimer-4k)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem'
                  }}>
                    /
                  </span>
                  <input
                    id="custom-code"
                    type="text"
                    className="form-input"
                    placeholder="Leave empty to auto-generate"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    style={{ paddingLeft: '1.75rem' }}
                  />
                </div>
              </div>

              {/* 3. Internal Title */}
              <div className="form-group">
                <label className="form-label" htmlFor="link-title">
                  <span>Movie Title / Description</span>
                  <span className="form-help">Displayed to visitors & dashboard</span>
                </label>
                <input
                  id="link-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Oppenheimer 2023 2160p 4K HDR BluRay"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* 4. Link Status */}
              <div className="form-group">
                <label className="form-label">Link Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active (Resolves to interstitials)</option>
                  <option value="disabled">Disabled (Shows link inactive notice)</option>
                </select>
              </div>

              {/* 5. Monetization Flow */}
              <div className="form-group">
                <label className="form-label">Monetization Flow</label>
                <select
                  className="form-select"
                  value={flowType}
                  onChange={(e) => setFlowType(e.target.value)}
                >
                  <option value="one-step">One-step Flow (1 Interstitial → Download)</option>
                  <option value="two-step">Two-step Flow (2 Interstitials → Download)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* 6. Step 1 Countdown */}
              <div className="form-group">
                <label className="form-label" htmlFor="cd-1">
                  <span>Step 1 Countdown (Seconds)</span>
                  <span style={{ color: '#F87171' }}>{countdownStep1}s</span>
                </label>
                <input
                  id="cd-1"
                  type="range"
                  min="3"
                  max="30"
                  className="form-input"
                  value={countdownStep1}
                  onChange={(e) => setCountdownStep1(e.target.value)}
                  style={{ padding: '0.2rem' }}
                />
              </div>

              {/* 7. Step 2 Countdown */}
              {flowType === 'two-step' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="cd-2">
                    <span>Step 2 Countdown (Seconds)</span>
                    <span style={{ color: '#F87171' }}>{countdownStep2}s</span>
                  </label>
                  <input
                    id="cd-2"
                    type="range"
                    min="3"
                    max="30"
                    className="form-input"
                    value={countdownStep2}
                    onChange={(e) => setCountdownStep2(e.target.value)}
                    style={{ padding: '0.2rem' }}
                  />
                </div>
              )}
            </div>

            {/* 8. Expiration Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="exp-date">
                <span>Optional Expiration Date</span>
                <span className="form-help">Link will automatically deactivate after this date</span>
              </label>
              <input
                id="exp-date"
                type="datetime-local"
                className="form-input"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                disabled={loading}
              >
                Clear
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Movie Link...' : 'Create Monetized Movie Link'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
