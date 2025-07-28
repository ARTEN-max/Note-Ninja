// If you haven't already, run: npm install react-icons
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import { doc, getDoc, setDoc, increment, collection, query, where, getDocs, or, onSnapshot, QueryFieldFilterConstraint, Query, DocumentData, QueryConstraint } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from './contexts/AuthContext.jsx';
import { getLikeCount, getUserLikes, toggleLike } from './utils/likeUtils.js';
import StudyGuideCard from './components/StudyGuideCard';
import { formatCourseCode } from "./utils/courseUtils";
import placeholderImages from './utils/placeholders';



// Add type for study guide document
interface StudyGuide {
  id: string | number;  // Allow both string (Firestore) and number (mock)
  courseCode: string;
  coursePrefix?: string;  // Optional since mock data doesn't have it
  title: string;
  description: string;
  imageUrl: string;
}

// Add faculty-based course mappings
const facultyCourseMappings = {
  "Mathematics": ["MATH", "CS", "STAT", "CO"],
  "Engineering": ["ECE", "ME", "CE", "SYDE"],
  "Science": ["PHYS", "CHEM", "BIOL"],
  "Arts": ["ARTS", "ENGL", "HIST", "PHIL", "ECON"],
  "Environment": ["ENV", "GEOG", "PLAN"],
  "Health": ["HLTH", "KIN", "REC"]
};

// Add type for query conditions
type QueryCondition = QueryFieldFilterConstraint;

