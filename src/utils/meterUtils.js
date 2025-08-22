// Metering utility for tracking anonymous user usage
const STORAGE_KEYS = {
  GUIDES_ACCESSED: 'nn_guides_accessed',
  AUDIO_MINUTES: 'nn_audio_minutes',
  LAST_RESET: 'nn_last_reset'
};

const LIMITS = {
  GUIDES_PER_MONTH: 3,
  AUDIO_MINUTES_PER_MONTH: 10
};

// Reset usage if it's a new month
function checkAndResetIfNewMonth() {
  const lastReset = localStorage.getItem(STORAGE_KEYS.LAST_RESET);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
  
  if (!lastReset || lastReset !== currentMonth) {
    localStorage.setItem(STORAGE_KEYS.GUIDES_ACCESSED, '0');
    localStorage.setItem(STORAGE_KEYS.AUDIO_MINUTES, '0');
    localStorage.setItem(STORAGE_KEYS.LAST_RESET, currentMonth);
  }
}

export function getGuidesAccessed() {
  checkAndResetIfNewMonth();
  return parseInt(localStorage.getItem(STORAGE_KEYS.GUIDES_ACCESSED) || '0');
}

export function getAudioMinutesUsed() {
  checkAndResetIfNewMonth();
  return parseFloat(localStorage.getItem(STORAGE_KEYS.AUDIO_MINUTES) || '0');
}

export function canAccessGuide() {
  return getGuidesAccessed() < LIMITS.GUIDES_PER_MONTH;
}

export function canAccessAudio(additionalMinutes = 0) {
  return (getAudioMinutesUsed() + additionalMinutes) <= LIMITS.AUDIO_MINUTES_PER_MONTH;
}

export function trackGuideAccess() {
  checkAndResetIfNewMonth();
  const current = getGuidesAccessed();
  localStorage.setItem(STORAGE_KEYS.GUIDES_ACCESSED, (current + 1).toString());
}

export function trackAudioUsage(minutes) {
  checkAndResetIfNewMonth();
  const current = getAudioMinutesUsed();
  localStorage.setItem(STORAGE_KEYS.AUDIO_MINUTES, (current + minutes).toString());
}

export function getRemainingGuides() {
  return Math.max(0, LIMITS.GUIDES_PER_MONTH - getGuidesAccessed());
}

export function getRemainingAudioMinutes() {
  return Math.max(0, LIMITS.AUDIO_MINUTES_PER_MONTH - getAudioMinutesUsed());
}

export function getUsageStats() {
  return {
    guidesUsed: getGuidesAccessed(),
    guidesRemaining: getRemainingGuides(),
    audioMinutesUsed: getAudioMinutesUsed(),
    audioMinutesRemaining: getRemainingAudioMinutes(),
    canAccessMoreGuides: canAccessGuide(),
    canAccessMoreAudio: canAccessAudio()
  };
}

// Reset usage (for testing or admin purposes)
export function resetUsage() {
  localStorage.removeItem(STORAGE_KEYS.GUIDES_ACCESSED);
  localStorage.removeItem(STORAGE_KEYS.AUDIO_MINUTES);
  localStorage.removeItem(STORAGE_KEYS.LAST_RESET);
}

