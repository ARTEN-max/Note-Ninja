import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useAudio } from '../contexts/AudioContext';
import { FiPlay, FiPause, FiClock, FiUser, FiHeart, FiUpload, FiTrash2 } from 'react-icons/fi';

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

        // Get durations for all notes
        const getAudioDuration = (note) => {
          return new Promise((resolve) => {
            if (!note.url) return resolve(note);
            const audio = new window.Audio();
            audio.src = note.url;
            audio.addEventListener('loadedmetadata', () => {
              resolve({ ...note, duration: audio.duration });
            });
            audio.addEventListener('error', () => {
              resolve({ ...note, duration: null });
            });
          });
        };

        Promise.all(notes.map(getAudioDuration)).then((notesWithDurations) => {
          setAudioNotesLocal(notesWithDurations);
          console.log('AudioNotes set in context:', notesWithDurations.length, 'notes');
        });
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

  const handleDelete = async (note) => {
    if (!window.confirm("Are you sure you want to delete this audio note?")) return;
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "audioNotes", note.id));
      
      // Delete from Storage
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
    if (!note.url) {
      alert("This note has no audio file to play.");
      return;
    }
    if (currentAudio?.id === note.id) {
      togglePlay();
    } else {
      playAudio({ ...note, artist: note.uploaderName || 'Unknown Artist' });
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
        <div className="w-full flex flex-col md:flex-row items-center gap-10 px-10 pt-8 pb-12">
          <div className="bg-gray-300 rounded-2xl w-80 h-80 animate-pulse mb-6 md:mb-0" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-gray-300 rounded w-2/3 h-10 animate-pulse mb-2" />
            <div className="bg-gray-300 rounded w-1/3 h-6 animate-pulse mb-2" />
            <div className="bg-gray-300 rounded w-1/2 h-6 animate-pulse mb-2" />
            <div className="flex gap-2 mt-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-300 rounded-full w-10 h-10 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="w-full mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center px-10 py-4 border-b border-[#b266ff]/10 animate-pulse">
              <div className="w-8 text-left">
                <div className="bg-gray-300 rounded h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="bg-gray-300 rounded w-10 h-10" />
                <div className="flex flex-col gap-2">
                  <div className="bg-gray-300 rounded w-32 h-4" />
                  <div className="bg-gray-300 rounded w-20 h-3" />
                </div>
              </div>
              <div className="w-56 hidden md:block">
                <div className="bg-gray-300 rounded w-24 h-4" />
              </div>
              <div className="w-40 hidden md:block">
                <div className="bg-gray-300 rounded w-20 h-4" />
              </div>
              <div className="w-24 text-right">
                <div className="bg-gray-300 rounded w-12 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a0845] to-[#1a1028]">
      <div className="w-full flex flex-col md:flex-row items-center gap-10 px-10 pt-8 pb-12"
        style={{
          background: 'linear-gradient(135deg, #4b006e 0%, #b266ff 100%)',
          minHeight: 400,
        }}
      >
        {/* Playlist Image/Icon Card */}
        <img 
          src="/goose-radio.png" 
          alt="Note Ninja Radio"
          className="w-80 h-80 rounded-2xl shadow-xl object-cover mr-0 md:mr-10 mb-6 md:mb-0"
        />
        {/* Playlist Info & Actions */}
        <div className="flex-1 flex flex-col justify-center items-start text-left">
          <div className="uppercase text-xs text-purple-200 mb-2 tracking-widest">Public Playlist</div>
          <div className="text-6xl md:text-7xl font-extrabold text-white mb-2 tracking-tight leading-tight">NOTE NINJA RADIO</div>
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
      <div className="w-full bg-gradient-to-b from-[#1a1028] to-[#2a0845] pt-2 pb-24 min-h-[400px]">
        <div className="flex items-center px-10 py-3 text-sm font-semibold text-purple-200 uppercase tracking-widest border-b border-[#b266ff]/30">
          <div className="w-8 text-left">#</div>
          <div className="flex-1">Title</div>
          <div className="w-56 hidden md:block">Subject</div>
          <div className="w-40 hidden md:block">Date added</div>
          <div className="w-24 text-right">Duration</div>
        </div>
        {audioNotesLocal.length === 0 ? (
          <div className="text-center py-16 text-purple-200">No Audio Notes Yet</div>
        ) : (
          audioNotesLocal.map((note, index) => (
            <div
              key={note.id}
              className={`flex items-center px-10 py-4 border-b border-[#b266ff]/10 transition group
                ${note.url ? "hover:bg-[#2a1a3a] cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
              onClick={() => note.url && handlePlayClick(note)}
            >
              {/* Index */}
              <div className="w-8 text-left text-purple-300 font-mono">{index + 1}</div>
              {/* Title and Info */}
              <div className="flex-1 min-w-0 flex items-center gap-4">
                  <img src={note.albumArt} alt={note.title} className="w-10 h-10 rounded-sm object-cover"/>
                  <div>
                      <div className="font-bold text-white truncate">{note.title}</div>
                      <div className="text-xs text-purple-300 truncate">{note.subject}</div>
                  </div>
              </div>
              {/* Subject */}
              <div className="w-56 text-purple-200 text-sm hidden md:block truncate">{note.subject}</div>
              {/* Date added (placeholder for now) */}
              <div className="w-40 text-purple-200 text-sm hidden md:block truncate">{note.uploadDate ? formatDate(note.uploadDate) : ''}</div>
              {/* Duration */}
              <div className="w-24 text-right text-white font-mono flex items-center justify-end gap-4">
                <span>{note.duration ? formatDuration(note.duration) : '--:--'}</span>
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note);
                    }}
                    className="text-purple-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete this note"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AudioNotesPage; 