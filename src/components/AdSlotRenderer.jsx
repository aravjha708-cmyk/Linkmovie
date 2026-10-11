import React from 'react';
import { ExternalLink, Film } from 'lucide-react';

export default function AdSlotRenderer({ adConfig, slotName = 'Advertisement', isPreview = false }) {
  // If no configured ad slot or slot is disabled
  if (!adConfig || !adConfig.enabled) {
    return (
      <div className="ad-slot-box" style={{ textAlign: 'center', padding: '1.75rem 1rem' }}>
        <div className="ad-label">{slotName}</div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-dim)',
          fontSize: '0.8125rem'
        }}>
          <Film size={28} color="#E50914" style={{ opacity: 0.9 }} />
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Verified MoviesHouse4u Partner</span>
          <span style={{ maxWidth: '380px' }}>
            Sponsored advertising space. Verified sponsor links help support free HD movie link generation.
          </span>
        </div>
      </div>
    );
  }

  // If banner ad (image + targetUrl)
  if (adConfig.type === 'banner' && adConfig.bannerUrl) {
    return (
      <div className="ad-slot-box">
        <div className="ad-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{slotName} • {adConfig.title || 'Sponsored'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            External Sponsor <ExternalLink size={10} />
          </span>
        </div>
        <a
          href={adConfig.targetUrl || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{ display: 'block', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}
        >
          <img
            src={adConfig.bannerUrl}
            alt={adConfig.title || 'Sponsor banner'}
            style={{ width: '100%', height: 'auto', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
          />
        </a>
      </div>
    );
  }

  // If custom HTML snippet, render safely inside sandboxed iframe
  if (adConfig.type === 'html' && adConfig.html) {
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

  return null;
}
