import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCourseCode } from "../utils/courseUtils";
import placeholderImages from '../utils/placeholders';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import OptimizedImage from './OptimizedImage';
import ContentGate from './ContentGate';
import { useAuth } from '../contexts/AuthContext';

const StudyGuideCard = ({
  courseCode,
  title,
  description,
  imageUrl,
  onClick,
  liked = false,
  onLike = () => {},
  likeCount,
  minimal = false,
  onAddToMyNotes,
  addNoteStatus,
  pdfUrl,
  showDelete = false,
  onDelete = () => {},
  showAddToNotes = false, // NEW PROP
  ...props
}) => {
  const { currentUser } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  // Pick a random placeholder for fallback
  const fallbackPlaceholder = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

  // Handle card click - download PDF if available, otherwise use original onClick
  const handleCardClick = (e) => {
    if (pdfUrl) {
      e.preventDefault();
      // Create a temporary link to download the PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${courseCode}_study_guide.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
        minimal ? 'w-full' : 'w-full'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ 
        maxWidth: minimal ? 'none' : '400px',
        minHeight: minimal ? 'auto' : '300px'
      }}
      title={pdfUrl ? `Click to download ${courseCode} study guide` : undefined}
    >
      <div className="relative" style={{ width: '100%', height: '14.5rem' }}>
        <OptimizedImage
          src={imgError ? fallbackPlaceholder : imageUrl}
          alt={`${courseCode} study guide`}
          className="object-cover w-full"
          width={384}
          height={216}
          fallbackSrc={fallbackPlaceholder}
          priority={false}
          style={{
            width: '100%',
            height: '14.5rem',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            display: 'block',
            objectFit: 'cover', // ensures cropping/filling
          }}
          onError={() => setImgError(true)}
        />
        {/* Like button - only show for authenticated users */}
        {!minimal && onLike && currentUser && (
          <div className="absolute top-2 left-2">
            <motion.button
              type="button"
              onClick={e => { e.stopPropagation(); onLike(); }}
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: liked ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: liked ? '0 4px 12px rgba(255, 107, 107, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={liked ? "#ffffff" : "none"}
                stroke={liked ? "#ffffff" : "#666666"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={liked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </motion.svg>
            </motion.button>
          </div>
        )}
        {/* Animated Play Button (not in minimal mode) */}
        {!minimal && (
          <AnimatePresence>
            {hovered && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="absolute bottom-4 right-4 flex items-center justify-center z-20 outline-none p-0"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #b266ff 0%, #8a2be2 100%)',
                  boxShadow: '0 0 0 8px #e3b8f9, 0 4px 16px #b266ff44',
                  transition: 'all 0.3s ease-in-out',
                  border: 'none',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 0 12px #e3b8f9, 0 4px 16px #b266ff66'
                }}
                whileTap={{ scale: 0.97 }}
                onClick={e => { e.stopPropagation(); onClick(); }}
                tabIndex={-1}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="none" />
                  <polygon points="16,11 30,20 16,29" fill="#FFFFFF" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
      <div
        className="flex flex-col items-center mt-0 px-0 w-full"
        style={{
          background: 'linear-gradient(to bottom, rgba(245,243,255,0.97), rgba(255,255,255,1))',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          padding: '12px 0 12px 0',
          width: '100%'
        }}
      >
        <div className="font-bold text-lg text-black text-center" style={{ fontFamily: "'Inknut Antiqua', serif" }}>{formatCourseCode(courseCode)}</div>
        <div className="text-sm text-gray-600 text-center mt-1 mb-3">{description}</div>
        {pdfUrl ? (
          <>
            {showDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(); }}
                className="w-full py-2 mt-2 rounded-lg font-bold text-sm transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center justify-center gap-2"
              >
                <FiTrash2 className="mr-1" /> Delete
              </button>
            )}
          </>
        ) : (
          showAddToNotes && (
            <ContentGate type="feature" gateType="feature">
              <button
                onClick={e => { e.stopPropagation(); onAddToMyNotes(); }}
                className={`w-full py-2 mt-2 rounded-lg font-bold text-sm transition-colors ${
                  addNoteStatus === 'added'
                    ? "bg-green-200 text-green-800 cursor-not-allowed"
                    : addNoteStatus === 'adding'
                    ? "bg-yellow-200 text-yellow-800 cursor-wait"
                    : "bg-[#e3b8f9] text-[#5E2A84] hover:bg-[#d8b0f2]"
                }`}
                disabled={addNoteStatus === 'added' || addNoteStatus === 'adding'}
              >
                {addNoteStatus === 'added' ? "Added to My Notes" : 
                  addNoteStatus === 'adding' ? "Adding..." : "Add to My Notes"}
              </button>
            </ContentGate>
          )
        )}
      </div>
    </motion.div>
  );
};

export default StudyGuideCard;
