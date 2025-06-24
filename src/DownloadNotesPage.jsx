import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from './firebase';
import { useAuth } from './contexts/AuthContext';
import { doc, setDoc, getDoc, collection, query, where, getDocs, onSnapshot, orderBy, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { formatCourseCode } from "./utils/courseUtils";

const ADMIN_EMAILS = ['abdul.rahman78113@gmail.com', 'kingbronfan23@gmail.com'];

const DownloadNotesPage = () => {
  const { courseCode: routeCourseCode } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [myNotesIds, setMyNotesIds] = useState(new Set());
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    if (!routeCourseCode) {
      navigate('/browse');
      return;
    }

    const fetchNotes = () => {
      setLoading(true);
      const q = query(collection(db, 'notes'), where('course', '==', routeCourseCode), orderBy('uploadDate', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notesArr = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(notesArr);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching notes:", error);
        setLoading(false);
      });
      return unsubscribe;
    };

    const unsubscribeNotes = fetchNotes();

    return () => {
      unsubscribeNotes();
    };
  }, [routeCourseCode, navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const myNotesRef = collection(db, 'students', currentUser.uid, 'myNotes');
    const unsubscribe = onSnapshot(myNotesRef, (snapshot) => {
      const ids = new Set(snapshot.docs.map(doc => doc.id));
      setMyNotesIds(ids);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddToMyNotes = async (note) => {
    setAddSuccess("");
    setAddError("");
    if (!currentUser) {
      setAddError("You must be signed in to add notes.");
      return;
    }
    if (myNotesIds.has(note.id)) {
      setAddSuccess("This note is already in your collection.");
      return;
    }

    try {
      await setDoc(doc(db, "students", currentUser.uid, "myNotes", note.id), {
        ...note,
        addedAt: new Date().toISOString(),
      });
      await addDoc(collection(db, "userDownloads"), {
        userId: currentUser.uid,
        courseId: note.id,
        courseTitle: note.title,
        courseThumbnail: note.previewImg || 'https://via.placeholder.com/150',
        downloadedAt: new Date().toISOString(),
      });
      setMyNotesIds(prev => new Set(prev).add(note.id));
      setAddSuccess("Added to My Notes!");
    } catch (err) {
      setAddError("Failed to add to My Notes.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sour-lavender flex justify-center items-center">
        <div className="text-xl font-semibold text-[#5E2A84]">Loading notes for {formatCourseCode(routeCourseCode)}...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sour-lavender py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold note-ninja-heading mb-4" style={{ color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}>
          Notes for {formatCourseCode(routeCourseCode)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((material, idx) => (
              <div key={material.id} className="bg-white rounded-xl shadow-md p-4 border border-pink-100 flex flex-col">
                <div className="relative w-full h-40 mb-3">
                  <img
                    src={material.previewImg || 'https://via.placeholder.com/150'}
                    alt={material.title}
                    className="rounded-lg object-cover w-full h-full"
                  />
                  <div className="absolute top-2 left-2 bg-[#e3b8f9] text-[#5E2A84] font-bold px-3 py-1 rounded-lg text-sm">
                    {material.type}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">{material.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{material.description}</p>
                <button
                  className="w-full py-2 rounded-2xl font-bold text-base bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none mb-2"
                  onClick={() => window.open(material.fileUrl, '_blank')}
                >
                  <span className="mr-2">📥</span>Download PDF
                </button>
                <button
                  className={`w-full py-2 rounded-2xl font-bold text-base shadow transition-transform focus:outline-none mb-2 ${
                    myNotesIds.has(material.id)
                      ? 'bg-green-200 text-green-800 cursor-not-allowed'
                      : 'bg-[#e3b8f9] text-[#5E2A84] hover:bg-[#c895f2] hover:scale-105'
                  }`}
                  onClick={() => handleAddToMyNotes(material)}
                  disabled={myNotesIds.has(material.id)}
                >
                  {myNotesIds.has(material.id) ? 'Added to My Notes' : '➕ Add to My Notes'}
                </button>
              </div>
            ))}
        </div>
        {(addSuccess || addError) && (
          <div className="mt-4 text-center">
            {addSuccess && <div className="text-green-600 font-medium mb-2">{addSuccess}</div>}
            {addError && <div className="text-red-600 font-medium mb-2">{addError}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadNotesPage; 