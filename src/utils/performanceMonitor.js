// Lightweight performance utilities used across the app

// No-op console in production for perf
if (typeof window !== 'undefined' && import.meta.env && import.meta.env.PROD) {
  const noop = () => {};
  ['log','info','debug'].forEach(k => { try { console[k] = noop; } catch {} });
}

// Preconnect important origins early
export function preconnectOrigins(origins) {
  if (typeof document === 'undefined') return;
  origins.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = '';
    document.head.appendChild(link);
  });
}

// Idle-time prefetch of critical routes when on landing page
export function warmRoutesWhenIdle(paths) {
  if (typeof window === 'undefined' || typeof requestIdleCallback === 'undefined') return;
  requestIdleCallback(() => {
    paths.forEach((p) => {
      switch (p) {
        case '/dashboard':
          import('../components/NoteDashboard');
          break;
        case '/browse':
          import('../BrowsePage');
          break;
        case '/audio-notes':
          import('../pages/AudioNotesPage');
          break;
        default:
          break;
      }
    });
  }, { timeout: 1500 });
}

export default undefined; 