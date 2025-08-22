import React, { useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useAudio } from '../contexts/AudioContext';
import { Home, Search, Headphones, Upload, FileText, User } from "lucide-react";
import GateModal from "./GateModal";

// Lightweight route prefetcher to warm up lazy chunks
const prefetchRoute = (path) => {
  try {
    switch (path) {
      case '/dashboard':
        import('../components/NoteDashboard');
        break;
      case '/browse':
        import('../BrowsePage');
        break;
      case '/audio-notes':
        import('../pages/AudioNotesPage');
        break;
      case '/upload':
        import('../UploadPage');
        break;
      case '/my-notes':
        import('../MyNotesPage');
        break;
      case '/account':
        import('../pages/NewUserProfilePage');
        break;
      case '/profile':
        import('../pages/UserProfilePage');
        break;
      default:
        break;
    }
  } catch {}
};

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: <Home size={20} />, requiresAuth: false },
  { label: "Browse & Discover", to: "/browse", icon: <Search size={20} />, requiresAuth: true },
  { label: "Audio Notes", to: "/audio-notes", icon: <Headphones size={20} />, requiresAuth: false },
  { label: "Request", to: "/upload", icon: <Upload size={20} />, requiresAuth: true },
];

const libraryItems = [
  { label: "My Notes", to: "/my-notes", icon: <FileText size={20} />, requiresAuth: true },
];


const extraItems = [
  { label: "User Search", to: "/search-users", icon: (
    <span role="img" aria-label="Search">��</span>
  ) },
];

const Sidebar = ({ showMinimize = false, usernameUpdated = false }) => {
  const { currentUser } = useAuth();
  const { resetAudio } = useAudio();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);


  // Function to capitalize first letter of name
  const capitalizeName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchUserName = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, "students", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserName(data.username || "");
            setProfileImageUrl(data.profileImageUrl || "");
          } else {
            setProfileImageUrl("");
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
        }
      }
    };

    fetchUserName();
  }, [currentUser, usernameUpdated]);

  const handleLogout = async () => {
    try {
      resetAudio(); // Reset audio state before logging out
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle navigation clicks for auth-required items
  const handleNavClick = (e, item) => {
    if (item.requiresAuth && !currentUser) {
      e.preventDefault();
      setShowGateModal(true);
    }
  };

  return (
    <div>
 <div
  className="hidden md:flex flex-col w-[240px] h-screen fixed left-0 top-0 bg-white z-[100] font-inter font-medium text-base"
  style={{ minWidth: 240 }}
>
  {/* Scrollable nav content */}
  <div className="flex-1 overflow-y-auto px-2 pt-6">
    <div className="pl-4 mb-6">
      <span className="font-semibold text-xl font-playfair text-black">Study App</span>
    </div>

    <hr className="w-full border-t-2 border-black mb-4" />

    {userName && (
      <div className="px-4 mb-4 text-lg font-semibold text-black">
        Hello {userName}!
      </div>
    )}

    <div className="px-2 mb-2">
      <span className="block mb-1 font-bold text-[#4b006e] font-playfair">Discover</span>
      {navItems.map(item => (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={(e) => handleNavClick(e, item)}
          onMouseEnter={() => prefetchRoute(item.to)}
          onFocus={() => prefetchRoute(item.to)}
          onTouchStart={() => prefetchRoute(item.to)}
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-4 py-2 rounded-lg transition duration-200 ${
              isActive ? 'bg-[#d6a5f7] text-[#4b006e] font-bold' : 'hover:bg-[#ecd6fa]'
            } ${item.requiresAuth && !currentUser ? 'opacity-70' : ''}`
          }
        >
          <span className="sidebar-icon">{React.cloneElement(item.icon, { color: '#4b006e' })}</span>
          <span>{item.label}</span>
          {item.requiresAuth && !currentUser && (
            <span className="ml-auto text-xs text-gray-500">🔒</span>
          )}
        </NavLink>
      ))}
    </div>

    <div className="px-2 mt-4">
      <span className="block mb-1 font-bold text-[#4b006e] font-playfair">Library</span>
      {libraryItems.map(item => (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={(e) => handleNavClick(e, item)}
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-4 py-2 rounded-lg transition duration-200 ${
              isActive ? 'bg-[#d6a5f7] text-[#4b006e] font-bold' : 'hover:bg-[#ecd6fa]'
            } ${item.requiresAuth && !currentUser ? 'opacity-70' : ''}`
          }
        >
          <span className="sidebar-icon">{React.cloneElement(item.icon, { color: '#4b006e' })}</span>
          <span>{item.label}</span>
          {item.requiresAuth && !currentUser && (
            <span className="ml-auto text-xs text-gray-500">🔒</span>
          )}
        </NavLink>
      ))}

      {/* Account/Profile - show for all users */}
      <NavLink 
        to="/account" 
        onClick={(e) => handleNavClick(e, { requiresAuth: true })}
        className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg hover:bg-[#ecd6fa] ${!currentUser ? 'opacity-70' : ''}`}
        onMouseEnter={() => prefetchRoute('/account')} 
        onFocus={() => prefetchRoute('/account')} 
        onTouchStart={() => prefetchRoute('/account')}
      >
        <span className="sidebar-icon">
          {profileImageUrl || currentUser?.photoURL ? (
            <img
              src={profileImageUrl || currentUser.photoURL}
              alt="Profile"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <User size={24} strokeWidth={2} color="#4b006e" />
          )}
        </span>
        <span>Profile</span>
        {!currentUser && (
          <span className="ml-auto text-xs text-gray-500">🔒</span>
        )}
      </NavLink>
    </div>
  </div>

  {/* Pinned action at bottom */}
  <div className="w-full px-2 py-3 bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md z-10">
    {currentUser ? (
      <button
        onClick={() => setIsConfirmOpen(true)}
        className="flex items-center gap-2 w-full justify-center"
      >
        <span className="text-xl">🚪</span> Logout
      </button>
    ) : (
      <button
        onClick={() => navigate('/signin')}
        className="flex items-center gap-2 w-full justify-center"
      >
        <span className="text-xl">🔑</span> Sign In
      </button>
    )}
  </div>
  </div>

  {/* Confirm Modal */}
  <ConfirmModal
    isOpen={isConfirmOpen}
    onClose={() => setIsConfirmOpen(false)}
    onConfirm={() => {
      handleLogout();
      setIsConfirmOpen(false);
    }}
    message="Are you sure you want to log out?"
  />

  {/* Gate Modal */}
  <GateModal 
    isOpen={showGateModal} 
    onClose={() => setShowGateModal(false)} 
    type="feature"
  />
</div>
  );
}

export default React.memo(Sidebar);
