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
  minimal = false,
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
        boxShadow: hovered && !minimal
          ? '0 0 20px 4px #e3b8f9, 0 4px 16px rgba(94,42,132,0.10)'
          : '0 4px 16px rgba(94,42,132,0.10)',
        border: '2px solid #e3b8f9',
        background: '#fff',
        transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
        overflow: 'hidden',
        padding: 0,
        transform: hovered && !minimal ? 'scale(1.05)' : 'scale(1)',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      id={`card-${courseCode}`}
    >
      <div className="relative" style={{ width: '100%', height: '14.5rem' }}>
        <img
          src={imageUrl}
          alt={`${courseCode} study guide`}
          className="object-cover"
          style={{ width: '100%', height: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16, display: 'block' }}
        />
        {/* Like button (minimal: always bottom left, else overlay) */}
        {minimal ? (
          <div className="absolute bottom-3 left-3">
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
        ) : (
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
        <div className="font-bold text-lg text-black text-center" style={{ fontFamily: "'Inknut Antiqua', serif" }}>{courseCode}</div>
        <div className="text-sm text-black text-center mt-1">{description}</div>
      </div>
    </div>
  );
};

export default StudyGuideCard;
