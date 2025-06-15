import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ChapterCard = ({
  chapterNumber,
  title,
  description,
  imageUrl,
  onClick,
  ...props
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      {...props}
      className="relative flex flex-col items-center cursor-pointer transition-all duration-300"
      style={{ 
        width: '14.5rem',
        height: '18.75rem',
        borderRadius: '16px',
        boxShadow: hovered
          ? '0 0 20px 4px #f9a8d4, 0 4px 16px rgba(136, 14, 79, 0.1)'
          : '0 4px 16px rgba(136, 14, 79, 0.1)',
        border: '2px solid #f9a8d4',
        background: '#fff',
        transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
        overflow: 'hidden',
        padding: 0,
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative" style={{ width: '100%', height: '14.5rem' }}>
        <img
          src={imageUrl}
          alt={`Chapter ${chapterNumber} - ${title}`}
          className="object-cover"
          style={{ width: '100%', height: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16, display: 'block' }}
        />
        {/* Chapter Number Badge */}
        <div className="absolute top-2 left-2 bg-[#880E4F] text-white px-3 py-1 rounded-full font-bold text-sm">
          Chapter {chapterNumber}
        </div>
        {/* Animated View Button */}
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
                boxShadow: '0 0 0 8px rgba(136, 14, 79, 0.2), 0 4px 16px rgba(136, 14, 79, 0.3)',
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
                boxShadow: '0 0 0 12px rgba(136, 14, 79, 0.3), 0 4px 16px rgba(136, 14, 79, 0.4)'
              }}
              whileTap={{ scale: 0.97 }}
              onClick={e => { e.stopPropagation(); onClick(); }}
              tabIndex={-1}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.5L20 12L12 19.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div 
        className="flex flex-col items-center mt-0 px-0 w-full"
        style={{ 
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.97), rgba(255,255,255,1))',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          padding: '12px 0 12px 0',
          width: '100%'
        }}
      >
        <div className="font-bold text-lg text-gray-800 text-center">{title}</div>
        <div className="text-sm text-gray-500 text-center mt-1 px-4">{description}</div>
      </div>
    </div>
  );
};

export default ChapterCard; 