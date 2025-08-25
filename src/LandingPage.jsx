import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDownIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SiteFooter from './components/SiteFooter';

const ACCENT = '#8A2BE2';

const Section = ({ children, className = '' }) => (
  <section className={`w-full px-4 ${className}`}>
    <div className="max-w-6xl mx-auto">{children}</div>
  </section>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [navSolid, setNavSolid] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [query, setQuery] = useState('');

  const courses = useMemo(() => ([
    'CS 246', 'MATH 135', 'MATH 137', 'STAT 231', 'CS 240', 'ECE 106', 'SE 212', 'ACTSC 231'
  ]), []);

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
      <style>{`
        .neon-glow{box-shadow:0 0 40px rgba(138,43,226,.25),0 0 80px rgba(98,0,234,.15)}
        .marquee{display:flex;gap:2rem;animation:mar 25s linear infinite;white-space:nowrap}
        @keyframes mar{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        
        .glow-border {
          position: relative;
          overflow: hidden;
        }
        .glow-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: linear-gradient(45deg, transparent, rgba(138,43,226,0.8), rgba(178,102,255,0.6), transparent, rgba(138,43,226,0.4));
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          animation: glowRotate 3s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        .glow-border::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(178,102,255,0.3), transparent);
          border-radius: inherit;
          animation: glowSweep 2s ease-in-out infinite alternate;
        }
        
        @keyframes glowRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes glowSweep {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        .glow-border-subtle {
          position: relative;
          border: 1px solid rgba(178,102,255,0.3);
          box-shadow: 0 0 20px rgba(138,43,226,0.2), inset 0 0 20px rgba(178,102,255,0.1);
          animation: subtleGlow 2s ease-in-out infinite alternate;
        }
        @keyframes subtleGlow {
          0% { box-shadow: 0 0 20px rgba(138,43,226,0.2), inset 0 0 20px rgba(178,102,255,0.1); }
          100% { box-shadow: 0 0 30px rgba(138,43,226,0.4), inset 0 0 30px rgba(178,102,255,0.2); }
        }
      `}</style>

      {/* Full-screen Hero with video background */}
      <div className="relative min-h-screen overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/placeholders/landing-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{ playbackRate: 0.75 }}
          onLoadedData={(e) => { e.target.playbackRate = 0.75; }}
          onCanPlay={(e) => { 
            e.target.playbackRate = 0.75;
            e.target.play().catch(() => {});
          }}
          priority="high"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/60 to-black/80" />
        
        {/* Enhanced legibility overlay */}
        <div 
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.50) 35%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.27) 100%)'
          }}
        />
        <div 
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.30) 60%, rgba(0,0,0,0.22) 100%)'
          }}
        />
        


        <Section className="pt-20 md:pt-24 pb-12 md:pb-20 min-h-screen flex items-center relative z-10">
          <div className="max-w-2xl md:max-w-3xl">
            <motion.h1 
              className="text-[14vw] md:text-7xl leading-[0.9] font-extrabold tracking-tight" 
              style={{textShadow:'0 6px 30px rgba(0,0,0,0.7)'}}
              initial={{opacity:0, y:20}} 
              animate={{opacity:1, y:0}} 
              transition={{duration:0.8, ease:[0.25, 0.46, 0.45, 0.94]}}
            >
              <motion.div 
                initial={{opacity:0, y:15}} 
                animate={{opacity:1, y:0}} 
                transition={{duration:0.6, ease:'easeOut', delay:0.2}}
              >
                NOTE
              </motion.div>
              <motion.div 
                initial={{opacity:0, y:15}} 
                animate={{opacity:1, y:0}} 
                transition={{duration:0.6, ease:'easeOut', delay:0.35}}
                className="block text-[#b266ff]"
              >
                NINJA
              </motion.div>
            </motion.h1>
            <p className="mt-3 text-white">Waterloo's Smartest Study Tool.</p>
            <p className="mt-3 text-zinc-200 max-w-xl">Waterloo-specific guides and audio notes, wherever you are.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 w-full sm:w-auto max-w-sm">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="px-6 py-3 rounded-full font-bold w-full sm:w-auto bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white shadow-md transition-all duration-300 hover:from-[#c078ff] hover:to-[#9644e8] hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105"
              >
                Start Studying
              </button>
              <button 
                onClick={() => navigate('/dashboard')} 
                className="px-6 py-3 rounded-full border border-white/30 w-full sm:w-auto transition-all duration-300 hover:border-white/70 hover:bg-white/10 hover:shadow-lg hover:shadow-white/20 hover:scale-105"
              >
                Browse Study Guides
              </button>
            </div>
            <div className="mt-8 flex items-center gap-2 text-zinc-200 animate-bounce"><ChevronDownIcon className="w-5 h-5"/>Explore</div>
          </div>
        </Section>
      </div>

      {/* Course code marquee */}
      <div className="py-4 border-y border-white/10 bg-white/5">
        <div className="marquee">
          {[...courses, ...courses].map((c,i)=> (
            <span key={i} className="text-zinc-300/90 text-sm md:text-base">{c}</span>
          ))}
        </div>
      </div>

      {/* App Interface Preview */}
      <Section className="py-14 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.9]">Your Study Hub <span style={{color:ACCENT}}>Awaits</span></h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">Familiar interface, powerful features. See what makes Note Ninja different.</p>
        </div>
        
        {/* App Interface Mockup */}
        <div className="relative bg-gradient-to-br from-[#2a0845] to-[#1a1028] rounded-3xl p-6 md:p-8 mb-12 glow-border">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Mini Sidebar Preview */}
            <div className="w-full lg:w-64 bg-white rounded-2xl p-4 shadow-xl glow-border-subtle">
              <div className="mb-4">
                <span className="font-semibold text-xl text-black">Study App</span>
              </div>
              <hr className="border-gray-300 mb-4" />
              <div className="space-y-2">
                <div className="text-[#4b006e] font-bold text-sm mb-2">Discover</div>
                {[
                  { icon: '🏠', label: 'Dashboard' },
                  { icon: '🔍', label: 'Browse & Discover' },
                  { icon: '🎧', label: 'Audio Notes' },
                  { icon: '📤', label: 'Request' }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${i === 2 ? 'bg-[#d6a5f7] text-[#4b006e] font-bold' : 'hover:bg-[#ecd6fa]'}`}>
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Content Preview */}
            <div className="flex-1 space-y-4">
              {/* Audio Notes Header */}
              <div className="bg-gradient-to-r from-[#4b006e] to-[#b266ff] rounded-xl p-6 glow-border-subtle">
                <div className="flex items-center gap-4">
                  <img 
                    src="/goose-radio.png" 
                    alt="Note Ninja Radio" 
                    className="w-16 h-16 rounded-lg object-cover" 
                    loading="eager"
                    decoding="async"
                  />
                  <div>
                    <div className="text-xs text-purple-200 uppercase tracking-wider">Public Playlist</div>
                    <div className="text-2xl font-bold text-white">NOTE NINJA RADIO</div>
                    <div className="text-purple-200 text-sm">For efficient review before exams</div>
                  </div>
                </div>
              </div>
              
              {/* Sample Audio Rows */}
              <div className="bg-[#181818] rounded-xl p-4 glow-border-subtle">
                {[
                  'ECON 101: Market Dynamics & Principles',
                  'CS 246: Object-Oriented Programming',
                  'MATH 137: Calculus Fundamentals'
                ].map((title, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#b266ff]/10 last:border-b-0 hover:bg-[#2a1a3a] transition group">
                    <div className="w-6 text-purple-300 font-mono text-sm">{i + 1}</div>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded"></div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-semibold">{title}</div>
                      <div className="text-purple-300 text-xs">Study Session</div>
                    </div>
                    <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
              
              {/* Mini Player Preview */}
              <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a1a3a] rounded-xl p-4 glow-border-subtle">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-semibold">ECON 101: Market Dynamics</div>
                    <div className="text-purple-300 text-xs">Note Ninja Radio</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                      <span className="text-sm">▶</span>
                    </button>
                  </div>
                </div>
                <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Glass feature cards */}
      <Section className="py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { t: 'Ready to use efficient study guides', d: 'Clean, exam-focused summaries ready to go.' },
            { t: 'Listen to audio notes', d: 'Study hands‑free with podcast‑style notes on the go.' },
            { t: 'Create playlists of your favorite courses', d: 'Save guides and audio into personalized study playlists.' }
          ].map((f,i)=> (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 md:p-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 glow-border-subtle"
            >
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-[#b266ff]/15 to-[#8a2be2]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#b266ff] to-[#8a2be2] text-white shadow-md">
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white">{f.t}</h3>
              </div>
              <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
                {f.d}
              </p>
              <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Reference-style copy section (replaces search feature) */}
      <Section className="py-14 md:py-20">
        <div className="max-w-3xl">
          <h2 className="uppercase font-extrabold tracking-tight text-4xl md:text-6xl leading-[0.95]">
            Rethink how
            <br />
            you study at Waterloo
          </h2>
          <p className="mt-6 text-zinc-300 max-w-2xl text-sm md:text-base">
            NoteNinja is an AI-powered study platform built for Waterloo student's, offering free, downloadable study guides for your toughest courses. Tune into podcast-style audio notes on the go whether you're at the gym or commuting. Create your profile, explore notes from fellow students, and build your own study playlists.
          </p>
          <div className="mt-6">
            <button onClick={()=>navigate('/dashboard')} className="px-5 py-2 rounded-full border border-white/30 hover:border-white/50">Try it now</button>
          </div>
        </div>
      </Section>





      {/* Final CTA */}
      <Section className="py-12">
        <div className="relative rounded-3xl overflow-hidden p-6 md:p-12" style={{background:'linear-gradient(135deg, rgba(138,43,226,.25) 0%, rgba(98,0,234,.25) 100%)'}}>
          <h3 className="text-xl md:text-3xl font-extrabold mb-2">Get better grades, faster.</h3>
          <p className="text-zinc-300 max-w-2xl text-sm md:text-base">All features and content are free, ENJOY!</p>
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm">
            <button onClick={()=>navigate('/dashboard')} className="px-6 py-3 rounded-full font-bold w-full sm:w-auto bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white">Get Started</button>
            <button onClick={()=>navigate('/signin')} className="px-6 py-3 rounded-full border border-white/30 w-full sm:w-auto">Sign In</button>
          </div>
        </div>
      </Section>

      <SiteFooter />
    </div>
  );
}