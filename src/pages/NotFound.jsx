import React from 'react';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound({ code }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.08) 0%, var(--bg-main) 70%)'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2.5rem 1.75rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'rgba(100, 116, 139, 0.15)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <FileQuestion size={28} color="var(--text-muted)" />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>404 - Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          {code
            ? `The short link "/${code}" does not exist or has been removed.`
            : 'The page you requested could not be found.'}
        </p>

        <a href="/" className="btn btn-primary" style={{ width: '100%' }}>
          <Home size={16} />
          <span>Return to Homepage</span>
        </a>
      </div>
    </div>
  );
}
