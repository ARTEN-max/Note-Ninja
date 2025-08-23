import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const GateModal = ({ isOpen, onClose, type = 'general' }) => {
  const navigate = useNavigate();

  const modalContent = {
    general: {
      title: "Unlock full access",
      features: [
        "Full study guides",
        "Unlimited audio",
        "Save playlists"
      ]
    },
    guide: {
      title: "Unlock full study guides",
      features: [
        "Complete chapter content",
        "Save and organize guides",
        "Download as PDF"
      ]
    },
    audio: {
      title: "Unlock unlimited audio",
      features: [
        "Full audio playback",
        "Create playlists",
        "Save your favorites"
      ]
    },
    feature: {
      title: "Sign in to continue for free",
      features: [
        "Save your favorites",
        "Create playlists",
        "Track your progress"
      ]
    }
  };

  const content = modalContent[type] || modalContent.general;

  const handleSignIn = () => {
    onClose();
    navigate('/signin');
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 relative overflow-hidden z-[1001]"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <FiX size={20} />
              </button>

              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-[#b266ff] to-[#8a2be2] p-6 text-white">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <FiLock size={24} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">
                  {content.title}
                </h2>
                <p className="text-center text-purple-100 text-sm">
                  Join thousands of Waterloo students
                </p>
              </div>

              {/* Features */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {content.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <FiCheck className="text-green-500" size={18} />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleRegister}
                    className="w-full bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white font-semibold py-3 px-4 rounded-lg hover:from-[#a259e6] hover:to-[#7e44a3] transition-all duration-200 shadow-lg"
                  >
                    Continue with Waterloo email
                  </button>
                  
                  <div className="text-center">
                    <span className="text-gray-500 text-sm">Already have an account? </span>
                    <button
                      onClick={handleSignIn}
                      className="text-[#8a2be2] font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full text-gray-500 font-medium py-2 hover:text-gray-700 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GateModal;
