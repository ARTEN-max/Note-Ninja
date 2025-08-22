// Image optimization utilities
class ImageOptimizer {
  constructor() {
    this.imageCache = new Map();
    this.intersectionObserver = null;
    this.initIntersectionObserver();
  }

  initIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              this.loadImage(img);
              this.intersectionObserver.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  // Preload critical images
  preloadImages(urls) {
    if (typeof window === 'undefined') return;
    
    urls.forEach(url => {
      if (!this.imageCache.has(url)) {
        const img = new Image();
        img.src = url;
        this.imageCache.set(url, img);
      }
    });
  }

  // Optimized image loading with fallback
  loadImage(imgElement) {
    const src = imgElement.dataset.src || imgElement.src;
    if (!src) return;

    // Check cache first
    if (this.imageCache.has(src)) {
      imgElement.src = src;
      return;
    }

    // Load with error handling
    const img = new Image();
    img.onload = () => {
      imgElement.src = src;
      this.imageCache.set(src, img);
    };
    img.onerror = () => {
      // Fallback to placeholder
      imgElement.src = this.getFallbackImage();
    };
    img.src = src;
  }

  // Get optimized image URL with size parameters
  getOptimizedImageUrl(url, width = 400, quality = 80) {
    if (!url) return this.getFallbackImage();
    
    // For local placeholder images, return as-is
    if (url.startsWith('/placeholders/')) {
      return url;
    }
    
    // For Unsplash images, add optimization parameters
    if (url.includes('unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}auto=format&fit=crop&w=${width}&q=${quality}`;
    }
    
    // For Picsum images, add size parameters
    if (url.includes('picsum.photos')) {
      return `${url}${url.includes('?') ? '&' : '?'}w=${width}&q=${quality}`;
    }
    
    return url;
  }

  // Get fallback image
  getFallbackImage() {
    const fallbacks = [
      '/placeholders/city.jpg',
      '/placeholders/strawberry.jpg',
      '/placeholders/dog.jpg',
      '/placeholders/cool.jpg',
      '/placeholders/car.jpg'
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Create optimized img element
  createOptimizedImg(src, alt, className = '', width = 400) {
    const optimizedSrc = this.getOptimizedImageUrl(src, width);
    const img = document.createElement('img');
    img.src = optimizedSrc;
    img.alt = alt;
    img.className = className;
    img.loading = 'lazy';
    img.decoding = 'async';
    
    // Add error handling
    img.onerror = () => {
      img.src = this.getFallbackImage();
    };
    
    return img;
  }

  // Observe image for lazy loading
  observeImage(imgElement) {
    if (this.intersectionObserver && imgElement.dataset.src) {
      this.intersectionObserver.observe(imgElement);
    }
  }

  // Preload images for better performance (disabled to prevent console warnings)
  preloadCriticalImages() {
    // Images will be loaded on demand to prevent console warnings
    // about preloaded resources not being used within a few seconds
    return;
  }

  // Cleanup
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.imageCache.clear();
  }
}

// Create singleton instance
const imageOptimizer = new ImageOptimizer();

export default imageOptimizer; 