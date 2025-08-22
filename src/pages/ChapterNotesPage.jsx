import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import studyGuides from '../data/studyGuides';
import { formatCourseCode } from "../utils/courseUtils";
import BackToPrevious from '../components/BackToPrevious';
import placeholderImages from '../utils/placeholders';
import ContentGate from '../components/ContentGate';

const ADMIN_EMAILS = ["abdul.rahman78113@gmail.com", "kingbronfan23@gmail.com"]; // <-- Add more admin emails here

const ChapterNotesPage = () => {
  const { guideId, chapterNumber } = useParams();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
  const [form, setForm] = useState({ file: null, title: "", description: "" });
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chapterTitle, setChapterTitle] = useState("");
  const [myNotesIds, setMyNotesIds] = useState([]);
  const guide = studyGuides.find(g => String(g.id) === String(guideId));
  const subjectName = guide ? guide.courseCode : guideId;
  const userKey = currentUser ? `myNotes_${currentUser.uid}` : 'myNotes_guest';

  // Firestore path: studyGuides/{guideId}/chapters/{chapterNumber}/notes
  const notesCollectionPath = `studyGuides/${guideId}/chapters/${chapterNumber}/notes`;

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const notesCol = collection(db, notesCollectionPath);
        const snapshot = await getDocs(notesCol);
        const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(notesData);
      } catch (err) {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [guideId, chapterNumber]);

  useEffect(() => {
    const fetchChapterTitle = async () => {
      try {
        const chapterDoc = await getDoc(doc(db, `studyGuides/${guideId}/chapters/${chapterNumber}`));
        if (chapterDoc.exists()) {
          setChapterTitle(chapterDoc.data().title || "");
        } else {
          setChapterTitle("");
        }
      } catch (err) {
        setChapterTitle("");
      }
    };
    fetchChapterTitle();
  }, [guideId]);

  useEffect(() => {
    // Fetch user's myNotes from localStorage
    const notesArr = JSON.parse(localStorage.getItem(userKey) || '[]');
    setMyNotesIds(notesArr.map(note => note.id));
  }, [userKey]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.file || !form.title) return;
    setUploading(true);
    try {
      // Upload PDF to Firebase Storage
      const storagePath = `notes/${guideId}/${chapterNumber}/${Date.now()}_${form.file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, form.file);
      const fileUrl = await getDownloadURL(storageRef);
      // Save note metadata to Firestore, including storagePath
      const notesCol = collection(db, notesCollectionPath);
      await addDoc(notesCol, {
        title: form.title,
        description: form.description,
        fileUrl,
        fileName: form.file.name,
        storagePath, // Save the full storage path
        createdAt: new Date().toISOString(),
        uploader: currentUser.email,
      });
      // Refresh notes
      const snapshot = await getDocs(notesCol);
      const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(notesData);
      setForm({ file: null, title: "", description: "" });
    } catch (err) {
      // handle error
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (note) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      // Delete from storage using the exact storagePath
      if (note.storagePath) {
        const storageRef = ref(storage, note.storagePath);
        await deleteObject(storageRef);
      }
      // Delete from Firestore
      await deleteDoc(doc(db, notesCollectionPath, note.id));
      setNotes(notes.filter(n => n.id !== note.id));

      // Also remove from local myNotesIds if it exists there
      setMyNotesIds(prev => prev.filter(id => id !== note.id));

      // Also remove from localStorage to ensure consistency
      const notesArr = JSON.parse(localStorage.getItem(userKey) || '[]');
      const updatedNotesArr = notesArr.filter(n => n.id !== note.id);
      localStorage.setItem(userKey, JSON.stringify(updatedNotesArr));
    } catch (err) {
      // handle error
    }
  };

  const handleAddToMyNotes = async (note) => {
    const notesArr = JSON.parse(localStorage.getItem(userKey) || '[]');
    if (notesArr.some(n => n.id === note.id)) return;
    
    const noteToSave = { 
      ...note, 
      addedAt: new Date().toISOString(),
      courseCode: subjectName, // ensure course code is saved
      savedBy: currentUser?.uid || 'guest',
      savedByEmail: currentUser?.email || 'guest'
    };
    
    notesArr.push(noteToSave);
    localStorage.setItem(userKey, JSON.stringify(notesArr));
    setMyNotesIds(prev => [...prev, note.id]);

    // Also save to Firebase for public profile viewing
    if (currentUser) {
      try {
        console.log('Attempting to save note to Firebase:', {
          note: noteToSave,
          user: {
            uid: currentUser.uid,
            email: currentUser.email
          }
        });
        
        const savedNotesRef = collection(db, 'savedNotes');
        const savedNote = {
          ...noteToSave,
          originalNoteId: note.id,
          savedAt: new Date().toISOString(),
          userId: currentUser.uid,
          userEmail: currentUser.email,
          username: currentUser.displayName || currentUser.email?.split('@')[0],
          uid: currentUser.uid,
          // Add these fields to ensure we have all necessary data
          title: note.title || 'Untitled Note',
          description: note.description || '',
          fileUrl: note.fileUrl || note.pdfUrl,
          fileName: note.fileName || '',
          course: subjectName,
          type: 'Saved Note'
        };
        
        const docRef = await addDoc(savedNotesRef, savedNote);
        console.log('Successfully saved note to Firebase with ID:', docRef.id);
      } catch (err) {
        console.error('Error saving note to Firebase:', err);
        // Try to get more error details
        console.error('Error details:', {
          code: err.code,
          message: err.message,
          details: err.details
        });
      }
    }
  };

  return (
    <>
      <BackToPrevious />
      <div className="min-h-screen bg-sour-lavender py-8 px-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 note-ninja-heading" style={{ color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}>
          Notes for {formatCourseCode(subjectName)}
        </h1>
        {isAdmin && (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 mb-8">
            <form onSubmit={handleFormSubmit}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#7E44A3' }}>Upload PDF Note</h2>
              <input
                type="file"
                name="file"
                accept="application/pdf"
                onChange={handleInputChange}
                className="mb-4 block w-full"
                required
              />
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleInputChange}
                className="mb-4 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
                required
              />
              <textarea
                name="description"
                placeholder="Description (optional)"
                value={form.description}
                onChange={handleInputChange}
                className="mb-4 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white rounded-full hover:from-[#a259e6] hover:to-[#7e44a3] transition-colors font-bold"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Note"}
              </button>
            </form>
          </div>
        )}
        {/* Uploaded notes section, separated from the form */}
        {loading ? (
          <div className="text-center font-bold" style={{ color: '#7E44A3' }}>Loading notes...</div>
        ) : notes.length > 0 ? (
          <div className="w-full max-w-5xl mt-8">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#7E44A3' }}>Uploaded Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note, idx) => {
                // Use a simpler, more reliable image selection
                const imageIndex = idx % placeholderImages.length;
                const imgSrc = placeholderImages[imageIndex];
                const alreadyAdded = myNotesIds.includes(note.id);
                return (
                  <div key={note.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={note.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        // Fallback to a different image if the current one fails
                        const fallbackIndex = (imageIndex + 1) % placeholderImages.length;
                        e.target.src = placeholderImages[fallbackIndex];
                        // If the fallback also fails, try a third image
                        e.target.onerror = () => {
                          const thirdIndex = (fallbackIndex + 1) % placeholderImages.length;
                          e.target.src = placeholderImages[thirdIndex];
                        };
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{note.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{note.description || note.fileName}</p>
                      <button
                        className="w-full py-2 rounded-2xl font-bold text-base bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none mb-2"
                        onClick={() => window.open(note.fileUrl, '_blank')}
                      >
                        <span className="mr-2">📥</span>Download PDF
                      </button>
                      <button
                        className={`w-full py-1 rounded-2xl text-sm font-semibold mt-1 mb-2 transition-colors ${alreadyAdded ? 'bg-green-200 text-green-800 cursor-not-allowed' : 'bg-[#e3b8f9] text-[#5E2A84] hover:bg-[#c895f2]'}`}
                        onClick={() => handleAddToMyNotes(note)}
                        disabled={alreadyAdded}
                      >
                        {alreadyAdded ? 'Added to My Notes' : 'Add to My Notes'}
                      </button>
                      {isAdmin && (
                        <button
                          className="w-full py-2 rounded-2xl font-bold text-base bg-[#e3b8f9] text-[#5E2A84] shadow transition-transform hover:bg-[#c895f2] focus:outline-none"
                          onClick={() => handleDelete(note)}
                        >
                          <span className="mr-2">🗑️</span>Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600 mt-8">No notes uploaded yet.</div>
        )}
      </div>
    </>
  );
};

export default ChapterNotesPage;