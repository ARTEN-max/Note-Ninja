import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('studyGuides');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseCode || !title) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Fetch uploader name from Firestore (students collection)
      let uploaderName = 'Anonymous';
      if (currentUser && currentUser.uid) {
        const userDoc = await getDoc(doc(db, 'students', currentUser.uid));
        if (userDoc.exists()) {
          uploaderName = userDoc.data().name || 'Anonymous';
        }
      }

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `study-materials/${courseCode}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Add document to Firestore
      const docRef = await addDoc(collection(db, 'pendingNotes'), {
        courseCode,
        title,
        description,
        type,
        fileUrl: downloadURL,
        fileName: file.name,
        fileSize: file.size,
        uploaderId: currentUser.uid,
        uploaderName,
        uploadDate: serverTimestamp(),
        likes: 0,
        downloads: 0
      });

      setSuccess('Study material uploaded successfully!');
      setFile(null);
      setCourseCode('');
      setTitle('');
      setDescription('');
      setType('studyGuides');

      // Redirect to the browse page after 2 seconds
      setTimeout(() => {
        navigate('/browse');
      }, 2000);

    } catch (err) {
      setError('Failed to upload study material. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 to-pink-300 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-[#880E4F] mb-6 font-inknut text-center">
            Upload Study Material
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                PDF File <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-pink-200 focus:outline-none focus:border-pink-400 transition-colors cursor-pointer"
                  disabled={uploading}
                />
                {file && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {file.name}
                  </div>
                )}
              </div>
            </div>

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

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Midterm Review Notes"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                disabled={uploading}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your study material..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors resize-none h-32"
                disabled={uploading}
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                Material Type <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                disabled={uploading}
                required
              >
                <option value="studyGuides">Study Guide</option>
                <option value="midtermFinal">Midterm/Final Review</option>
                <option value="quizzes">Quiz Solutions</option>
                <option value="deepDive">Deep Dive</option>
              </select>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-green-50 text-green-600 border border-green-200">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all
                ${uploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#880E4F] hover:scale-105 focus:scale-105 focus:outline-none'
                }`}
              style={{ 
                boxShadow: uploading 
                  ? 'none' 
                  : '0 0 0 8px rgba(136, 14, 79, 0.12), 0 4px 16px 0 rgba(136, 14, 79, 0.18)'
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Study Material'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage; 