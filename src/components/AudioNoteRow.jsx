import React, { useRef, useState, memo } from "react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { useAudio } from '../contexts/AudioContext';

const AudioNoteRow = memo(({ note, index, isAdmin, handleDelete, formatDate, formatDuration, onAddToPlaylist, onRowPlay, closePlaylistMenu }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { currentAudio, isPlaying, isLoading, audioElementRef } = useAudio();
  
  // Check if this note is currently playing
  const isCurrentlyPlaying = currentAudio?.id === note.id && isPlaying;
  const isCurrentlyLoading = currentAudio?.id === note.id && isLoading;

  // Play audio when row is clicked (except + button)
  const handleRowClick = (e) => {
    console.log('🎵 Row clicked:', note.title, 'URL:', note.url);
    if (e.target.closest('.add-to-playlist-btn')) {
      console.log('🎵 Add to playlist button clicked, ignoring');
      return;
    }
    if (!note.url || note.url === '') {
      console.warn('⚠️ Cannot play audio - no URL provided for:', note.title);
      return;
    }
    if (closePlaylistMenu) closePlaylistMenu();
    if (onRowPlay) {
      console.log('🎵 Calling onRowPlay for:', note.title);
      onRowPlay(note);
    }
    // Removed direct play call; let MiniPlayer handle playback after DOM update
  };

  return (
    <div
      className={`flex items-center px-10 py-4 border-b border-[#b266ff]/10 transition group audio-note-row ${
        note.url ? "hover:bg-[#2a1a3a] cursor-pointer" : "opacity-50 cursor-not-allowed"
      } ${isCurrentlyPlaying ? "bg-[#2a1a3a]/50" : ""}`}
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ gap: '0.5rem' }}
    >
      <div className="w-8 text-left text-purple-300 font-mono">{index + 1}</div>
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <img 
          src={note.albumArt} 
          alt={note.title} 
          className="w-10 h-10 rounded-sm object-cover" 
          loading="lazy"
        />
        <div>
          <div className="font-bold text-white truncate">{note.title}</div>
          <div className="text-xs text-purple-300 truncate">{note.subject}</div>
        </div>
      </div>
      <div className="w-16 flex items-center justify-start gap-2 relative add-to-playlist-mobile-col">
        <button
          className="add-to-playlist-btn text-purple-200 hover:text-white transition-opacity rounded-full border-2 border-white p-2 flex items-center justify-center shadow bg-[#2a1a3a] hover:bg-purple-700/60"
          title="Add to playlist"
          onClick={e => {
            e.stopPropagation();
            if (onAddToPlaylist) onAddToPlaylist(note);
          }}
          style={{ minWidth: 32, minHeight: 32 }}
        >
          <FiPlus size={18} />
        </button>
      </div>
      <div className="w-56 text-purple-200 text-sm hidden md:block truncate text-left pl-8">{note.subject}</div>
      <div className="w-40 text-purple-200 text-sm hidden md:block truncate">
        {note.uploadDate ? formatDate(note.uploadDate) : ''}
      </div>
      <div className="w-24 text-right text-white font-mono flex items-center justify-end gap-4 hidden md:flex">
        <span>{note.duration ? formatDuration(note.duration) : '--:--'}</span>
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(note);
            }}
            className="text-purple-300 hover:text-red-500 transition-opacity"
            title="Delete this note"
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
});

AudioNoteRow.displayName = 'AudioNoteRow';

export default AudioNoteRow; 