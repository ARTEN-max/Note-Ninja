import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ChapterCard from "../components/ChapterCard";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const StudyGuideChapters = () => {
  const { studyGuideId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [studyGuide, setStudyGuide] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudyGuideAndChapters = async () => {
      if (!currentUser) return;

      try {
        // Fetch study guide details
        const studyGuideRef = collection(db, "studyGuides");
        const q = query(
          studyGuideRef,
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        
        // Find the study guide with matching ID
        const guideData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .find(guide => guide.id === studyGuideId);
        
        if (guideData) {
          setStudyGuide(guideData);

          // Fetch chapters for this study guide
          const chaptersRef = collection(db, "chapters");
          const chaptersQuery = query(
            chaptersRef,
            where("studyGuideId", "==", studyGuideId)
          );
          const chaptersSnapshot = await getDocs(chaptersQuery);
          
          const chaptersData = chaptersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => a.chapterNumber - b.chapterNumber);
          
          setChapters(chaptersData);
        }
      } catch (error) {
        console.error("Error fetching study guide and chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyGuideAndChapters();
  }, [currentUser, studyGuideId]);

  const handleChapterClick = (chapterId) => {
    navigate(`/study-guide/${studyGuideId}/chapter/${chapterId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#880E4F]"></div>
      </div>
    );
  }

  if (!studyGuide) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Study Guide Not Found</h2>
          <p className="mt-2 text-gray-600">The study guide you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-6 py-2 bg-[#880E4F] text-white rounded-full hover:bg-[#6B0D3D] transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{studyGuide.title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{studyGuide.description}</p>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {chapters.map((chapter) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChapterCard
                chapterNumber={chapter.chapterNumber}
                title={chapter.title}
                description={chapter.description}
                imageUrl={chapter.imageUrl || "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"}
                onClick={() => handleChapterClick(chapter.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {chapters.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chapters Yet</h3>
            <p className="text-gray-600 mb-6">Start by adding chapters to your study guide.</p>
            <button
              onClick={() => navigate(`/study-guide/${studyGuideId}/add-chapter`)}
              className="px-6 py-2 bg-[#880E4F] text-white rounded-full hover:bg-[#6B0D3D] transition-colors"
            >
              Add First Chapter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGuideChapters; 