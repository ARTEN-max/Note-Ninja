import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HomeIcon, BookOpenIcon, ArrowUpOnSquareIcon, UserIcon } from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const navItems = [
  { label: "Home", to: "/", icon: <HomeIcon className="w-6 h-6" /> },
  { label: "Browse", to: "/browse", icon: <BookOpenIcon className="w-6 h-6" /> },
  { label: "Request", to: "/upload", icon: <ArrowUpOnSquareIcon className="w-6 h-6" /> },
  { label: "My Notes", to: "/my-notes", icon: <UserIcon className="w-6 h-6" /> },
];

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide logout on auth pages
  const hideLogout = ['/signin', '/register', '/student-info'].includes(location.pathname);

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-pink-200 flex justify-around items-center py-2 md:hidden z-50">
      <div className="flex flex-row gap-2 w-full justify-around items-center">
        {navItems.map(item => (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className={`flex flex-col items-center text-xs font-medium ${
              location.pathname === item.to ? "text-pink-700" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        {!hideLogout && (
          <button
            onClick={async () => {
              await signOut(auth);
              navigate('/signin');
            }}
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
  );
} 