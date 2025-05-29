import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StudyGuideCard from "./StudyGuideCard";
import { db, storage } from "../firebase";
import { collection, addDoc, onSnapshot, serverTimestamp, query, where, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";

const ADMIN_EMAIL = 'abdul.rahman78113@gmail.com';

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-200 to-pink-300 relative overflow-hidden">
      {/* Animation: Heading at the top, scales and fades in */}
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-pink-800 mt-12 mb-8"
        style={{ fontFamily: 'Inknut Antiqua, serif', textAlign: 'center', position: 'relative', zIndex: 20 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onAnimationComplete={() => setTimeout(() => setShowNotes(true), 400)}
      >
        {welcomeMessage}
      </motion.h1>
      {/* Admin Upload Form */}
      {currentUser && currentUser.email === ADMIN_EMAIL && (
        <form onSubmit={handleUpload} className="mb-8 bg-white/90 rounded-2xl shadow p-6 flex flex-col gap-4 w-full max-w-xl">
          <h3 className="font-bold text-lg text-pink-800 mb-2">Upload Note</h3>
          <input
            type="text"
            placeholder="Subject (e.g. CS246, MATH137)"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="border rounded p-2"
            required
          />
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border rounded p-2"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border rounded p-2"
          />
          <input
            type="file"
            accept=".pdf"
            onChange={e => setPdfFile(e.target.files[0])}
            className="border rounded p-2"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
            className="border rounded p-2"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border mx-auto" />
          )}
          <button
            type="submit"
            className="bg-pink-700 text-white font-bold py-2 px-4 rounded hover:bg-pink-800"
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
          {albumNotes.map(note => (
            <StudyGuideCard
              key={note.id}
              courseCode={note.subject}
              title={note.title}
              description={note.description}
              imageUrl={note.imageUrl || defaultImage || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"}
              onClick={() => window.open(note.pdfUrl, '_blank')}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AlbumNotesPage; 