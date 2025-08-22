import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import BackToPrevious from '../components/BackToPrevious';
import ContentGate from '../components/ContentGate';

const StudyCard = ({ section, isFlipped, onFlip }) => {
  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={onFlip}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="relative w-full h-64 transition-transform duration-500 transform-style-preserve-3d"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full backface-hidden rounded-xl shadow-lg overflow-hidden"
          style={{ background: "linear-gradient(135deg, #f9a8d4 0%, #f472b6 100%)" }}
        >
          <div className="p-6 h-full flex flex-col justify-between">
            <h3 className="text-2xl font-bold text-white mb-4">{section.title}</h3>
            {section.imageUrl && (
              <div className="flex-1 relative">
                <img
                  src={section.imageUrl}
                  alt={section.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            <div className="mt-4 text-white text-sm opacity-80">
              Click to flip
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full backface-hidden rounded-xl shadow-lg bg-white p-6"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="h-full overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h3>
            <div className="text-gray-600 whitespace-pre-wrap">{section.content}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ChapterPage = () => {
  const { guideId, chapterId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [chapter, setChapter] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        // Fetch chapter details
        const chapterDoc = await getDoc(doc(db, "studyGuides", guideId, "chapters", chapterId));
        if (!chapterDoc.exists()) {
          console.error("Chapter not found");
          return;
        }

        const chapterData = { id: chapterDoc.id, ...chapterDoc.data() };
        setChapter(chapterData);

        // Fetch sections
        const sectionsQuery = query(
          collection(db, "studyGuides", guideId, "chapters", chapterId, "sections")
        );
        const sectionsSnapshot = await getDocs(sectionsQuery);
        
        const sectionsData = sectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => a.order - b.order);
        
        setSections(sectionsData);
      } catch (error) {
        console.error("Error fetching chapter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [guideId, chapterId]);

  const handleCardFlip = (sectionId) => {
    setFlippedCards(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sour-lavender flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b266ff]"></div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-sour-lavender flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#5E2A84', fontFamily: "'Inknut Antiqua', serif" }}>Chapter Not Found</h2>
          <p className="mb-6" style={{ color: '#7E44A3' }}>The chapter you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(`/guide/${guideId}`)}
            className="px-6 py-2 bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white rounded-full hover:from-[#a259e6] hover:to-[#7e44a3] transition-colors"
          >
            Return to Study Guide
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackToPrevious />
      <div className="min-h-screen bg-sour-lavender py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#5E2A84', fontFamily: "'Inknut Antiqua', serif", textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}>
              Chapter {chapter.number}: {chapter.title}
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#7E44A3' }}>{chapter.description}</p>
          </div>

          {/* Study Cards */}
          <ContentGate 
            type="content" 
            threshold={0.35} 
            gateType="guide"
            className="space-y-8"
          >
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <StudyCard
                  section={section}
                  isFlipped={flippedCards[section.id]}
                  onFlip={() => handleCardFlip(section.id)}
                />
              </motion.div>
            ))}
          </ContentGate>

          {/* Empty State */}
          {sections.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#5E2A84' }}>No Study Cards Yet</h3>
              <p className="mb-6" style={{ color: '#7E44A3' }}>Start by adding study cards to this chapter.</p>
              <button
                onClick={() => navigate(`/guide/${guideId}/chapter/${chapterId}/add-section`)}
                className="px-6 py-2 bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white rounded-full hover:from-[#a259e6] hover:to-[#7e44a3] transition-colors"
              >
                Add First Study Card
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChapterPage; 