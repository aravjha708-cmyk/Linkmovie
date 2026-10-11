import React, { useEffect, useRef } from 'react';
import { Zap, ArrowRight, Film, ShieldCheck } from 'lucide-react';

const SMARTLINK_URL = 'https://www.profitableratecpmnetwork.com/ifb7beykcq?key=f0b9f9ff2e842f19400e1dc3b9da33e8';

/**
 * 728x90 Leaderboard / Responsive Banner Ad
 */
export function LeaderboardBanner({ label = 'Sponsored Advertisement' }) {
  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <base target="_blank">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 90px;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '9c3ba7179a5c911108ea3386cad9a0f4',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
          };
        <\/script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/9c3ba7179a5c911108ea3386cad9a0f4/invoke.js"><\/script>
      </body>
    </html>
  `;

  return (
    <div className="leaderboard-ad-wrapper">
      <div className="ad-mini-label">{label}</div>
      <div className="leaderboard-ad-frame-holder">
        <iframe
          title="Banner Ad 728x90"
          srcDoc={iframeSrcDoc}
          className="leaderboard-ad-iframe"
          scrolling="no"
        />
      </div>
    </div>
  );
}

/**
 * Native Ad Container with pl31778988 network invoke script
 * Embedded inside the layout card near the countdown timer
 */
export function NativeAdContainer() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Inject the native ad invoke script into parent window for DOM targeting
    if (!document.getElementById('native-ad-invoke-script')) {
      const script = document.createElement('script');
      script.id = 'native-ad-invoke-script';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl31778988.profitableratecpmnetwork.com/d83c03528170dc916ba37bfbf1098f37/invoke.js';
      document.body.appendChild(script);
    }
  }, []);

  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <base target="_blank">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100px;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          #container-d83c03528170dc916ba37bfbf1098f37 {
            width: 100%;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div id="container-d83c03528170dc916ba37bfbf1098f37"></div>
        <script async="async" data-cfasync="false" src="https://pl31778988.profitableratecpmnetwork.com/d83c03528170dc916ba37bfbf1098f37/invoke.js"><\/script>
      </body>
    </html>
  `;

  return (
    <div className="native-ad-box">
      <div className="native-ad-header">
        <span className="native-ad-title">Recommended Media Sponsor</span>
        <span className="native-ad-tag">AD</span>
      </div>

      {/* Target DOM container for native ad script in parent */}
      <div
        id="container-d83c03528170dc916ba37bfbf1098f37"
        ref={containerRef}
        style={{ minHeight: '80px', width: '100%' }}
      >
        {/* Sandboxed iframe for guaranteed isolated execution */}
        <iframe
          title="Native Sponsored Ad"
          srcDoc={iframeSrcDoc}
          className="native-ad-iframe"
          scrolling="no"
        />
      </div>
    </div>
  );
}

/**
 * Side Skyscraper / Lateral Ad Banner for Desktop Gutters
 */
export function SideAdBanner({ side = 'left' }) {
  const isLeft = side === 'left';

  return (
    <aside className={`side-ad-column side-ad-${side}`}>
      <div className="side-ad-card">
        <div className="side-ad-badge">
          {isLeft ? '⚡ Cloud Partner' : '🎬 4K Cinema'}
        </div>

        <div className="side-ad-icon-wrap">
          {isLeft ? <Zap size={20} color="#E50914" /> : <Film size={20} color="#E50914" />}
        </div>

        <div className="side-ad-title">
          {isLeft ? '10 Gbps Fast Mirror' : 'Ultra HD 4K Cloud'}
        </div>

        <p className="side-ad-desc">
          {isLeft ? 'Direct download stream with zero waiting queues.' : 'Instant streaming servers with lossless 1080p/4K bitrate.'}
        </p>

        <a
          href={SMARTLINK_URL}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="btn btn-primary btn-sm side-ad-btn"
        >
          <span>{isLeft ? 'Fast Mirror' : 'Stream 4K'}</span>
          <ArrowRight size={12} />
        </a>
      </div>

      <div className="side-ad-footer-badge">
        <ShieldCheck size={13} color="#22C55E" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
        Verified Partner
      </div>
    </aside>
  );
}
