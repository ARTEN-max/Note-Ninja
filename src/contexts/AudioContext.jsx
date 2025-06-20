import React, { createContext, useContext, useState, useRef } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioElementRef = useRef(null);

  const playAudio = (audioNote) => {
    if (!audioNote?.url) return;
    setCurrentAudio(audioNote);
    setIsPlaying(true);
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

  return (
    <AudioContext.Provider
      value={{
        currentAudio,
        isPlaying,
        playAudio,
        pauseAudio,
        togglePlay,
        audioElementRef,
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