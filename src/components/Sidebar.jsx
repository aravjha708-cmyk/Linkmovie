import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Link2,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  Film,
  Clapperboard,
  X
} from 'lucide-react';

export default function Sidebar({ currentRoute, onNavigate, onLogout, isOpen, onClose }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'create', label: 'Create Movie Link', icon: PlusCircle },
    { id: 'links', label: 'Manage Links', icon: Link2 },
    { id: 'analytics', label: 'Click Analytics', icon: BarChart3 },
    { id: 'ads', label: 'Ad Placements', icon: Megaphone },
    { id: 'settings', label: 'Website Settings', icon: Settings }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 45 }}
          onClick={onClose}
        />
      )}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(229, 9, 20, 0.3)'
            }}>
              <Clapperboard size={19} color="#E50914" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                MoviesHouse4u
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#F87171', fontWeight: 600 }}>
                Links Portal Admin
              </div>
            </div>
          </div>
          {isOpen && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0.5rem 0.75rem', letterSpacing: '0.05em' }}>
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  if (isOpen) onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border)' }}>
          <div
            className="nav-item"
            style={{ color: '#F87171' }}
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </div>
        </div>
      </aside>
    </>
  );
}
