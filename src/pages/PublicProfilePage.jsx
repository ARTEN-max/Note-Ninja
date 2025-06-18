import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  FiUser, FiBook, FiAward, FiMail, FiHome, FiHeart, 
  FiEye, FiShare2, FiCopy, FiBookmark, FiUpload 
} from 'react-icons/fi';
import { formatCourseCode } from '../utils/courseUtils';

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
        console.log('User data found:', data);
        console.log('Profile image URL:', data.profileImageUrl);
        setUserData(data);

        // Check if this is the current user's profile
        setIsOwnProfile(currentUser && currentUser.uid === userDoc.id);

        // Fetch user's notes from multiple collections
        const allNotes = [];

        // 1. Fetch from notes collection (DownloadNotesPage)
        try {
          const notesRef = collection(db, 'notes');
          const notesQuery = query(notesRef, where('uploaderId', '==', userDoc.id));
          const notesSnapshot = await getDocs(notesQuery);
          notesSnapshot.forEach(doc => {
            allNotes.push({ 
              id: doc.id, 
              ...doc.data(),
              source: 'notes',
              type: 'Study Material'
            });
          });
        } catch (err) {
          console.error('Error fetching from notes collection:', err);
        }

        // 2. Fetch from albumNotes collection
        try {
          const albumNotesRef = collection(db, 'albumNotes');
          const albumNotesQuery = query(albumNotesRef, where('uploaderId', '==', userDoc.id));
          const albumNotesSnapshot = await getDocs(albumNotesQuery);
          albumNotesSnapshot.forEach(doc => {
            allNotes.push({ 
              id: doc.id, 
              ...doc.data(),
              source: 'albumNotes',
              type: 'Album Note'
            });
          });
        } catch (err) {
          console.error('Error fetching from albumNotes collection:', err);
        }

        // 3. Fetch from audioNotes collection
        try {
          const audioNotesRef = collection(db, 'audioNotes');
          const audioNotesQuery = query(audioNotesRef, where('uploaderId', '==', userDoc.id));
          const audioNotesSnapshot = await getDocs(audioNotesQuery);
          audioNotesSnapshot.forEach(doc => {
            allNotes.push({ 
              id: doc.id, 
              ...doc.data(),
              source: 'audioNotes',
              type: 'Audio Note'
            });
          });
        } catch (err) {
          console.error('Error fetching from audioNotes collection:', err);
        }

        // 4. Fetch from studyGuides subcollections (ChapterNotesPage)
        try {
          // Get all study guides
          const studyGuidesRef = collection(db, 'studyGuides');
          const studyGuidesSnapshot = await getDocs(studyGuidesRef);
          
          for (const guideDoc of studyGuidesSnapshot.docs) {
            const guideId = guideDoc.id;
            const chaptersRef = collection(db, `studyGuides/${guideId}/chapters`);
            const chaptersSnapshot = await getDocs(chaptersRef);
            
            for (const chapterDoc of chaptersSnapshot.docs) {
              const chapterNumber = chapterDoc.id;
              const notesRef = collection(db, `studyGuides/${guideId}/chapters/${chapterNumber}/notes`);
              const notesQuery = query(notesRef, where('uploader', '==', data.email));
              const notesSnapshot = await getDocs(notesQuery);
              
              notesSnapshot.forEach(noteDoc => {
                allNotes.push({ 
                  id: noteDoc.id, 
                  ...noteDoc.data(),
                  source: 'chapterNotes',
                  type: 'Chapter Note',
                  guideId,
                  chapterNumber
                });
              });
            }
          }
        } catch (err) {
          console.error('Error fetching from studyGuides subcollections:', err);
        }

        // 5. Fetch saved notes from savedNotes collection
        try {
          const savedNotesRef = collection(db, 'savedNotes');
          console.log('Looking for saved notes for user:', {
            uid: data.uid,
            docId: userDoc.id,
            email: data.email
          });
          
          // Try multiple query strategies to find saved notes
          let savedNotesSnapshot = null;
          
          // Strategy 1: Query by UID
          if (data.uid) {
            const query1 = query(savedNotesRef, where('userId', '==', data.uid));
            savedNotesSnapshot = await getDocs(query1);
            console.log('Saved notes by UID:', savedNotesSnapshot.size);
          }
          
          // Strategy 2: Query by document ID
          if (!savedNotesSnapshot || savedNotesSnapshot.empty) {
            const query2 = query(savedNotesRef, where('userId', '==', userDoc.id));
            savedNotesSnapshot = await getDocs(query2);
            console.log('Saved notes by doc ID:', savedNotesSnapshot.size);
          }
          
          // Strategy 3: Query by email
          if (!savedNotesSnapshot || savedNotesSnapshot.empty) {
            const query3 = query(savedNotesRef, where('userEmail', '==', data.email));
            savedNotesSnapshot = await getDocs(query3);
            console.log('Saved notes by email:', savedNotesSnapshot.size);
          }
          
          // Strategy 4: Query by uid field (alternative field name)
          if (!savedNotesSnapshot || savedNotesSnapshot.empty) {
            const query4 = query(savedNotesRef, where('uid', '==', data.uid || userDoc.id));
            savedNotesSnapshot = await getDocs(query4);
            console.log('Saved notes by uid field:', savedNotesSnapshot.size);
          }
          
          // Strategy 5: Get all saved notes and filter client-side (fallback)
          if (!savedNotesSnapshot || savedNotesSnapshot.empty) {
            console.log('Trying fallback: getting all saved notes...');
            savedNotesSnapshot = await getDocs(savedNotesRef);
            const allSavedNotes = savedNotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('All saved notes in database:', allSavedNotes);
            
            // Filter by email or any matching field
            const filteredNotes = allSavedNotes.filter(note => 
              note.userEmail === data.email || 
              note.userId === data.uid || 
              note.userId === userDoc.id ||
              note.uid === data.uid ||
              note.uid === userDoc.id
            );
            console.log('Filtered saved notes:', filteredNotes);
            
            filteredNotes.forEach(note => {
              allNotes.push({ 
                id: note.id, 
                ...note,
                source: 'savedNotes',
                type: 'Saved Note'
              });
            });
          } else {
            savedNotesSnapshot.forEach(doc => {
              console.log('Found saved note:', doc.data());
              allNotes.push({ 
                id: doc.id, 
                ...doc.data(),
                source: 'savedNotes',
                type: 'Saved Note'
              });
            });
          }
        } catch (err) {
          console.error('Error fetching from savedNotes collection:', err);
        }

        // Sort notes by creation date (newest first)
        allNotes.sort((a, b) => {
          const dateA = a.uploadDate?.toDate?.() || new Date(a.createdAt || a.uploadDate);
          const dateB = b.uploadDate?.toDate?.() || new Date(b.createdAt || b.uploadDate);
          return dateB - dateA;
        });

        setUserNotes(allNotes);

      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile');
      } finally {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 p-8 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-purple-800 mb-4">😕 Oops!</div>
        <div className="text-purple-700">{error}</div>
      </div>
    );
  }

  const savedNotes = userNotes.filter(note => note.source === 'savedNotes');
  const uploadedNotes = userNotes.filter(note => note.source !== 'savedNotes');
  const totalNotes = userNotes.length;
  const completionRate = Math.round((savedNotes.length / (totalNotes || 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-sour-lavender py-8 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Picture */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-purple-400 ring-opacity-50 shadow-lg">
                {userData?.profileImageUrl ? (
                  <img
                    src={userData.profileImageUrl}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <FiUser className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              <motion.div
                className="absolute inset-0 rounded-full"
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
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-purple-900">
                  {userData?.displayName || username}
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyURL}
                    className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                    title="Copy profile URL"
                  >
                    <FiCopy className="text-purple-600" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                    title="Share profile"
                  >
                    <FiShare2 className="text-purple-600" />
                  </button>
                </div>
              </div>
              
              <div className="text-purple-600 mb-4">@{username}</div>
              
              {/* Stats Bar */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <FiBook className="text-[#5E2A84] w-5 h-5" />
                  <div>
                    <div className="text-sm text-[#5E2A84]/70">Faculty</div>
                    <div className="font-semibold text-[#5E2A84]">{userData?.faculty || 'Not Set'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FiBookmark className="text-[#5E2A84] w-5 h-5" />
                  <div>
                    <div className="text-sm text-[#5E2A84]/70">Saved</div>
                    <div className="font-semibold text-[#5E2A84]">{savedNotes.length}</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#e3b8f9]/20 rounded-full h-1">
                <div 
                  className="bg-[#e3b8f9] rounded-full h-full transition-all duration-500"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'saved'
                  ? 'bg-[#e3b8f9] text-[#5E2A84] shadow-lg'
                  : 'bg-purple-100 text-[#5E2A84] hover:bg-purple-200'
              }`}
            >
              <FiBookmark />
              Saved Notes ({savedNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('uploaded')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'uploaded'
                  ? 'bg-[#e3b8f9] text-[#5E2A84] shadow-lg'
                  : 'bg-purple-100 text-[#5E2A84] hover:bg-purple-200'
              }`}
            >
              <FiUpload />
              Uploaded Notes ({uploadedNotes.length})
            </button>
          </div>

          {/* Notes Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {(activeTab === 'saved' ? savedNotes : uploadedNotes).map((note) => (
                <motion.div
                  key={note.id}
                  whileHover={{ y: -5 }}
                  className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Course Tag */}
                  <div className="absolute top-4 right-4 bg-[#e3b8f9] text-[#5E2A84] px-3 py-1 rounded-full text-sm font-medium">
                    {formatCourseCode(note.course || note.courseCode)}
                  </div>

                  <h3 className="text-xl font-semibold text-[#5E2A84] mb-2 pr-20">
                    {note.title}
                  </h3>
                  
                  <p className="text-[#5E2A84] mb-4 line-clamp-2">
                    {note.description || 'No description provided'}
                  </p>

                  {/* Note Footer */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-[#5E2A84]">
                      {new Date(note.createdAt || note.savedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-[#e3b8f9]/10 rounded-full transition-colors"
                      >
                        <FiHeart className="text-[#5E2A84] group-hover:text-[#e3b8f9] transition-colors" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-[#e3b8f9]/10 rounded-full transition-colors"
                      >
                        <FiBookmark className="text-[#5E2A84] group-hover:text-[#e3b8f9] transition-colors" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#e3b8f9] bg-opacity-0 group-hover:bg-opacity-5 rounded-2xl transition-all duration-300" />
                </motion.div>
              ))}
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