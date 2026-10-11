import React from 'react';
import {
  Clapperboard,
  Film,
  Zap,
  ShieldCheck,
  Globe,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Download,
  Info
} from 'lucide-react';

export default function MovieHome({ onNavigate }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-main)'
    }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: 'rgba(13, 15, 21, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(229, 9, 20, 0.2)',
              border: '1px solid var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(229, 9, 20, 0.4)'
            }}>
              <Clapperboard size={22} color="#E50914" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                MoviesHouse<span style={{ color: 'var(--primary)' }}>4u</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#F87171', fontWeight: 600 }}>
                Links of MoviesHouse4u
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href="https://movieshouse4u.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Globe size={14} />
              <span>Official MoviesHouse4u Site</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '3rem 1.5rem 4rem',
        flex: 1,
        width: '100%'
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3.5rem',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(229, 9, 20, 0.15)',
            border: '1px solid rgba(229, 9, 20, 0.35)',
            color: '#F87171',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}>
            <Zap size={14} color="#E50914" />
            <span>Official High-Speed Link Gateway</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1rem',
            color: '#FFFFFF'
          }}>
            Links of <span style={{ color: 'var(--primary)', textShadow: '0 0 20px rgba(229,9,20,0.5)' }}>MoviesHouse4u</span>
          </h1>

          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto 2rem',
            lineHeight: 1.6
          }}>
            The official link shortening, asset delivery, and verification gateway for <strong>MoviesHouse4u</strong>. Connecting movie lovers to verified 4K UHD, 1080p, and multi-audio South Hindi dubbed cloud mirrors with zero queue waiting.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="https://movieshouse4u.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Explore Movies on MoviesHouse4u</span>
              <ExternalLink size={16} />
            </a>

            <a
              href="https://www.profitableratecpmnetwork.com/ifb7beykcq?key=f0b9f9ff2e842f19400e1dc3b9da33e8"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Zap size={16} />
              <span>⚡ Fast 4K Server Mirror</span>
            </a>
          </div>
        </div>

        {/* About The Platform Section */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
            <Info size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>About MoviesHouse4u</h2>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <p>
              <strong>MoviesHouse4u</strong> (<a href="https://movieshouse4u.netlify.app/" target="_blank" rel="noreferrer" style={{ color: '#F87171' }}>https://movieshouse4u.netlify.app/</a>) is an ultra-fast, lightweight movie discovery portal dedicated to providing verified multi-audio downloads, real screenshots, and dual-audio South Hindi films.
            </p>
            <p>
              This link gateway (<strong>Links of MoviesHouse4u</strong>) handles link protection, serverless verification, high-speed redirect generation, and compliant advertisement delivery to maintain our free cloud mirrors.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(229, 9, 20, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Zap size={22} color="#E50914" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', marginBottom: '0.375rem' }}>10 Gbps Cloud Mirrors</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Direct high-speed download mirrors with zero queue wait times. Instant cloud streaming and full HD downloads across major storage providers.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(229, 9, 20, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Film size={22} color="#E50914" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', marginBottom: '0.375rem' }}>Multi-Audio & 4K UHD</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Specializing in South Indian films dubbed in pure Hindi, Dolby Digital 5.1 surround sound web series, Bollywood blockbusters, and Hollywood dual-audio.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(229, 9, 20, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <ShieldCheck size={22} color="#E50914" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', marginBottom: '0.375rem' }}>Verified & Malware Free</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Transparent verification. No deceptive click traps, pop-unders, or unauthorized software installation. Verified safe gateway.
            </p>
          </div>
        </div>

        {/* How It Works Flow */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--primary)" />
            How Our Download Links Work
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.375rem' }}>
                01
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Find Your Movie
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Browse our catalog on <a href="https://movieshouse4u.netlify.app/" target="_blank" rel="noreferrer" style={{ color: '#F87171' }}>MoviesHouse4u</a> and click the download button.
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.375rem' }}>
                02
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Brief Countdown
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Wait for the short verification timer to prepare your direct high-speed cloud link.
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.375rem' }}>
                03
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Instant Download
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Click continue and receive your original high-speed cloud mirror link immediately!
              </div>
            </div>
          </div>
        </div>

        {/* DMCA & Disclaimer Policy */}
        <div style={{
          background: 'var(--bg-card-sub)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          fontSize: '0.8125rem',
          color: 'var(--text-dim)',
          lineHeight: 1.6
        }}>
          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.375rem' }}>
            Disclaimer & DMCA Policy Notice
          </strong>
          MoviesHouse4u does not host, upload, or store any media files, videos, or copyrighted content on our servers. All links, videos, and images displayed or shortened through this platform are aggregated from freely accessible third-party and public domain sources across the Internet. We are not the owners of any hosted content and only index publicly available links. If you have any copyright inquiries or wish to request link removals, please consult our DMCA policy or contact the external host directly.
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderTop: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-dim)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clapperboard size={18} color="#E50914" />
            <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
              MoviesHouse4u
            </span>
            <span>• Links Gateway</span>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="https://movieshouse4u.netlify.app/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
              Official Site (movieshouse4u.netlify.app)
            </a>
            <a href="https://movieshouse4u.netlify.app/about" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
              About
            </a>
            <a href="https://movieshouse4u.netlify.app/disclaimer" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
              Disclaimer & DMCA
            </a>
            <button
              onClick={() => onNavigate('/admin')}
              style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 0, font: 'inherit', fontWeight: 600 }}
            >
              Admin Portal
            </button>
          </div>

          <p style={{ marginTop: '0.5rem' }}>
            © 2026 MoviesHouse4u. Built for high performance on Netlify. Zero Server Runtime • Fast Delivery.
          </p>
        </div>
      </footer>
    </div>
  );
}
