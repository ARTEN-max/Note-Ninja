import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import BackToPrevious from '../components/BackToPrevious';

const StudyCard = ({ title, content, imageUrl }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => setIsFlipped(!isFlipped)}
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
            <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
            {imageUrl && (
              <div className="flex-1 relative">
                <img
                  src={imageUrl}
                  alt={title}
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
            <div className="text-gray-600 whitespace-pre-wrap">{content}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ChapterStudyCards = () => {
  const { studyGuideId, chapterId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [chapter, setChapter] = useState(null);
  const [studyCards, setStudyCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterAndStudyCards = async () => {
      if (!currentUser) return;

      try {
        // Fetch chapter details
        const chapterRef = collection(db, "chapters");
        const q = query(
          chapterRef,
          where("studyGuideId", "==", studyGuideId),
          where("id", "==", chapterId)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const chapterData = querySnapshot.docs[0].data();
          setChapter(chapterData);

          // Fetch study cards for this chapter
          const studyCardsRef = collection(db, "studyCards");
          const studyCardsQuery = query(
            studyCardsRef,
            where("chapterId", "==", chapterId)
          );
          const studyCardsSnapshot = await getDocs(studyCardsQuery);
          
          const cardsData = studyCardsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => a.order - b.order);
          
          setStudyCards(cardsData);
        }
      } catch (error) {
        console.error("Error fetching chapter and study cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterAndStudyCards();
  }, [currentUser, studyGuideId, chapterId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#880E4F]"></div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Chapter Not Found</h2>
          <p className="mt-2 text-gray-600">The chapter you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(`/study-guide/${studyGuideId}`)}
            className="mt-4 px-6 py-2 bg-[#880E4F] text-white rounded-full hover:bg-[#6B0D3D] transition-colors"
          >
            Return to Study Guide
          </button>
        </div>
      </div>
    );
  }

  const placeholders = [
    '/placeholders/car.jpg',
    '/placeholders/city.jpg',
    '/placeholders/cool.jpg',
    '/placeholders/dog.jpg',
    '/placeholders/math138.jpg',
    '/placeholders/strawberry.jpg'
  ];

  return (
    <>
      <BackToPrevious />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chapter {chapter.chapterNumber}: {chapter.title}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{chapter.description}</p>
          </div>

          {/* Study Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {studyCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <StudyCard
                  title={card.title}
                  content={card.content}
                  imageUrl={card.imageUrl || placeholders[index % placeholders.length]}
                />
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {studyCards.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Study Cards Yet</h3>
              <p className="text-gray-600 mb-6">Start by adding study cards to this chapter.</p>
              <button
                onClick={() => navigate(`/study-guide/${studyGuideId}/chapter/${chapterId}/add-card`)}
                className="px-6 py-2 bg-[#880E4F] text-white rounded-full hover:bg-[#6B0D3D] transition-colors"
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

export default ChapterStudyCards; 