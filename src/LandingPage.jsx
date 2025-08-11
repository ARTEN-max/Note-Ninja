import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDownIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SiteFooter from './components/SiteFooter';

const ACCENT = '#3AF38C';

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
        .neon-glow{box-shadow:0 0 40px rgba(58,243,140,.25),0 0 80px rgba(98,0,234,.15)}
        .marquee{display:flex;gap:2rem;animation:mar 25s linear infinite;white-space:nowrap}
        @keyframes mar{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      `}</style>

      {/* Sticky Nav */}
      <header className={`sticky top-0 z-40 transition-colors ${navSolid ? 'bg-black/70 backdrop-blur border-b border-white/10' : 'bg-transparent'} `}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/')} className="font-extrabold tracking-tight text-base sm:text-lg">NOTE NINJA</button>
          <nav className="hidden sm:flex items-center gap-6 text-[11px] uppercase tracking-wide">
            <Link to="/browse" className="hover:text-[var(--accent,#3AF38C)]">Study Guides</Link>
            <Link to="/about" className="hover:text-[var(--accent,#3AF38C)]">About</Link>
            <a href="#faq" className="hover:text-[var(--accent,#3AF38C)]">FAQ</a>
            <Link to="/signin" className="hover:text-[var(--accent,#3AF38C)]">Sign In</Link>
          </nav>
          <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-full font-bold shadow-md" style={{ background: ACCENT, color: '#00150A' }}>Sign Up</button>
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/65 to-black" />
        <Section className="pt-12 md:pt-20 pb-10 md:pb-16 min-h-[70vh] md:min-h-[80vh] flex items-center">
          <div className="max-w-2xl">
            <motion.h1 initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.5}} className="text-[14vw] md:text-7xl leading-[0.9] font-extrabold tracking-tight">
              NOTE
              <span className="block" style={{color:ACCENT}}>NINJA</span>
            </motion.h1>
            <p className="mt-3 text-zinc-300">Waterloo’s Smartest Study Tool.</p>
            <p className="mt-3 text-zinc-300 max-w-xl">AI-powered study guides, exam patterns, and smarter prep — built for Waterloo courses.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm">
              <button onClick={() => navigate('/register')} className="px-6 py-3 rounded-full font-bold w-full sm:w-auto" style={{background:ACCENT,color:'#00150A'}}>Start Studying</button>
              <button onClick={() => navigate('/browse')} className="px-6 py-3 rounded-full border border-white/20 hover:border-white/40 w-full sm:w-auto">Browse Study Guides</button>
            </div>
            <div className="mt-8 flex items-center gap-2 text-zinc-300"><ChevronDownIcon className="w-5 h-5"/>Scroll</div>
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
          {[{
            t:'Auto Study Guides', d:'Turn messy notes into exam-ready summaries in seconds.'
          },{
            t:'Past Paper Insights', d:'See commonly tested topics instantly.'
          },{
            t:'Lightning Recall', d:'Smart spaced repetition for max retention.'
          }].map((f,i)=> (
            <motion.div key={f.t} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}} className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/><span className="font-semibold">{f.t}</span></div>
              <p className="mt-1 text-zinc-400 text-sm">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Interactive preview */}
      <Section className="py-10">
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold">Search your course</h2>
          <p className="text-zinc-400 text-sm">Try MATH 135 or CS 246</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 max-w-2xl mx-auto">
          <MagnifyingGlassIcon className="w-5 h-5 text-zinc-400"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search courses..." className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-zinc-500"/>
          <button onClick={()=>navigate('/browse')} className="hidden sm:inline px-4 py-1.5 rounded-full font-semibold" style={{background:ACCENT,color:'#00150A'}}>Explore</button>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(query?courses.filter(c=>c.toLowerCase().includes(query.toLowerCase())):courses).slice(0,6).map((c)=> (
            <div key={c} className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="font-semibold">{c}</div>
              <p className="text-zinc-400 text-sm mt-1">Auto-generated guide • Key topics • Quick recall</p>
              <div className="mt-3"><button onClick={()=>navigate(`/guide/${c.replace(' ','')}/notes`)} className="px-3 py-1.5 rounded-full text-xs font-bold" style={{background:ACCENT,color:'#00150A'}}>Open</button></div>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works – compact */}
      <Section className="py-10 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[{n:1,t:'Upload or choose',d:'Add notes or pick a course.'},{n:2,t:'AI builds your guide',d:'Clean, exam-focused study guide.'},{n:3,t:'Drill key points',d:'Fast recall with smart prompts.'}].map((s,i)=> (
            <motion.div key={s.n} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{background:ACCENT,color:'#00150A'}}>{s.n}</div>
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
        <div className="relative rounded-3xl overflow-hidden p-6 md:p-12" style={{background:'linear-gradient(135deg, rgba(58,243,140,.2) 0%, rgba(98,0,234,.25) 100%)'}}>
          <h3 className="text-xl md:text-3xl font-extrabold mb-2">Get better grades, faster.</h3>
          <p className="text-zinc-300 max-w-2xl text-sm md:text-base">Free to start. Cancel anytime.</p>
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm">
            <button onClick={()=>navigate('/register')} className="px-6 py-3 rounded-full font-bold w-full sm:w-auto" style={{background:ACCENT,color:'#00150A'}}>Sign Up Now</button>
            <button onClick={()=>navigate('/signin')} className="px-6 py-3 rounded-full border border-white/30 w-full sm:w-auto">Sign In</button>
          </div>
        </div>
      </Section>

      <SiteFooter />
    </div>
  );
}