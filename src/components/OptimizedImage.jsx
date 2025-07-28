import React, { useState, useRef, useEffect, memo } from 'react';
import imageOptimizer from '../utils/imageOptimizer';

const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  width = 400, 
  height = 300,
  fallbackSrc = null,
  priority = false,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setImgSrc(imageOptimizer.getFallbackImage());
      return;
    }

    // Get optimized source URL
    const optimizedSrc = imageOptimizer.getOptimizedImageUrl(src, width);
    setImgSrc(optimizedSrc);
  }, [src, width]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setImgError(true);
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setImgSrc(imageOptimizer.getFallbackImage());
    }
  };

  const finalSrc = imgError ? (fallbackSrc || imageOptimizer.getFallbackImage()) : imgSrc;

  return (
    <img
      ref={imgRef}
      src={finalSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : ''}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        ...props.style
      }}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage; 