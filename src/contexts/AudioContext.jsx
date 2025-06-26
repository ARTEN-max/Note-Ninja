import React, { createContext, useContext, useState, useRef } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioNotes, setAudioNotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const audioElementRef = useRef(null);

  const playAudio = (audioNote, index = null) => {
    if (!audioNote?.url) return;
    setCurrentAudio(audioNote);
    setIsPlaying(true);
    if (index !== null) setCurrentIndex(index);
    else {
      const idx = audioNotes.findIndex(n => n.id === audioNote.id);
      setCurrentIndex(idx);
    }
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  };

  const togglePlay = () => {
    if (!currentAudio || !currentAudio.url) return;
    setIsPlaying((prev) => {
      if (audioElementRef.current) {
        if (prev) {
          audioElementRef.current.pause();
        } else {
          audioElementRef.current.play();
        }
      }
      return !prev;
    });
  };

  const nextTrack = () => {
    if (!audioNotes.length) return;
    let nextIdx = (currentIndex + 1) % audioNotes.length;
    playAudio(audioNotes[nextIdx], nextIdx);
  };

  const prevTrack = () => {
    if (!audioNotes.length) return;
    let prevIdx = (currentIndex - 1 + audioNotes.length) % audioNotes.length;
    playAudio(audioNotes[prevIdx], prevIdx);
  };

  const shuffleTrack = () => {
    if (!audioNotes.length) return;
    let idx = Math.floor(Math.random() * audioNotes.length);
    playAudio(audioNotes[idx], idx);
  };

  return (
    <AudioContext.Provider
      value={{
        currentAudio,
        isPlaying,
        playAudio,
        pauseAudio,
        togglePlay,
        audioElementRef,
        audioNotes,
        setAudioNotes,
        nextTrack,
        prevTrack,
        shuffleTrack,
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