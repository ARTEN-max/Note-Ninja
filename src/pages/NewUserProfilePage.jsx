import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, getDocs, setDoc } from 'firebase/firestore';
import './NewUserProfilePage.css';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import studyGuides from '../data/studyGuides';
import { FiEdit2 } from 'react-icons/fi';
import { FiPlay } from 'react-icons/fi';
import OptimizedImage from '../components/OptimizedImage';

const topCourses = [
  { name: 'Advanced Calculus', thumbnail: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=200&q=80' },
  { name: 'Quantum Physics', thumbnail: 'https://images.unsplash.com/photo-1581092921447-4a11c8734568?auto=format&fit=crop&w=200&q=80' },
  { name: 'Organic Chemistry', thumbnail: 'https://images.unsplash.com/photo-1627807033482-d8527a4e613c?auto=format&fit=crop&w=200&q=80' },
  { name: 'History of Art', thumbnail: 'https://images.unsplash.com/photo-1547891654-e66ed711b934?auto=format&fit=crop&w=200&q=80' },
  { name: 'Chill Study Nights', description: 'Relaxing beats for late-night study sessions.', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80' },
];

const coursePlaceholders = [
  'https://images.unsplash.com/photo-1524995767968-97212abf4625?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1503676260728-f68a1a41a682?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1491841550275-5b462bf485cc?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=200&q=80'
];

const publicPlaylists = [
  { name: 'Math Boost', description: 'Concentration mix for complex problem solving.', thumbnail: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=400&q=80' },
  { name: 'Chill Study Nights', description: 'Relaxing beats for late-night study sessions.', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80' },
];

const NewUserProfilePage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topCourses, setTopCourses] = useState([]);
  const [courseCount, setCourseCount] = useState(0);
  const [error, setError] = useState("");
  const [myUsername, setMyUsername] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistAudios, setPlaylistAudios] = useState({});

  // Fetch current user's username from Firestore
  useEffect(() => {
    if (currentUser) {
      getDoc(doc(db, 'students', currentUser.uid)).then(docSnap => {
        if (docSnap.exists()) {
          setMyUsername((docSnap.data().username || '').toLowerCase());
        }
      });
    }
  }, [currentUser]);

  // Set isOwnProfile based on username param and myUsername
  useEffect(() => {
    if (!username && currentUser) {
      setIsOwnProfile(true);
    } else if (username && myUsername) {
      setIsOwnProfile(username.toLowerCase() === myUsername);
    } else {
      setIsOwnProfile(false);
    }
  }, [username, myUsername, currentUser]);

  useEffect(() => {
    const fetchProfileUser = async () => {
      setLoading(true);
      setError("");
      try {
        let userDoc, userData, userUid;
        if (username) {
          // Viewing another user's profile by username
          const usersRef = collection(db, 'students');
          let querySnapshot = await getDocs(query(usersRef, where('username', '==', username.toLowerCase())));
          if (querySnapshot.empty) {
            querySnapshot = await getDocs(query(usersRef, where('username', '==', username)));
          }
          if (querySnapshot.empty) {
            setUser(null);
            setError('User not found');
            setLoading(false);
            return;
          }
          userDoc = querySnapshot.docs[0];
          userData = userDoc.data();
          userUid = userDoc.id;
        } else if (currentUser) {
          // Viewing own profile
          userDoc = await getDoc(doc(db, 'students', currentUser.uid));
          if (userDoc.exists()) {
            userData = userDoc.data();
            userUid = currentUser.uid;
          } else {
            // Create new user doc for self only
            const newUserData = {
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              username: '',
              email: currentUser.email || '',
              faculty: '',
              year: '',
              profileImageUrl: '',
              createdAt: new Date().toISOString(),
              stats: { courses: 0, followers: 12, following: 6 },
            };
            await setDoc(doc(db, 'students', currentUser.uid), newUserData);
            userData = newUserData;
            userUid = currentUser.uid;
          }
        } else {
          setUser(null);
          setError('Not logged in.');
          setLoading(false);
          return;
        }
        setUser({
          name: userData.name ? userData.name.split(' ')[0] : 'User',
          profileImageUrl: userData.profileImageUrl || '',
          stats: { courses: 0, followers: 12, following: 6 },
          uid: userUid,
          username: userData.username || '',
          faculty: userData.faculty || '',
        });
        setError("");
        if (user && currentUser) {
          setIsOwnProfile(
            (!username && user.uid === currentUser.uid) ||
            (username && user.username && currentUser && user.username.toLowerCase() === currentUser.email?.split('@')[0]?.toLowerCase())
          );
        } else {
          setIsOwnProfile(false);
        }
      } catch (error) {
        setUser(null);
        setError("Error loading user profile: " + (error.message || error));
      }
      setLoading(false);
    };
    fetchProfileUser();
  }, [currentUser, username]);

  useEffect(() => {
    if (!user || !user.uid) return;
    setLoading(true);
    setError("");
    const placeholderPool = [
      "/placeholders/city.jpg",
      "/placeholders/strawberry.jpg",
      "/placeholders/dog.jpg",
      "/placeholders/car.jpg",
      "/placeholders/cool.jpg"
    ];
    const notesQuery = query(collection(db, 'savedNotes'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(notesQuery, (querySnapshot) => {
      try {
        const courses = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          const hasValidThumbnail = typeof data.previewImg === 'string' && data.previewImg.trim().startsWith('http');
          return {
            id: doc.id,
            name: data.title || data.courseCode || 'Unnamed Course',
            thumbnail: hasValidThumbnail ? data.previewImg.trim() : undefined,
          };
        });
        // Filter to only unique course titles
        const uniqueCoursesMap = new Map();
        courses.forEach(course => {
          if (course.name && !uniqueCoursesMap.has(course.name)) {
            uniqueCoursesMap.set(course.name, course);
          }
        });
        const uniqueCourses = Array.from(uniqueCoursesMap.values());
        // Shuffle placeholders and assign unique images
        const shuffled = [...placeholderPool].sort(() => Math.random() - 0.5);
        uniqueCourses.forEach((course, idx) => {
          course.randomPlaceholder = shuffled[idx % shuffled.length];
        });
        setTopCourses(uniqueCourses);
        setCourseCount(courses.length);
        setError("");
      } catch (err) {
        setError("Error loading notes: " + (err.message || err));
      }
      setLoading(false);
    }, (error) => {
      setError("Error fetching saved notes: " + (error.message || error));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch user playlists and their audio notes
  useEffect(() => {
    const fetchPlaylistsAndAudios = async () => {
      if (!user || !user.uid) return;
      // Fetch playlists
      const playlistsRef = collection(db, 'audioPlaylists');
      const q = query(playlistsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const playlists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserPlaylists(playlists);
      // Fetch audio notes for each playlist
      const audiosByPlaylist = {};
      for (const pl of playlists) {
        if (pl.audios && pl.audios.length > 0) {
          const audioNotes = [];
          for (const audioId of pl.audios) {
            try {
              const audioDoc = await getDoc(doc(db, 'audioNotes', audioId));
              if (audioDoc.exists()) {
                audioNotes.push({ id: audioDoc.id, ...audioDoc.data() });
              }
            } catch (err) {
              console.warn('Failed to fetch audio note', audioId, err);
            }
          }
          audiosByPlaylist[pl.id] = audioNotes;
        } else {
          audiosByPlaylist[pl.id] = [];
        }
      }
      setPlaylistAudios(audiosByPlaylist);
    };
    fetchPlaylistsAndAudios();
  }, [user]);

  const handleProfilePicClick = (e) => {
    e.stopPropagation();
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (loading) {
    return (
      <div className="profile-container min-h-screen p-8">
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <h2 className="text-2xl font-bold mb-6">Top Courses this Month</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center animate-pulse">
              <div className="bg-gray-300 rounded-full w-32 h-32 mb-2" />
              <div className="bg-gray-300 rounded w-20 h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container min-h-screen flex items-center justify-center">
        <div>
          <p className="text-gray-400">User not found or could not load profile.</p>
          {error && <div className="text-red-400 mt-2">{error}</div>}
        </div>
      </div>
    );
  }

  // Profile image with user icon placeholder
  const renderProfileImage = () => {
    return (
      <div className={`relative group ${isOwnProfile ? 'cursor-pointer' : ''}`}
           onClick={isOwnProfile ? handleProfilePicClick : undefined}>
        {user.profileImageUrl && user.profileImageUrl.trim() ? (
          <OptimizedImage
            src={user.profileImageUrl}
            alt="Profile"
            className="h-40 w-40 rounded-full object-cover"
            width={160}
            height={160}
            priority={true}
          />
        ) : (
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#d1d5db" />
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#6b7280" />
          </svg>
        )}
        {/* Overlay for own profile */}
        {isOwnProfile && (
          <>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onClick={e => e.stopPropagation()}
              onChange={() => {}}
            />
            <div
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ pointerEvents: 'none' }}
            >
              <span style={{ pointerEvents: 'auto' }}>
                <FiEdit2 size={36} color="#fff" />
              </span>
              <span className="text-white font-semibold mt-2" style={{ pointerEvents: 'auto' }}>Choose photo</span>
            </div>
          </>
        )}
      </div>
    );
  };

  const placeholderPool = [
    "/placeholders/city.jpg",
    "/placeholders/strawberry.jpg",
    "/placeholders/dog.jpg",
    "/placeholders/car.jpg",
    "/placeholders/cool.jpg"
  ];
  const showCourses = topCourses && topCourses.length > 0;

  // Playlist placeholder images
  const playlistPlaceholders = [
    'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1547891654-e66ed711b934?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1581092921447-4a11c8734568?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1627807033482-d8527a4e613c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524995767968-97212abf4625?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1503676260728-f68a1a41a682?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1491841550275-5b462bf485cc?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80'
  ];

  // Helper: hash a string to a number
  function hashStringToIndex(str, max) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash) % max;
  }

  return (
    <>
      <motion.div
        className="profile-container absolute left-0 top-0 min-h-screen w-screen bg-[#181818] overflow-y-auto md:static md:w-full md:bg-[#181818] md:max-w-none md:mx-0 p-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ background: '#181818' }}
      >
        <header className="profile-header flex flex-row items-center gap-8 bg-[#181818]" style={{ background: '#181818' }}>
          <motion.div
            className="h-40 w-40 rounded-full border-4 border-white/20 shadow-lg flex items-center justify-center bg-gray-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          >
            {renderProfileImage()}
          </motion.div>
          <div>
            <h1 className="text-6xl font-extrabold">@{user.username}</h1>
            <div className="flex space-x-6 mt-4 text-lg text-gray-300">
              <span><strong>{topCourses.length}</strong> {topCourses.length === 1 ? 'Course' : 'Courses'}</span>
            </div>
          </div>
        </header>

        <main className="p-8">
          <section>
            <h2 className="text-2xl font-bold mb-6">Top Courses this Month</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {showCourses
                ? topCourses.map((course, index) => {
                    const imgSrc = course.thumbnail && course.thumbnail.trim().startsWith('http')
                      ? course.thumbnail
                      : course.randomPlaceholder;
                    const name = course && course.name ? course.name : 'Untitled';
                    // Normalize for robust matching
                    const normalize = str => (str || '').replace(/\s+/g, '').toUpperCase();
                    const guide = studyGuides.find(
                      g =>
                        normalize(g.title) === normalize(name) ||
                        normalize(g.courseCode) === normalize(name)
                    );
                    const courseCode = guide ? guide.courseCode : null;
                    const finalCourseCode = courseCode || normalize(name);
                    return (
                      <div
                        key={course.id || index}
                        className="text-center cursor-pointer group transition-transform duration-200"
                        onClick={() => {
                          console.log('Course name:', name, 'Matched courseCode:', courseCode, 'Final code:', finalCourseCode);
                          navigate(`/guide/${finalCourseCode}/notes`, { state: { from: location.pathname } });
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <OptimizedImage
                            src={imgSrc}
                            alt={name}
                            className="rounded-full w-32 h-32 object-cover mb-2 border-2 border-gray-700 mx-auto group-hover:scale-105 group-hover:shadow-xl transition-transform duration-200"
                            width={128}
                            height={128}
                            fallbackSrc={course.randomPlaceholder}
                          />
                          <div className="bg-gray-700 rounded-lg w-32 mt-1 mb-1 py-1 px-2 flex items-center justify-center mx-auto group-hover:bg-gray-600 group-hover:scale-105 group-hover:shadow-lg transition-all duration-200">
                            <span className="text-white text-base font-bold truncate w-full text-center">{name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                : placeholderPool.map((src, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <img src={src} alt="Placeholder" className="rounded-full w-32 h-32 object-cover mb-2 border-2 border-gray-700 mx-auto" />
                      <div className="bg-gray-700 rounded-lg w-32 mb-1 py-1 px-2 flex items-center justify-center mx-auto">
                        <span className="text-white text-base font-bold truncate w-full text-center">&nbsp;</span>
                      </div>
                    </div>
                  ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Public Study Playlists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userPlaylists.length === 0 ? (
                <div className="text-gray-400 col-span-full">No playlists yet.</div>
              ) : (
                userPlaylists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    className="playlist-card bg-[#181818] p-4 rounded-lg shadow-lg hover:bg-[#282828] flex flex-col relative group cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={() => navigate(`/playlist/${playlist.id}`, { state: { from: location.pathname } })}
                  >
                    {/* Playlist cover image */}
                    <div className="relative w-full h-40 mb-4">
                                          <OptimizedImage
                      src={playlist.coverImage || `https://picsum.photos/seed/${encodeURIComponent(playlist.id || playlist.name)}/400/200`}
                      alt={playlist.name}
                      className="rounded-md w-full h-40 object-cover"
                      width={400}
                      height={200}
                      fallbackSrc="https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=400&q=80"
                    />
                    </div>
                    <h3 className="font-bold text-lg mb-1 text-white">{playlist.name}</h3>
                    <div className="text-sm text-gray-300 mb-2">By {user.name}</div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </main>
      </motion.div>
    </>
  );
};

export default NewUserProfilePage; 