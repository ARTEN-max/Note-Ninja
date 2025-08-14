class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: new Map(),
      interactions: new Map(),
      resources: new Map()
    };
    this.startTime = performance.now();
    this.init();
  }

  init() {
    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.trackInteraction('page_visible');
      }
    });

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration}ms`);
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API not supported
      }
    }
  }

  trackPageLoad(pageName) {
    const loadTime = performance.now() - this.startTime;
    this.metrics.pageLoads.set(pageName, loadTime);
    
    if (__DEV__) {
      console.log(`📊 Page Load: ${pageName} - ${loadTime.toFixed(2)}ms`);
    }
    
    // Report to analytics if available
    if (window.gtag) {
      window.gtag('event', 'page_load_time', {
        page_name: pageName,
        value: Math.round(loadTime)
      });
    }
  }

  trackInteraction(action, target = null) {
    const timestamp = performance.now();
    const key = target ? `${action}_${target}` : action;
    
    this.metrics.interactions.set(key, timestamp);
    
    if (__DEV__) {
      console.log(`🖱️ Interaction: ${key}`);
    }
  }

  trackResourceLoad(resourceName, startTime, endTime) {
    const duration = endTime - startTime;
    this.metrics.resources.set(resourceName, duration);
    
    if (__DEV__ && duration > 1000) {
      console.warn(`🐌 Slow resource: ${resourceName} - ${duration.toFixed(2)}ms`);
    }
  }

  getMetrics() {
    return {
      pageLoads: Object.fromEntries(this.metrics.pageLoads),
      interactions: Object.fromEntries(this.metrics.interactions),
      resources: Object.fromEntries(this.metrics.resources),
      memory: this.getMemoryInfo(),
      timing: this.getNavigationTiming()
    };
  }

  getMemoryInfo() {
    if ('memory' in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  }

  getNavigationTiming() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      return {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        load: navigation.loadEventEnd - navigation.navigationStart
      };
    }
    return null;
  }

  logSummary() {
    if (!__DEV__) return;
    
    console.group('🚀 Performance Summary');
    console.table(this.getMetrics());
    console.groupEnd();
  }
}

// Utility functions for performance optimization
export function preconnectOrigins(origins) {
  if (typeof document === 'undefined') return;
  
  origins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

export function warmRoutesWhenIdle(routes) {
  if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return;
  
  requestIdleCallback(() => {
    routes.forEach(route => {
      // Preload route components
      if (route === '/dashboard') {
        import('../components/NoteDashboard');
      } else if (route === '/browse') {
        import('../BrowsePage');
      } else if (route === '/audio-notes') {
        import('../pages/AudioNotesPage');
      }
    });
  }, { timeout: 2000 });
}

const performanceMonitorInstance = new PerformanceMonitor();
export default performanceMonitorInstance;