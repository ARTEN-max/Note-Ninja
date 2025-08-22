import React, { useRef, useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiShuffle, FiList, FiMusic, FiLock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { Listbox } from '@headlessui/react';
import { FiCheck } from 'react-icons/fi';
import GateModal from './GateModal';

const MiniPlayer = () => {
  const { currentAudio, isPlaying, isLoading, playAudio, pauseAudio, togglePlay, audioElementRef, nextTrack, prevTrack, shuffleTrack, shouldPlayRef, isGated, gateTriggered, previewTimeLimit } = useAudio();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isHidden, setIsHidden] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);
  const { currentUser } = useAuth();


  // Volume drag state
  const volumeBarRef = useRef();
  const isDraggingVolume = useRef(false);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 640 : false);

  const [showTimeTooltip, setShowTimeTooltip] = useState(false);
  const tooltipTimeoutRef = useRef();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show gate modal when audio is gated
  useEffect(() => {
    if (gateTriggered && !currentUser) {
      setShowGateModal(true);
    }
  }, [gateTriggered, currentUser]);

  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (!audioElement) return;

    const updateProgress = () => setProgress(audioElement.currentTime);
    const updateDuration = () => {
      if (!isNaN(audioElement.duration) && isFinite(audioElement.duration)) {
        setDuration(audioElement.duration);
      }
    };

    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    audioElement.addEventListener('ended', () => {
      // Auto-play next track when current ends
      nextTrack();
    });

    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
      audioElement.removeEventListener('ended', nextTrack);
    };
  }, [currentAudio, audioElementRef, nextTrack]);
  
  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (audioElement) {
      audioElement.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioElementRef]);

  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (audioElement) {
      audioElement.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, audioElementRef]);

  
  useEffect(() => {
    setImgError(false);
  }, [currentAudio]);

  // Handle drag events for volume
  useEffect(() => {
    const handleMove = (e) => {
      if (!isDraggingVolume.current || !volumeBarRef.current) return;
      const rect = volumeBarRef.current.getBoundingClientRect();
      let clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let newVolume = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setVolume(newVolume);
      if (isMuted) setIsMuted(false);
    };
    const handleUp = () => {
      isDraggingVolume.current = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
    if (isDraggingVolume.current) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isMuted]);

  const handlePlayPause = () => {
    console.log('🎵 MiniPlayer: handlePlayPause called');
    console.log('🎵 MiniPlayer: currentAudio:', currentAudio);
    if (!currentAudio) return;
    togglePlay();
  };

  const handleSeek = (e) => {
    const audioElement = audioElementRef.current;
    if (!audioElement || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const seekTime = ((e.clientX - rect.left) / rect.width) * duration;
    audioElement.currentTime = seekTime;
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleQueue = () => console.log('Queue clicked');

  const audioTitle = currentAudio?.title || 'No audio selected';
  const audioSubtitle = currentAudio?.subject || 'Select a track to play';
  const albumArt = currentAudio?.albumArt || '/path/to/default/art.jpg';

  // When currentAudio changes, if shouldPlayRef.current is true, play after loadedmetadata
  // useEffect(() => {
  //   const audioElement = audioElementRef.current;
  //   if (!audioElement || !currentAudio || !(currentAudio.url || currentAudio.audioUrl)) return;
  //   if (!shouldPlayRef?.current) return;
  //   const onReady = () => {
  //     audioElement.play().catch(() => {});
  //     shouldPlayRef.current = false;
  //     audioElement.removeEventListener('loadedmetadata', onReady);
  //   };
  //   audioElement.addEventListener('loadedmetadata', onReady);
  //   return () => audioElement.removeEventListener('loadedmetadata', onReady);
  // }, [currentAudio, audioElementRef, shouldPlayRef]);

  const handleMobileProgressBarTap = () => {
    setShowTimeTooltip(true);
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => setShowTimeTooltip(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  // Add mutation observer to track audio element src changes
  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (!audioElement) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          const newSrc = audioElement.getAttribute('src');
          console.log('🎵 Audio element src changed to:', newSrc);
          if (newSrc && newSrc.includes('localhost') && !newSrc.includes('firebasestorage')) {
            console.error('❌ Audio element src was set to invalid URL:', newSrc);
          }
        }
      });
    });

    observer.observe(audioElement, { attributes: true, attributeFilter: ['src'] });

    return () => observer.disconnect();
  }, [audioElementRef]);

  useEffect(() => {
    // Warm up audio on first user interaction to allow immediate play later
    const warmup = () => {
      const el = audioElementRef.current;
      if (!el) return;
      try {
        el.play().then(() => {
          el.pause();
          el.currentTime = 0;
        }).catch(() => {});
      } catch {}
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) {
          const ctx = new Ctx();
          // Create a short silent buffer to unlock
          const buf = ctx.createBuffer(1, 1, 22050);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
          try { src.start(0); } catch {}
        }
      } catch {}
      window.removeEventListener('touchstart', warmup);
      window.removeEventListener('click', warmup);
    };
    window.addEventListener('touchstart', warmup, { once: true, passive: true });
    window.addEventListener('click', warmup, { once: true });
    return () => {
      window.removeEventListener('touchstart', warmup);
      window.removeEventListener('click', warmup);
    };
  }, [audioElementRef]);

  return (
    <>
      {/* Hidden audio element for the AudioContext to control */}
      <audio
        ref={audioElementRef}
        preload={/Mobi|Android/i.test(navigator.userAgent) ? "none" : "metadata"}
        playsInline
        x-webkit-airplay="allow"
        style={{ display: 'none' }}
        onPlay={() => console.log('🎵 Audio play event')}
        onPause={() => console.log('🎵 Audio pause event')}
        onLoadedMetadata={() => console.log('🎵 Audio metadata loaded')}
        onError={(e) => console.error('🎵 Audio error:', e)}
      />
      {currentAudio && !isHidden && (
        isMobile ? (
          <div className="miniplayer-mobile-spotify">
            <img src={albumArt} alt={audioTitle} className="miniplayer-mobile-spotify-art" />
            <div className="miniplayer-mobile-spotify-info">
              <div className="miniplayer-mobile-spotify-title">{audioTitle}</div>
              <div className="miniplayer-mobile-spotify-artist">{audioSubtitle}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePlayPause} className="miniplayer-mobile-spotify-play">
                {isPlaying ? <FiPause /> : <FiPlay />}
              </button>
              <button 
                onClick={() => setIsHidden(true)} 
                className="text-white/70 hover:text-white text-sm"
                title="Hide mini player"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div 
              className="miniplayer-mobile-spotify-progress" 
              onClick={handleMobileProgressBarTap} 
              style={{ 
                cursor: 'pointer',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '0 0 1.5rem 1.5rem'
              }}
            >
              <div 
                className="miniplayer-mobile-spotify-progress-bar" 
                style={{ 
                  width: duration ? `${(progress / duration) * 100}%` : '0%',
                  height: '100%',
                  backgroundColor: '#b266ff',
                  borderRadius: '0 0 1.5rem 1.5rem',
                  transition: 'width 0.2s'
                }}
              ></div>
            </div>
            {showTimeTooltip && (
              <div className="miniplayer-mobile-spotify-tooltip" style={{ position: 'absolute', left: '50%', bottom: '110%', transform: 'translateX(-50%)' }}>
                {formatTime(progress)} / {formatTime(duration)}
              </div>
            )}
          </div>
        ) : (
          <div className="fixed left-0 lg:left-[240px] right-0 z-[9999] flex justify-end pointer-events-none bottom-14 md:bottom-0">
            <div className="w-full bg-black shadow-2xl px-2 sm:px-4 lg:px-6 py-1 sm:py-2 flex items-center gap-2 sm:gap-6 pointer-events-auto h-[60px] sm:h-[80px] lg:h-[90px]">
              {/* Left Section: Album Art & Title */}
              <div className="flex items-center gap-2 sm:gap-3 w-1/3 min-w-0">
                {imgError ? (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center rounded-md bg-gradient-to-br from-purple-700 to-purple-400 border-2 border-white/20">
                    <FiMusic className="text-white text-xl sm:text-2xl" />
                  </div>
                ) : (
                  <img
                    src={albumArt}
                    alt={audioTitle}
                    className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 rounded-md object-cover border border-white/10"
                    onError={() => setImgError(true)}
                  />
                )}
                <div className="flex-col min-w-0 hidden sm:flex">
                  <span className="font-bold text-white text-xs sm:text-sm truncate">{audioTitle}</span>
                  <span className="text-xs text-neutral-400 truncate">{audioSubtitle}</span>
                </div>
              </div>

              {/* Center Section: Controls & Progress Bar */}
              <div className="flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 min-w-0">
                {/* Row 1: Playback Controls */}
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <button onClick={shuffleTrack} className="text-neutral-400 text-lg sm:text-xl hover:text-white"><FiShuffle /></button>
                  <button onClick={prevTrack} className="text-neutral-400 text-xl sm:text-2xl hover:text-white"><FiSkipBack /></button>
                  <button
                    onClick={handlePlayPause}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                    disabled={!currentAudio || !(currentAudio.url || currentAudio.audioUrl) || isLoading}
                  >
                    {isLoading && !isPlaying ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                      <FiPause className="text-xl sm:text-2xl" />
                    ) : (
                      <FiPlay className="text-xl sm:text-2xl ml-1" />
                    )}
                  </button>
                  <button onClick={nextTrack} className="text-neutral-400 text-xl sm:text-2xl hover:text-white"><FiSkipForward /></button>
                </div>
                {/* Row 2: Progress Bar */}
                <div className="flex items-center gap-2 w-full max-w-md">
                  <span className="text-xs text-neutral-400 w-10 text-right">{formatTime(progress)}</span>
                  <div className="flex-1 h-1 bg-neutral-700 rounded-full relative cursor-pointer group" onClick={handleSeek}>
                    <div className="h-full bg-white rounded-full relative" style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}>
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 w-10 text-left">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Section: Volume + Speed Control */}
              <div className="items-center justify-end gap-2 w-1/3 min-w-[120px] sm:min-w-[180px] hidden lg:flex">
                <Listbox value={playbackSpeed} onChange={setPlaybackSpeed}>
                  <div className="relative w-[72px]">
                    <Listbox.Button className="w-full bg-neutral-900 border border-white/10 text-white text-xs rounded-full px-2 py-[2px] text-center font-mono hover:bg-neutral-800 transition-all">
                      {playbackSpeed.toFixed(2).replace(/\.00$/, '')}x
                    </Listbox.Button>

                    <Listbox.Options  className="absolute bottom-[calc(100%+4px)] right-0 max-h-60 w-full overflow-auto rounded-md bg-neutral-900 py-1 text-xs text-white shadow-lg ring-1 ring-black/20 focus:outline-none z-50">
                      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                        <Listbox.Option
                          key={speed}
                          value={speed}
                          className={({ active }) =>
                            `cursor-pointer select-none relative py-1.5 pl-3 pr-8 ${
                              active ? 'bg-sour-lavender text-black' : 'text-white'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block font-mono ${selected ? 'font-bold' : ''}`}>
                                {speed.toFixed(2).replace(/\.00$/, '')}x
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 right-2 flex items-center text-sour-lavender">
                                  <FiCheck />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>

                <button onClick={() => setIsMuted((m) => !m)} className="text-neutral-400 hover:text-white" title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}>
                  {isMuted || volume === 0 ? <FiVolumeX className="text-xl" /> : <FiVolume2 className="text-xl" />}
                </button>

                <div
                  ref={volumeBarRef}
                  className="w-16 sm:w-24 h-1 bg-neutral-700 rounded-full relative cursor-pointer group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const newVolume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    setVolume(newVolume);
                    if (isMuted) setIsMuted(false);
                  }}
                  onMouseDown={() => {
                    isDraggingVolume.current = true;
                  }}
                  onTouchStart={() => {
                    isDraggingVolume.current = true;
                  }}
                >
                  <div className="h-full bg-white rounded-full relative" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsHidden(true)} 
                  className="text-neutral-400 hover:text-white ml-2" 
                  title="Hide mini player"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        )
      )}
      
      {/* Show Mini Player Button (when hidden) */}
      {currentAudio && isHidden && (
        <button
          onClick={() => setIsHidden(false)}
          className="fixed bottom-4 right-4 z-[9999] bg-[#b266ff] hover:bg-[#9644e8] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          title="Show mini player"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* Gate Modal */}
      <GateModal 
        isOpen={showGateModal} 
        onClose={() => setShowGateModal(false)} 
        type="audio"
      />
    </>
  );
};

export default MiniPlayer; 
