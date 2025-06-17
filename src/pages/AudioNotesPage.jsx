import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const ADMIN_EMAILS = ["abdul.rahman78113@gmail.com", "kingbronfan23@gmail.com"];

const AudioNotesPage = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
  const [audioNotes, setAudioNotes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    audioFile: null
  });

  // Fetch audio notes from Firestore
  useEffect(() => {
    const q = collection(db, "audioNotes");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAudioNotes(notes);
    });
    return () => unsubscribe();
  }, []);

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
        uploadDate: serverTimestamp(),
      });

      setUploadSuccess("Audio note uploaded successfully!");
      setForm({ title: "", description: "", subject: "", audioFile: null });
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

  return (
    <div className="min-h-screen bg-sour-lavender py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold mb-6 note-ninja-heading text-center"
          style={{ color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Audio Notes
        </motion.h1>

        {/* Admin Upload Form */}
        {isAdmin && (
          <motion.div 
            className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7E44A3' }}>Upload Audio Note</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#7E44A3' }}>Subject</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g., CS246, MATH137"
                  value={form.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#7E44A3' }}>Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Audio note title"
                  value={form.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#7E44A3' }}>Description</label>
                <textarea
                  name="description"
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#7E44A3' }}>Audio File</label>
                <input
                  type="file"
                  name="audioFile"
                  accept="audio/*"
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white rounded-full hover:from-[#a259e6] hover:to-[#7e44a3] transition-colors font-bold"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Audio Note"}
              </button>
              {uploadSuccess && <div className="text-green-600 text-center">{uploadSuccess}</div>}
              {uploadError && <div className="text-red-600 text-center">{uploadError}</div>}
            </form>
          </motion.div>
        )}

        {/* Audio Notes Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {audioNotes.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#7E44A3' }}>No Audio Notes Yet</h3>
              <p className="text-gray-600">Start by uploading your first audio note!</p>
            </div>
          ) : (
            audioNotes.map((note, index) => (
              <motion.div
                key={note.id}
                className="bg-white rounded-xl shadow-md p-6 border border-[#e3b8f9]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[#e3b8f9] text-[#5E2A84] font-bold px-3 py-1 rounded-lg text-sm">
                    {note.subject}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(note)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                
                <h3 className="font-bold text-lg text-gray-800 mb-2">{note.title}</h3>
                {note.description && (
                  <p className="text-sm text-gray-600 mb-3">{note.description}</p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-500">
                    📁 {note.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    📊 {formatFileSize(note.fileSize)}
                  </div>
                  <div className="text-xs text-gray-500">
                    📅 {formatDate(note.uploadDate)}
                  </div>
                </div>

                <audio 
                  controls 
                  className="w-full mb-4"
                  style={{ borderRadius: '8px' }}
                >
                  <source src={note.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>

                <button
                  onClick={() => window.open(note.audioUrl, '_blank')}
                  className="w-full py-2 rounded-2xl font-bold text-base bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none"
                >
                  <span className="mr-2">🎵</span>Play Audio
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AudioNotesPage; 