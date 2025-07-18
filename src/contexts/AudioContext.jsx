import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
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
      audioPerformanceMonitor.trackError(audioNote.url, error);
    });
  }, []);

  // Optimized play function with immediate response
  const playAudio = useCallback(async (audioNote, index = null, retryCount = 0) => {
    if (!audioNote?.url) return;
    const playStartTime = performance.now();
    // Ensure audio element is mounted before proceeding
    const audioElement = audioElementRef.current;
    if (!audioElement) {
      if (retryCount < 5) {
        setTimeout(() => playAudio(audioNote, index, retryCount + 1), 50);
      } else {
        console.error('Audio element not mounted after retries');
      }
      return;
    }
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
        audioPerformanceMonitor.trackPlayTime(audioNote.url, playStartTime);
        audioElement.removeEventListener('playing', onPlaying);
      };
      audioElement.addEventListener('playing', onPlaying);
      if (audioElement.src !== audioNote.url) {
        // Attach event listener BEFORE setting src
        const onReady = async () => {
          try {
            await audioElement.play();
          } catch (error) {
            console.error('Failed to play audio:', error);
            audioPerformanceMonitor.trackError(audioNote.url, error);
            setIsPlaying(false);
            setIsLoading(false);
          }
          audioElement.removeEventListener('loadedmetadata', onReady);
        };
        audioElement.addEventListener('loadedmetadata', onReady);
        audioElement.src = audioNote.url;
        audioElement.preload = 'auto';
        needsToWait = true;
      }
      if (!needsToWait) {
        await audioElement.play();
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
      audioPerformanceMonitor.trackError(audioNote.url, error);
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
    if (!currentAudio || !currentAudio.url) return;
    
    if (isPlaying) {
      pauseAudio();
    } else {
      try {
        await audioElementRef.current?.play();
        setIsPlaying(true);
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
      if (note.url) {
        preloadAudio(note);
      }
    });
  }, [preloadAudio]);

  // Add event listeners for debugging
  React.useEffect(() => {
    const audioElement = audioElementRef.current;
    if (!audioElement) return;
    const logEvent = (e) => console.log('[AUDIO EVENT]', e.type);
    audioElement.addEventListener('play', logEvent);
    audioElement.addEventListener('playing', logEvent);
    audioElement.addEventListener('pause', logEvent);
    audioElement.addEventListener('waiting', logEvent);
    audioElement.addEventListener('loadedmetadata', logEvent);
    audioElement.addEventListener('error', logEvent);
    return () => {
      audioElement.removeEventListener('play', logEvent);
      audioElement.removeEventListener('playing', logEvent);
      audioElement.removeEventListener('pause', logEvent);
      audioElement.removeEventListener('waiting', logEvent);
      audioElement.removeEventListener('loadedmetadata', logEvent);
      audioElement.removeEventListener('error', logEvent);
    };
  }, []);

  React.useEffect(() => {
    console.log('[STATE] isLoading:', isLoading, 'isPlaying:', isPlaying, 'currentAudio:', currentAudio?.title);
  }, [isLoading, isPlaying, currentAudio]);

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