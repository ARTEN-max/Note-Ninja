import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDownIcon, CheckCircleIcon, MagnifyingGlassIcon, UserCircleIcon, AcademicCapIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
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
    { code: 'CS 246', title: 'Object-Oriented Software Development', tags: ['C++', 'OOP', 'Design'] },
    { code: 'MATH 135', title: 'Algebra', tags: ['Proofs', 'Number Theory'] },
    { code: 'MATH 137', title: 'Calculus 1', tags: ['Limits', 'Derivatives'] },
    { code: 'STAT 231', title: 'Statistics', tags: ['Distributions', 'Estimation'] },
  ]), []);

  const filteredCourses = courses.filter(c =>
    c.code.toLowerCase().includes(query.toLowerCase()) ||
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
      {/* Sticky Nav */}
      <header className={`sticky top-0 z-40 transition-colors ${navSolid ? 'bg-black/70 backdrop-blur border-b border-white/10' : 'bg-transparent'} `}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/')} className="font-extrabold tracking-tight text-base sm:text-lg">
            NOTE NINJA
          </button>
          <nav className="hidden sm:flex items-center gap-6 text-[11px] uppercase tracking-wide">
            <Link to="/browse" className="hover:text-[var(--accent, #3AF38C)]">Study Guides</Link>
            <Link to="/about" className="hover:text-[var(--accent, #3AF38C)]">About</Link>
            <a href="#faq" className="hover:text-[var(--accent, #3AF38C)]">FAQ</a>
            <Link to="/signin" className="hover:text-[var(--accent, #3AF38C)]">Sign In</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 rounded-full font-bold shadow-md"
              style={{ background: ACCENT, color: '#00150A' }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative">
        {/* background texture */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(600px 300px at 20% 20%, rgba(58,243,140,0.15), transparent 60%), radial-gradient(600px 300px at 80% 30%, rgba(124,77,255,0.18), transparent 60%)'
          }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black to-black" />
        </div>

        <Section className="pt-16 md:pt-20 pb-10">
          <div className="flex flex-col items-center text-center">
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-[14vw] leading-[0.9] md:text-8xl font-extrabold tracking-tight">
              NOTE NINJA
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-2 md:mt-3 text-zinc-300 text-sm md:text-lg">
              Waterloo’s Smartest Study Tool.
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-zinc-300 max-w-2xl text-sm md:text-base">
              AI-powered study guides, past paper patterns, and lightning-fast recall — built specifically for Waterloo courses.
            </motion.p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm">
              <button onClick={() => navigate('/register')} className="px-6 py-3 rounded-full font-bold w-full sm:w-auto" style={{ background: ACCENT, color: '#00150A' }}>Start Studying</button>
              <button onClick={() => navigate('/browse')} className="px-6 py-3 rounded-full border border-white/20 hover:border-white/40 w-full sm:w-auto">Browse Study Guides</button>
            </div>
            <div className="mt-10 flex flex-col items-center text-zinc-400">
              <ChevronDownIcon className="w-6 h-6 animate-bounce" />
              <span className="text-xs">Scroll</span>
            </div>
          </div>
        </Section>
      </div>

      {/* Social Proof */}
      <Section className="py-6">
        <div className="text-center text-zinc-400 text-xs mb-3">Trusted by thousands of Waterloo students</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 opacity-80">
          {['UW MathSoc','UW EngSoc','Velocity','WiCS','UWCS'].map(name => (
            <div key={name} className="h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[11px] md:text-sm text-zinc-300">
              {name}
            </div>
          ))}
        </div>
      </Section>

      {/* Core Benefits */}
      <Section id="benefits" className="py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {[{
            icon: <CheckCircleIcon className="w-6 h-6" />,
            title: 'Auto Study Guides',
            desc: 'Instantly turn messy notes into exam-ready summaries.'
          },{
            icon: <AcademicCapIcon className="w-6 h-6" />,
            title: 'Past Paper Insights',
            desc: 'Spot commonly tested topics in seconds.'
          },{
            icon: <RocketLaunchIcon className="w-6 h-6" />,
            title: 'Lightning Recall',
            desc: 'Smart spaced repetition for maximum retention.'
          },{
            icon: <UserCircleIcon className="w-6 h-6" />,
            title: 'Team Mode',
            desc: 'Share and collaborate with classmates.'
          }].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-zinc-200">{f.icon}<span className="font-semibold">{f.title}</span></div>
              <div className="text-zinc-400 text-sm">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Interactive Preview */}
      <Section className="py-10 md:py-12">
        <div className="mb-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Search your course</h2>
          <p className="text-zinc-400 text-sm md:text-base">Try typing a Waterloo course code like <span className="text-zinc-200">MATH 135</span> or <span className="text-zinc-200">CS 246</span>.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 max-w-2xl mx-auto">
          <MagnifyingGlassIcon className="w-5 h-5 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-zinc-500"
          />
          <button onClick={() => navigate('/browse')} className="hidden sm:inline px-4 py-1.5 rounded-full font-semibold" style={{ background: ACCENT, color: '#00150A' }}>Explore</button>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(query ? filteredCourses : courses).map((c) => (
            <div key={c.code} className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="text-xs text-zinc-400">{c.code}</div>
              <div className="font-semibold mt-1">{c.title}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.tags.map(t => (
                  <span key={t} className="text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/10 text-zinc-300">{t}</span>
                ))}
              </div>
              <div className="mt-3">
                <button onClick={() => navigate(`/guide/${c.code.replace(' ', '')}/notes`)} className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: ACCENT, color: '#00150A' }}>Open</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section id="how" className="py-10 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { n: 1, t: 'Upload or choose', d: 'Add your notes or pick a course to start.' },
            { n: 2, t: 'AI builds your guide', d: 'Get a clean, exam-ready study guide in seconds.' },
            { n: 3, t: 'Drill with recall', d: 'Practice key points with smart prompts and spaced repetition.' }
          ].map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col gap-2 items-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ background: ACCENT, color: '#00150A' }}>{s.n}</div>
              <div className="font-semibold">{s.t}</div>
              <div className="text-zinc-400 text-sm">{s.d}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="py-10 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">What students say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { q: 'Brought my midterm up by 12%. The recall prompts are clutch.', a: 'Aditi • CS 2B' },
            { q: 'It’s like someone organized my brain for me.', a: 'Marcus • SYDE 1B' },
            { q: 'Past paper patterns saved me hours. Zero fluff.', a: 'Zara • MATH 2A' },
            { q: 'Group playlists made studying with friends actually work.', a: 'Ethan • STAT 2B' },
          ].map((t, i) => (
            <motion.blockquote key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <p className="text-zinc-200">“{t.q}”</p>
              <footer className="mt-3 text-zinc-400 text-sm">{t.a}</footer>
            </motion.blockquote>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="py-10 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">FAQ</h2>
        <div className="max-w-3xl mx-auto">
          {[
            { q: 'Is Note Ninja allowed at UW?', a: 'Yes. It is an independent study tool. Always follow your course policies and use guides responsibly.' },
            { q: 'How accurate are the guides?', a: 'Guides combine your inputs and public resources. They’re great for structure and focus, and you should verify key details with course material.' },
            { q: 'Can I collaborate with classmates?', a: 'Yes. Create shared playlists and study together in Team Mode.' },
            { q: 'How do you handle my data?', a: 'We store as little as possible. You control your content. See our Privacy Policy for details.' },
            { q: 'Can I use it on mobile?', a: 'Absolutely. The entire experience is mobile-optimized and fast.' },
            { q: 'Is there a free plan?', a: 'Yes. Get started free. Upgrade anytime.' }
          ].map((item, idx) => (
            <div key={item.q} className="rounded-xl bg-white/5 border border-white/10 mb-3 overflow-hidden">
              <button
                className="w-full text-left px-4 py-3 font-semibold flex items-center justify-between"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span>{item.q}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-sm text-zinc-300">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="py-12">
        <div className="relative rounded-3xl overflow-hidden p-6 md:p-12" style={{ background: 'linear-gradient(135deg, rgba(58,243,140,0.2) 0%, rgba(98,0,234,0.25) 100%)' }}>
          <h3 className="text-xl md:text-3xl font-extrabold mb-2">Get better grades, faster.</h3>
          <p className="text-zinc-300 max-w-2xl text-sm md:text-base">Join Note Ninja today. Free to start. Cancel anytime.</p>
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm">
            <button onClick={() => navigate('/register')} className="px-6 py-3 rounded-full font-bold w-full sm:w-auto" style={{ background: ACCENT, color: '#00150A' }}>Sign Up Now</button>
            <button onClick={() => navigate('/signin')} className="px-6 py-3 rounded-full border border-white/30 w-full sm:w-auto">Sign In</button>
          </div>
        </div>
      </Section>

      {/* Footer (reuse site footer for links + small print) */}
      <SiteFooter />
    </div>
  );
}