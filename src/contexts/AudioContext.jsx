import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioNotes, setAudioNotes] = useState([]); // Playlist/queue
  const audioElementRef = useRef(null);
  const currentBlobUrl = useRef(null);

  // Debug logging for audio state changes
  useEffect(() => {
    console.log('Audio state changed:', { 
      hasAudio: !!currentAudio, 
      isPlaying, 
      audioTitle: currentAudio?.title 
    });
  }, [currentAudio, isPlaying]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (currentBlobUrl.current) {
        URL.revokeObjectURL(currentBlobUrl.current);
      }
    };
  }, []);

  // Handle tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      setCurrentAudio(null);
      setIsPlaying(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Cleanup when audio changes
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
    };
  }, [currentAudio]);

  const playAudio = (audioNote) => {
    console.log('Playing audio:', {
      audioNote,
      hasUrl: !!audioNote?.url,
      url: audioNote?.url,
      title: audioNote?.title,
      id: audioNote?.id
    });
    
    // Validate audio note has a URL
    if (!audioNote?.url) {
      console.error('No audio URL provided');
      return;
    }
    
    // Stop any currently playing audio
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
      audioElementRef.current.load();
    }
    
    // Clean up previous blob URL
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
      currentBlobUrl.current = null;
    }
    
    // Reset state
    setCurrentTime(0);
    setDuration(0);
    setCurrentAudio(audioNote);
    setIsPlaying(true); // Autoplay on select
  };

  const pauseAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    console.log('togglePlay called', { 
      isPlaying, 
      hasAudioElement: !!audioElementRef.current,
      hasCurrentAudio: !!currentAudio,
      audioUrl: currentAudio?.url 
    });
    
    if (audioElementRef.current) {
      if (isPlaying) {
        console.log('Pausing audio');
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('Attempting to play audio');
        const playPromise = audioElementRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Audio play successful');
            setIsPlaying(true);
          }).catch(error => {
            console.error('Audio play failed:', error);
            setIsPlaying(false);
          });
        }
      }
    } else {
      console.error('No audio element available');
    }
  };

  const updateProgress = (time) => {
    setCurrentTime(time);
  };

  const seekTo = (time) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  // Find index of current audio in playlist
  const getCurrentIndex = () => {
    if (!currentAudio || !audioNotes.length) return -1;
    return audioNotes.findIndex(note => note.id === currentAudio.id);
  };

  // Play next audio in playlist
  const nextAudio = () => {
    console.log('nextAudio called', { audioNotesLength: audioNotes.length, currentAudio: currentAudio?.title });
    const idx = getCurrentIndex();
    console.log('Current index:', idx);
    if (idx === -1 || audioNotes.length === 0) {
      console.log('No audio notes available or current audio not found');
      return;
    }
    const nextIdx = (idx + 1) % audioNotes.length;
    console.log('Playing next audio at index:', nextIdx, audioNotes[nextIdx]?.title);
    playAudio(audioNotes[nextIdx]);
  };

  // Play previous audio in playlist
  const previousAudio = () => {
    console.log('previousAudio called', { audioNotesLength: audioNotes.length, currentAudio: currentAudio?.title });
    const idx = getCurrentIndex();
    console.log('Current index:', idx);
    if (idx === -1 || audioNotes.length === 0) {
      console.log('No audio notes available or current audio not found');
      return;
    }
    const prevIdx = (idx - 1 + audioNotes.length) % audioNotes.length;
    console.log('Playing previous audio at index:', prevIdx, audioNotes[prevIdx]?.title);
    playAudio(audioNotes[prevIdx]);
  };

  // Shuffle and play a random audio note
  const shuffleAudio = () => {
    console.log('shuffleAudio called', { audioNotesLength: audioNotes.length, currentAudio: currentAudio?.title });
    if (!audioNotes.length) {
      console.log('No audio notes available for shuffle');
      return;
    }
    let idx = getCurrentIndex();
    let randomIdx = idx;
    while (audioNotes.length > 1 && randomIdx === idx) {
      randomIdx = Math.floor(Math.random() * audioNotes.length);
    }
    console.log('Playing shuffled audio at index:', randomIdx, audioNotes[randomIdx]?.title);
    playAudio(audioNotes[randomIdx]);
  };

  return (
    <AudioContext.Provider
      value={{
        currentAudio,
        isPlaying,
        duration,
        currentTime,
        playAudio,
        pauseAudio,
        togglePlay,
        updateProgress,
        seekTo,
        setDuration,
        audioElementRef,
        audioNotes,
        setAudioNotes,
        nextAudio,
        previousAudio,
        shuffleAudio
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