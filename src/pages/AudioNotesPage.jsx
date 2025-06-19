import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useAudio } from '../contexts/AudioContext';
import { FiPlay, FiPause, FiClock, FiUser, FiHeart, FiUpload, FiTrash2 } from 'react-icons/fi';
import MiniPlayer from '../components/MiniPlayer';

const ADMIN_EMAILS = ["abdul.rahman78113@gmail.com", "kingbronfan23@gmail.com"];

// Utility to format seconds as mm:ss
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const AudioNotesPage = () => {
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

  // Fetch audio notes from Firestore
  useEffect(() => {
    const fetchAudioNotes = async () => {
      try {
        const audioNotesRef = collection(db, 'audioNotes');
        const q = query(audioNotesRef, orderBy('uploadDate', 'desc'));
        const snapshot = await getDocs(q);
        
        const notes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          url: doc.data().audioUrl // Map audioUrl to url for the player
        }));
        
        setAudioNotes(notes);
        setAudioNotesLocal(notes);
        console.log('AudioNotes set in context:', notes.length, 'notes');
      } catch (error) {
        console.error('Error fetching audio notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioNotes();
  }, [setAudioNotes]);

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
      // Upload audio file to Firebase Storage
      const storageRef = ref(storage, `audio-notes/${form.subject}/${Date.now()}_${form.audioFile.name}`);
      const snapshot = await uploadBytes(storageRef, form.audioFile);
      const audioUrl = await getDownloadURL(snapshot.ref);

      // Save metadata to Firestore
      await addDoc(collection(db, "audioNotes"), {
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
      
      // Refresh the audio notes list
      const audioNotesRef = collection(db, 'audioNotes');
      const q = query(audioNotesRef, orderBy('uploadDate', 'desc'));
      const snapshot2 = await getDocs(q);
      const notes = snapshot2.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        url: doc.data().audioUrl
      }));
      setAudioNotes(notes);
    } catch (error) {
      setUploadError("Failed to upload audio note. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (note) => {
    if (!window.confirm("Are you sure you want to delete this audio note?")) return;
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "audioNotes", note.id));
      setAudioNotes(prev => prev.filter(n => n.id !== note.id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

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

  const handlePlayClick = (note) => {
    if (currentAudio?.id === note.id) {
      togglePlay();
    } else {
      playAudio(note);
    }
  };

  // Calculate dynamic playlist info
  const episodeCount = audioNotesLocal.length;
  // If you have duration per note, sum it; otherwise, fallback to 0
  const totalSeconds = audioNotesLocal.reduce((sum, note) => sum + (note.duration || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  const durationString =
    hours > 0
      ? `about ${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`
      : `about ${minutes} min`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e3b8f9]/20 to-white p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5E2A84] mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a0845] to-[#1a1028]">
      <div className="w-full flex flex-col md:flex-row items-center gap-10 px-10 pt-8 pb-12"
        style={{
          background: 'linear-gradient(135deg, #4b006e 0%, #b266ff 100%)',
          minHeight: 280,
        }}
      >
        {/* Playlist Image/Icon Card */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-48 h-48 rounded-2xl bg-[#2a1a3a] shadow-xl overflow-hidden mr-0 md:mr-10 mb-6 md:mb-0 p-6">
          <div className="uppercase text-xs text-purple-200 tracking-widest mb-2">Audio Notes</div>
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#4b267a] mb-4">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="24" fill="#b266ff" />
              <rect x="16" y="18" width="4" height="12" rx="2" fill="#fff" />
              <rect x="28" y="14" width="4" height="16" rx="2" fill="#fff" />
            </svg>
          </div>
          <div className="text-white text-xl font-bold mb-1">Cram Mode</div>
          <div className="text-purple-300 text-sm">All subjects</div>
        </div>
        {/* Playlist Info & Actions */}
        <div className="flex-1 flex flex-col justify-center items-start text-left">
          <div className="uppercase text-xs text-purple-200 mb-2 tracking-widest">Public Playlist</div>
          <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight leading-tight">CRAM MODE</div>
          <div className="text-purple-200 text-base mb-3">For efficient review before exams</div>
          <div className="flex items-center gap-2 text-purple-100 text-sm font-medium mb-6">
            <span className="font-bold text-white">Note Ninja</span>
            <span>• {episodeCount} episodes</span>
            <span>• {durationString}</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <button className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#fff" fillOpacity=".08"/><polygon points="11,8 21,14 11,20" fill="#fff"/></svg></button>
            <button className="w-10 h-10 rounded-full bg-[#2a1a3a] flex items-center justify-center text-purple-200 text-xl shadow hover:bg-purple-700/40 transition"><span className="text-2xl">+</span></button>
            <button className="w-10 h-10 rounded-full bg-[#2a1a3a] flex items-center justify-center text-purple-200 text-xl shadow hover:bg-purple-700/40 transition"><svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M10 3v10m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="15" width="14" height="2" rx="1" fill="currentColor"/></svg></button>
            <button className="w-10 h-10 rounded-full bg-[#2a1a3a] flex items-center justify-center text-purple-200 text-xl shadow hover:bg-purple-700/40 transition"><svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="2" fill="currentColor"/><circle cx="16" cy="10" r="2" fill="currentColor"/><circle cx="4" cy="10" r="2" fill="currentColor"/></svg></button>
          </div>
        </div>
      </div>

      {/* Admin Upload Form */}
      {isAdmin && (
        <motion.div 
          className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8 border border-[#e3b8f9]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#5E2A84] flex items-center gap-2">
            <FiUpload className="w-5 h-5" />
            Upload Audio Note
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#5E2A84]">Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="e.g., CS246, MATH137"
                value={form.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#e3b8f9]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E2A84] focus:border-transparent bg-white/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#5E2A84]">Title</label>
              <input
                type="text"
                name="title"
                placeholder="Audio note title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#e3b8f9]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E2A84] focus:border-transparent bg-white/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#5E2A84]">Description</label>
              <textarea
                name="description"
                placeholder="Description (optional)"
                value={form.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#e3b8f9]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E2A84] focus:border-transparent bg-white/50"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#5E2A84]">Audio File</label>
              <input
                type="file"
                name="audioFile"
                accept="audio/*"
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#e3b8f9]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E2A84] focus:border-transparent bg-white/50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-[#5E2A84] to-[#7E44A3] text-white rounded-xl hover:from-[#7E44A3] hover:to-[#5E2A84] transition-all duration-300 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Audio Note"}
            </button>
            {uploadSuccess && (
              <div className="text-green-600 text-center bg-green-50 p-3 rounded-lg">
                {uploadSuccess}
              </div>
            )}
            {uploadError && (
              <div className="text-red-600 text-center bg-red-50 p-3 rounded-lg">
                {uploadError}
              </div>
            )}
          </form>
        </motion.div>
      )}

      {/* Audio Notes Table - Spotify Style */}
      <div className="w-full bg-gradient-to-b from-[#1a1028] to-[#2a0845] pt-2 pb-24 min-h-[400px]">
        <div className="flex items-center px-10 py-3 text-sm font-semibold text-purple-200 uppercase tracking-widest border-b border-[#b266ff]/30">
          <div className="w-8 text-left">#</div>
          <div className="flex-1">Title</div>
          <div className="w-56 hidden md:block">Album</div>
          <div className="w-40 hidden md:block">Date added</div>
          <div className="w-20 text-right">Duration</div>
        </div>
        {audioNotesLocal.length === 0 ? (
          <div className="text-center py-16 text-purple-200">No Audio Notes Yet</div>
        ) : (
          audioNotesLocal.map((note, index) => (
            <div
              key={note.id}
              className="flex items-center px-10 py-4 border-b border-[#b266ff]/10 hover:bg-[#2a1a3a] transition group cursor-pointer"
              onClick={() => handlePlayClick(note)}
            >
              {/* Index */}
              <div className="w-8 text-left text-purple-300 font-mono">{index + 1}</div>
              {/* Title and Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">{note.title}</div>
                <div className="text-xs text-purple-300 truncate">{note.subject}</div>
              </div>
              {/* Album (placeholder for now) */}
              <div className="w-56 text-purple-200 text-sm hidden md:block truncate">{note.album || note.subject}</div>
              {/* Date added (placeholder for now) */}
              <div className="w-40 text-purple-200 text-sm hidden md:block truncate">{note.uploadDate ? formatDate(note.uploadDate) : ''}</div>
              {/* Duration */}
              <div className="w-20 text-right text-white font-mono">{note.duration ? formatDuration(note.duration) : '--:--'}</div>
            </div>
          ))
        )}
      </div>
      <MiniPlayer />
    </div>
  );
};

export default AudioNotesPage; 