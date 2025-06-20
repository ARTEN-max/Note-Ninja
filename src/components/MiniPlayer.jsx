import React, { useRef, useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiShuffle, FiList, FiMusic } from 'react-icons/fi';

const MiniPlayer = () => {
  const { currentAudio, isPlaying, playAudio, pauseAudio, togglePlay, audioElementRef } = useAudio();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [imgError, setImgError] = useState(false);

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

    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [currentAudio, audioElementRef]);
  
  useEffect(() => {
      const audioElement = audioElementRef.current;
      if (!audioElement) return;
      if (currentAudio && currentAudio.url) {
          if (audioElement.src !== currentAudio.url) {
            audioElement.src = currentAudio.url;
          }
          if (isPlaying) {
              audioElement.play().catch(e => console.error("Audio play failed:", e));
          } else {
              audioElement.pause();
          }
      }
  }, [currentAudio, isPlaying, audioElementRef]);


  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (audioElement) {
      audioElement.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioElementRef]);
  
  useEffect(() => {
    setImgError(false);
  }, [currentAudio]);

  const handlePlayPause = () => {
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

  const handlePrev = () => console.log('Previous track');
  const handleNext = () => console.log('Next track');
  const handleShuffle = () => console.log('Shuffle clicked');
  const handleQueue = () => console.log('Queue clicked');

  const audioTitle = currentAudio?.title || 'No audio selected';
  const audioSubtitle = currentAudio?.artist || 'Select a track to play';
  const albumArt = currentAudio?.albumArt || '/path/to/default/art.jpg';

  if (!currentAudio) {
    return (
        <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 z-[9999] flex justify-end pointer-events-none">
            <div className="w-full bg-black shadow-2xl px-4 lg:px-6 py-2 flex items-center gap-4 lg:gap-6 pointer-events-auto h-[90px]">
                <div className="flex items-center gap-3 w-1/3 min-w-[180px]">
                    <div className="w-14 h-14 flex items-center justify-center rounded-md bg-neutral-800 border border-white/10">
                        <FiMusic className="text-neutral-500 text-2xl" />
                    </div>
                    <div className="flex-col min-w-0 hidden lg:flex">
                        <span className="font-bold text-neutral-500 text-sm">No Audio Selected</span>
                        <span className="text-xs text-neutral-600">Choose a track</span>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center justify-center gap-2 md:gap-4">
                        <FiShuffle className="text-neutral-600 text-lg md:text-xl" />
                        <FiSkipBack className="text-neutral-600 text-xl md:text-2xl" />
                        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                            <FiPlay className="text-xl md:text-2xl ml-1 text-neutral-500" />
                        </div>
                        <FiSkipForward className="text-neutral-600 text-xl md:text-2xl" />
                        <FiList className="text-neutral-600 text-lg md:text-xl" />
                    </div>
                    <div className="hidden md:flex items-center gap-2 w-full max-w-md">
                        <span className="text-xs text-neutral-600 w-10 text-right">0:00</span>
                        <div className="flex-1 h-1 bg-neutral-700 rounded-full"></div>
                        <span className="text-xs text-neutral-600 w-10 text-left">0:00</span>
                    </div>
                </div>
                <div className="items-center justify-end gap-2 w-1/3 min-w-[120px] hidden lg:flex">
                    <FiVolume2 className="text-xl text-neutral-600" />
                    <div className="w-24 h-1 bg-neutral-700 rounded-full"></div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 z-[9999] flex justify-end pointer-events-none">
      <audio ref={audioElementRef} preload="metadata" style={{ display: 'none' }} />
      <div className="w-full bg-black shadow-2xl px-4 lg:px-6 py-2 flex items-center gap-4 lg:gap-6 pointer-events-auto h-[90px]">
        {/* Left Section: Album Art & Title */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          {imgError ? (
            <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-md bg-gradient-to-br from-purple-700 to-purple-400 border-2 border-white/20">
              <FiMusic className="text-white text-2xl" />
            </div>
          ) : (
            <img
              src={albumArt}
              alt={audioTitle}
              className="w-14 h-14 flex-shrink-0 rounded-md object-cover border border-white/10"
              onError={() => setImgError(true)}
            />
          )}
          <div className="flex-col min-w-0 hidden lg:flex">
            <span className="font-bold text-white text-sm truncate">{audioTitle}</span>
            <span className="text-xs text-neutral-400 truncate">{audioSubtitle}</span>
          </div>
        </div>

        {/* Center Section: Controls & Progress Bar */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 min-w-0">
          {/* Row 1: Playback Controls */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <button onClick={handleShuffle} className="text-neutral-400 text-lg md:text-xl hover:text-white"><FiShuffle /></button>
            <button onClick={handlePrev} className="text-neutral-400 text-xl md:text-2xl hover:text-white"><FiSkipBack /></button>
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              disabled={!currentAudio || !currentAudio.url}
            >
              {isPlaying ? <FiPause className="text-2xl" /> : <FiPlay className="text-2xl ml-1" />}
            </button>
            <button onClick={handleNext} className="text-neutral-400 text-xl md:text-2xl hover:text-white"><FiSkipForward /></button>
            <button onClick={handleQueue} className="text-neutral-400 text-lg md:text-xl hover:text-white"><FiList /></button>
          </div>
          {/* Row 2: Progress Bar */}
          <div className="hidden md:flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-neutral-400 w-10 text-right">{formatTime(progress)}</span>
            <div className="flex-1 h-1 bg-neutral-700 rounded-full relative cursor-pointer group" onClick={handleSeek}>
              <div className="h-full bg-white rounded-full relative" style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}>
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <span className="text-xs text-neutral-400 w-10 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Section: Volume Control */}
        <div className="items-center justify-end gap-2 w-1/3 min-w-[120px] hidden lg:flex">
          <button onClick={() => setIsMuted((m) => !m)} className="text-neutral-400 hover:text-white" title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0 ? <FiVolumeX className="text-xl" /> : <FiVolume2 className="text-xl" />}
          </button>
          <div className="w-24 h-1 bg-neutral-700 rounded-full relative cursor-pointer group" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const newVolume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setVolume(newVolume);
            if (isMuted) setIsMuted(false);
          }}>
            <div className="h-full bg-white rounded-full relative" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer; 