// If you haven't already, run: npm install react-icons
import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import { doc, getDoc, setDoc, increment, collection, query, where, getDocs, or, onSnapshot, QueryFieldFilterConstraint, Query, DocumentData, QueryConstraint } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from './contexts/AuthContext.jsx';
import { getLikeCount, getUserLikes, toggleLike } from './utils/likeUtils.js';
import StudyGuideCard from './components/StudyGuideCard';

// Add type for study guide document
interface StudyGuide {
  id: string | number;  // Allow both string (Firestore) and number (mock)
  courseCode: string;
  coursePrefix?: string;  // Optional since mock data doesn't have it
  title: string;
  description: string;
  imageUrl: string;
}

// Update mock data to include coursePrefix
const studyGuides: StudyGuide[] = [
  {
    id: 1,
    courseCode: "CS246",
    coursePrefix: "CS",
    title: "Study Guide 1",
    description: "Description of playlist",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/36526b27cd6c189d1bfdb806f5ceb1322060cbad?placeholderIfAbsent=true",
  },
  {
    id: 2,
    courseCode: "MATH137",
    coursePrefix: "MATH",
    title: "Study Guide 2",
    description: "Description of playlist",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/6fae324141d1039bf2b81b3ec7dc2f228cce8544?placeholderIfAbsent=true",
  },
  {
    id: 3,
    courseCode: "STAT230",
    coursePrefix: "STAT",
    title: "Study Guide 3",
    description: "Description of playlist",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/b74b14b6b3c5377baeb384c799fd79ddca8803d8?placeholderIfAbsent=true",
  },
  {
    id: 4,
    courseCode: "MATH135",
    coursePrefix: "MATH",
    title: "Study Guide 4",
    description: "Description of playlist",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/b5a7a6e7eb860dca445df9a3c409eb7da483cae0?placeholderIfAbsent=true",
  },
  {
    id: 5,
    courseCode: "PHYS121",
    coursePrefix: "PHYS",
    title: "Study Guide 5",
    description: "Description of playlist",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/2a20d44e6ae70f49483a0c767b1644249e9ca8a3?placeholderIfAbsent=true",
  },
  {
    id: 6,
    courseCode: "CHEM120",
    coursePrefix: "CHEM",
    title: "Study Guide 6",
    description: "Description of playlist",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/409c53ce05e6a99f769c7cd21d30ed60ddfb1230?placeholderIfAbsent=true",
  },
];

// Add faculty-based course mappings
const facultyCourseMappings = {
  "Mathematics": ["MATH", "CS", "STAT", "CO"],
  "Engineering": ["ECE", "ME", "CE", "SYDE"],
  "Science": ["PHYS", "CHEM", "BIOL"],
  "Arts": ["ARTS", "ENGL", "HIST", "PHIL"],
  "Environment": ["ENV", "GEOG", "PLAN"],
  "Health": ["HLTH", "KIN", "REC"]
};

// Add type for query conditions
type QueryCondition = QueryFieldFilterConstraint;

