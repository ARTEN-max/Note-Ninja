import React from 'react';

const Skeleton = ({ variant = 'rect', width = '100%', height = 16, className = '' }) => {
  let shapeClass = '';
  if (variant === 'circle') {
    shapeClass = 'rounded-full';
  } else if (variant === 'text') {
    shapeClass = 'rounded';
  } else {
    shapeClass = 'rounded-lg';
  }
  return (
    <div
      className={`bg-gray-300 animate-pulse ${shapeClass} ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton; 