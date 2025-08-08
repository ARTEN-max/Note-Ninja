import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SiteFooter from './components/SiteFooter';

const Section = ({ children, className = '' }) => (
  <section className={`w-full px-4 ${className}`}>
    <div className="max-w-6xl mx-auto">{children}</div>
  </section>
);

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Smooth scroll behavior for internal links
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-50 via-pink-50 to-white">
      {/* Hero */}
      <Section className="pt-20 pb-10">
        <div className="flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-extrabold note-ninja-heading"
            style={{ color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}
          >
            Study Smarter. Learn Faster.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 text-lg md:text-xl text-purple-800/80 max-w-2xl"
          >
            Note Ninja turns your course content into structured study guides, audio notes, and smart review flows—so you can focus on learning, not organizing.
          </motion.p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white font-bold shadow-md hover:from-[#a259e6] hover:to-[#7e44a3]"
            >
              Get Started Free
            </button>
            <Link
              to="#features"
              className="px-6 py-3 rounded-full bg-white text-purple-800 font-bold shadow-md hover:bg-purple-50 border border-purple-200"
            >
              Explore Features
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {["Faster Recall", "Audio Notes", "Smart Reviews", "Community"].map((label, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-white shadow p-4 text-purple-800 font-semibold">
                {label}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Feature Cards */}
      <Section className="py-12" id="features">
        <h2 className="text-3xl md:text-4xl font-bold text-purple-900 text-center mb-8">Everything you need to crush your exams</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[{
            title: 'Curated Study Guides',
            desc: 'Beautifully structured guides by chapter and objective. Save time, focus on what matters.'
          }, {
            title: 'Audio Notes Player',
            desc: 'Listen on the go. Queue, shuffle, next/prev, and instant preload for zero-wait playback.'
          }, {
            title: 'Cram & Deep Dive Modes',
            desc: 'Switch contextually between quick recap, exam review, and deep dive with one click.'
          }].map((c, idx) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <h3 className="text-xl font-bold text-purple-900 mb-2">{c.title}</h3>
              <p className="text-purple-800/80">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Showcase Strip */}
      <Section className="py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["/placeholders/city.jpg","/placeholders/strawberry.jpg","/placeholders/dog.jpg","/placeholders/cool.jpg"].map((src, i) => (
            <motion.img key={src} src={src} alt="showcase" className="rounded-2xl shadow-md object-cover h-40 w-full"
              initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} />
          ))}
        </div>
      </Section>

      {/* Callout Banner */}
      <Section className="py-12">
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12"
             style={{ background: 'linear-gradient(135deg,#b266ff 0%, #8a2be2 100%)' }}>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Make every study session count</h3>
          <p className="text-white/90 max-w-2xl">Join students turning notes into momentum. Note Ninja helps you retain more in less time—backed by spaced repetition and smart audio.</p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/register')} className="px-6 py-3 rounded-full bg-white text-purple-800 font-bold shadow hover:bg-purple-50">Create your account</button>
            <button onClick={() => navigate('/signin')} className="px-6 py-3 rounded-full bg-white/10 text-white font-bold shadow border border-white/30 hover:bg-white/20">Sign in</button>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-12">
        <h2 className="text-3xl font-bold text-purple-900 text-center mb-6">Frequently asked</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { q: 'Is Note Ninja free?', a: 'You can start free. Pro adds faster audio processing and unlimited saved notes.' },
            { q: 'Can I request new courses?', a: 'Yes. Use Request a Course from your dashboard—we prioritize popular requests.' },
            { q: 'Does it work on mobile?', a: 'Absolutely. It’s optimized for phones, tablets, and desktops.' },
            { q: 'How do audio notes work?', a: 'We prefetch and cache tracks for instant playback and minimal waiting.' }
          ].map((item, i) => (
            <details key={item.q} className="bg-white rounded-2xl shadow p-5 border border-purple-100">
              <summary className="cursor-pointer font-semibold text-purple-900">{item.q}</summary>
              <p className="mt-2 text-purple-800/80">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <SiteFooter />
    </div>
  );
}