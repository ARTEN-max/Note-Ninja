import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useAudio } from '../contexts/AudioContext';

const navItems = [
  { label: "Dashboard", to: "/", icon: (
    <span style={{ width: 24, height: 24, display: 'inline-block', position: 'relative' }}>
      <span style={{ width: 18, height: 20, left: 3, top: 2, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
      <span style={{ width: 6, height: 10, left: 9, top: 12, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
    </span>
  ) },
  { label: "Browse & Discover", to: "/browse", icon: (
    <span style={{ width: 24, height: 24, display: 'inline-block', position: 'relative' }}>
      <span style={{ width: 16, height: 16, left: 3, top: 3, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
      <span style={{ width: 4.35, height: 4.35, left: 16.65, top: 16.65, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
    </span>
  ) },
  { label: "Audio Notes", to: "/audio-notes", icon: (
    <span style={{ width: 24, height: 24, display: 'inline-block', position: 'relative' }}>
      <span style={{ width: 16, height: 16, left: 4, top: 4, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px', borderRadius: '50%' }} />
      <span style={{ width: 8, height: 8, left: 8, top: 8, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px', borderRadius: '50%' }} />
      <span style={{ width: 4, height: 4, left: 10, top: 10, position: 'absolute', background: '#4b006e', borderRadius: '50%' }} />
    </span>
  ) },
  { label: "Request", to: "/upload", icon: (
    <span style={{ width: 24, height: 24, display: 'inline-block', position: 'relative' }}>
      <span style={{ width: 16, height: 16, left: 4, top: 4, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
      <span style={{ width: 8, height: 2, left: 8, top: 11, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
      <span style={{ width: 2, height: 8, left: 11, top: 8, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
    </span>
  ) },
];

const libraryItems = [
  { label: "My Notes", to: "/my-notes", icon: (
    <span style={{ width: 24, height: 24, display: 'inline-block', position: 'relative' }}>
      {/* Main document/note */}
      <span style={{ 
        width: 16, 
        height: 20, 
        left: 4, 
        top: 2, 
        position: 'absolute', 
        outline: '2px black solid', 
        outlineOffset: '-1px',
        borderRadius: '2px'
      }} />
      {/* Lines representing text */}
      <span style={{ 
        width: 10, 
        height: 1.5, 
        left: 6, 
        top: 5, 
        position: 'absolute', 
        background: '#4b006e',
        borderRadius: '1px'
      }} />
      <span style={{ 
        width: 8, 
        height: 1.5, 
        left: 6, 
        top: 7.5, 
        position: 'absolute', 
        background: '#4b006e',
        borderRadius: '1px'
      }} />
      <span style={{ 
        width: 12, 
        height: 1.5, 
        left: 6, 
        top: 10, 
        position: 'absolute', 
        background: '#4b006e',
        borderRadius: '1px'
      }} />
      <span style={{ 
        width: 6, 
        height: 1.5, 
        left: 6, 
        top: 12.5, 
        position: 'absolute', 
        background: '#4b006e',
        borderRadius: '1px'
      }} />
      {/* Corner fold effect */}
      <span style={{ 
        width: 4, 
        height: 4, 
        left: 16, 
        top: 2, 
        position: 'absolute', 
        outline: '2px black solid', 
        outlineOffset: '-1px',
        borderTopRightRadius: '2px',
        background: 'white'
      }} />
    </span>
  ) },
];

const extraItems = [
  { label: "User Search", to: "/search-users", icon: (
    <span role="img" aria-label="Search">��</span>
  ) },
];

export default function Sidebar(props) {
  const { currentUser } = useAuth();
  const { resetAudio } = useAudio();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

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
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      resetAudio(); // Reset audio state before logging out
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div
      className="hidden md:flex flex-col justify-between w-[240px] h-screen fixed left-0 top-0 bg-white overflow-hidden z-[100] font-inter font-medium text-base"
      style={{ minWidth: 240 }}
    >
      <div>
        <div className="absolute left-6 top-6 flex flex-col justify-center">
          <span className="font-semibold text-xl leading-[30px] font-playfair text-black" style={{ fontFamily: "'Playfair Display', serif", color: '#000' }}>Study App</span>
        </div>
        <hr className="w-full border-t-2 border-black mt-[70px] mb-2" />
        
        {/* User Name Display */}
        {userName && (
          <div className="w-[240px] absolute left-2 top-[78px] flex flex-col gap-1 items-start">
            <div className="px-4 py-2 text-lg font-semibold text-black" style={{ fontFamily: "'Inter', Arial, sans-serif" }}>
              Hello @{userName}!
            </div>
          </div>
        )}
        
        <div className="w-[240px] absolute left-2 top-[120px] flex flex-col gap-1 items-start">
          <span className="mt-8 mb-2 font-bold text-[#4b006e] font-playfair" style={{ fontFamily: "'Playfair Display', serif" }}>Discover</span>
          {navItems.map(item => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-[#d6a5f7] text-[#4b006e] font-bold' : 'hover:bg-[#ecd6fa]'} font-inter`}
              tabIndex={0}
              style={{ minHeight: 44 }}
            >
              <span className="sidebar-icon">{React.cloneElement(item.icon, { color: '#4b006e' })}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="w-[240px] absolute left-2 top-[420px] flex flex-col gap-2 items-start">
          <span className="mt-8 mb-2 font-bold text-[#4b006e] font-playfair" style={{ fontFamily: "'Playfair Display', serif" }}>Library</span>
          {libraryItems.map(item => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-[#d6a5f7] text-[#4b006e] font-bold' : 'hover:bg-[#ecd6fa]'} font-inter`}
              tabIndex={0}
              style={{ minHeight: 44 }}
            >
              <span className="sidebar-icon">{React.cloneElement(item.icon, { color: '#4b006e' })}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          {/* Profile Button */}
          <NavLink
            to="/profile"
            className={({ isActive }) => `flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-[#d6a5f7] text-[#4b006e] font-bold' : 'hover:bg-[#ecd6fa]'} font-inter`}
            tabIndex={0}
            style={{ minHeight: 44 }}
          >
             <span className="sidebar-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
               <span role="img" aria-label="Profile" style={{ fontSize: 24 }}>👤</span>
             </span>
             <span>Account</span>
          </NavLink>
          {/* Account Button */}
          <NavLink
            to="/account"
            className={({ isActive }) => `flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-[#d6a5f7] text-[#4b006e] font-bold' : 'hover:bg-[#ecd6fa]'} font-inter`}
            tabIndex={0}
            style={{ minHeight: 44 }}
          >
            <span className="sidebar-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
              {profileImageUrl || currentUser?.photoURL ? (
                <img
                  src={profileImageUrl || currentUser.photoURL}
                  alt="Profile"
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e3b8f9', background: '#f3e8ff' }}
                />
              ) : (
                <span role="img" aria-label="Profile" style={{ fontSize: 24 }}>👤</span>
              )}
            </span>
            <span>Profile</span>
          </NavLink>
        </div>
      </div>
      {/* Logout Button at the bottom for desktop/tablet */}
      <button
        onClick={handleLogout}
        className="absolute bottom-6 left-0 w-full px-6 py-3 rounded-none bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white font-bold text-base border-none cursor-pointer shadow-md tracking-wider flex items-center justify-center gap-2 transition-transform duration-150 hover:scale-105 focus:scale-105 focus:outline-none hidden md:flex"
        style={{ boxShadow: '0 0 0 8px rgba(178,102,255,0.10), 0 4px 16px 0 rgba(138,43,226,0.18)' }}
      >
        <span className="text-xl">🚪</span> Logout
      </button>
    </div>
  );
} 