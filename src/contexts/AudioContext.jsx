import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import audioPerformanceMonitor from '../utils/audioPerformance';

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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Preload audio metadata for faster loading
  const preloadAudio = useCallback((audioNote) => {
    if (!audioNote?.url || audioCacheRef.current.has(audioNote.url)) return;
    
    const startTime = performance.now();
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = audioNote.url;
    
    // Store in cache once metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
      audioCacheRef.current.set(audioNote.url, {
        duration: audio.duration,
        element: audio
      });
      audioPerformanceMonitor.trackLoadTime(audioNote.url, startTime);
    });
    
    audio.addEventListener('error', (error) => {
      console.warn('Failed to preload audio:', audioNote.url);
      audioPerformanceMonitor.trackError(audioNote.url || audioNote.audioUrl || '', error);
    });
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
      const audioUrl = audioNote?.url || audioNote?.audioUrl || '';
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
        setIsLoading(false);
        setIsPlaying(true);
        audioPerformanceMonitor.trackPlayTime(audioUrl, playStartTime);
        audioElement.removeEventListener('playing', onPlaying);
      };
      audioElement.addEventListener('playing', onPlaying);
      if (audioElement.src !== audioUrl) {
        console.log('🎵 Loading new audio URL:', audioUrl);
        console.log('🎵 Current audio element src:', audioElement.src);
        console.log('🎵 Audio note object:', audioNote);
        
        // Check if the URL is valid
        if (!audioUrl || audioUrl === '') {
          console.error('❌ Invalid audio URL:', audioUrl);
          setIsPlaying(false);
          setIsLoading(false);
          return;
        }
        
        // Attach event listener BEFORE setting src
        const onReady = async () => {
          console.log('🎵 Audio metadata loaded, attempting to play...');
          console.log('🎵 Audio element details:', {
            src: audioElement.src,
            duration: audioElement.duration,
            readyState: audioElement.readyState,
            networkState: audioElement.networkState
          });
          try {
            await audioElement.play();
            console.log('✅ Audio play successful');
          } catch (error) {
            console.error('❌ Failed to play audio:', error);
            console.error('❌ Error details:', {
              name: error.name,
              message: error.message,
              code: error.code
            });
            audioPerformanceMonitor.trackError(audioUrl, error);
            setIsPlaying(false);
            setIsLoading(false);
          }
          audioElement.removeEventListener('loadedmetadata', onReady);
        };
        
        // Add error handling for the audio element
        const onError = (error) => {
          console.error('❌ Audio element error:', error);
          console.error('❌ Audio element error details:', {
            error: audioElement.error,
            networkState: audioElement.networkState,
            readyState: audioElement.readyState,
            src: audioElement.src
          });
          setIsPlaying(false);
          setIsLoading(false);
        };
        
                  audioElement.addEventListener('error', onError);
          audioElement.addEventListener('loadedmetadata', onReady);
          console.log('🎵 Setting audio element src to:', audioUrl);
          audioElement.src = audioUrl;
          audioElement.preload = 'auto';
          needsToWait = true;
        
        // Clean up error listener when metadata loads
        audioElement.addEventListener('loadedmetadata', () => {
          audioElement.removeEventListener('error', onError);
        }, { once: true });
      }
      if (!needsToWait) {
        console.log('🎵 Playing existing audio...');
        try {
          await audioElement.play();
          console.log('✅ Direct play successful');
        } catch (error) {
          console.error('❌ Direct play failed:', error);
          console.error('❌ Direct play error details:', {
            name: error.name,
            message: error.message,
            code: error.code
          });
          setIsPlaying(false);
          setIsLoading(false);
        }
      }
      // Preload next few tracks in background
      const currentIdx = index !== null ? index : audioNotes.findIndex(n => n.id === audioNote.id);
      for (let i = 1; i <= 3; i++) {
        const nextIdx = (currentIdx + i) % audioNotes.length;
        if (audioNotes[nextIdx]) {
          preloadAudio(audioNotes[nextIdx]);
        }
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      audioPerformanceMonitor.trackError(audioUrl, error);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [audioNotes, preloadAudio]);

  const pauseAudio = useCallback(() => {
    setIsPlaying(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!currentAudio || !(currentAudio.url || currentAudio.audioUrl)) return;
    const audioElement = audioElementRef.current;
    const audioUrl = currentAudio.url || currentAudio.audioUrl || '';
    if (!audioElement) return;

    // Safeguard against invalid URLs
    if (audioUrl.includes('localhost') && !audioUrl.includes('firebasestorage')) {
      console.error('❌ Invalid audio URL detected (localhost page URL):', audioUrl);
      return;
    }

    if (isPlaying) {
      pauseAudio();
    } else {
      try {
        // If src is not set or is different, set it and wait for loadedmetadata
        if (!audioElement.src || audioElement.src !== audioUrl) {
          console.log('togglePlay: setting src to', audioUrl);
          console.log('togglePlay: current audio element src was', audioElement.src);
          audioElement.src = audioUrl;
          audioElement.preload = 'auto';
          // Wait for loadedmetadata before playing
          const playAfterLoad = () => {
            console.log('togglePlay: loadedmetadata, now playing');
            console.log('togglePlay: final audio element src is', audioElement.src);
            audioElement.play().then(() => {
              setIsPlaying(true);
            }).catch((error) => {
              console.error('Failed to resume audio after loadedmetadata:', error);
            });
            audioElement.removeEventListener('loadedmetadata', playAfterLoad);
          };
          audioElement.addEventListener('loadedmetadata', playAfterLoad);
        } else {
          console.log('togglePlay: audioElement.src =', audioElement.src);
          await audioElement.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Failed to resume audio:', error);
      }
    }
  }, [currentAudio, isPlaying, pauseAudio]);

  const nextTrack = useCallback(() => {
    if (!audioNotes.length) return;
    let nextIdx = (currentIndex + 1) % audioNotes.length;
    playAudio(audioNotes[nextIdx], nextIdx);
  }, [audioNotes, currentIndex, playAudio]);

  const prevTrack = useCallback(() => {
    if (!audioNotes.length) return;
    let prevIdx = (currentIndex - 1 + audioNotes.length) % audioNotes.length;
    playAudio(audioNotes[prevIdx], prevIdx);
  }, [audioNotes, currentIndex, playAudio]);

  const shuffleTrack = useCallback(() => {
    if (!audioNotes.length) return;
    let idx = Math.floor(Math.random() * audioNotes.length);
    playAudio(audioNotes[idx], idx);
  }, [audioNotes, playAudio]);

  const resetAudio = useCallback(() => {
    setCurrentAudio(null);
    setIsPlaying(false);
    setCurrentIndex(-1);
    setIsLoading(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }
  }, []);

  // Preload audio notes when they're set
  const setAudioNotesWithPreload = useCallback((notes) => {
    setAudioNotes(notes);
    
    // Preload first few audio files
    notes.slice(0, 5).forEach(note => {
      if (note.url || note.audioUrl) {
        preloadAudio(note);
      }
    });
  }, [preloadAudio]);

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

  return (
    <AudioContext.Provider
      value={{
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
        shouldPlayRef, // NEW: expose ref
        progress,
        duration,
      }}
    >
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