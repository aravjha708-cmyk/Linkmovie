import React from 'react';
import { Menu, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentTitle, onToggleSidebar, isDevAuth }) {
  return (
    <header className="admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', padding: '0.4rem', borderColor: 'transparent' }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
          {currentTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isDevAuth && (
          <span className="badge badge-expired" style={{ fontSize: '0.6875rem' }}>
            Dev Credentials Active
          </span>
        )}
        <div className="badge badge-active">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }} />
          Blobs Online
        </div>
      </div>
    </header>
  );
}
