import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HomeIcon, BookOpenIcon, ArrowUpOnSquareIcon, UserIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import ConfirmModal from "../components/ConfirmModal"; // 

const navItems = [
  { label: "Home", to: "/dashboard", icon: <HomeIcon className="w-6 h-6" /> },
  { label: "Browse", to: "/browse", icon: <BookOpenIcon className="w-6 h-6" /> },
  { label: "Audio", to: "/audio-notes", icon: <MusicalNoteIcon className="w-6 h-6" /> },
  { label: "Profile", to: "/profile", icon: <UserIcon className="w-6 h-6" /> },
];

export default function MobileNav() {
  const { currentUser } = useAuth();
  const { resetAudio } = useAudio();
  const navigate = useNavigate();
  const location = useLocation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // control modal

  const hideLogout = ['/signin', '/register', '/student-info'].includes(location.pathname);
  const isMobile = () => window.matchMedia && window.matchMedia('(max-width: 767px)').matches;

  const handleLogout = async () => {
    try {
      resetAudio();
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-pink-200 flex justify-around items-center py-2 md:hidden z-50">
        <div className="flex flex-row gap-2 w-full justify-around items-center">
          {navItems.map(item => (
            <button
              key={item.to}
              onClick={() => {
                if (item.label === "Profile" && isMobile()) {
                  navigate("/account");
                } else {
                  navigate(item.to);
                }
              }}
              className={`flex flex-col items-center text-xs font-medium ${
                location.pathname === item.to || (item.label === "Profile" && location.pathname === "/account") ? "text-pink-700" : "text-gray-500"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          {!hideLogout && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="flex flex-row items-center gap-1 bg-[#880E4F] text-white rounded-full px-4 py-2 font-bold text-sm shadow-md ml-2"
              style={{ minWidth: 0 }}
              aria-label="Logout"
            >
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* Modal controlled here */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          handleLogout();
          setIsConfirmOpen(false);
        }}
        message="Are you sure you want to log out?"
      />
    </>
  );
}
