import { useNavigate, useLocation } from "react-router-dom";
import { HomeIcon, BookOpenIcon, UploadIcon, UserIcon } from "@heroicons/react/outline";

const navItems = [
  { label: "Home", to: "/", icon: <HomeIcon className="w-6 h-6" /> },
  { label: "Browse", to: "/browse", icon: <BookOpenIcon className="w-6 h-6" /> },
  { label: "Upload", to: "/upload", icon: <UploadIcon className="w-6 h-6" /> },
  { label: "My Notes", to: "/my-notes", icon: <UserIcon className="w-6 h-6" /> },
];

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-pink-200 flex justify-around items-center py-2 md:hidden z-50">
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
    </nav>
  );
} 