const BrowsePage = () => {
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notFound, setNotFound] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [recommendedGuides, setRecommendedGuides] = useState<StudyGuide[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

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
  }, [currentUser]);

  useEffect(() => {
    const fetchRecommended = async () => {
      setLoadingRecs(true);
      if (!currentUser) {
        setRecommendedGuides(studyGuides);
        setLoadingRecs(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "students", currentUser.uid));
      if (!userDoc.exists()) {
        setRecommendedGuides(studyGuides);
        setLoadingRecs(false);
        return;
      }

      const userData = userDoc.data();
      const courseCodes = userData.courseCodes || [];
      const faculty = userData.faculty || "";
      let guides: StudyGuide[] = [];
      let fetched = false;

      // Firestore does not support 'or' with 'in', so fetch separately and merge
      if (courseCodes.length > 0) {
        const courseCodeQuery = query(collection(db, "studyGuides"), where("courseCode", "in", courseCodes));
        await new Promise<void>((resolve) => {
          onSnapshot(courseCodeQuery, (snapshot) => {
            guides = guides.concat(snapshot.docs.map(doc => {
              const data = doc.data();
              const coursePrefix = data.courseCode?.match(/^[A-Z]+/)?.[0] || "";
              return {
                id: doc.id,
                courseCode: data.courseCode || "",
                title: data.title || "",
                description: data.description || "",
                imageUrl: data.imageUrl || "",
                coursePrefix
              };
            }));
            resolve();
          }, () => resolve());
        });
        fetched = true;
      }
      if (faculty && facultyCourseMappings[faculty]) {
        const prefixes = facultyCourseMappings[faculty];
        const prefixQuery = query(collection(db, "studyGuides"), where("coursePrefix", "in", prefixes));
        await new Promise<void>((resolve) => {
          onSnapshot(prefixQuery, (snapshot) => {
            guides = guides.concat(snapshot.docs.map(doc => {
              const data = doc.data();
              const coursePrefix = data.courseCode?.match(/^[A-Z]+/)?.[0] || "";
              return {
                id: doc.id,
                courseCode: data.courseCode || "",
                title: data.title || "",
                description: data.description || "",
                imageUrl: data.imageUrl || "",
                coursePrefix
              };
            }));
            resolve();
          }, () => resolve());
        });
        fetched = true;
      }
      // Remove duplicates by courseCode
      guides = guides.filter((g, i, arr) => arr.findIndex(x => x.courseCode === g.courseCode) === i);
      if (!fetched || guides.length === 0) {
        setRecommendedGuides(studyGuides);
      } else {
        setRecommendedGuides(guides);
      }
      setLoadingRecs(false);
    };
    fetchRecommended();
  }, [currentUser]);

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

  // Update to use a more specific type
  const handleMouseMove = (e: { currentTarget: HTMLDivElement; clientX: number; clientY: number }, cardId: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Fade-in animation variant
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const filteredSuggestions = search.trim()
    ? studyGuides.filter(
        guide =>
          guide.courseCode.toLowerCase().includes(search.trim().toLowerCase()) ||
          guide.title.toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      const query = search.trim().toLowerCase();
      const match = studyGuides.find(
        guide =>
          guide.courseCode.toLowerCase() === query ||
          guide.title.toLowerCase().includes(query)
      );
      if (match) {
        setNotFound("");
        navigate(`/download/${match.id}`);
      } else {
        setNotFound("Course not found.");
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (id) => {
    setNotFound("");
    setShowSuggestions(false);
    navigate(`/choose-mode/${id}`);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="min-h-screen bg-sour-lavender py-8 px-4"
    >
      {/* Search Section */}
      <div className="w-full flex justify-center items-center mt-8 mb-10">
        <div className="relative w-full max-w-lg mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 text-2xl">
            <FiSearch />
          </span>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-lg bg-white/90 border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300 text-lg font-medium placeholder-gray-400 transition"
            placeholder="Search for courses, notes, or study guides..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setShowSuggestions(true);
              setNotFound("");
            }}
            onKeyDown={handleSearchKeyDown}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onFocus={() => setShowSuggestions(true)}
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
          />
          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-10 border border-pink-100 max-h-60 overflow-y-auto">
              {filteredSuggestions.map(guide => (
                <div
                  key={guide.id}
                  className="px-4 py-3 cursor-pointer hover:bg-pink-50 flex items-center gap-3"
                  onMouseDown={() => handleSuggestionClick(guide.id)}
                >
                  <span className="bg-pink-100 text-pink-700 font-bold px-2 py-1 rounded text-xs">{guide.courseCode}</span>
                  <span className="font-medium text-gray-800">{guide.title}</span>
                </div>
              ))}
            </div>
          )}
          {/* Not Found Message */}
          {notFound && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-10 border border-red-200 text-red-600 px-4 py-3 font-semibold">
              {notFound}
            </div>
          )}
        </div>
      </div>

      {/* Personalized Study Guides Section */}
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold font-inknut mb-6 text-center md:text-left"
            style={{ fontFamily: 'Inknut Antiqua, serif', color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}>
          {recommendedGuides === studyGuides ? "Popular Study Guides" : "Recommended for You"}
        </h2>
        {loadingRecs ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="animate-spin h-12 w-12 text-pink-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <div className="text-lg font-semibold text-pink-700">Fetching your recommendations...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {recommendedGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white/90 rounded-2xl shadow-lg flex flex-col items-center p-4 transition-all duration-300 hover:shadow-xl cursor-pointer perspective-1000"
                style={{
                  minWidth: 0,
                  transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
                  transformStyle: 'preserve-3d',
                }}
                onMouseMove={(e) => handleMouseMove(e, Number(guide.id))}
                onMouseLeave={handleMouseLeave}
                onClick={() => navigate(`/guide/${guide.courseCode}/notes`)}
                role="button"
                tabIndex={0}
              >
                <div 
                  className="relative w-full h-40 mb-4 transition-transform duration-300"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <img
                    src={guide.imageUrl}
                    alt={guide.title}
                    className="rounded-xl object-cover w-full h-full"
                  />
                </div>
                <div 
                  className="w-full flex flex-col items-start"
                  style={{ transform: 'translateZ(10px)' }}
                >
                  <div className="font-bold text-lg text-gray-800 font-inknut mb-1" style={{ fontFamily: 'Inknut Antiqua, serif' }}>{guide.courseCode}</div>
                  <div className="text-sm text-gray-500 mb-3">{guide.description}</div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleLikeClick(guide.id, guide.courseCode); }}
                    className={`px-4 py-1 rounded-2xl font-bold text-base transition-colors ${liked[guide.id] ? 'bg-pink-200 text-pink-700' : 'bg-gray-200 text-black'} focus:outline-none`}
                  >
                    {liked[guide.id] ? 'Liked' : 'Like'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.main>
  );
};

export default BrowsePage; 