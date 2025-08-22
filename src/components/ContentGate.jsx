import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import GateModal from './GateModal';
import { canAccessGuide, canAccessAudio, trackGuideAccess, trackAudioUsage } from '../utils/meterUtils';

const ContentGate = ({ 
  children, 
  type = 'feature', // 'feature', 'content', 'time'
  threshold = 0.35, // For content gating (percentage to show)
  timeLimit = 60, // For time-based gating (seconds)
  onTimeExceeded,
  gateType = 'general', // For modal content
  className = '',
  disabled = false,
  showPreview = true,
  onGateTriggered
}) => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [hasBeenGated, setHasBeenGated] = useState(false);

  // If user is logged in, show content without gating
  if (currentUser) {
    return <>{children}</>;
  }

  // If disabled, show content without gating
  if (disabled) {
    return <>{children}</>;
  }

  const handleGateClick = () => {
    setShowModal(true);
    if (onGateTriggered) {
      onGateTriggered();
    }
  };

  const handleTimeExceeded = () => {
    setHasBeenGated(true);
    if (onTimeExceeded) {
      onTimeExceeded();
    }
    setShowModal(true);
  };

  // For feature gating (buttons, actions)
  if (type === 'feature') {
    // For features, we simply check if user is authenticated
    if (!currentUser) {
      return (
        <>
          <div 
            onClick={handleGateClick}
            className={`relative ${className} opacity-60 cursor-pointer inline-flex items-center`}
          >
            {React.cloneElement(children, {
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGateClick();
              }
            })}
            <FiLock size={12} className="text-gray-500 ml-1" />
          </div>
          
          <GateModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
            type={gateType}
          />
        </>
      );
    }

    return (
      <>
        {children}
        
        <GateModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          type={gateType}
        />
      </>
    );
  }

  // For content gating (show partial content)
  if (type === 'content') {
    return (
      <>
        <ContentWrapper
          threshold={threshold}
          onGateClick={handleGateClick}
          showPreview={showPreview}
          className={className}
        >
          {children}
        </ContentWrapper>
        
        <GateModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          type={gateType}
        />
      </>
    );
  }

  // For time-based gating (audio, video)
  if (type === 'time') {
    return (
      <>
        <TimeGate
          timeLimit={timeLimit}
          onTimeExceeded={handleTimeExceeded}
          hasBeenGated={hasBeenGated}
          className={className}
        >
          {children}
        </TimeGate>
        
        <GateModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          type={gateType}
        />
      </>
    );
  }

  return <>{children}</>;
};

// Content wrapper for partial content display
const ContentWrapper = ({ children, threshold, onGateClick, showPreview, className }) => {
  const [showFullContent, setShowFullContent] = useState(false);

  if (showFullContent) {
    return <div className={className}>{children}</div>;
  }

  // Extract content for preview
  const content = React.Children.toArray(children);
  const previewLength = Math.floor(content.length * threshold);
  const previewContent = content.slice(0, previewLength);

  return (
    <div className={`relative ${className}`}>
      {/* Preview content */}
      <div className={showPreview ? '' : 'filter blur-sm'}>
        {previewContent}
      </div>

      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

      {/* Gate overlay */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={onGateClick}
          className="bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiLock size={20} />
          <span>Unlock full content</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

// Time-based gate component
const TimeGate = ({ children, timeLimit, onTimeExceeded, hasBeenGated, className }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);

  React.useEffect(() => {
    let interval;
    
    if (isActive && !hasBeenGated) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (newTime >= timeLimit) {
            setIsActive(false);
            onTimeExceeded();
            // Track audio usage
            trackAudioUsage(timeLimit / 60);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, hasBeenGated, timeLimit, onTimeExceeded]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  if (hasBeenGated) {
    return (
      <div className={`relative ${className}`}>
        <div className="filter blur-sm opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center">
            <FiLock size={48} className="mx-auto mb-4" />
            <p className="text-lg font-semibold">Time limit reached</p>
            <p className="text-sm opacity-80">Sign in for unlimited access</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {React.cloneElement(children, {
        onPlay: startTimer,
        onPause: pauseTimer,
        onEnded: pauseTimer,
        // Add time overlay if needed
        timeRemaining: timeLimit - timeElapsed
      })}
      
      {/* Time warning overlay */}
      {timeElapsed > timeLimit * 0.8 && timeElapsed < timeLimit && (
        <motion.div 
          className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {timeLimit - timeElapsed}s remaining
        </motion.div>
      )}
    </div>
  );
};

export default ContentGate;
