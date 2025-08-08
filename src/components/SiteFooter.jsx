import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-purple-200/40 bg-white/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          © {year} Note Ninja. All rights reserved.
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/about" className="text-purple-700 hover:text-purple-900 font-medium">About</Link>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-purple-700 hover:text-purple-900">Twitter</a>
          <Link to="/signin" className="text-purple-700 hover:text-purple-900">Sign in</Link>
          <Link to="/register" className="text-purple-700 hover:text-purple-900">Create account</Link>
        </nav>
      </div>
      <div className="w-full bg-purple-50/90">
        <div className="max-w-6xl mx-auto px-4 py-3 text-[12px] leading-relaxed text-gray-600">
          Disclaimer: Note Ninja is an educational tool intended to help students study more effectively. Content may be user-submitted and could contain inaccuracies. Always verify important information with official course materials. By using this site you agree to our community guidelines.
        </div>
      </div>
    </footer>
  );
}