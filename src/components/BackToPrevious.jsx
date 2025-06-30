import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackToPrevious = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.body.classList.add('has-back-btn');
    return () => document.body.classList.remove('has-back-btn');
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className="fixed top-4 left-4 md:left-[260px] z-[9999] flex items-center px-4 py-2 bg-white/90 hover:bg-white text-[#5E2A84] rounded-full shadow-lg border border-[#e3b8f9] transition-all duration-200"
      style={{ fontWeight: 600, fontSize: 16, zIndex: 9999 }}
    >
      <svg className="mr-2" width="20" height="20" fill="none" stroke="#5E2A84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      Back
    </button>
  );
};

export default BackToPrevious;

// In your global CSS (e.g., App.css or index.css), add:
// .has-back-btn main, .has-back-btn .main-content, .has-back-btn .page-content { margin-top: 64px !important; } 