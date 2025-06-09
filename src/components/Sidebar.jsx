import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const navItems = [
  { label: "Home", to: "/", icon: (
    <span style={{ width: 24, height: 24, display: 'inline-block', position: 'relative' }}>
      <span style={{ width: 18, height: 20, left: 3, top: 2, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
      <span style={{ width: 6, height: 10, left: 9, top: 12, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
    </span>
  ) },
  { label: "Browse", to: "/browse", icon: (
    <span style={{ width: 24, height: 24, display: 'inline-block', position: 'relative' }}>
      <span style={{ width: 16, height: 16, left: 3, top: 3, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
      <span style={{ width: 4.35, height: 4.35, left: 16.65, top: 16.65, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
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
  { label: "Notelists", to: "/", icon: (
    <span style={{ width: 24, height: 24, display: 'inline-block', position: 'relative' }}>
      <span style={{ width: 18, height: 22, left: 3, top: 1, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px', borderRadius: 4, background: '#fff' }} />
      <span style={{ width: 12, height: 2, left: 6, top: 6, position: 'absolute', background: '#880E4F', borderRadius: 2 }} />
      <span style={{ width: 12, height: 2, left: 6, top: 12, position: 'absolute', background: '#880E4F', borderRadius: 2 }} />
      <span style={{ width: 8, height: 2, left: 6, top: 18, position: 'absolute', background: '#880E4F', borderRadius: 2 }} />
    </span>
  ) },
  { label: "My Notes", to: "/my-notes", icon: (
    <span style={{ width: 24, height: 24, display: 'inline-block', position: 'relative' }}>
      <span style={{ width: 12, height: 15, left: 9, top: 3, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
      <span style={{ width: 6, height: 6, left: 3, top: 15, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
      <span style={{ width: 6, height: 6, left: 15, top: 13, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
    </span>
  ) },
  { label: "Personalized picks", to: "/browse", icon: (
    <span style={{ width: 24, height: 24, display: 'inline-block', position: 'relative' }}>
      <span style={{ width: 20, height: 20, left: 2, top: 2, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
      <span style={{ width: 8, height: 2, left: 8, top: 14, position: 'absolute', outline: '2px black solid', outlineOffset: '-1px' }} />
    </span>
  ) },
];

function Sidebar() {
  const navigate = useNavigate();
  return (
    <>
      {/* Small mobile-only logout button, top right */}
      <button
        onClick={async () => {
          await signOut(auth);
          navigate('/signin');
        }}
        className="fixed top-4 right-4 md:hidden bg-[#880E4F] text-white rounded-full p-2 shadow-lg z-[200] flex items-center justify-center text-sm"
        style={{ boxShadow: '0 0 0 4px rgba(136, 14, 79, 0.12), 0 2px 8px 0 rgba(136, 14, 79, 0.18)' }}
        aria-label="Logout"
      >
        <span className="text-lg">🚪</span>
      </button>
      <div
        className="hidden md:flex flex-col justify-between w-[240px] h-screen fixed left-0 top-0 bg-white overflow-hidden border-r border-gray-200 z-[100] font-inter font-medium text-base"
        style={{ minWidth: 240 }}
      >
        <div>
          <div className="absolute left-6 top-6 flex flex-col justify-center">
            <span className="font-semibold text-xl leading-[30px]">Study app</span>
            <hr className="w-32 border-t-2 border-black mt-2 mb-2" />
          </div>
          <div className="w-[240px] absolute left-2 top-[78px] flex flex-col gap-1 items-start">
            <span className="mt-8 mb-2 font-bold">Discover</span>
            {navItems.map(item => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => `flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-pink-100 text-pink-700 font-bold' : 'hover:bg-gray-100'}`}
                tabIndex={0}
                style={{ minHeight: 44 }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
          <div className="w-[240px] absolute left-2 top-[312px] flex flex-col gap-2 items-start">
            <span className="mt-8 mb-2 font-bold">Library</span>
            {libraryItems.map(item => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => `flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-pink-100 text-pink-700 font-bold' : 'hover:bg-gray-100'}`}
                tabIndex={0}
                style={{ minHeight: 44 }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
        {/* Logout Button at the bottom for desktop/tablet */}
        <button
          onClick={async () => {
            await signOut(auth);
            navigate('/signin');
          }}
          className="absolute bottom-6 left-0 w-full px-6 py-3 rounded-lg bg-[#880E4F] text-white font-bold text-base border-none cursor-pointer shadow-md tracking-wider flex items-center justify-center gap-2 transition-transform duration-150 hover:scale-105 focus:scale-105 focus:outline-none hidden md:flex"
          style={{ boxShadow: '0 0 0 8px rgba(136, 14, 79, 0.12), 0 4px 16px 0 rgba(136, 14, 79, 0.18)' }}
        >
          <span className="text-xl">🚪</span> Logout
        </button>
      </div>
    </>
  );
}

export default Sidebar; 