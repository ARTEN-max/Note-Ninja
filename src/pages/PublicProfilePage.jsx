import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProfilePage.css';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, collectionGroup } from 'firebase/firestore';
import { 
  FiUser, FiBook, FiClock, FiHeart, FiBookmark, FiUpload, FiDownload,
  FiShare2, FiCopy, FiPlus, FiArrowRight, FiEye, FiFileText, FiCalendar
} from 'react-icons/fi';
import { formatCourseCode } from '../utils/courseUtils';

// Simple function to format time ago
const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
};

const PublicProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userNotes, setUserNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');
  const [showCopied, setShowCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        setError('Username not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Try to find user by username (try both lowercase and original case)
        const usersRef = collection(db, 'students');
        let querySnapshot = await getDocs(query(usersRef, where('username', '==', username.toLowerCase())));
        
        // If not found, try with original case
        if (querySnapshot.empty) {
          querySnapshot = await getDocs(query(usersRef, where('username', '==', username)));
        }

        if (querySnapshot.empty) {
          setError('User not found');
          setLoading(false);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        setUserData(data);

        // Check if this is the current user's profile
        setIsOwnProfile(currentUser && currentUser.uid === userDoc.id);

        // Fetch all notes in parallel
        const fetchPromises = [
          // 1. Regular notes
          getDocs(query(collection(db, 'notes'), where('uploaderId', '==', userDoc.id)))
            .then(snapshot => snapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              source: 'notes',
              type: 'Study Material'
            })))
            .catch(err => {
              console.warn('Error fetching notes:', err);
              return [];
            }),

          // 2. Album notes
          getDocs(query(collection(db, 'albumNotes'), where('uploaderId', '==', userDoc.id)))
            .then(snapshot => snapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              source: 'albumNotes',
              type: 'Album Note'
            })))
            .catch(err => {
              console.warn('Error fetching album notes:', err);
              return [];
            }),

          // 3. Audio notes
          getDocs(query(collection(db, 'audioNotes'), where('uploaderId', '==', userDoc.id)))
            .then(snapshot => snapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              source: 'audioNotes',
              type: 'Audio Note'
            })))
            .catch(err => {
              console.warn('Error fetching audio notes:', err);
              return [];
            }),

          // 4. Study guide notes - using a more efficient query
          getDocs(query(
            collection(db, `studyGuides/default/chapters/1/notes`), 
            where('uploader', '==', data.email)
          )).then(snapshot => snapshot.docs.map(doc => {
            const pathSegments = doc.ref.path.split('/');
            return {
              id: doc.id,
              ...doc.data(),
              source: 'chapterNotes',
              type: 'Chapter Note',
              guideId: pathSegments[1],
              chapterNumber: pathSegments[3]
            };
          }))
          .catch(err => {
            console.warn('Error fetching study guide notes:', err);
            return [];
          }),

          // 5. Saved notes - using a compound query
          getDocs(query(
            collection(db, 'savedNotes'),
            where('userId', 'in', [data.uid, userDoc.id])
          )).then(snapshot => snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            source: 'savedNotes',
            type: 'Saved Note'
          })))
          .catch(err => {
            console.warn('Error fetching saved notes:', err);
            return [];
          })
        ];

        // Wait for all queries to complete
        const results = await Promise.all(fetchPromises);
        
        // Combine all notes and filter out empty arrays
        const allNotes = results.flat().filter(Boolean);
        
        // Remove duplicates based on id
        const uniqueNotes = Array.from(
          new Map(allNotes.map(note => [note.id, note])).values()
        );

        setUserNotes(uniqueNotes);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username, currentUser]);

  const handleNoteClick = (note) => {
    // Handle different note types
    if (note.source === 'chapterNotes') {
      // Navigate to the specific chapter notes page
      navigate(`/guide/${note.guideId}/chapter/${note.chapterNumber}/notes`);
    } else if (note.source === 'savedNotes') {
      // For saved notes, try to open the original file
      if (note.fileUrl || note.pdfUrl) {
        window.open(note.fileUrl || note.pdfUrl, '_blank');
      } else {
        // If no direct file URL, try to navigate to the original note location
        if (note.guideId && note.chapterNumber) {
          navigate(`/guide/${note.guideId}/chapter/${note.chapterNumber}/notes`);
        } else {
          navigate('/browse');
        }
      }
    } else if (note.fileUrl || note.pdfUrl) {
      // Open PDF file in new tab
      window.open(note.fileUrl || note.pdfUrl, '_blank');
    } else if (note.audioUrl) {
      // For audio notes, we could open a modal or navigate to audio player
      window.open(note.audioUrl, '_blank');
    } else {
      // Default fallback - navigate to browse page
      navigate('/browse');
    }
  };

  const handleCopyURL = () => {
    const url = `noteninja.com/u/${username}`;
    navigator.clipboard.writeText(url);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `noteninja.com/u/${username}`;
    try {
      await navigator.share({
        title: `${userData?.displayName || username}'s Note Ninja Profile`,
        text: 'Check out my notes on Note Ninja!',
        url: url
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sour-lavender flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5E2A84]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sour-lavender p-8 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-[#5E2A84] mb-4">😕 Oops!</div>
        <div className="text-[#5E2A84]">{error}</div>
      </div>
    );
  }

  const savedNotes = userNotes.filter(note => note.source === 'savedNotes');
  const uploadedNotes = userNotes.filter(note => note.source !== 'savedNotes');
  const lastActive = userData?.lastActive ? new Date(userData.lastActive) : new Date();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-sour-lavender py-8 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 sm:p-8 mb-8 shadow-xl profile-header">
          {/* Floating Particles */}
          <div className="floating-particle"></div>
          <div className="floating-particle"></div>
          <div className="floating-particle"></div>
          <div className="floating-particle"></div>
          <div className="floating-particle"></div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Picture */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-4 ring-[#e3b8f9] ring-opacity-50 shadow-lg">
                {userData?.profileImageUrl ? (
                  <img
                    src={userData.profileImageUrl}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#e3b8f9] to-[#5E2A84] flex items-center justify-center">
                    <FiUser className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <motion.div
                className="absolute inset-0 rounded-full profile-glow"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(227, 184, 249, 0.3)',
                    '0 0 30px rgba(227, 184, 249, 0.5)',
                    '0 0 20px rgba(227, 184, 249, 0.3)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
                <div>
                  <h1 className="username-text mb-2">@{username}</h1>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#e3b8f9]/20 text-[#5E2A84] font-medium">
                    <FiUser className="w-4 h-4" />
                    <span className="text-sm">
                      {userData?.faculty || 'Faculty not specified'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <motion.button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={handleCopyURL}
                    className="p-2 hover:bg-[#e3b8f9]/10 rounded-full transition-colors relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiCopy className="w-5 h-5 text-[#5E2A84]" />
                    {showTooltip && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-[#5E2A84] text-white px-2 py-1 rounded whitespace-nowrap">
                        Copy Profile Link
                      </div>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleShare}
                    className="p-2 hover:bg-[#e3b8f9]/10 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiShare2 className="w-5 h-5 text-[#5E2A84]" />
                  </motion.button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap justify-start gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <FiUpload className="w-4 h-4 text-[#5E2A84]" />
                  <span className="text-sm text-[#5E2A84]">
                    <strong>{uploadedNotes.length}</strong> Uploaded
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiDownload className="w-4 h-4 text-[#5E2A84]" />
                  <span className="text-sm text-[#5E2A84]">
                    <strong>{savedNotes.length}</strong> Saved
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-[#5E2A84]" />
                  <span className="text-sm text-[#5E2A84]">
                    Last active {formatTimeAgo(lastActive)}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#e3b8f9]/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-4 sm:p-6 shadow-xl w-full max-w-[1200px] mx-auto">
          {/* Tabs */}
          <div className="tabs-container mb-4 overflow-x-auto">
            {/* Active Tab Indicator */}
            <motion.div
              className="tab-indicator"
              initial={false}
              animate={{
                left: activeTab === 'saved' ? '0.5rem' : '50%',
                width: 'calc(50% - 0.75rem)',
              }}
            />
            
            {/* Tab Buttons */}
            <button
              onClick={() => setActiveTab('saved')}
              className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
            >
              <FiBookmark className="w-5 h-5" />
              <span>Saved Notes</span>
              <span className="tab-count">{savedNotes.length}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('uploaded')}
              className={`tab-button ${activeTab === 'uploaded' ? 'active' : ''}`}
            >
              <FiUpload className="w-5 h-5" />
              <span>Uploaded Notes</span>
              <span className="tab-count">{uploadedNotes.length}</span>
            </button>
          </div>

          {/* Notes Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2"
            >
              {(activeTab === 'saved' ? savedNotes : uploadedNotes).length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  {activeTab === 'uploaded' ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-[#e3b8f9]/20 flex items-center justify-center mb-4">
                        <FiUpload className="w-8 h-8 text-[#5E2A84]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#5E2A84] mb-2">No uploaded notes yet</h3>
                      <p className="text-[#5E2A84]/70 mb-6">Ready to share your knowledge?</p>
                      <motion.button
                        onClick={handleUploadClick}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5E2A84] text-white font-semibold hover:bg-[#5E2A84]/90 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiPlus className="w-5 h-5" />
                        Upload Notes
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-[#e3b8f9]/20 flex items-center justify-center mb-4">
                        <FiBookmark className="w-8 h-8 text-[#5E2A84]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#5E2A84] mb-2">No saved notes</h3>
                      <p className="text-[#5E2A84]/70 mb-6">Browse notes to start saving!</p>
                      <motion.button
                        onClick={() => navigate('/browse')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5E2A84] text-white font-semibold hover:bg-[#5E2A84]/90 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Browse Notes
                        <FiArrowRight className="w-5 h-5" />
                      </motion.button>
                    </>
                  )}
                </div>
              ) : (
                (activeTab === 'saved' ? savedNotes : uploadedNotes).map((note) => (
                  <motion.div
                    key={note.id}
                    className={`note-card relative ${note.isFlipped ? 'flipped' : ''} bg-white rounded-2xl shadow-lg overflow-hidden`}
                    onClick={() => {
                      const updatedNotes = userNotes.map(n => 
                        n.id === note.id ? { ...n, isFlipped: !n.isFlipped } : n
                      );
                      setUserNotes(updatedNotes);
                    }}
                  >
                    {/* Front of Card */}
                    <div className="note-card-front p-6 h-full">
                      {/* Course Tag */}
                      <div 
                        className="course-badge absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-[#e3b8f9]/30 to-[#e3b8f9]/10 text-[#5E2A84] px-3 py-1.5 rounded-full text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/browse?course=${note.course || note.courseCode}`);
                        }}
                      >
                        <FiBook className="w-4 h-4" />
                        {formatCourseCode(note.course || note.courseCode)}
                        <div className="tooltip">
                          Browse all {formatCourseCode(note.course || note.courseCode)} notes
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-[#5E2A84] mb-2 pr-24">
                        {note.title}
                      </h3>
                      
                      <p className="text-[#5E2A84]/70 mb-4 line-clamp-2">
                        {note.description || 'No description provided'}
                      </p>

                      {/* Note Footer */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-[#5E2A84]/60">
                          {formatTimeAgo(new Date(note.createdAt || note.savedAt))}
                        </div>
                        <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                          <motion.button
                            className="like-button flex items-center gap-1.5 p-2 hover:bg-[#e3b8f9]/10 rounded-full transition-colors"
                          >
                            <FiHeart 
                              className={`heart-icon w-5 h-5 ${note.isLiked ? 'text-pink-500 fill-pink-500' : 'text-[#5E2A84]'} transition-colors`}
                            />
                            <span className="text-sm text-[#5E2A84]/70">{note.likes || 0}</span>
                          </motion.button>
                          <motion.button
                            className="save-button flex items-center gap-1.5 p-2 hover:bg-[#e3b8f9]/10 rounded-full transition-colors"
                          >
                            <FiBookmark 
                              className={`bookmark-icon w-5 h-5 ${note.isSaved ? 'text-[#5E2A84] fill-[#5E2A84]' : 'text-[#5E2A84]'} transition-colors`}
                            />
                            <span className="text-sm text-[#5E2A84]/70">{note.saves || 0}</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div className="note-card-back">
                      <div className="metadata-item">
                        <FiEye />
                        <span>{note.views || 0} Views</span>
                      </div>
                      <div className="metadata-item">
                        <FiShare2 />
                        <span>{note.shares || 0} Shares</span>
                      </div>
                      <div className="metadata-item">
                        <FiFileText />
                        <span>{note.fileSize || '2.3'} MB</span>
                      </div>
                      <div className="metadata-item">
                        <FiCalendar />
                        <span>Created {formatTimeAgo(new Date(note.createdAt))}</span>
                      </div>
                      <div className="text-sm text-[#5E2A84]/60 mt-4 text-center">
                        Click to flip back
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Copied URL Toast */}
      <AnimatePresence>
        {showCopied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#5E2A84] text-white px-6 py-3 rounded-full shadow-lg"
          >
            Profile URL copied to clipboard! 🎉
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PublicProfilePage;