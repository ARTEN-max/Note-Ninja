import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const StudyGuideCard = ({
  courseCode,
  title,
  description,
  imageUrl,
  onClick,
  liked = false,
  onLike = () => {},
  likeCount,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
      style={{ width: 232, height: 300 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-[232px] h-[232px]">
        <img
          src={imageUrl}
          alt={`${courseCode} study guide`}
          className="rounded-xl object-cover w-full h-full"
        />
        <div className="absolute top-2 left-2 bg-pink-100 text-pink-700 font-bold px-3 py-1 rounded-lg text-sm shadow">{courseCode}</div>
        <div className="absolute top-2 right-2">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onLike(); }}
            className={`px-4 py-1 rounded-2xl font-bold text-base transition-colors ${liked ? 'bg-pink-200 text-pink-700' : 'bg-gray-200 text-black'}`}
          >
            {liked ? 'Liked' : 'Like'}
          </button>
        </div>
        {/* Animated Play Button */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
              className="absolute bottom-4 right-4 flex items-center justify-center z-20 outline-none p-0"
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#880E4F',
                boxShadow: '0 4px 16px 0 rgba(136, 14, 79, 0.18)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                border: 'none',
                cursor: 'pointer',
                touchAction: 'manipulation',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 0 8px rgba(136, 14, 79, 0.4), 0 4px 16px 0 rgba(136, 14, 79, 0.18)' }}
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
      </div>
      <div className="flex flex-col items-center mt-4 px-2">
        <div className="font-bold text-lg text-gray-800 text-center">{title}</div>
        <div className="text-sm text-gray-500 text-center mt-1">{description}</div>
      </div>
    </div>
  );
};

export default StudyGuideCard;
