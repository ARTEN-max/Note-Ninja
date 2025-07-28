import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StudyGuideCard from "./StudyGuideCard";
import placeholderImages from '../utils/placeholders';
import { db, storage } from "../firebase";
import { collection, addDoc, onSnapshot, serverTimestamp, query, where, orderBy, doc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject, ref as storageRef } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";
import BackToPrevious from './BackToPrevious';

const ADMIN_EMAILS = ['abdul.rahman78113@gmail.com', 'kingbronfan23@gmail.com'];

const AlbumNotesPage = ({ type, welcomeMessage, defaultImage }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [albumNotes, setAlbumNotes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { currentUser } = useAuth();

  // Fetch notes for this album type from Firestore
  useEffect(() => {
    const q = query(collection(db, "albumNotes"), where("type", "==", type), orderBy("uploadDate", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlbumNotes(notes);
    });
    return () => unsub();
  }, [type]);

  // Handle image preview
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(imageFile);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  // Upload handler (admin only)
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");
    if (!pdfFile || !title || !subject) {
      setUploadError("PDF, subject, and title are required.");
      return;
    }
    setUploading(true);
    try {
      // Upload PDF
      const pdfRef = ref(storage, `album-notes/${type}/${subject}_${Date.now()}_${pdfFile.name}`);
      const pdfSnap = await uploadBytes(pdfRef, pdfFile);
      const pdfUrl = await getDownloadURL(pdfSnap.ref);
      // Upload image if provided
      let imageUrl = "";
      if (imageFile) {
        const imgRef = ref(storage, `album-notes/images/${type}_${subject}_${Date.now()}_${imageFile.name}`);
        const imgSnap = await uploadBytes(imgRef, imageFile);
        imageUrl = await getDownloadURL(imgSnap.ref);
      }
      // Save metadata to Firestore
      await addDoc(collection(db, "albumNotes"), {
        type,
        subject,
        title,
        description,
        pdfUrl,
        imageUrl,
        uploaderId: currentUser.uid,
        uploaderEmail: currentUser.email,
        uploadDate: serverTimestamp(),
      });
      setUploadSuccess("Note uploaded successfully!");
      setSubject("");
      setTitle("");
      setDescription("");
      setPdfFile(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setUploadError("Failed to upload note.");
    } finally {
      setUploading(false);
    }
  };

  // Delete handler
  const handleDelete = async (note) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteDoc(doc(db, "albumNotes", note.id));
      if (note.pdfUrl) {
        try {
          const fileRef = storageRef(storage, note.pdfUrl);
          await deleteObject(fileRef);
        } catch (err) {
          // Ignore storage errors
        }
      }
      setAlbumNotes(prev => prev.filter(n => n.id !== note.id));
    } catch (err) {
      alert("Failed to delete note.");
    }
  };

  // Use all unique placeholders from the imported list

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sour-lavender relative overflow-hidden px-2 py-8">
      <BackToPrevious />
      {/* Animation: Heading at the top, scales and fades in */}
      <motion.h1
        className="text-4xl md:text-6xl font-bold mt-12 mb-8 note-ninja-heading"
        style={{ textAlign: 'center', position: 'relative', zIndex: 20, color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onAnimationComplete={() => setTimeout(() => setShowNotes(true), 400)}
      >
        {welcomeMessage}
      </motion.h1>
      {/* Admin Upload Form */}
      {currentUser && ADMIN_EMAILS.includes(currentUser.email) && (
        <form onSubmit={handleUpload} className="mb-8 bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 w-full max-w-xl neon-lavender-glow">
          <h3 className="font-bold text-lg mb-2" style={{ color: '#7E44A3' }}>Upload Note</h3>
          <input
            type="text"
            placeholder="Subject (e.g. CS246, MATH137)"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
            required
          />
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
          />
          <input
            type="file"
            accept=".pdf"
            onChange={e => setPdfFile(e.target.files[0])}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border mx-auto" />
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white font-bold py-2 px-4 rounded-full hover:from-[#a259e6] hover:to-[#7e44a3] transition-colors shadow-lg"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Note'}
          </button>
          {uploadSuccess && <div className="text-green-600">{uploadSuccess}</div>}
          {uploadError && <div className="text-red-600">{uploadError}</div>}
        </form>
      )}
      {/* Study Guide Cards Grid */}
      {showNotes && (
        <motion.div
          className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 } }}
        >
          {albumNotes.map((note, index) => {
            // Assign a unique placeholder to each card, ignore note.imageUrl
            const imageUrl = placeholderImages[index] || '';
            return (
              <StudyGuideCard
                key={note.id}
                courseCode={note.subject}
                title={note.title}
                description={note.description}
                imageUrl={imageUrl}
                pdfUrl={note.pdfUrl}
                showDelete={currentUser && note.uploaderId === note.uploaderId}
                onDelete={() => handleDelete(note)}
                minimal={true}
              />
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default AlbumNotesPage; 