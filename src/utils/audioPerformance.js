// Audio Performance Monitoring Utility
class AudioPerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTimes: [],
      playTimes: [],
      errors: []
    };
  }

  // Track audio loading time
  trackLoadTime(url, startTime) {
    const loadTime = performance.now() - startTime;
    this.metrics.loadTimes.push({ url, loadTime });
    
    if (loadTime > 2000) {
      console.warn(`Slow audio load detected: ${url} took ${loadTime.toFixed(2)}ms`);
    }
    
    return loadTime;
  }

  // Track time from click to play
  trackPlayTime(url, startTime) {
    const playTime = performance.now() - startTime;
    this.metrics.playTimes.push({ url, playTime });
    
    if (playTime > 500) {
      console.warn(`Slow play response detected: ${url} took ${playTime.toFixed(2)}ms`);
    }
    
    return playTime;
  }

  // Track errors
  trackError(url, error) {
    this.metrics.errors.push({ url, error: error.message, timestamp: Date.now() });
    console.error(`Audio error for ${url}:`, error);
  }

  // Get performance summary
  getSummary() {
    const avgLoadTime = this.metrics.loadTimes.length > 0 
      ? this.metrics.loadTimes.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.loadTimes.length 
      : 0;
    
    const avgPlayTime = this.metrics.playTimes.length > 0 
      ? this.metrics.playTimes.reduce((sum, m) => sum + m.playTime, 0) / this.metrics.playTimes.length 
      : 0;

    return {
      totalLoads: this.metrics.loadTimes.length,
      totalPlays: this.metrics.playTimes.length,
      totalErrors: this.metrics.errors.length,
      avgLoadTime: avgLoadTime.toFixed(2),
      avgPlayTime: avgPlayTime.toFixed(2),
      slowLoads: this.metrics.loadTimes.filter(m => m.loadTime > 2000).length,
      slowPlays: this.metrics.playTimes.filter(m => m.playTime > 500).length
    };
  }

  // Log performance summary
  logSummary() {
    const summary = this.getSummary();
    console.log('🎵 Audio Performance Summary:', summary);
    return summary;
  }

  // Clear metrics
  clear() {
    this.metrics = {
      loadTimes: [],
      playTimes: [],
      errors: []
    };
  }
}

// Create singleton instance
const audioPerformanceMonitor = new AudioPerformanceMonitor();

export default audioPerformanceMonitor; 