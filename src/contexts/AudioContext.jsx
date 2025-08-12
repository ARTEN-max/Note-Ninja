import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import audioPerformanceMonitor from '../utils/audioPerformance';
import { storage } from '../firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioNotes, setAudioNotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const audioElementRef = useRef(null);
  const audioCacheRef = useRef(new Map()); // Cache for preloaded audio elements
  const shouldPlayRef = useRef(false); // NEW: tracks if play should be triggered after DOM update
  const hasColdPlayOccurredRef = useRef(false); // Tracks if we've successfully played at least once this session
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const preloadQueueRef = useRef([]); // Queue for preloading audio files

  const normalizeUrl = useCallback((url) => url || '', []);

  // Attempt to derive a fresh, valid download URL from a possibly stale URL
  const resolveFreshDownloadUrl = useCallback(async (inputUrl) => {
    let url = inputUrl || '';
    try {
      if (!url) return url;

      // First try: treat the existing https URL as a ref (SDK supports https/gs URLs)
      try {
        const r1 = storageRef(storage, url);
        const fresh1 = await getDownloadURL(r1);
        if (fresh1 && typeof fresh1 === 'string') return fresh1;
      } catch (_) {}

      // Fallback: extract the encoded object path between "/o/" and the query string, then decode it
      const oIndex = url.indexOf('/o/');
      if (oIndex !== -1) {
        const afterO = url.substring(oIndex + 3);
        const pathEncoded = afterO.split('?')[0];
        if (pathEncoded) {
          const decodedPath = decodeURIComponent(pathEncoded);
          try {
            const r2 = storageRef(storage, decodedPath);
            const fresh2 = await getDownloadURL(r2);
            if (fresh2 && typeof fresh2 === 'string') return fresh2;
          } catch (_) {}
        }
      }
    } catch (_) {}
    return url; // give back the original if we couldn't refresh
  }, []);

  // Enhanced preload audio with mobile optimization
  const preloadAudio = useCallback((audioNote) => {
    const rawUrl = audioNote?.url;
    const url = normalizeUrl(rawUrl);
    if (!url || audioCacheRef.current.has(url)) return;
    
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
    // Skip aggressive preloading on mobile to save bandwidth
    if (isMobile) {
      console.log('📱 Skipping preload on mobile for:', url);
      return;
    }
    
    const startTime = performance.now();
    const audio = new Audio();
    audio.preload = 'metadata'; // Lighter preload for better performance
    audio.src = url;
    
    // Store in cache once metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
      audioCacheRef.current.set(url, {
        duration: audio.duration,
        element: audio,
        loadedAt: Date.now()
      });
      audioPerformanceMonitor.trackLoadTime(url, startTime);
      
      // Remove from preload queue
      const index = preloadQueueRef.current.findIndex(item => item.url === url);
      if (index > -1) {
        preloadQueueRef.current.splice(index, 1);
      }
    });
    
    audio.addEventListener('error', (error) => {
      console.warn('Failed to preload audio:', url);
      audioPerformanceMonitor.trackError(url || audioNote.audioUrl || '', error);
      
      // Remove from preload queue on error
      const index = preloadQueueRef.current.findIndex(item => item.url === url);
      if (index > -1) {
        preloadQueueRef.current.splice(index, 1);
      }
    });
    
    // Add to preload queue
    preloadQueueRef.current.push({ url, audio });
  }, [normalizeUrl]);

  // Batch preload function for multiple audio files
  const preloadAudioBatch = useCallback((audioNotes, maxConcurrent = 3) => {
    const validNotes = audioNotes.filter(note => note?.url && !audioCacheRef.current.has(normalizeUrl(note.url)));
    
    // Process in batches to avoid overwhelming the browser
    const processBatch = (startIndex) => {
      const batch = validNotes.slice(startIndex, startIndex + maxConcurrent);
      batch.forEach(note => preloadAudio(note));
      
      if (startIndex + maxConcurrent < validNotes.length) {
        setTimeout(() => processBatch(startIndex + maxConcurrent), 100);
      }
    };
    
    if (validNotes.length > 0) {
      processBatch(0);
    }
  }, [preloadAudio, normalizeUrl]);

  const playWithRetry = useCallback(async (element, attempts = 3) => {
    for (let i = 0; i < attempts; i++) {
      try {
        const p = element.play();
        if (p && typeof p.then === 'function') await p;
        return true;
      } catch (err) {
        if (i === attempts - 1) throw err;
        await new Promise(r => setTimeout(r, 80));
      }
    }
    return false;
  }, []);

  // Optimized play function with immediate response
  const playAudio = useCallback(async (audioNote, index = null, retryCount = 0) => {
    console.log('🎵 playAudio called with:', { 
      audioNote: { 
        id: audioNote?.id, 
        title: audioNote?.title, 
        url: audioNote?.url,
        audioUrl: audioNote?.audioUrl
      }, 
      index, 
      retryCount 
    });
    
    // Check for audio URL in multiple possible fields
    let audioUrl = normalizeUrl(audioNote?.url || audioNote?.audioUrl || '');
    if (!audioUrl) {
      console.error('❌ No audio URL provided:', audioNote);
      return;
    }
    if (audioUrl === '') {
      console.error('❌ Empty audio URL provided for:', audioNote.title);
      return;
    }
    
    // Safeguard against invalid URLs
    if (audioUrl.includes('localhost') && !audioUrl.includes('firebasestorage')) {
      console.error('❌ Invalid audio URL detected (localhost page URL):', audioUrl);
      return;
    }

    // Try to refresh potentially stale Firebase Storage URLs
    try {
      const fresh = await resolveFreshDownloadUrl(audioUrl);
      if (fresh && typeof fresh === 'string') {
        audioUrl = fresh;
      }
    } catch (_) {}
    
    const playStartTime = performance.now();
    // Ensure audio element is mounted before proceeding
    const audioElement = audioElementRef.current;
    if (!audioElement) {
      console.warn('⚠️ Audio element not found, retrying...');
      if (retryCount < 5) {
        setTimeout(() => playAudio(audioNote, index, retryCount + 1), 50);
      } else {
        console.error('❌ Audio element not mounted after retries');
      }
      return;
    }
    
    console.log('🎵 Setting up audio playback...');
    setIsLoading(true);
    // Set ref to trigger play after DOM update
    shouldPlayRef.current = true;
    
    // Immediately try to initiate playback to preserve user gesture
    const quickPlayAttempt = () => {
      try {
        console.log('🎵 Quick play attempt to preserve user gesture...');
        const playPromise = audioElement.play();
        if (playPromise) {
          playPromise.then(() => {
            console.log('⚡ Quick play succeeded!');
            setIsPlaying(true);
            clearTimeout(loadingTimeout);
            setIsLoading(false);
            return true;
          }).catch(() => {
            console.log('⏳ Quick play failed, continuing with setup...');
            return false;
          });
        }
      } catch (e) {
        console.log('⏳ Quick play error:', e?.name || e);
        return false;
      }
    };
    
    // Try quick play if audio element has some data
    if (audioElement.readyState > 0) {
      quickPlayAttempt();
    }
    
    // Mobile-adaptive timeout
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const timeoutDuration = isMobile ? 500 : 200; // Longer timeout for mobile networks
    const loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout reached, clearing loading state');
      setIsLoading(false);
    }, timeoutDuration);
    // Immediately update UI state for instant feedback
    setCurrentAudio(audioNote);
    if (index !== null) {
      setCurrentIndex(index);
    } else {
      const idx = audioNotes.findIndex(n => n.id === audioNote.id);
      setCurrentIndex(idx);
    }
    
    try {
      // Check if we have cached metadata
      const cached = audioCacheRef.current.get(audioNote.url);
      let needsToWait = false;
      
      // Add 'playing' event listener to clear loading as soon as playback starts
      const onPlaying = () => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
        setIsPlaying(true);
        audioPerformanceMonitor.trackPlayTime(audioUrl, playStartTime);
        audioElement.removeEventListener('playing', onPlaying);
      };
      audioElement.addEventListener('playing', onPlaying);
      
      if (audioElement.src !== audioUrl) {
        console.log('🎵 Loading new audio URL:', audioUrl);
        
        // Optimize for mobile playback
        try { 
          audioElement.setAttribute('playsinline', ''); 
          audioElement.setAttribute('webkit-playsinline', ''); 
          audioElement.setAttribute('x-webkit-airplay','allow');
          // Mobile-specific optimizations
          if (/Mobi|Android/i.test(navigator.userAgent)) {
            audioElement.setAttribute('preload', 'metadata'); // Lighter preload for mobile
            audioElement.setAttribute('crossorigin', 'anonymous'); // Help with mobile CORS
          } else {
            audioElement.preload = 'auto'; // Full preload for desktop
          }
        } catch {}
        audioElement.autoplay = true;

        // Mobile-optimized progressive loading
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Mobile: More aggressive early play attempts
          const onProgress = () => {
            if (audioElement.buffered.length > 0 && audioElement.buffered.end(0) > 1) {
              audioElement.removeEventListener('progress', onProgress);
              clearTimeout(loadingTimeout);
              setIsLoading(false);
              const playPromise = audioElement.play();
              if (playPromise) {
                playPromise.then(() => setIsPlaying(true)).catch(() => {
                  // Fallback to canplaythrough for mobile
                  const onCanPlayThrough = () => {
                    audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
                    audioElement.play().then(() => setIsPlaying(true)).catch(e => console.log('mobile fallback failed', e));
                  };
                  audioElement.addEventListener('canplaythrough', onCanPlayThrough);
                });
              }
            }
          };
          audioElement.addEventListener('progress', onProgress);
        } else {
          // Desktop: Play as soon as ANY data starts loading
          const onLoadStart = () => {
            audioElement.removeEventListener('loadstart', onLoadStart);
            clearTimeout(loadingTimeout);
            setIsLoading(false);
            const playPromise = audioElement.play();
            if (playPromise) {
              playPromise.then(() => {
                setIsPlaying(true);
              }).catch(() => {
                const onCanPlay = () => {
                  audioElement.removeEventListener('canplay', onCanPlay);
                  const retryPromise = audioElement.play();
                  if (retryPromise) {
                    retryPromise.then(() => setIsPlaying(true)).catch(e => console.log('canplay failed', e));
                  }
                };
                audioElement.addEventListener('canplay', onCanPlay);
              });
            }
          };
          audioElement.addEventListener('loadstart', onLoadStart);
        }

        // Set src and force load. Mobile-optimized cache strategy
        const urlToUse = !hasColdPlayOccurredRef.current && !isMobile
          ? audioUrl + (audioUrl.includes('?') ? '&' : '?') + 'v=' + Date.now()
          : audioUrl; // Skip cache-buster on mobile to avoid extra requests
        audioElement.src = urlToUse;
        try { audioElement.load(); } catch {}
        needsToWait = true;

        // Retry once on error by resolving a fresh URL
        const onErrorOnce = async () => {
          audioElement.removeEventListener('error', onErrorOnce);
          try {
            const refreshed = await resolveFreshDownloadUrl(audioUrl);
            if (refreshed && refreshed !== audioUrl) {
              console.warn('Retrying audio load with refreshed URL');
              audioElement.src = refreshed;
              try { audioElement.load(); } catch {}
              try { await playWithRetry(audioElement, 2); } catch {}
            }
          } catch {}
        };
        audioElement.addEventListener('error', onErrorOnce, { once: true });
        
        // ULTRA-AGGRESSIVE: Try to play immediately, no waiting
        try {
          const playPromise = audioElement.play();
          console.log('⚡ INSTANT play attempt started');
          playPromise.then(() => {
            console.log('⚡ INSTANT play succeeded');
            setIsPlaying(true);
            clearTimeout(loadingTimeout);
            setIsLoading(false);
            needsToWait = false;
          }).catch(e => {
            console.log('⏳ Immediate play deferred, will retry on loadstart:', e?.name || e);
            // Let loadstart handle it
          });
        } catch (e) {
          console.log('⏳ Immediate play failed synchronously:', e?.name || e);
        }
      }
      
      if (!needsToWait) {
        console.log('🎵 Playing existing audio...');
        try {
          const playPromise = audioElement.play();
          if (playPromise) {
            playPromise.then(() => {
              console.log('✅ Direct play successful');
              setIsPlaying(true);
              hasColdPlayOccurredRef.current = true;
              clearTimeout(loadingTimeout);
              setIsLoading(false);
            }).catch(error => {
              console.error('❌ Direct play failed:', error);
              setIsPlaying(false);
              setIsLoading(false);
              clearTimeout(loadingTimeout);
            });
          }
        } catch (error) {
          console.error('❌ Direct play failed:', error);
          setIsPlaying(false);
          setIsLoading(false);
          clearTimeout(loadingTimeout);
        }
      }
      
      // Preload next few tracks in background
      const currentIdx = index !== null ? index : audioNotes.findIndex(n => n.id === audioNote.id);
      const nextNotes = [];
      for (let i = 1; i <= 3; i++) {
        const nextIdx = (currentIdx + i) % audioNotes.length;
        if (audioNotes[nextIdx]) {
          nextNotes.push(audioNotes[nextIdx]);
        }
      }
      if (nextNotes.length > 0) {
        preloadAudioBatch(nextNotes, 2);
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      audioPerformanceMonitor.trackError(audioUrl, error);
      setIsPlaying(false);
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    }
  }, [audioNotes, preloadAudio, preloadAudioBatch, playWithRetry, normalizeUrl, resolveFreshDownloadUrl]);
  

  const pauseAudio = useCallback(() => {
    setIsPlaying(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!currentAudio) return;
    const audioElement = audioElementRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      pauseAudio();
    } else {
      // Try to resume existing audio first (preserves playback position)
      if (audioElement.src && audioElement.readyState >= 1) {
        try {
          console.log('🎵 Resuming audio from current position:', audioElement.currentTime);
          const playPromise = audioElement.play();
          if (playPromise) {
            await playPromise;
            setIsPlaying(true);
            console.log('✅ Resume successful');
            return; // Successfully resumed, don't reload
          }
        } catch (error) {
          console.log('⚠️ Resume failed, trying full reload:', error?.name || error);
        }
      }
      
      // Only if resume fails completely, reload the audio
      console.log('🔄 Reloading audio due to resume failure');
      const index = audioNotes.findIndex(n => n.id === currentAudio.id);
      playAudio(currentAudio, index >= 0 ? index : null);
    }
  }, [currentAudio, isPlaying, pauseAudio, audioNotes, playAudio, audioElementRef]);

  const nextTrack = useCallback(() => {
    if (audioNotes.length === 0) return;
    const nextIndex = (currentIndex + 1) % audioNotes.length;
    const nextAudio = audioNotes[nextIndex];
    if (nextAudio) {
      playAudio(nextAudio, nextIndex);
    }
  }, [audioNotes, currentIndex, playAudio]);

  const prevTrack = useCallback(() => {
    if (audioNotes.length === 0) return;
    const prevIndex = currentIndex <= 0 ? audioNotes.length - 1 : currentIndex - 1;
    const prevAudio = audioNotes[prevIndex];
    if (prevAudio) {
      playAudio(prevAudio, prevIndex);
    }
  }, [audioNotes, currentIndex, playAudio]);

  const shuffleTrack = useCallback(() => {
    if (audioNotes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * audioNotes.length);
    const randomAudio = audioNotes[randomIndex];
    if (randomAudio) {
      playAudio(randomAudio, randomIndex);
    }
  }, [audioNotes, playAudio]);

  const resetAudio = useCallback(() => {
    setCurrentAudio(null);
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentIndex(-1);
    setProgress(0);
    setDuration(0);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
  }, []);

  const setAudioNotesWithPreload = useCallback((notes) => {
    setAudioNotes(notes);
    // Preload first few audio files for instant playback
    if (notes.length > 0) {
      const firstFew = notes.slice(0, 3);
      preloadAudioBatch(firstFew, 2);
    }
  }, [preloadAudioBatch]);

  // Cleanup function for audio cache
  const cleanupAudioCache = useCallback(() => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    for (const [url, data] of audioCacheRef.current.entries()) {
      if (now - data.loadedAt > maxAge) {
        audioCacheRef.current.delete(url);
      }
    }
  }, []);

  // Cleanup cache periodically
  useEffect(() => {
    const interval = setInterval(cleanupAudioCache, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [cleanupAudioCache]);

  // Add event listeners for debugging
  React.useEffect(() => {
    const audioElement = audioElementRef.current;
    if (!audioElement) return;
    const logEvent = (e) => {
      console.log('[AUDIO EVENT]', e.type);
      if (e.type === 'error') {
        console.error('❌ Audio error details:', {
          error: e.target.error,
          networkState: e.target.networkState,
          readyState: e.target.readyState,
          src: e.target.src,
          currentTime: e.target.currentTime,
          duration: e.target.duration
        });
      }
    };
    audioElement.addEventListener('play', logEvent);
    audioElement.addEventListener('playing', logEvent);
    audioElement.addEventListener('pause', logEvent);
    audioElement.addEventListener('waiting', logEvent);
    audioElement.addEventListener('loadedmetadata', logEvent);
    audioElement.addEventListener('error', logEvent);
    audioElement.addEventListener('stalled', logEvent);
    audioElement.addEventListener('suspend', logEvent);
    audioElement.addEventListener('abort', logEvent);
    return () => {
      audioElement.removeEventListener('play', logEvent);
      audioElement.removeEventListener('playing', logEvent);
      audioElement.removeEventListener('pause', logEvent);
      audioElement.removeEventListener('waiting', logEvent);
      audioElement.removeEventListener('loadedmetadata', logEvent);
      audioElement.removeEventListener('error', logEvent);
      audioElement.removeEventListener('stalled', logEvent);
      audioElement.removeEventListener('suspend', logEvent);
      audioElement.removeEventListener('abort', logEvent);
    };
  }, []);

  React.useEffect(() => {
    console.log('[STATE] isLoading:', isLoading, 'isPlaying:', isPlaying, 'currentAudio:', currentAudio?.title);
  }, [isLoading, isPlaying, currentAudio]);

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
      // Only cleanup if we're actually unmounting or switching audio
      // Don't clear src during normal playback
      if (!currentAudio) {
        audioElement.src = '';
        audioElement.load();
      }
    };
  }, [currentAudio, audioElementRef, nextTrack, progress, duration]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentAudio,
    isPlaying,
    isLoading,
    playAudio,
    pauseAudio,
    togglePlay,
    audioElementRef,
    audioNotes,
    setAudioNotes: setAudioNotesWithPreload,
    nextTrack,
    prevTrack,
    shuffleTrack,
    resetAudio,
    preloadAudio,
    shouldPlayRef,
    progress,
    duration,
  }), [
    currentAudio,
    isPlaying,
    isLoading,
    playAudio,
    pauseAudio,
    togglePlay,
    audioNotes,
    setAudioNotesWithPreload,
    nextTrack,
    prevTrack,
    shuffleTrack,
    resetAudio,
    preloadAudio,
    progress,
    duration,
  ]);

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}; 