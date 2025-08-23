"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StudyGuideCard from "./StudyGuideCard";
import AlbumItem from "./AlbumItem";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { useAuth } from '../contexts/AuthContext';
import { getLikeCount, getUserLikes, toggleLike } from '../utils/likeUtils';
import { FiUser } from "react-icons/fi";
import Skeleton from './Skeleton';
import placeholderImages from '../utils/placeholders';
// Shuffle function
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Move studyGuides outside component to prevent useEffect re-runs
const studyGuides = [
  {
    id: 1,
    courseCode: "CS246",
    title: "Study Guide 1",
    description: "Logic and Computation",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/36526b27cd6c189d1bfdb806f5ceb1322060cbad?placeholderIfAbsent=true",
  },
  {
    id: 2,
    courseCode: "MATH137",
    title: "Study Guide 2",
    description: "Calculus 1",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/6fae324141d1039bf2b81b3ec7dc2f228cce8544?placeholderIfAbsent=true",
  },
  {
    id: 3,
    courseCode: "STAT230",
    title: "Study Guide 3",
    description: "Probability",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/b74b14b6b3c5377baeb384c799fd79ddca8803d8?placeholderIfAbsent=true",
  },
  {
    id: 4,
    courseCode: "MATH135",
    title: "Study Guide 4",
    description: "Algebra",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/b5a7a6e7eb860dca445df9a3c409eb7da483cae0?placeholderIfAbsent=true",
  },
];

const NoteDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [likeError, setLikeError] = useState("");
  const [loading, setLoading] = useState(true);

  const albums = [
    {
      id: 1,
      title: "Cram Mode",
      subtitle: "Everything",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/2a20d44e6ae70f49483a0c767b1644249e9ca8a3?placeholderIfAbsent=true",
    },
    {
      id: 2,
      title: "Deep Dive",
      subtitle: "Chapter Notes",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/409c53ce05e6a99f769c7cd21d30ed60ddfb1230?placeholderIfAbsent=true",
    },
    {
      id: 3,
      title: "Exam Review",
      subtitle: "Midterm/Final",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/866a3e1dfb4c46967db9b8a84fb24deda80ac307?placeholderIfAbsent=true",
    },
    {
      id: 4,
      title: "Quick Recap",
      subtitle: "Summary",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/10f659c608e8829dc4d8ee3d1cdf00f943de7890?placeholderIfAbsent=true",
    },
    {
      id: 5,
      title: "Night Owl",
      subtitle: "R&B",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/91b178e6f2bbc69a515ffeaf70a21eae5f057812?placeholderIfAbsent=true",
    },
    {
      id: 6,
      title: "Chill Review",
      subtitle: "Rock",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/bf6ba7aa29f0b15ac581d17766eca054df1912c4?placeholderIfAbsent=true",
    },
  ];

  const guideImageMap = useMemo(() => {
    const count = studyGuides.length;
    let images = [];
    if (placeholderImages.length >= count) {
      images = shuffleArray(placeholderImages).slice(0, count);
    } else {
      const times = Math.ceil(count / placeholderImages.length);
      images = Array(times).fill(null).flatMap(() => shuffleArray(placeholderImages)).slice(0, count);
    }
    const map = {};
    studyGuides.forEach((guide, idx) => {
      map[guide.id] = images[idx];
    });
    return map;
  }, [studyGuides.length, placeholderImages.length]);

  useEffect(() => {
    // Fetch like counts and user likes for all study guides
    const fetchLikes = async () => {
      const counts = {};
      for (const guide of studyGuides) {
        counts[guide.courseCode] = await getLikeCount(guide.courseCode);
      }
      setLikeCounts(counts);
      if (currentUser) {
        const userLikes = await getUserLikes(currentUser.uid);
        const likedMap = {};
        for (const guide of studyGuides) {
          likedMap[guide.id] = userLikes.includes(guide.courseCode);
        }
        setLiked(likedMap);
      }
    };
    fetchLikes();
  }, [currentUser]); // Removed studyGuides from dependencies

  useEffect(() => {
    // Simulate loading for 1s for demo; replace with real loading logic if needed
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStudyGuideClick = (courseCode) => {
    // Navigate directly to the notes page for this study guide using course code
    navigate(`/guide/${courseCode}/notes`);
  };

  const handleLikeClick = async (id, courseCode) => {
    if (!currentUser) return;
    
    // Get current state
    const alreadyLiked = !!liked[id];
    
    // Update UI immediately
    setLiked(prev => ({ ...prev, [id]: !alreadyLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [courseCode]: (prev[courseCode] || 0) + (alreadyLiked ? -1 : 1),
    }));
    setLikeError("");
    
    // Fire and forget - don't await
    toggleLike(courseCode, currentUser.uid, alreadyLiked).catch(err => {
      console.error('Like error:', err);
      // Rollback UI state on error
      setLiked(prev => ({ ...prev, [id]: alreadyLiked }));
      setLikeCounts(prev => ({
        ...prev,
        [courseCode]: (prev[courseCode] || 0) + (alreadyLiked ? 1 : -1),
      }));
      setLikeError("Failed to update like. Please try again.");
    });
  };

  // Framer Motion variants for staggered animation
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.35,
      },
    },
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;600;700&family=Inria+Sans:wght@400;700&family=Inter:wght@400;500&display=swap"
      />
      <div className="min-h-screen bg-sour-lavender flex flex-col items-center justify-start">
        <div className="w-full max-w-7xl mx-auto px-4 flex flex-col flex-1 overflow-auto pt-6">
          {loading ? (
            <>
              <div className="w-full flex justify-center mb-2">
                <Skeleton variant="text" width={256} height={40} />
              </div>
              <div className="mb-2">
                <Skeleton variant="text" width={192} height={32} className="mb-2" />
                <Skeleton variant="text" width={288} height={24} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-8 mb-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center bg-white rounded-2xl shadow-md p-4">
                    <Skeleton variant="rect" width={200} height={120} className="mb-2" />
                    <Skeleton variant="text" width={96} height={16} className="mt-2 mb-1" />
                    <Skeleton variant="text" width={80} height={12} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-10" style={{ marginLeft: 20 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center bg-white rounded-xl shadow-md p-4">
                    <Skeleton variant="rect" width={144} height={144} className="mb-2" />
                    <Skeleton variant="text" width={80} height={16} className="mt-2 mb-1" />
                    <Skeleton variant="text" width={64} height={12} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="w-full text-center mb-2">
                <h1
                  className="text-4xl font-bold mb-1 note-ninja-heading pl-0"
                  style={{ color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}
                >
                  NOTE NINJA
                </h1>
                <div className="w-full md:w-auto mx-auto text-left md:text-left md:pl-4">
                  <h2 className="text-2xl font-bold mb-1 pl-0" style={{ color: '#7E44A3', fontFamily: 'Inter, Arial, sans-serif', fontWeight: '600' }}>Dashboard</h2>
                  <div className="text-lg pl-0" style={{ color: '#7E44A3', fontFamily: 'Inter, Arial, sans-serif', fontWeight: '400' }}>Today's top study guides...</div>
                </div>
              </div>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {likeError && <div className="col-span-4 text-center text-red-600 font-bold mb-2">{likeError}</div>}
                {studyGuides.length === 0 ? (
                  <div className="col-span-4 text-center py-12 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-semibold text-white mb-2">No Study Guides Yet</h3>
                    <p className="text-white mb-6">Start by adding a study guide.</p>
                    {/* You can add a button here to create a new guide */}
                  </div>
                ) : (
                  studyGuides.map((guide) => {
                    return (
                      <motion.div
                        key={guide.id}
                        variants={cardVariants}
                        className="flex justify-center mb-2"
                      >
                        <StudyGuideCard
                          courseCode={guide.courseCode}
                          title={guide.title}
                          description={guide.description}
                          imageUrl={guideImageMap[guide.id]}
                          liked={!!liked[guide.id]}
                          onLike={() => handleLikeClick(guide.id, guide.courseCode)}
                          likeCount={likeCounts[guide.courseCode] || 0}
                          onClick={() => handleStudyGuideClick(guide.courseCode)}
                        />
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-10 justify-items-center">
                {albums.map((album, idx) => (
                  <AlbumItem
                    key={album.id}
                    title={album.title}
                    subtitle={album.subtitle}
                    imageUrl={album.imageUrl}
                    onClick={() => {
                      const routes = [
                        '/cram-mode',
                        '/deep-dive',
                        '/exam-review',
                        '/quick-recap',
                        '/night-owl',
                        '/chill-review',
                      ];
                      navigate(routes[idx]);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NoteDashboard;