// Shuffle function
function shuffleArray(array: string[]): string[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Debounce hook for search optimization
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const BrowsePage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [liked, setLiked] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notFound, setNotFound] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [allStudyGuides, setAllStudyGuides] = useState<StudyGuide[]>([]);
  const [recommendedGuides, setRecommendedGuides] = useState<StudyGuide[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'studyGuides' | 'profiles'>("studyGuides");
  const [profileResults, setProfileResults] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Fetch all study guides from Firestore on mount
  useEffect(() => {
    const fetchAllStudyGuides = async () => {
      const guidesSnapshot = await getDocs(collection(db, "studyGuides"));
      const guides: StudyGuide[] = guidesSnapshot.docs.map(doc => {
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
      });
      setAllStudyGuides(guides);
    };
    fetchAllStudyGuides();
  }, []);

  // Update like counts and user likes for all study guides
  useEffect(() => {
    const fetchLikes = async () => {
      const counts = {};
      for (const guide of allStudyGuides) {
        counts[guide.courseCode] = await getLikeCount(guide.courseCode);
      }
      setLikeCounts(counts);
      if (currentUser) {
        const userLikes = await getUserLikes(currentUser.uid);
        const likedMap = {};
        for (const guide of allStudyGuides) {
          likedMap[guide.id] = userLikes.includes(guide.courseCode);
        }
        setLiked(likedMap);
      }
    };
    if (allStudyGuides.length > 0) fetchLikes();
  }, [currentUser, allStudyGuides]);

  // Fetch recommended guides (or all guides if not logged in)
  useEffect(() => {
    const fetchRecommended = async () => {
      setLoadingRecs(true);
      if (!currentUser) {
        setRecommendedGuides(allStudyGuides);
        setLoadingRecs(false);
        return;
      }
      const userDoc = await getDoc(doc(db, "students", currentUser.uid));
      if (!userDoc.exists()) {
        setRecommendedGuides(allStudyGuides);
        setLoadingRecs(false);
        return;
      }
      const userData = userDoc.data();
      const courseCodes = userData.courseCodes || [];
      const faculty = userData.faculty || "";
      let guides: StudyGuide[] = [];
      let fetched = false;
      if (courseCodes.length > 0) {
        guides = allStudyGuides.filter(g => courseCodes.includes(g.courseCode));
        fetched = true;
      }
      // Optionally, add faculty-based filtering here if needed
      if (!fetched || guides.length === 0) {
        setRecommendedGuides(allStudyGuides);
      } else {
        setRecommendedGuides(guides);
      }
      setLoadingRecs(false);
    };
    if (allStudyGuides.length > 0) fetchRecommended();
  }, [currentUser, allStudyGuides]);

  // Profile search logic
  useEffect(() => {
    const fetchProfiles = async () => {
      if (selectedFilter !== 'profiles' || !search.trim()) {
        setProfileResults([]);
        setLoadingProfiles(false);
        return;
      }
      setLoadingProfiles(true);
      const q = query(collection(db, 'students'), where('username', '>=', search), where('username', '<=', search + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const users: any[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setProfileResults(users);
      setLoadingProfiles(false);
    };
    fetchProfiles();
  }, [search, selectedFilter]);

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
    
    // Fire and forget - don't await
    toggleLike(courseCode, currentUser.uid, alreadyLiked).catch(err => {
      console.error('Like error:', err);
      // Rollback UI state on error
      setLiked(prev => ({ ...prev, [id]: alreadyLiked }));
      setLikeCounts(prev => ({
        ...prev,
        [courseCode]: (prev[courseCode] || 0) + (alreadyLiked ? 1 : -1),
      }));
    });
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

  // Use debounced search for filtering
  const filteredGuides = useMemo(() => {
    if (!debouncedSearch.trim()) return recommendedGuides;
    
    const searchLower = debouncedSearch.toLowerCase();
    return recommendedGuides.filter(guide => 
      guide.courseCode.toLowerCase().includes(searchLower) ||
      guide.title.toLowerCase().includes(searchLower) ||
      guide.description.toLowerCase().includes(searchLower)
    );
  }, [recommendedGuides, debouncedSearch]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      const query = search.trim().toLowerCase();
      const match = allStudyGuides.find(
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

  const handleSuggestionClick = (guide) => {
    setNotFound("");
    setShowSuggestions(false);
    navigate(`/guide/${guide.courseCode}/notes`, { state: { from: location.pathname } });
  };

  // Precompute a random image for each card, only changes on refresh or guide count change
  const uniqueImages = useMemo(() => {
    const count = recommendedGuides.length;
    let images: string[] = [];
    if (placeholderImages.length >= count) {
      images = shuffleArray(placeholderImages).slice(0, count);
    } else {
      // Not enough images, so repeat after shuffling
      const times = Math.ceil(count / placeholderImages.length);
      images = Array(times).fill(null).flatMap(() => shuffleArray(placeholderImages)).slice(0, count);
    }
    return images;
  }, [recommendedGuides.length, placeholderImages.length]);

  const guideImageMap = useMemo(() => {
    const count = recommendedGuides.length;
    let images: string[] = [];
    if (placeholderImages.length >= count) {
      images = shuffleArray(placeholderImages).slice(0, count);
    } else {
      const times = Math.ceil(count / placeholderImages.length);
      images = Array(times).fill(null).flatMap(() => shuffleArray(placeholderImages)).slice(0, count);
    }
    // Map guide.id to image
    const map: Record<string, string> = {};
    recommendedGuides.forEach((guide, idx) => {
      map[guide.id] = images[idx];
    });
    return map;
  }, [recommendedGuides, placeholderImages.length]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="min-h-screen bg-sour-lavender py-8 px-4"
    >
      {/* Search Section */}
      <div className="w-full flex flex-col items-center mt-8 mb-10">
        {/* Filter Pills - move above search bar and suggestions */}
        {search.trim().length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              className={`px-5 py-2 rounded-full font-semibold shadow transition-all duration-150 ${selectedFilter === 'studyGuides' ? 'bg-[#b266ff] text-white' : 'bg-white text-[#5E2A84] border border-[#b266ff]'}`}
              onClick={() => setSelectedFilter('studyGuides')}
            >
              Study Guides
            </button>
            <button
              className={`px-5 py-2 rounded-full font-semibold shadow transition-all duration-150 ${selectedFilter === 'profiles' ? 'bg-[#b266ff] text-white' : 'bg-white text-[#5E2A84] border border-[#b266ff]'}`}
              onClick={() => setSelectedFilter('profiles')}
            >
              Profiles
            </button>
          </div>
        )}
        <div className="relative w-full max-w-lg mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 text-2xl">
            <FiSearch />
          </span>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-lg bg-white/90 border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300 text-lg font-medium placeholder-gray-400 transition"
            placeholder="Search for courses, profiles..."
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
          {/* Study Guide Suggestions Dropdown */}
          {showSuggestions && debouncedSearch.trim().length > 0 && selectedFilter === 'studyGuides' && filteredGuides.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto border border-pink-100">
              {filteredGuides.map(guide => (
                <div
                  key={guide.id}
                  className="px-4 py-3 cursor-pointer hover:bg-[#f3e8ff] transition flex items-center gap-3"
                  onMouseDown={() => handleSuggestionClick(guide)}
                >
                  <img
                    src={guideImageMap[guide.id]}
                    alt={guide.title}
                    className="w-10 h-10 rounded-lg object-cover border border-[#e3b8f9]"
                  />
                  <div>
                    <div className="font-bold text-[#5E2A84] text-base">{guide.courseCode}</div>
                    <div className="text-gray-500 text-sm">{guide.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Profile Suggestions Dropdown */}
          {showSuggestions && search.trim().length > 0 && selectedFilter === 'profiles' && profileResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto border border-pink-100">
              {profileResults.map(user => (
                <div
                  key={user.id}
                  className="px-4 py-3 cursor-pointer hover:bg-[#f3e8ff] transition flex items-center gap-3"
                  onMouseDown={() => navigate(`/u/${user.username}`, { state: { from: location.pathname } })}
                >
                  <img
                    src={user.profileImageUrl || 'https://i.imgur.com/6VBx3io.png'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border border-[#e3b8f9]"
                  />
                  <div>
                    <div className="font-bold text-[#5E2A84] text-base">{user.username}</div>
                    <div className="text-gray-500 text-sm">View Profile</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Results Section */}
      {search.trim().length > 0 && selectedFilter === 'profiles' ? (
        <div className="w-full max-w-4xl mx-auto mt-8">
          {loadingProfiles ? (
            <div className="text-lg text-[#5E2A84]">Loading...</div>
          ) : profileResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {profileResults.map(user => (
                <div
                  key={user.id}
                  className="bg-black rounded-lg shadow-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-[#18181b] transition border border-[#222] h-auto min-h-0"
                  style={{ minWidth: 0, maxWidth: 340 }}
                  onClick={() => navigate(`/u/${user.username}`)}
                >
                  <img
                    src={user.profileImageUrl || 'https://i.imgur.com/6VBx3io.png'}
                    alt={user.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#b266ff]"
                  />
                  <div className="flex flex-col justify-center">
                    <div className="font-bold text-base text-white leading-tight">{user.username}</div>
                    <div className="text-gray-400 text-sm">View Profile</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 mt-8">No users found.</div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-inknut mb-6 text-center md:text-left"
              style={{ fontFamily: 'Inknut Antiqua, serif', color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}>
            {recommendedGuides === allStudyGuides ? "Popular Study Guides" : "Recommended for You"}
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
              {recommendedGuides.map((guide, idx) => (
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
                      src={guideImageMap[guide.id]}
                      alt={guide.title}
                      className="rounded-xl object-cover w-full h-full"
                    />
                    {/* Like button positioned at top left of image */}
                    <motion.button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleLikeClick(guide.id, guide.courseCode); }}
                      className="absolute top-2 left-2 flex items-center justify-center"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: liked[guide.id] ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: liked[guide.id] ? '0 4px 12px rgba(255, 107, 107, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <motion.svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={liked[guide.id] ? "#ffffff" : "none"}
                        stroke={liked[guide.id] ? "#ffffff" : "#666666"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={liked[guide.id] ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </motion.svg>
                    </motion.button>
                  </div>
                  <div 
                    className="w-full flex flex-col items-start"
                    style={{ transform: 'translateZ(10px)' }}
                  >
                    <div className="font-bold text-lg text-gray-800 font-inknut mb-1" style={{ fontFamily: 'Inknut Antiqua, serif' }}>{formatCourseCode(guide.courseCode)}</div>
                    <div className="text-sm text-gray-500 mb-3">{guide.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.main>
  );
};

export default BrowsePage;