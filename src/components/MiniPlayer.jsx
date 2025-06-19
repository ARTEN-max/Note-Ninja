import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../contexts/AudioContext';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiSkipBack, FiSkipForward, FiShuffle } from 'react-icons/fi';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MiniPlayer = () => {
  const {
    currentAudio,
    isPlaying,
    duration,
    currentTime,
    togglePlay,
    updateProgress,
    seekTo,
    setDuration,
    audioElementRef,
    pauseAudio,
    nextAudio,
    previousAudio,
    shuffleAudio
  } = useAudio();

  const [isMuted, setIsMuted] = React.useState(false);
  const [audioReady, setAudioReady] = React.useState(false);

  // Add event listeners to audio element
  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (!audioElement) return;

    // Add event listeners
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('loadeddata', handleLoadedData);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    // Cleanup event listeners
    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('loadeddata', handleLoadedData);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    if (audioElementRef.current && currentAudio?.url) {
      if (isPlaying) {
        // Only play if user has interacted with the page and audio is ready
        if (audioElementRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
          const playPromise = audioElementRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Audio play failed:', error);
              // If autoplay is blocked, we need user interaction
              if (error.name === 'NotAllowedError') {
                console.log('Audio autoplay blocked. User interaction required.');
                pauseAudio();
              }
            });
          }
        } else {
          console.log('Audio not ready yet, waiting for data...');
          // Wait for audio to be ready
          const handleCanPlay = () => {
            if (isPlaying && audioElementRef.current) {
              audioElementRef.current.play().catch(error => {
                console.error('Audio play failed after ready:', error);
                pauseAudio();
              });
            }
            if (audioElementRef.current) {
              audioElementRef.current.removeEventListener('canplay', handleCanPlay);
            }
          };
          audioElementRef.current.addEventListener('canplay', handleCanPlay);
        }
      } else {
        audioElementRef.current.pause();
      }
    } else if (isPlaying) {
      console.log('Cannot play: missing audio element or URL');
      pauseAudio();
    }
  }, [isPlaying, currentAudio, audioElementRef, pauseAudio]);

  // Handle seeking
  useEffect(() => {
    if (audioElementRef.current && Math.abs(audioElementRef.current.currentTime - currentTime) > 0.5) {
      audioElementRef.current.currentTime = currentTime;
    }
  }, [currentTime, audioElementRef]);

  const handleTimeUpdate = () => {
    if (audioElementRef.current) {
      updateProgress(audioElementRef.current.currentTime);
      console.log('Time update:', audioElementRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioElementRef.current) {
      setAudioReady(true);
      setDuration(audioElementRef.current.duration);
      console.log('Loaded metadata, duration:', audioElementRef.current.duration);
    }
  };

  const handleLoadedData = () => {
    console.log('Loaded data event fired');
    if (audioElementRef.current && isPlaying && audioElementRef.current.src) {
      audioElementRef.current.play().catch(error => {
        console.error('Audio play failed after data loaded:', error);
        pauseAudio();
      });
    }
  };

  const handleProgressClick = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    seekTo(percent * duration);
  };

  const toggleMute = () => {
    if (audioElementRef.current) {
      audioElementRef.current.muted = !audioElementRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Handle audio ended
  const handleEnded = () => {
    console.log('Audio ended event fired');
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = 0;
      updateProgress(0);
    }
  };

  const handleError = (e) => {
    console.error('Audio error event fired:', e);
    if (audioElementRef.current) {
      const errorDetails = {
        error: audioElementRef.current.error,
        networkState: audioElementRef.current.networkState,
        readyState: audioElementRef.current.readyState,
        src: audioElementRef.current.src
      };
      console.error('Audio error details:', errorDetails);
      
      // Check for CORS error
      if (audioElementRef.current.error && audioElementRef.current.error.code === 4) {
        console.error('CORS Error detected. This is likely due to Firebase Storage CORS configuration.');
        console.error('Solutions:');
        console.error('1. Configure Firebase Storage CORS rules');
        console.error('2. Use a different audio hosting service');
        console.error('3. Deploy to production where CORS might be less restrictive');
      }
    } else {
      console.error('Audio element not available');
    }
    pauseAudio();
  };

  // Add handlers for next, previous, shuffle
  const handleNext = (e) => {
    e.stopPropagation();
    console.log('Next button clicked');
    nextAudio();
  };
  const handlePrevious = (e) => {
    e.stopPropagation();
    console.log('Previous button clicked');
    previousAudio();
  };
  const handleShuffle = (e) => {
    e.stopPropagation();
    console.log('Shuffle button clicked');
    shuffleAudio();
  };

  // Add debug to togglePlay
  const handlePlayPause = () => {
    console.log('Play/Pause button clicked');
    togglePlay();
  };

  // Add this useEffect after all hooks are defined, before the return statement
  useEffect(() => {
    if (audioElementRef.current && currentAudio?.url && isPlaying) {
      const tryPlay = () => {
        audioElementRef.current.play().catch((err) => {
          console.warn('Autoplay failed:', err);
        });
        audioElementRef.current.removeEventListener('loadedmetadata', tryPlay);
      };
      audioElementRef.current.addEventListener('loadedmetadata', tryPlay);
      // If metadata is already loaded, try to play immediately
      if (audioElementRef.current.readyState >= 1) {
        tryPlay();
      }
      return () => {
        if (audioElementRef.current) {
          audioElementRef.current.removeEventListener('loadedmetadata', tryPlay);
        }
      };
    }
  }, [currentAudio, isPlaying]);

  useEffect(() => {
    setAudioReady(false); // Reset when audio changes
  }, [currentAudio]);

  if (!currentAudio) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center ml-[240px]"
      >
        {/* Hidden audio element */}
        <audio
          ref={audioElementRef}
          src={currentAudio?.url || ''}
          preload="metadata"
          style={{ display: 'none' }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={handleLoadedData}
          onEnded={handleEnded}
          onError={handleError}
        />
        
        <div className="w-full">
          <div className="w-full bg-black shadow-2xl px-4 py-2 flex items-center gap-6" style={{ borderRadius: 0, minHeight: 0 }}>
            {/* Album Art */}
            <div className="w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-neutral-800 flex items-center justify-center">
              {/* Placeholder image or album art */}
              <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                <rect width="40" height="40" rx="6" fill="#222" />
                <circle cx="20" cy="20" r="10" fill="#444" />
              </svg>
            </div>
            {/* Title and Subject */}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-base truncate">{currentAudio.title}</span>
              <span className="text-xs text-neutral-300 truncate">{currentAudio.subject}</span>
            </div>
            {/* Green check icon (placeholder) */}
            <div className="ml-2 flex items-center">
              <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                <circle cx="11" cy="11" r="11" fill="#1ed760" />
                <path d="M7 11.5l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Controls */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex items-center gap-6 mb-1">
                {/* Shuffle */}
                <button 
                  onClick={handleShuffle} 
                  className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded hover:bg-white/10"
                  title="Shuffle"
                >
                  <FiShuffle size={20} />
                </button>
                {/* Previous */}
                <button 
                  onClick={handlePrevious} 
                  className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded hover:bg-white/10"
                  title="Previous"
                >
                  <FiSkipBack size={20} />
                </button>
                {/* Play/Pause */}
                <button
                  onClick={handlePlayPause}
                  disabled={!audioReady}
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-2xl shadow-lg mx-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <FiPause className="w-6 h-6" />
                  ) : (
                    <FiPlay className="w-6 h-6 ml-1" />
                  )}
                </button>
                {/* Next */}
                <button 
                  onClick={handleNext} 
                  className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded hover:bg-white/10"
                  title="Next"
                >
                  <FiSkipForward size={20} />
                </button>
                {/* Queue */}
                <button className="text-white/70 hover:text-white text-lg p-2 rounded hover:bg-white/10 transition-colors duration-200">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <rect x="3" y="6" width="14" height="2" rx="1" fill="currentColor"/>
                    <rect x="3" y="12" width="10" height="2" rx="1" fill="currentColor"/>
                  </svg>
                </button>
              </div>
              {/* Progress Bar */}
              <div className="flex items-center w-full gap-2">
                <span className="text-xs text-neutral-400 min-w-[36px]">{formatTime(isNaN(currentTime) ? 0 : currentTime)}</span>
                <div className="flex-1 h-1 bg-neutral-700 rounded-full relative cursor-pointer" onClick={handleProgressClick}>
                  <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${(duration && isFinite(duration) && !isNaN(duration)) ? (currentTime / duration) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-neutral-400 min-w-[36px] text-right">{formatTime((duration && isFinite(duration) && !isNaN(duration)) ? duration : 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniPlayer; 