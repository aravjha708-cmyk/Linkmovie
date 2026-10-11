import React from 'react';
import { ExternalLink, Film, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

const DEFAULT_SMARTLINK = 'https://www.profitableratecpmnetwork.com/ifb7beykcq?key=f0b9f9ff2e842f19400e1dc3b9da33e8';

export default function AdSlotRenderer({ adConfig, slotName = 'Advertisement', isPreview = false }) {
  const targetUrl = adConfig?.targetUrl || DEFAULT_SMARTLINK;
  const title = adConfig?.title || '⚡ Fast Cloud 4K Streaming & Direct Download Mirror';

  // If custom HTML snippet, render safely inside sandboxed iframe
  if (adConfig?.type === 'html' && adConfig.html) {
    const iframeSrcDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; background: transparent; color: #94A3B8; text-align: center; }
          </style>
        </head>
        <body>
          ${adConfig.html}
        </body>
      </html>
    `;

    return (
      <div className="ad-slot-box">
        <div className="ad-label">{slotName} • Sponsored</div>
        <iframe
          title={`Ad Slot ${slotName}`}
          srcDoc={iframeSrcDoc}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          style={{ width: '100%', height: '140px', border: 'none', overflow: 'hidden' }}
        />
      </div>
    );
  }

  // If image banner configured
  if (adConfig?.type === 'banner' && adConfig.bannerUrl) {
    return (
      <div className="ad-slot-box">
        <div className="ad-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{slotName} • {title}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            External Sponsor <ExternalLink size={10} />
          </span>
        </div>
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{ display: 'block', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}
        >
          <img
            src={adConfig.bannerUrl}
            alt={title}
            style={{ width: '100%', height: 'auto', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
          />
        </a>
      </div>
    );
  }

  // Active High-Performance Sponsor Banner (Smartlink integration)
  return (
    <div className="ad-slot-box" style={{ padding: '1rem', border: '1px solid rgba(229, 9, 20, 0.4)', background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.12) 0%, rgba(18, 21, 29, 0.95) 100%)' }}>
      <div className="ad-label" style={{ display: 'flex', justifyContent: 'space-between', color: '#F87171' }}>
        <span>{slotName} • Verified Sponsor</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.625rem' }}>
          Sponsored Link <ExternalLink size={10} />
        </span>
      </div>

      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        style={{
          display: 'block',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(229, 9, 20, 0.3)',
          textDecoration: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(229, 9, 20, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Zap size={20} color="#E50914" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                {title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ultra-fast cloud streaming • Dual Audio Hindi • 10 Gbps fast mirror (No Queue)
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 0 10px rgba(229, 9, 20, 0.4)'
          }}>
            <span>Open Fast Mirror</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </a>
    </div>
  );
}
