import { settingsStore } from './storage.mjs';

const SMARTLINK_URL = 'https://www.profitableratecpmnetwork.com/ifb7beykcq?key=f0b9f9ff2e842f19400e1dc3b9da33e8';

const DEFAULT_SETTINGS = {
  websiteName: 'MoviesHouse4u',
  tagline: 'Links of MoviesHouse4u - Fast HD Movie & Media Download Gateway',
  brandColor: '#E50914',
  defaultCountdownStep1: 10,
  defaultCountdownStep2: 8,
  defaultFlowType: 'two-step',
  termsContent: 'By proceeding with the download link, you acknowledge and agree that media files are hosted on verified external cloud mirrors. MoviesHouse4u does not alter original content.',
  privacyContent: 'We prioritize visitor privacy. No personal identification data or IP addresses are permanently retained.',
  ads: {
    step1: {
      enabled: true,
      title: '⚡ Fast Server 4K Streaming & Cloud Mirror',
      type: 'banner', // 'banner' | 'html'
      bannerUrl: '',
      targetUrl: SMARTLINK_URL,
      html: ''
    },
    step2: {
      enabled: true,
      title: '⚡ High Speed 10 Gbps Direct Download Mirror',
      type: 'banner',
      bannerUrl: '',
      targetUrl: SMARTLINK_URL,
      html: ''
    },
    banner: {
      enabled: true,
      title: 'Verified 4K High Speed Cloud Sponsor',
      type: 'banner',
      bannerUrl: '',
      targetUrl: SMARTLINK_URL,
      html: ''
    }
  }
};

/**
 * Fetch settings with fallback to defaults
 */
export async function getSettings() {
  const stored = await settingsStore.get('global_settings');
  if (!stored) {
    return { ...DEFAULT_SETTINGS };
  }
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    ads: {
      ...DEFAULT_SETTINGS.ads,
      ...(stored.ads || {})
    }
  };
}

/**
 * Save settings
 */
export async function saveSettings(newSettings) {
  const current = await getSettings();
  const updated = {
    ...current,
    websiteName: newSettings.websiteName?.trim() || current.websiteName,
    tagline: newSettings.tagline?.trim() || current.tagline,
    brandColor: newSettings.brandColor || current.brandColor,
    defaultCountdownStep1: Math.max(3, Math.min(60, parseInt(newSettings.defaultCountdownStep1, 10) || 10)),
    defaultCountdownStep2: Math.max(3, Math.min(60, parseInt(newSettings.defaultCountdownStep2, 10) || 8)),
    defaultFlowType: newSettings.defaultFlowType === 'one-step' ? 'one-step' : 'two-step',
    termsContent: newSettings.termsContent ?? current.termsContent,
    privacyContent: newSettings.privacyContent ?? current.privacyContent,
    ads: {
      step1: { ...current.ads.step1, ...(newSettings.ads?.step1 || {}) },
      step2: { ...current.ads.step2, ...(newSettings.ads?.step2 || {}) },
      banner: { ...current.ads.banner, ...(newSettings.ads?.banner || {}) }
    },
    updatedAt: new Date().toISOString()
  };

  await settingsStore.set('global_settings', updated);
  return updated;
}
