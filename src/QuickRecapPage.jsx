import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "./contexts/AuthContext";
import { db, storage } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, where, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useAudio } from './contexts/AudioContext';
import { FiPlay, FiPause, FiClock, FiUser, FiHeart, FiUpload, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import Skeleton from './components/Skeleton';
import AudioNoteRow from './components/AudioNoteRow';
import { FixedSizeList as List } from 'react-window';

const ADMIN_EMAILS = ["abdul.rahman78113@gmail.com", "kingbronfan23@gmail.com"];

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const QuickRecapPage = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
  const [audioNotesLocal, setAudioNotesLocal] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    audioFile: null
  });
  const [loading, setLoading] = useState(true);
  const { currentAudio, isPlaying, playAudio, togglePlay, setAudioNotes } = useAudio();
  const [playlists, setPlaylists] = useState([]);
  const [playlistMenuNoteId, setPlaylistMenuNoteId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuRef = useRef();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [pendingNoteId, setPendingNoteId] = useState(null);
  const [modalError, setModalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onRowPlay = useCallback((note) => {
    const index = audioNotesLocal.findIndex(n => n.id === note.id);
    playAudio(note, index);
  }, [audioNotesLocal, playAudio]);

  const handleDelete = useCallback(async (note) => {
    if (!window.confirm("Are you sure you want to delete this audio note?")) return;
    try {
      await deleteDoc(doc(db, "quickRecapNotes", note.id));
      if (note.audioUrl) {
        try {
          const fileRef = ref(storage, note.audioUrl);
          await deleteObject(fileRef);
        } catch(storageError) {
          console.warn("Could not delete file from storage. It might have been already deleted or the URL is incorrect.", storageError);
        }
      }
      setAudioNotesLocal(prev => prev.filter(n => n.id !== note.id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete audio note. Check console for details.");
    }
  }, []);

  const handleAddToPlaylist = useCallback(async (note, playlistId) => {
    try {
      const playlistDoc = doc(db, 'audioPlaylists', playlistId);
      const playlistSnap = await getDoc(playlistDoc);
      let audios = (playlistSnap.data()?.audios || []);
      if (!audios.includes(note.id)) {
        audios.push(note.id);
        await updateDoc(playlistDoc, { audios });
      }
      setPlaylistMenuNoteId(null);
      setSuccessMessage('Added to playlist!');
      setTimeout(() => setSuccessMessage(''), 2000);
      if (currentUser) {
        const playlistsRef = collection(db, 'audioPlaylists');
        const q = query(playlistsRef, where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        setPlaylists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error('Error adding to playlist:', error);
      setSuccessMessage('Failed to add to playlist');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  }, [currentUser]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderRow = useCallback(({ index, style }) => {
    const note = audioNotesLocal[index];
    if (!note) return null;
    return (
      <div style={style}>
        <AudioNoteRow
          key={note.id}
          note={note}
          index={index}
          isAdmin={isAdmin}
          handleDelete={handleDelete}
          formatDate={formatDate}
          formatDuration={formatDuration}
          onAddToPlaylist={n => { setPlaylistMenuNoteId(n.id); setMenuAnchor(null); }}
          onRowPlay={onRowPlay}
          closePlaylistMenu={() => setPlaylistMenuNoteId(null)}
        />
        {playlistMenuNoteId === note.id && (
          <div className="relative">
            <div className="absolute right-0 top-0 z-50 bg-[#1a1a1a] border border-purple-500/30 rounded-lg shadow-xl p-2 min-w-[200px]">
              <div className="text-white text-sm font-semibold mb-2">Add to Playlist</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(note, playlist.id)}
                    className="w-full text-left px-2 py-1 text-sm text-purple-200 hover:bg-purple-700/30 rounded transition-colors"
                  >
                    {playlist.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setPendingNoteId(note.id);
                    setShowPlaylistModal(true);
                    setPlaylistMenuNoteId(null);
                  }}
                  className="w-full text-left px-2 py-1 text-sm text-purple-400 hover:bg-purple-700/30 rounded transition-colors border-t border-purple-500/20 mt-2 pt-2"
                >
                  + Create New Playlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [audioNotesLocal, isAdmin, handleDelete, formatDate, formatDuration, onRowPlay, playlists, playlistMenuNoteId, handleAddToPlaylist]);

  // Fetch quick recap notes from Firestore
  useEffect(() => {
    const fetchAudioNotes = async () => {
      try {
        console.time('fetchQuickRecapNotes');
        const quickRecapRef = collection(db, 'quickRecapNotes');
        const q = query(quickRecapRef, orderBy('uploadDate', 'desc'));
        const snapshot = await getDocs(q);
        const notes = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            subject: data.subject || '',
            url: data.audioUrl || '',
            albumArt: `https://picsum.photos/seed/${doc.id}/40/40`,
            ...data
          };
        });
        setAudioNotesLocal(notes);
        setAudioNotes(notes);
        console.timeEnd('fetchQuickRecapNotes');
        console.log('QuickRecapNotes set in context:', notes.length, 'notes');
      } catch (error) {
        console.error('Error fetching quick recap notes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAudioNotes();
  }, [setAudioNotes]);

  useEffect(() => {
    if (audioNotesLocal.length > 0) {
      audioNotesLocal.slice(0, 3).forEach(note => {
        if (note.url) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'audio';
          link.href = note.url;
          document.head.appendChild(link);
        }
      });
    }
  }, [audioNotesLocal]);

  const fetchPlaylists = async () => {
    if (!currentUser) return;
    const playlistsRef = collection(db, 'audioPlaylists');
    const q = query(playlistsRef, where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    setPlaylists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };
  useEffect(() => {
    fetchPlaylists();
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setPlaylistMenuNoteId(null);
      }
    }
    if (playlistMenuNoteId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [playlistMenuNoteId]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "audioFile") {
      setForm({ ...form, audioFile: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.audioFile || !form.title || !form.subject) {
      setUploadError("Please fill in all required fields and select an audio file.");
      return;
    }
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      const storageRef = ref(storage, `quick-recap-notes/${form.subject}/${Date.now()}_${form.audioFile.name}`);
      const snapshot = await uploadBytes(storageRef, form.audioFile);
      const audioUrl = await getDownloadURL(snapshot.ref);
      await addDoc(collection(db, "quickRecapNotes"), {
        title: form.title,
        description: form.description,
        subject: form.subject,
        audioUrl,
        fileName: form.audioFile.name,
        fileSize: form.audioFile.size,
        uploaderId: currentUser.uid,
        uploaderEmail: currentUser.email,
        uploaderName: currentUser.displayName || currentUser.email,
        uploadDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        likes: 0
      });
      setUploadSuccess("Audio note uploaded successfully!");
      setForm({ title: "", description: "", subject: "", audioFile: null });
      const quickRecapRef = collection(db, 'quickRecapNotes');
      const q = query(quickRecapRef, orderBy('uploadDate', 'desc'));
      const snapshot2 = await getDocs(q);
      const notes = snapshot2.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          subject: data.subject || '',
          url: data.audioUrl || '',
          albumArt: `https://picsum.photos/seed/${doc.id}/40/40`,
          ...data
        };
      });
      setAudioNotesLocal(notes);
    } catch (error) {
      setUploadError("Failed to upload audio note. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const episodeCount = audioNotesLocal.length;
  const totalSeconds = audioNotesLocal.reduce((sum, note) => sum + (note.duration || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  const durationString =
    hours > 0
      ? `about ${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`
      : `about ${minutes} min`;

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    setModalError("");
    if (!newPlaylistName.trim()) {
      setModalError("Playlist name cannot be empty.");
      return;
    }
    try {
      const playlistsRef = collection(db, 'audioPlaylists');
      const q = query(playlistsRef, where('userId', '==', currentUser.uid), where('name', '==', newPlaylistName.trim()));
      const snapshot = await getDocs(q);
      let playlistId;
      if (!snapshot.empty) {
        playlistId = snapshot.docs[0].id;
      } else {
        const docRef = await addDoc(playlistsRef, {
          userId: currentUser.uid,
          name: newPlaylistName.trim(),
          createdAt: serverTimestamp(),
          audios: []
        });
        playlistId = docRef.id;
      }
      const playlistDoc = doc(db, 'audioPlaylists', playlistId);
      const playlistSnap = await getDoc(playlistDoc);
      let audios = (playlistSnap.data()?.audios || []);
      if (!audios.includes(pendingNoteId)) {
        audios.push(pendingNoteId);
        await updateDoc(playlistDoc, { audios });
      }
      setShowPlaylistModal(false);
      setPlaylistMenuNoteId(null);
      setNewPlaylistName("");
      setPendingNoteId(null);
      await fetchPlaylists();
      setSuccessMessage("Playlist created!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setModalError("Failed to create playlist. Try again.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e3b8f9]/20 to-white p-6">
        <div className="w-full flex flex-col md:flex-row items-center gap-10 px-10 pt-8 pb-12">
          <Skeleton variant="rect" width={320} height={320} className="mb-6 md:mb-0" />
          <div className="flex-1 flex flex-col gap-4">
            <Skeleton variant="text" width="66%" height={40} className="mb-2" />
            <Skeleton variant="text" width="33%" height={24} className="mb-2" />
            <Skeleton variant="text" width="50%" height={24} className="mb-2" />
            <div className="flex gap-2 mt-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="circle" width={40} height={40} />
              ))}
            </div>
          </div>
        </div>
        <div className="w-full mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center px-10 py-4 border-b border-[#b266ff]/10">
              <div className="w-8 text-left">
                <Skeleton variant="circle" width={24} height={24} />
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-4">
                <Skeleton variant="circle" width={40} height={40} />
                <div className="flex flex-col gap-2">
                  <Skeleton variant="text" width={128} height={16} />
                  <Skeleton variant="text" width={80} height={12} />
                </div>
              </div>
              <div className="w-56 hidden md:block">
                <Skeleton variant="text" width={96} height={16} />
              </div>
              <div className="w-40 hidden md:block">
                <Skeleton variant="text" width={80} height={16} />
              </div>
              <div className="w-24 text-right">
                <Skeleton variant="text" width={48} height={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="absolute left-0 top-0 min-h-screen w-screen bg-[#181818] overflow-y-auto md:static md:w-full md:bg-gradient-to-b md:from-[#2a0845] md:to-[#1a1028]">
        <div className="w-full flex flex-col md:flex-row items-center gap-10 px-10 pt-8 pb-12"
          style={{
            background: 'linear-gradient(135deg, #4b006e 0%, #b266ff 100%)',
            minHeight: 400,
          }}
        >
          {/* Playlist Image/Icon Card */}
          <img 
            src="/goose-radio.png" 
            alt="Quick Recap"
            className="w-80 h-80 rounded-2xl shadow-xl object-cover mr-0 md:mr-10 mb-6 md:mb-0"
          />
          {/* Playlist Info & Actions */}
          <div className="flex-1 flex flex-col justify-center items-start text-left">
            <div className="uppercase text-xs text-purple-200 mb-2 tracking-widest">Public Playlist</div>
            <div className="text-6xl md:text-7xl font-extrabold text-white mb-2 tracking-tight leading-tight">QUICK RECAP</div>
            <div className="text-purple-200 text-base mb-3">For efficient review before exams</div>
            <div className="flex items-center gap-2 text-purple-100 text-sm font-medium mb-6">
              <span className="font-bold text-white">Note Ninja</span>
              <span>• {episodeCount} episodes</span>
              <span>• {durationString}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <button
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform"
                onClick={() => {
                  const first = audioNotesLocal[0];
                  if (first && first.url) {
                    playAudio({ ...first, artist: first.uploaderName || 'Unknown Artist' });
                  }
                }}
                aria-label="Play first audio"
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#fff" fillOpacity=".08"/><polygon points="11,8 21,14 11,20" fill="#fff"/></svg>
              </button>
            </div>
          </div>
        </div>
        {/* Admin Upload Form */}
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="px-10 py-6 bg-[#1a1028]/50 mb-8"
          >
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-purple-400/30 pb-2">Upload New Audio Note</h3>
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-purple-200 mb-1" htmlFor="title">Title</label>
                <input type="text" name="title" id="title" value={form.title} onChange={handleInputChange} required className="w-full bg-[#2a1a3a] text-white border border-purple-400/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-purple-200 mb-1" htmlFor="subject">Subject</label>
                <input type="text" name="subject" id="subject" value={form.subject} onChange={handleInputChange} required className="w-full bg-[#2a1a3a] text-white border border-purple-400/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-purple-200 mb-1" htmlFor="description">Description</label>
                <textarea name="description" id="description" value={form.description} onChange={handleInputChange} rows="3" className="w-full bg-[#2a1a3a] text-white border border-purple-400/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"></textarea>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-purple-200 mb-1" htmlFor="audioFile">Audio File</label>
                <input type="file" name="audioFile" id="audioFile" onChange={handleInputChange} required accept="audio/*" className="w-full text-sm text-purple-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600" />
              </div>
              <div className="col-span-2 flex justify-end items-center">
                {uploadError && <p className="text-red-400 text-sm mr-4">{uploadError}</p>}
                {uploadSuccess && <p className="text-green-400 text-sm mr-4">{uploadSuccess}</p>}
                <button type="submit" disabled={uploading} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
        {/* Audio Notes Table - Spotify Style */}
        <div className="w-full bg-gradient-to-b from-[#1a1028] to-[#2a0845] pt-2 pb-24 min-h-[400px] audio-notes-container">
          <div className="flex items-center px-10 py-3 text-sm font-semibold text-purple-200 uppercase tracking-widest border-b border-[#b266ff]/30">
            <div className="w-8 text-left">#</div>
            <div className="flex-1">Title</div>
            <div className="w-16 flex items-center justify-start"> </div>
            <div className="w-56 hidden md:block">Subject</div>
            <div className="w-40 hidden md:block">Date added</div>
            <div className="w-24 text-right">Duration</div>
          </div>
          {audioNotesLocal.length === 0 ? (
            <div className="text-center py-16 text-purple-200">No Audio Notes Yet</div>
          ) : (
            <List
              height={600}
              itemCount={audioNotesLocal.length}
              itemSize={80}
              width={"100%"}
              style={{ background: 'transparent' }}
            >
              {renderRow}
            </List>
          )}
        </div>
        {/* Playlist Creation Modal */}
        {showPlaylistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#1a1028] rounded-xl shadow-2xl p-8 w-full max-w-md relative">
              <button className="absolute top-4 right-4 text-purple-200 hover:text-white" onClick={() => { setShowPlaylistModal(false); setNewPlaylistName(""); setPendingNoteId(null); }}>
                <FiX size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white mb-4">Create Playlist</h2>
              <form onSubmit={handleCreatePlaylist}>
                <input
                  type="text"
                  className="w-full bg-[#2a0845] text-white border border-purple-700 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  placeholder="Enter playlist name"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  autoFocus
                />
                {modalError && <div className="text-red-400 mb-2">{modalError}</div>}
                <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform">
                  Save
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold animate-fade-in-out">
            {successMessage}
          </div>
        )}
      </div>
    </>
  );
};

export default QuickRecapPage; 