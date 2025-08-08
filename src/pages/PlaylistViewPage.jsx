import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { getDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { FiTrash2 } from 'react-icons/fi';
import BackToPrevious from '../components/BackToPrevious';

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PlaylistViewPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { currentAudio, isPlaying, playAudio, togglePlay } = useAudio();
  const [playlist, setPlaylist] = useState(null);
  const [audioNotes, setAudioNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [durations, setDurations] = useState({}); // { audioId: duration }
  const { currentUser, profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPlaylistAndAudios = async () => {
      setLoading(true);
      try {
        const playlistDoc = await getDoc(doc(db, 'audioPlaylists', playlistId));
        if (!playlistDoc.exists()) {
          setPlaylist(null);
          setAudioNotes([]);
          setLoading(false);
          return;
        }
        const playlistData = playlistDoc.data();
        setPlaylist({ id: playlistDoc.id, ...playlistData });
        // Fetch audio notes in this playlist
        const audios = [];
        for (const audioId of (playlistData.audios || [])) {
          const audioDoc = await getDoc(doc(db, 'audioNotes', audioId));
          if (audioDoc.exists()) {
            audios.push({ id: audioDoc.id, ...audioDoc.data() });
          }
        }
        setAudioNotes(audios);
      } catch (err) {
        setPlaylist(null);
        setAudioNotes([]);
      }
      setLoading(false);
    };
    fetchPlaylistAndAudios();
  }, [playlistId]);

  // Fetch missing durations for audios without duration
  useEffect(() => {
    const missing = audioNotes.filter(note => !note.duration && note.audioUrl && !durations[note.id]);
    if (missing.length === 0) return;
    missing.forEach(note => {
      const audio = new window.Audio();
      audio.src = note.audioUrl;
      audio.addEventListener('loadedmetadata', () => {
        setDurations(prev => ({ ...prev, [note.id]: audio.duration }));
      });
    });
  }, [audioNotes]);

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !playlist) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `playlistCovers/${playlist.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'audioPlaylists', playlist.id), { coverImage: url });
      setPlaylist(prev => ({ ...prev, coverImage: url }));
    } catch (err) {
      alert('Failed to upload image.');
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#181818]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400 mb-6"></div>
        <div className="text-white text-2xl font-bold mb-2">Loading your playlist...</div>
        <div className="text-purple-200 text-lg">Getting your study vibes ready!</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl bg-[#181818]">Playlist not found.</div>
    );
  }

  return (
    <>
      <BackToPrevious />
      <div className="absolute left-0 top-0 min-h-screen w-screen bg-[#181818] overflow-y-auto md:static md:w-full md:bg-gradient-to-b md:from-[#2a0845] md:to-[#1a1028]">
        <div className="w-full flex flex-col md:flex-row items-center gap-10 px-10 pt-8 pb-12"
          style={{ background: 'linear-gradient(135deg, #4b006e 0%, #b266ff 100%)', minHeight: 320 }}
        >
          {/* Playlist Image/Icon Card with hover to change */}
          <div className="relative group mr-0 md:mr-10 mb-6 md:mb-0 w-100 h-80">
            <img
              src={playlist.coverImage || `https://picsum.photos/seed/${encodeURIComponent(playlist.id || playlist.name)}/480/320`}
              alt={playlist.name}
              className="w-full h-full rounded-2xl shadow-xl object-cover object-center bg-neutral-900"
              style={{ filter: uploading ? 'blur(2px) grayscale(0.5)' : undefined }}
            />
            {/* Play button overlay - bottom right, Spotify style */}
            {audioNotes.length > 0 && (
              <button
                className="absolute bottom-4 right-4 z-20 bg-green-500 hover:bg-green-400 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
                onClick={e => {
                  e.stopPropagation();
                  const first = audioNotes[0];
                  if (first && first.audioUrl) {
                    playAudio({ ...first, url: first.audioUrl, artist: first.uploaderName || 'Unknown Artist' });
                  }
                }}
                tabIndex={0}
                aria-label="Play first audio"
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#fff" fillOpacity=".08"/><polygon points="11,8 21,14 11,20" fill="#fff"/></svg>
              </button>
            )}
            {/* Overlay on hover */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
              disabled={uploading}
            />
            <div
              className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => !uploading && fileInputRef.current && fileInputRef.current.click()}
              style={{ pointerEvents: uploading ? 'none' : 'auto' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h2l2-2h4l2 2h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span className="text-white font-semibold">{uploading ? 'Uploading...' : 'Change Cover'}</span>
            </div>
          </div>
          {/* Playlist Info & Actions */}
          <div className="flex-1 flex flex-col justify-center items-start text-left">
            <div className="uppercase text-xs text-purple-200 mb-2 tracking-widest">Playlist</div>
            <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight leading-tight">{playlist.name}</div>
            <div className="text-purple-200 text-base mb-3">{audioNotes.length} audios</div>
            <div className="flex items-center gap-4 mt-2">
              {/* Play button - purple gradient, matches AudioNotesPage */}
              <button
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform"
                onClick={() => {
                  const first = audioNotes[0];
                  if (first && first.audioUrl) {
                    playAudio({ ...first, url: first.audioUrl, artist: first.uploaderName || 'Unknown Artist' });
                  }
                }}
                aria-label="Play first audio"
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#fff" fillOpacity=".08"/><polygon points="11,8 21,14 11,20" fill="#fff"/></svg>
              </button>
              {/* Delete playlist button - only for owner */}
              {playlist.userId === currentUser?.uid && (
                <button
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform"
                  onClick={() => setShowDeleteModal(true)}
                  aria-label="Delete playlist"
                  title="Delete playlist"
                >
                  <FiTrash2 size={24} />
                </button>
              )}
              {/* Other action buttons (add, download, more) - keep as is or add here if needed */}
            </div>
          </div>
        </div>
        {/* Audio Notes Table */}
        <div className="w-full bg-gradient-to-b from-[#1a1028] to-[#2a0845] pt-2 pb-24 min-h-[400px]">
          <div className="flex items-center px-10 py-3 text-sm font-semibold text-purple-200 uppercase tracking-widest border-b border-[#b266ff]/30">
            <div className="w-8 text-left">#</div>
            <div className="flex-1">Title</div>
            <div className="w-56 hidden md:block">Subject</div>
            <div className="w-40 hidden md:block">Uploader</div>
            <div className="w-24 text-right">Duration</div>
          </div>
          {audioNotes.length === 0 ? (
            <div className="text-center py-16 text-purple-200">No audios in this playlist yet.</div>
          ) : (
            audioNotes.map((note, index) => {
              let uploaderFirstName = 'Unknown';
              if (
                note.uploaderName &&
                typeof note.uploaderName === 'string' &&
                !note.uploaderName.includes('@')
              ) {
                // If uploaderName is a real name, use first word
                uploaderFirstName = note.uploaderName.split(' ')[0];
              } else if (note.uploaderEmail && typeof note.uploaderEmail === 'string') {
                // Extract first part before dot or @, and capitalize
                let base = note.uploaderEmail.split('@')[0];
                if (base.includes('.')) {
                  base = base.split('.')[0];
                }
                uploaderFirstName = base.charAt(0).toUpperCase() + base.slice(1);
              }
              console.log('Uploader debug:', {
                noteUploaderName: note.uploaderName,
                noteUploaderEmail: note.uploaderEmail,
                currentUserEmail: currentUser && currentUser.email,
                profileDisplayName: profile && profile.displayName
              });
              // Get duration: prefer note.duration, else from durations state
              const rowDuration = note.duration || durations[note.id];
              return (
                <div
                  key={note.id}
                  className={`flex items-center px-10 py-4 border-b border-[#b266ff]/10 transition group
                    ${note.audioUrl ? "hover:bg-[#2a1a3a] cursor-pointer" : "opacity-50 cursor-not-allowed"}
                    ${currentAudio?.id === note.id ? 'bg-[#2a1a3a]' : ''}`}
                  onClick={() => note.audioUrl && playAudio({ ...note, url: note.audioUrl, artist: note.uploaderName || 'Unknown Artist' })}
                >
                  {/* Index */}
                  <div className="w-8 text-left text-purple-300 font-mono">{index + 1}</div>
                  {/* Title and Info */}
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    <img src={note.albumArt || '/goose-radio.png'} alt={note.title} className="w-10 h-10 rounded-sm object-cover" />
                    <div>
                      <div className="font-bold text-white truncate">{note.title}</div>
                      <div className="text-xs text-purple-300 truncate">{note.subject}</div>
                    </div>
                  </div>
                  {/* Subject */}
                  <div className="w-56 text-purple-200 text-sm hidden md:block truncate">{note.subject}</div>
                  {/* Uploader (first name) */}
                  <div className="w-40 text-purple-200 text-sm hidden md:block truncate">{uploaderFirstName}</div>
                  {/* Duration */}
                  <div className="w-24 text-right text-white font-mono flex items-center justify-end gap-4">
                    <span>{rowDuration ? formatDuration(rowDuration) : '--:--'}</span>
                    {/* Remove from playlist button (only for owner) */}
                    {playlist.userId === currentUser?.uid && (
                      <button
                        className="ml-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Remove from playlist"
                        onClick={async (e) => {
                          e.stopPropagation();
                          // Remove this audio from the playlist audios array
                          const updatedAudios = (playlist.audios || []).filter(id => id !== note.id);
                          await updateDoc(doc(db, 'audioPlaylists', playlist.id), { audios: updatedAudios });
                          setAudioNotes(audioNotes.filter(n => n.id !== note.id));
                          // Also update playlist state to keep UI in sync
                          setPlaylist({ ...playlist, audios: updatedAudios });
                        }}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#1a1028] rounded-xl shadow-2xl p-8 w-full max-w-md relative">
              <button className="absolute top-4 right-4 text-purple-200 hover:text-white" onClick={() => setShowDeleteModal(false)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-full p-4 mb-4"><FiTrash2 size={36} className="text-white" /></div>
                <h2 className="text-2xl font-bold text-white mb-2">Delete Playlist?</h2>
                <p className="text-purple-200 mb-6 text-center">Are you sure you want to delete this playlist? <br/>This cannot be undone.</p>
                <div className="flex gap-4">
                  <button
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow hover:scale-105 transition-transform disabled:opacity-50"
                    onClick={async () => {
                      setDeleting(true);
                      await deleteDoc(doc(db, 'audioPlaylists', playlist.id));
                      setDeleting(false);
                      setShowDeleteModal(false);
                      navigate('/account');
                    }}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    className="px-6 py-2 rounded-full bg-gray-700 text-white font-bold shadow hover:bg-gray-600 transition"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PlaylistViewPage;