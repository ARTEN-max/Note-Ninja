import React, { useRef, useState } from "react";

const AudioNoteItem = React.memo(function AudioNoteItem({ note, isPlaying, onPlay, onPause }) {
  const audioRef = useRef(null);
  const [error, setError] = useState(false);

  // Play or pause the audio directly
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        if (onPlay) onPlay(note);
      } else {
        audioRef.current.pause();
        if (onPause) onPause();
      }
    }
  };

  return (
    <div className="audio-note-item">
      <div>
        <strong>{note.title}</strong>
        <button onClick={handlePlayPause} disabled={error}>
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <audio
        ref={audioRef}
        preload="metadata"
        controls
        onPlay={() => onPlay && onPlay(note)}
        onPause={onPause}
        onError={() => setError(true)}
        src={note.url}
        style={{ width: "100%" }}
      >
        Your browser does not support the audio element.
      </audio>
      {error && <div style={{ color: "red" }}>Audio failed to load. <button onClick={() => setError(false)}>Retry</button></div>}
    </div>
  );
});

export default AudioNoteItem; 