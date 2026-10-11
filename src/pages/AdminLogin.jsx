import React, { useState } from 'react';
import { Film, Clapperboard, Eye, EyeOff, Lock, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function AdminLogin({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) {
      setError('Please enter the administrator password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.login(password);
      if (res.success) {
        addToast('Signed in to MoviesHouse4u dashboard', 'success');
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 30%, rgba(229, 9, 20, 0.14) 0%, var(--bg-main) 70%)'
    }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            margin: '0 auto 1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(229, 9, 20, 0.15)',
            border: '1px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(229, 9, 20, 0.35)'
          }}>
            <Clapperboard size={26} color="#E50914" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>MoviesHouse4u</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Enter administrator password to manage movie links and monetization.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#F87171',
            fontSize: '0.8125rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                disabled={loading}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to MoviesHouse4u'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{
          marginTop: '1.75rem',
          padding: '0.875rem',
          backgroundColor: 'var(--bg-card-sub)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, color: '#F87171', marginBottom: '0.25rem' }}>
            <Info size={14} />
            <span>Default Dev Credentials</span>
          </div>
          <div>Default password: <code style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>Admin@123456</code></div>
          <div style={{ marginTop: '0.25rem', color: 'var(--text-dim)' }}>
            To change, set <code style={{ fontFamily: 'var(--font-mono)' }}>ADMIN_PASSWORD</code> in Netlify Environment Variables.
          </div>
        </div>
      </div>
    </div>
  );
}
