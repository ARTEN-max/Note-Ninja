import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';

const UploadPage = () => {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [reason, setReason] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseCode || !courseName) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Fetch requester name from Firestore (students collection)
      let requesterName = 'Anonymous';
      let requesterId = '';
      if (currentUser && currentUser.uid) {
        requesterId = currentUser.uid;
        const userDoc = await getDoc(doc(db, 'students', currentUser.uid));
        if (userDoc.exists()) {
          requesterName = userDoc.data().name || 'Anonymous';
        }
      }

      // Add request to Firestore
      await addDoc(collection(db, 'courseRequests'), {
        courseCode,
        courseName,
        reason,
        requesterId,
        requesterName,
        requestDate: serverTimestamp(),
      });

      setSuccess('Course request submitted successfully!');
      setCourseCode('');
      setCourseName('');
      setReason('');

      // Redirect to the browse page after 2 seconds
      setTimeout(() => {
        navigate('/browse');
      }, 2000);

    } catch (err) {
      setError('Failed to submit course request. Please try again.');
      console.error('Request error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="min-h-screen bg-sour-lavender py-8 px-4 flex items-center justify-center"
    >
      <div className="max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold font-inknut text-center mb-6"
              style={{ color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff', fontFamily: 'Inknut Antiqua, serif' }}>
            Request a Course
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Code */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                placeholder="e.g., CS246"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                disabled={uploading}
                required
              />
            </div>

            {/* Course Name */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Algorithms and Data Structures"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                disabled={uploading}
                required
              />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                Why do you want this course? (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know why this course is important to you..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors resize-none h-32"
                disabled={uploading}
              />
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white font-bold text-lg shadow-md hover:from-[#a259e6] hover:to-[#7e44a3] transition-colors disabled:opacity-60"
              disabled={uploading}
            >
              {uploading ? 'Submitting...' : 'Request'}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UploadPage; 