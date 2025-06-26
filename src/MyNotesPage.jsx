import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { motion } from "framer-motion";
import { formatCourseCode } from "./utils/courseUtils";
import { getLikeCount, getUserLikes, toggleLike } from './utils/likeUtils';
import Skeleton from './components/Skeleton';

const MyNotesPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!currentUser) {
      setNotes([]);
      setLoading(false);
      return;
    }
    
    const notesQuery = query(collection(db, 'savedNotes'), where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(notesQuery, async (querySnapshot) => {
      const notesArr = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setNotes(notesArr);

      // Fetch likes data whenever notes change
      const counts = {};
      const userLikes = await getUserLikes(currentUser.uid);
      const likedMap = {};
      for (const note of notesArr) {
        counts[note.course] = await getLikeCount(note.course);
        likedMap[note.id] = userLikes.includes(note.course);
      }
      setLikeCounts(counts);
      setLiked(likedMap);
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching saved notes: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, authLoading]);

  const handleRemove = async (noteToRemove) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'savedNotes', noteToRemove.id));

      const userKey = `myNotes_${currentUser.uid}`;
      const notesArr = JSON.parse(localStorage.getItem(userKey) || '[]');
      
      if (noteToRemove.originalNoteId) {
        const updatedNotesArr = notesArr.filter(n => n.id !== noteToRemove.originalNoteId);
        localStorage.setItem(userKey, JSON.stringify(updatedNotesArr));
      }
    } catch (error) {
      console.error("Error removing saved note: ", error);
      alert("Failed to remove note. Please try again.");
    }
  };

  const handleLikeClick = async (id, courseCode) => {
    if (!currentUser) return;
    
    const alreadyLiked = !!liked[id];
    setLiked(prev => ({ ...prev, [id]: !alreadyLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [courseCode]: (prev[courseCode] || 0) + (alreadyLiked ? -1 : 1),
    }));
    
    toggleLike(courseCode, currentUser.uid, alreadyLiked).catch(err => {
      console.error('Like error:', err);
      setLiked(prev => ({ ...prev, [id]: alreadyLiked }));
      setLikeCounts(prev => ({
        ...prev,
        [courseCode]: (prev[courseCode] || 0) + (alreadyLiked ? 1 : -1),
      }));
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#2a0845] to-[#1a1028]">
        <Skeleton variant="circle" width={64} height={64} className="mb-6" />
        <Skeleton variant="text" width={240} height={32} className="mb-2" />
        <Skeleton variant="text" width={200} height={24} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="min-h-screen bg-sour-lavender py-8 px-4"
    >
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold font-inknut mb-6 text-center md:text-left"
            style={{ fontFamily: 'Inknut Antiqua, serif', color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}>
          My Notes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {notes.length === 0 ? (
            <div className="col-span-full text-center text-lg text-gray-600 font-semibold py-16">
              <span role="img" aria-label="empty">🗒️</span> Oops, nothing's here yet!<br />No notes found.
            </div>
        ) : (
            notes.map((note, idx) => {
              const csImages = [
                'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
              ];
              const imgSrc = note.previewImg || csImages[idx % csImages.length];
              const subject = note.courseCode || note.subject || note.course || 'Unknown Subject';
              const pdfUrl = note.fileUrl || note.pdfUrl;
              return (
                <div
                  key={note.id}
                  className="bg-white/90 rounded-2xl shadow-lg flex flex-col items-center p-4 transition-all duration-300 hover:shadow-xl cursor-pointer"
                  onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative w-full h-40 mb-4 transition-transform duration-300">
                    <img
                      src={imgSrc}
                      alt={note.title}
                      className="rounded-xl object-cover w-full h-full"
                    />
                    <div className="absolute top-2 left-2 bg-[#e3b8f9] text-[#5E2A84] font-bold px-3 py-1 rounded-lg text-sm shadow font-inknut" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
                      {formatCourseCode(subject)}
                    </div>
                  </div>
                  <div className="w-full flex flex-col items-start">
                    <div className="font-bold text-lg text-gray-800 font-inknut mb-1" style={{ fontFamily: 'Inknut Antiqua, serif' }}>{note.title}</div>
                    <div className="text-sm text-gray-500 mb-3 truncate w-full">{note.description || note.fileName || ''}</div>
                    <div className="flex flex-row gap-2 w-full">
                      <motion.button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleLikeClick(note.id, note.course); }}
                        className="flex items-center justify-center"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: liked[note.id] ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' : 'rgba(255, 255, 255, 0.9)',
                          boxShadow: liked[note.id] ? '0 4px 12px rgba(255, 107, 107, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <motion.svg width="20" height="20" viewBox="0 0 24 24" fill={liked[note.id] ? "#ffffff" : "none"} stroke={liked[note.id] ? "#ffffff" : "#666666"} strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </motion.svg>
                      </motion.button>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleRemove(note); }}
                        className="px-4 py-1 rounded-2xl font-bold text-base bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white shadow hover:from-[#a259e6] hover:to-[#7e44a3] transition-colors focus:outline-none"
                      >
                        Remove from My Notes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MyNotesPage; 