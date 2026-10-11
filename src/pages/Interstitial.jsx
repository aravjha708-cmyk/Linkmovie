import React, { useState, useEffect, useRef } from 'react';
import {
  Clapperboard,
  Film,
  Download,
  ArrowRight,
  Clock,
  AlertCircle,
  Play,
  Zap,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import AdSlotRenderer from '../components/AdSlotRenderer';

const SMARTLINK_FALLBACK = 'https://www.profitableratecpmnetwork.com/ifb7beykcq?key=f0b9f9ff2e842f19400e1dc3b9da33e8';

const DEFAULT_TOP_AD = {
  enabled: true,
  title: '⚡ Fast Server 4K Streaming & Cloud Mirror',
  type: 'banner',
  targetUrl: SMARTLINK_FALLBACK
};

const DEFAULT_BOTTOM_AD = {
  enabled: true,
  title: 'Verified 4K High Speed Cloud Sponsor (10 Gbps)',
  type: 'banner',
  targetUrl: SMARTLINK_FALLBACK
};

export default function Interstitial({ shortCode }) {
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null); // { reason, message }
  const [linkData, setLinkData] = useState(null);
  const [branding, setBranding] = useState(null);
  const [flowToken, setFlowToken] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(1);
  const [countdown, setCountdown] = useState(10);
  const [timerRemaining, setTimerRemaining] = useState(10);
  const [ads, setAds] = useState({ currentSlot: DEFAULT_TOP_AD, bannerSlot: DEFAULT_BOTTOM_AD });
  const [continueLoading, setContinueLoading] = useState(false);
  const [completedDestination, setCompletedDestination] = useState(null);

  const timerRef = useRef(null);

  // Ensure Ad Network scripts are active on every link page
  useEffect(() => {
    try {
      if (!document.getElementById('lm-popunder-ad')) {
        const s1 = document.createElement('script');
        s1.id = 'lm-popunder-ad';
        s1.src = 'https://pl31778088.profitableratecpmnetwork.com/0c/2b/7c/0c2b7c00c083f901512abe976219c32c.js';
        s1.async = true;
        document.head.appendChild(s1);
      }
      if (!document.getElementById('lm-socialbar-ad')) {
        const s2 = document.createElement('script');
        s2.id = 'lm-socialbar-ad';
        s2.src = 'https://pl31778089.profitableratecpmnetwork.com/a3/a5/66/a3a56615030cdf1b04568307428aeca1.js';
        s2.async = true;
        document.head.appendChild(s2);
      }
    } catch (e) {}
  }, []);

  // Initial Link Resolution
  useEffect(() => {
    async function resolve() {
      setLoading(true);
      setErrorState(null);
      try {
        const res = await api.resolveLink(shortCode);
        if (res.success && res.viable) {
          setLinkData(res.link);
          setBranding(res.branding);
          setFlowToken(res.flowToken);
          setCurrentStep(res.link.currentStep);
          setTotalSteps(res.link.totalSteps);
          setCountdown(res.link.countdown);
          setTimerRemaining(res.link.countdown);
          setAds({
            currentSlot: res.ads?.currentSlot || DEFAULT_TOP_AD,
            bannerSlot: res.ads?.bannerSlot || DEFAULT_BOTTOM_AD
          });
        } else {
          setErrorState({
            reason: res.reason || 'UNAVAILABLE',
            message: res.message || 'This movie link is currently unavailable.'
          });
        }
      } catch (err) {
        setErrorState({
          reason: err.data?.reason || 'NOT_FOUND',
          message: err.data?.message || err.message || 'Movie link could not be resolved.'
        });
      } finally {
        setLoading(false);
      }
    }
    resolve();
  }, [shortCode]);

  // Countdown Timer
  useEffect(() => {
    if (loading || errorState || completedDestination) return;

    if (timerRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimerRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerRemaining, loading, errorState, completedDestination]);

  // Handle Continue Click
  async function handleContinue() {
    if (timerRemaining > 0 || continueLoading) return;

    setContinueLoading(true);
    try {
      const res = await api.continueFlow({
        code: shortCode,
        flowToken,
        step: currentStep
      });

      if (res.completed && res.destinationUrl) {
        // Final destination reached
        setCompletedDestination(res.destinationUrl);
        setTimeout(() => {
          window.location.href = res.destinationUrl;
        }, 1200);
      } else if (res.nextStep) {
        // Advance to step 2
        setCurrentStep(res.nextStep);
        setFlowToken(res.flowToken);
        setCountdown(res.countdown);
        setTimerRemaining(res.countdown);
        setAds({
          currentSlot: res.ads?.currentSlot || DEFAULT_TOP_AD,
          bannerSlot: res.ads?.bannerSlot || DEFAULT_BOTTOM_AD
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      alert(err.message || 'Failed to progress to the next step. Please refresh and try again.');
    } finally {
      setContinueLoading(false);
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="interstitial-container" style={{ justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: 'rgba(229, 9, 20, 0.15)',
            border: '1px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 0 16px rgba(229, 9, 20, 0.35)'
          }}>
            <Clapperboard size={26} color="#E50914" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Preparing MoviesHouse4u Link...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Resolving high-speed media gateway and security credentials.
          </p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Unavailable / Expired / Disabled State
  if (errorState) {
    return (
      <div className="interstitial-container" style={{ justifyContent: 'center' }}>
        <div className="interstitial-card" style={{ maxWidth: '540px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: errorState.reason === 'NOT_FOUND' ? 'rgba(100, 116, 139, 0.15)' : 'var(--warning-bg)',
            border: `1px solid ${errorState.reason === 'NOT_FOUND' ? 'var(--border)' : 'rgba(245, 158, 11, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <AlertCircle size={28} color={errorState.reason === 'NOT_FOUND' ? 'var(--text-dim)' : 'var(--warning)'} />
          </div>

          <h2 style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>
            {errorState.reason === 'EXPIRED' ? 'Movie Link Has Expired' : errorState.reason === 'DISABLED' ? 'Movie Link Currently Inactive' : 'Movie Link Not Found'}
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {errorState.message}
          </p>

          {/* Ad slot in unavailable state */}
          <div style={{ marginBottom: '1.5rem' }}>
            <AdSlotRenderer adConfig={DEFAULT_TOP_AD} slotName="Fast Cloud Mirror" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <a href="/" className="btn btn-secondary btn-sm">
              Return to Homepage
            </a>
            <a href="https://movieshouse4u.netlify.app/" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
              Browse MoviesHouse4u
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Redirecting state
  if (completedDestination) {
    return (
      <div className="interstitial-container" style={{ justifyContent: 'center' }}>
        <div className="interstitial-card" style={{ maxWidth: '480px' }}>
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
            <Download size={28} color="var(--success)" />
          </div>

          <h2 style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>Movie Download Ready!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Verification complete. You are being redirected to your requested movie asset...
          </p>

          <a
            href={completedDestination}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '0.75rem' }}
          >
            Click here if not redirected automatically
          </a>
        </div>
      </div>
    );
  }

  const isTimerDone = timerRemaining === 0;

  return (
    <div className="interstitial-container">
      {/* Brand Header */}
      <header style={{ width: '100%', maxWidth: '640px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
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
            boxShadow: '0 0 10px rgba(229, 9, 20, 0.35)'
          }}>
            <Clapperboard size={19} color="#E50914" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.0625rem', letterSpacing: '-0.02em', color: 'var(--text-main)', lineHeight: 1.2 }}>
              {branding?.websiteName || 'MoviesHouse4u'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#F87171', fontWeight: 600 }}>
              Links of MoviesHouse4u
            </div>
          </div>
        </div>

        <div className="badge badge-step">
          Step {currentStep} of {totalSteps}
        </div>
      </header>

      {/* Main Interstitial Card */}
      <main className="interstitial-card" style={{ margin: '1.5rem 0' }}>
        {/* Step Progression Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--bg-input)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: `${(currentStep / totalSteps) * 100}%`,
            height: '100%',
            backgroundColor: 'var(--primary)',
            boxShadow: '0 0 10px rgba(229, 9, 20, 0.5)',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Link Title & Notice */}
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.375rem' }}>
          {linkData?.title || 'Preparing Movie Download Link'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
          Your HD download link is being safely prepared. Please wait for the countdown below to generate your direct movie link.
        </p>

        {/* Primary Top Ad Slot (Always Active with Smartlink) */}
        <AdSlotRenderer
          adConfig={ads?.currentSlot || DEFAULT_TOP_AD}
          slotName={`Sponsored Content (${currentStep}/${totalSteps})`}
        />

        {/* Countdown Area */}
        <div className="countdown-box">
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Clock size={16} color="#F87171" />
            {isTimerDone ? 'Movie Link Ready!' : 'Preparing Movie Download Link...'}
          </div>

          <div className="countdown-number">
            {isTimerDone ? '0' : timerRemaining}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {isTimerDone
              ? 'Click Continue below to access your movie.'
              : `Please wait ${timerRemaining} second${timerRemaining === 1 ? '' : 's'}...`}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!isTimerDone || continueLoading}
          className={`btn ${isTimerDone ? 'btn-primary' : 'btn-secondary'} btn-lg`}
          style={{
            width: '100%',
            fontSize: '1rem',
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {continueLoading ? (
            'Validating Token...'
          ) : isTimerDone ? (
            currentStep < totalSteps ? (
              <>
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Get Movie Download Link</span>
              </>
            )
          ) : (
            <span>Please wait {timerRemaining}s</span>
          )}
        </button>

        {/* Secondary Sitewide Bottom Ad Banner (Always Active with Smartlink) */}
        <div style={{ marginTop: '1.25rem' }}>
          <AdSlotRenderer
            adConfig={ads?.bannerSlot || DEFAULT_BOTTOM_AD}
            slotName="Verified Sponsor Mirror"
          />
        </div>

        {/* Transparent Guarantee Disclosure */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.75rem',
          borderTop: '1px solid var(--border)',
          fontSize: '0.6875rem',
          color: 'var(--text-dim)',
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          🎬 MoviesHouse4u Verified Gateway. High-speed transfers with zero intrusive pop-unders.
        </div>
      </main>

      {/* Footer Disclosures */}
      <footer style={{ width: '100%', maxWidth: '640px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', padding: '0 0.5rem' }}>
        <p style={{ marginBottom: '0.375rem' }}>
          {branding?.privacyContent || 'Visitor privacy is respected. No personal identification data or IP addresses are retained.'}
        </p>
        <p>
          {branding?.termsContent || 'Files are delivered from external original cloud storage repositories.'}
        </p>
      </footer>
    </div>
  );
}
