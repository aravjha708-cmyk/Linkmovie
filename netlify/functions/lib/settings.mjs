import { settingsStore } from './storage.mjs';

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
      enabled: false,
      title: 'Partner Promotion',
      type: 'banner', // 'banner' | 'html'
      bannerUrl: '',
      targetUrl: '',
      html: ''
    },
    step2: {
      enabled: false,
      title: 'Sponsored Media Tools',
      type: 'banner',
      bannerUrl: '',
      targetUrl: '',
      html: ''
    },
    banner: {
      enabled: false,
      title: 'Verified Sponsor',
      type: 'banner',
      bannerUrl: '',
      targetUrl: '',
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
