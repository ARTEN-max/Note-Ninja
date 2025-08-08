import React from 'react';
import SiteFooter from '../components/SiteFooter';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold mb-4 text-purple-900">About Note Ninja</h1>
        <p className="text-purple-900/80 text-lg mb-6">
          Note Ninja is built for students who want to learn faster with less stress. We turn scattered notes into structured study guides and audio you can listen to anywhere.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow border border-purple-100">
            <h2 className="font-bold text-purple-900 mb-2">Our mission</h2>
            <p className="text-purple-900/80">Help students focus on understanding instead of organizing. Fewer taps. More clarity.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-purple-100">
            <h2 className="font-bold text-purple-900 mb-2">What we value</h2>
            <ul className="list-disc ml-5 text-purple-900/80">
              <li>Clarity over clutter</li>
              <li>Speed and accessibility</li>
              <li>Community-driven content</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-purple-900/70">Questions or feedback? Reach us any time.</p>
      </div>
      <SiteFooter />
    </div>
  );
}