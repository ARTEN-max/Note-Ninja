import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { getLikeCount, getUserLikes, toggleLike } from './utils/likeUtils';
import { motion } from "framer-motion";

const csImages = [
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1461344577544-4e5dc9487184?auto=format&fit=crop&w=600&q=80',
];

const MyNotesPage = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const userKey = currentUser ? `myNotes_${currentUser.uid}` : 'myNotes_guest';

  useEffect(() => {
    setLoading(true);
    const notesArr = JSON.parse(localStorage.getItem(userKey) || '[]');
    setNotes(notesArr);
    // Fetch like counts and user likes for all notes
    const fetchLikes = async () => {
      const counts = {};
      for (const note of notesArr) {
        counts[note.course] = await getLikeCount(note.course);
      }
      setLikeCounts(counts);
      if (currentUser) {
        const userLikes = await getUserLikes(currentUser.uid);
        const likedMap = {};
        for (const note of notesArr) {
          likedMap[note.id] = userLikes.includes(note.course);
        }
        setLiked(likedMap);
      }
      setLoading(false);
    };
    fetchLikes();
  }, [currentUser, userKey]);

  const handleLikeClick = async (id, courseCode) => {
    if (!currentUser) return;
    const alreadyLiked = !!liked[id];
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
    setLikeCounts(prev => ({
      ...prev,
      [courseCode]: (prev[courseCode] || 0) + (alreadyLiked ? -1 : 1),
    }));
    await toggleLike(courseCode, currentUser.uid, alreadyLiked);
  };

  const handleMouseMove = (e, cardId) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const handleRemove = (id) => {
    const myNotesArr = JSON.parse(localStorage.getItem(userKey) || "[]");
    const newNotesArr = myNotesArr.filter(note => note.id !== id);
    localStorage.setItem(userKey, JSON.stringify(newNotesArr));
    setNotes(newNotesArr);
  };

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
              const imgSrc = note.previewImg || csImages[idx % csImages.length];
              const subject = note.courseCode || note.subject || note.course || 'Unknown Subject';
              const pdfUrl = note.fileUrl || note.pdfUrl;
              return (
                <div
                  key={note.id}
                  className="bg-white/90 rounded-2xl shadow-lg flex flex-col items-center p-4 transition-all duration-300 hover:shadow-xl cursor-pointer perspective-1000"
                  style={{ minWidth: 0, transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`, transformStyle: 'preserve-3d' }}
                  onMouseMove={e => handleMouseMove(e, note.id)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className="relative w-full h-40 mb-4 transition-transform duration-300"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    <img
                      src={imgSrc}
                      alt={note.title}
                      className="rounded-xl object-cover w-full h-full"
                    />
                    <div
                      className="absolute top-2 left-2 bg-[#e3b8f9] text-[#5E2A84] font-bold px-3 py-1 rounded-lg text-sm shadow font-inknut"
                      style={{ fontFamily: 'Inknut Antiqua, serif', transform: 'translateZ(30px)' }}
                    >
                      {subject}
                    </div>
                  </div>
                  <div className="w-full flex flex-col items-start" style={{ transform: 'translateZ(10px)' }}>
                    <div className="font-bold text-lg text-gray-800 font-inknut mb-1" style={{ fontFamily: 'Inknut Antiqua, serif' }}>{note.title}</div>
                    <div className="text-sm text-gray-500 mb-3 truncate w-full">{note.description || note.fileName || ''}</div>
                    <div className="flex flex-row gap-2 w-full">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleRemove(note.id); }}
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