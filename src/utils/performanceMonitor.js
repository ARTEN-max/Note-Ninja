// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: [],
      imageLoads: [],
      audioLoads: [],
      navigationTimes: [],
      errors: []
    };
    this.init();
  }

  init() {
    if (typeof window !== 'undefined') {
      this.observePageLoads();
      this.observeImageLoads();
      this.observeNavigation();
      this.observeErrors();
    }
  }

  // Track page load performance
  observePageLoads() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const metrics = {
            timestamp: Date.now(),
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
            url: window.location.href
          };
          
          this.metrics.pageLoads.push(metrics);
          
          // Log slow loads
          if (metrics.totalTime > 3000) {
            console.warn('Slow page load detected:', metrics);
          }
        }
      });
    }
  }

  // Track image load performance
  observeImageLoads() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const startTime = performance.now();
            
            const onLoad = () => {
              const loadTime = performance.now() - startTime;
              this.metrics.imageLoads.push({
                src: img.src,
                loadTime,
                timestamp: Date.now()
              });
              
              if (loadTime > 2000) {
                console.warn('Slow image load:', img.src, `${loadTime.toFixed(2)}ms`);
              }
              
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
            };
            
            const onError = () => {
              this.metrics.errors.push({
                type: 'image_load_error',
                src: img.src,
                timestamp: Date.now()
              });
              
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
            };
            
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
            
            imageObserver.unobserve(img);
          }
        });
      });
      
      // Observe all images
      document.addEventListener('DOMContentLoaded', () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => imageObserver.observe(img));
      });
    }
  }

  // Track navigation performance
  observeNavigation() {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.metrics.navigationTimes.push({
              name: entry.name,
              duration: entry.duration,
              timestamp: Date.now()
            });
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported');
      }
    }
  }

  // Track errors
  observeErrors() {
    window.addEventListener('error', (event) => {
      this.metrics.errors.push({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now()
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors.push({
        type: 'unhandled_promise_rejection',
        reason: event.reason,
        timestamp: Date.now()
      });
    });
  }

  // Track custom metrics
  trackCustomMetric(name, value) {
    this.metrics[name] = this.metrics[name] || [];
    this.metrics[name].push({
      value,
      timestamp: Date.now()
    });
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      totalPageLoads: this.metrics.pageLoads.length,
      averagePageLoadTime: 0,
      totalImageLoads: this.metrics.imageLoads.length,
      averageImageLoadTime: 0,
      totalErrors: this.metrics.errors.length,
      slowLoads: 0
    };

    if (this.metrics.pageLoads.length > 0) {
      const totalTime = this.metrics.pageLoads.reduce((sum, load) => sum + load.totalTime, 0);
      summary.averagePageLoadTime = totalTime / this.metrics.pageLoads.length;
      summary.slowLoads = this.metrics.pageLoads.filter(load => load.totalTime > 3000).length;
    }

    if (this.metrics.imageLoads.length > 0) {
      const totalImageTime = this.metrics.imageLoads.reduce((sum, load) => sum + load.loadTime, 0);
      summary.averageImageLoadTime = totalImageTime / this.metrics.imageLoads.length;
    }

    return summary;
  }

  // Log performance report
  logPerformanceReport() {
    const summary = this.getPerformanceSummary();
    console.log('📊 Performance Report:', summary);
    
    if (summary.slowLoads > 0) {
      console.warn(`⚠️ ${summary.slowLoads} slow page loads detected`);
    }
    
    if (summary.totalErrors > 0) {
      console.warn(`⚠️ ${summary.totalErrors} errors detected`);
    }
  }

  // Clear old metrics
  clearOldMetrics(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const now = Date.now();
    
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = this.metrics[key].filter(item => {
        return now - item.timestamp < maxAge;
      });
    });
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      ...this.metrics,
      summary: this.getPerformanceSummary(),
      exportedAt: Date.now()
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-clear old metrics every hour
setInterval(() => {
  performanceMonitor.clearOldMetrics();
}, 60 * 60 * 1000);

// Log performance report every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    performanceMonitor.logPerformanceReport();
  }, 5 * 60 * 1000);
}

export default performanceMonitor; 