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
      `}</style>

      {/* Sticky Nav */}
      <header className={`sticky top-0 z-40 transition-colors ${navSolid ? 'bg-black/70 backdrop-blur border-b border-white/10' : 'bg-transparent'} `}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 h-14 md:h-16">
          <button onClick={() => navigate('/')} className="font-extrabold tracking-tight text-base sm:text-lg">NOTE NINJA</button>
          <nav className="hidden sm:flex items-center gap-8 md:gap-10 text-[11px] uppercase tracking-wide">
            <Link to="/browse" className="hover:text-[var(--accent,#3AF38C)]">Study Guides</Link>
            <Link to="/about" className="hover:text-[var(--accent,#3AF38C)]">About</Link>
            <a href="#faq" className="hover:text-[var(--accent,#3AF38C)]">FAQ</a>
            <Link to="/signin" className="hover:text-[var(--accent,#3AF38C)]">Sign In</Link>
          </nav>
          <button onClick={() => navigate('/register')} className="ml-4 md:ml-6 px-4 py-2 rounded-full font-bold shadow-md bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white">Sign Up</button>
        </div>
      </header>

      {/* Hero: full-background video */}
      <div className="relative overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/landing-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/placeholders/city.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/60 to-black/80" />
        <Section className="pt-16 md:pt-24 pb-12 md:pb-20 min-h-[70vh] md:min-h-[85vh] flex items-center relative z-10">
          <div className="max-w-2xl md:max-w-3xl bg-black/35 md:bg-transparent backdrop-blur-[2px] md:backdrop-blur-0 rounded-xl md:rounded-none p-4 md:p-0">
            <motion.h1 initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.5}} className="text-[14vw] md:text-7xl leading-[0.9] font-extrabold tracking-tight" style={{textShadow:'0 6px 30px rgba(0,0,0,0.7)'}}>
              NOTE
              <span className="block text-[#b266ff]">NINJA</span>
            </motion.h1>
            <p className="mt-3 text-white">Waterloo’s Smartest Study Tool.</p>
            <p className="mt-3 text-zinc-200 max-w-xl">AI-powered study guides, exam patterns, and smarter prep — built for Waterloo courses.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm">
              <button onClick={() => navigate('/register')} className="px-6 py-3 rounded-full font-bold w-full sm:w-auto bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white">Start Studying</button>
              <button onClick={() => navigate('/browse')} className="px-6 py-3 rounded-full border border-white/30 hover:border-white/50 w-full sm:w-auto">Browse Study Guides</button>
            </div>
            <div className="mt-8 flex items-center gap-2 text-zinc-200"><ChevronDownIcon className="w-5 h-5"/>Scroll</div>
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

      {/* Glass feature cards */}
      <Section className="py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { t: 'Ready to use efficient study guides', d: 'Clean, exam-focused summaries ready to go.' },
            { t: 'Listen to audio notes', d: 'Study hands‑free with podcast‑style notes on the go.' },
            { t: 'Create playlists of your favorite courses', d: 'Save guides and audio into personalized study playlists.' }
          ].map((f,i)=> (
            <motion.div key={f.t} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}} className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/><span className="font-semibold">{f.t}</span></div>
              <p className="mt-1 text-zinc-400 text-sm">{f.d}</p>
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
            NoteNinja is an AI-powered study platform built for Waterloo students, offering free, downloadable study guides for your toughest courses. Tune into podcast-style audio notes on the go whether you're at the gym or commuting. Create your profile, explore notes from fellow students, and build your own study playlists.
          </p>
          <div className="mt-6">
            <button onClick={()=>navigate('/register')} className="px-5 py-2 rounded-full border border-white/30 hover:border-white/50">Try it now</button>
          </div>
        </div>
      </Section>

      {/* How it works – compact */}
      <Section className="py-10 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[{n:1,t:'Upload or choose',d:'Add notes or pick a course.'},{n:2,t:'AI builds your guide',d:'Clean, exam-focused study guide.'},{n:3,t:'Drill key points',d:'Fast recall with smart prompts.'}].map((s,i)=> (
            <motion.div key={s.n} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-[#8a2be2] text-white">{s.n}</div>
              <div className="mt-2 font-semibold">{s.t}</div>
              <div className="text-zinc-400 text-sm">{s.d}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Testimonials – punchy grid */}
      <Section className="py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Students love the speed</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            '“Recall prompts are clutch. Midterm up +12%.” — Aditi, CS 2B',
            '“Past paper patterns saved me hours.” — Marcus, SYDE 1B',
            '“Zero fluff. Just what’s tested.” — Zara, MATH 2A'
          ].map((q,i)=> (
            <motion.div key={i} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}} className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <p className="text-zinc-200">{q}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="py-10 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">FAQ</h2>
        <div className="max-w-3xl mx-auto">
          {[
            { q:'Is Note Ninja allowed at UW?', a:'Yes. It’s an independent study tool. Always follow your course policies.' },
            { q:'How accurate are the guides?', a:'Great for structure and focus; verify key details with course material.' },
            { q:'Can I collaborate?', a:'Yes. Share playlists and study together.' },
            { q:'How do you handle my data?', a:'Store as little as possible. You control your content.' },
            { q:'Mobile support?', a:'Fully optimized for phones and tablets.' },
          ].map((item,idx)=> (
            <div key={item.q} className="rounded-xl bg-white/5 border border-white/10 mb-3 overflow-hidden">
              <button className="w-full text-left px-4 py-3 font-semibold flex items-center justify-between" onClick={()=> setOpenFaq(openFaq===idx?null:idx)}>
                <span>{item.q}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFaq===idx?'rotate-180':''}`}/>
              </button>
              {openFaq===idx && (<div className="px-4 pb-4 text-sm text-zinc-300">{item.a}</div>)}
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="py-12">
        <div className="relative rounded-3xl overflow-hidden p-6 md:p-12" style={{background:'linear-gradient(135deg, rgba(138,43,226,.25) 0%, rgba(98,0,234,.25) 100%)'}}>
          <h3 className="text-xl md:text-3xl font-extrabold mb-2">Get better grades, faster.</h3>
          <p className="text-zinc-300 max-w-2xl text-sm md:text-base">Free to start. Cancel anytime.</p>
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm">
            <button onClick={()=>navigate('/register')} className="px-6 py-3 rounded-full font-bold w-full sm:w-auto bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white">Sign Up Now</button>
            <button onClick={()=>navigate('/signin')} className="px-6 py-3 rounded-full border border-white/30 w-full sm:w-auto">Sign In</button>
          </div>
        </div>
      </Section>

      <SiteFooter />
    </div>
  );
}