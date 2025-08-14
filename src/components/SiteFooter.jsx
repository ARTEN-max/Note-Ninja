import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-white/10 bg-black">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm text-zinc-400">
          © {year} Note Ninja. All rights reserved.
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/about" className="text-zinc-300 hover:text-[#b266ff] font-medium transition-colors">About</Link>
          <Link to="/signin" className="text-zinc-300 hover:text-[#b266ff] transition-colors">Sign in</Link>
          <Link to="/register" className="text-zinc-300 hover:text-[#b266ff] transition-colors">Create account</Link>
        </nav>
      </div>
      <div className="w-full bg-gradient-to-r from-black to-zinc-900/80">
        <div className="max-w-6xl mx-auto px-4 py-3 text-[12px] leading-relaxed text-zinc-500">
          Disclaimer: Note Ninja is an educational tool intended to help students study more effectively. Content may be user-submitted and could contain inaccuracies. Always verify important information with official course materials. By using this site you agree to our community guidelines.
        </div>
      </div>
    </footer>
  );
}