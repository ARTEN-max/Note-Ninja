import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiUser, FiEdit2, FiSave, FiX, FiBook, FiAward, FiCamera, FiMail, FiHome } from 'react-icons/fi';

const UserProfilePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    faculty: '',
    year: ''
  });

  // Available faculties
  const faculties = [
    "Mathematics",
    "Engineering", 
    "Science",
    "Arts",
    "Environment",
    "Health"
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'students', currentUser.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setFormData({
            name: data.name || '',
            username: data.username || '',
            email: data.email || currentUser.email || '',
            faculty: data.faculty || '',
            year: data.year || ''
          });
        } else {
          // Create new user document if it doesn't exist
          const newUserData = {
            name: currentUser.displayName || currentUser.email?.split('@')[0] || '',
            username: '',
            email: currentUser.email || '',
            faculty: '',
            year: '',
            profileImageUrl: '',
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'students', currentUser.uid), newUserData);
          setUserData(newUserData);
          setFormData(newUserData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');

      // Upload image to Firebase Storage
      const imageRef = ref(storage, `profile-images/${currentUser.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user document with new image URL
      await updateDoc(doc(db, 'students', currentUser.uid), {
        profileImageUrl: downloadURL,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setUserData(prev => ({ ...prev, profileImageUrl: downloadURL }));
      setSuccess('Profile picture updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Prepare the data to update in Firebase
      const updateData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        faculty: formData.faculty,
        year: formData.year,
        updatedAt: new Date().toISOString()
      };

      console.log('Updating Firebase with:', updateData);

      // Update the document in Firebase Firestore
      await updateDoc(doc(db, 'students', currentUser.uid), updateData);

      console.log('Firebase update successful');

      // Preserve the profileImageUrl when updating userData
      setUserData(prev => ({
        ...prev,
        ...formData
      }));
      
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile in Firebase:', err);
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sour-lavender flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-sour-lavender py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-4xl font-bold font-inknut" style={{ color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}>
            My Profile
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 shadow-lg border border-white/30"
          >
            <FiHome className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 shadow-lg"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-lg"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
              {/* Profile Picture Section */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-purple-600 mx-auto mb-4 shadow-xl border-4 border-white">
                    {userData?.profileImageUrl ? (
                      <img
                        src={userData.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Camera Icon Overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-110"
                  >
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <FiCamera className="w-5 h-5 text-white" />
                    )}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{userData?.name || 'User'}</h2>
                <p className="text-gray-600 flex items-center justify-center space-x-1 mb-1">
                  <FiMail className="w-4 h-4" />
                  <span>{formData.email}</span>
                </p>
                {userData?.username && (
                  <p className="text-sm text-gray-500 font-medium">@{userData.username}</p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                  <FiAward className="w-6 h-6 text-pink-500" />
                  <div>
                    <p className="text-sm text-gray-500">Faculty</p>
                    <p className="font-semibold text-gray-800">{userData?.faculty || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <FiBook className="w-6 h-6 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Year of Study</p>
                    <p className="font-semibold text-gray-800">{userData?.year || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Public Profile URL */}
              {userData?.username && (
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">Your Public Profile URL</p>
                  <p className="text-sm font-mono text-gray-700 break-all">
                    noteninja.com/u/{userData.username}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`noteninja.com/u/${userData.username}`);
                      setSuccess('Profile URL copied to clipboard!');
                      setTimeout(() => setSuccess(''), 3000);
                    }}
                    className="mt-2 text-xs text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Copy URL
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Edit Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <FiEdit2 className="w-6 h-6 text-pink-500" />
                <span>Edit Profile</span>
              </h3>
              
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your username"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Faculty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Faculty
                  </label>
                  <select
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map(faculty => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your year"
                  />
                </div>

                {/* Save Button */}
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-60 flex items-center justify-center space-x-2 shadow-lg font-semibold text-lg"
                >
                  <FiSave className="w-5 h-5" />
                  <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfilePage; 