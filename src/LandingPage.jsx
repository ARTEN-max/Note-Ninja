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
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
      {/* Top nav */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/')} className="font-extrabold tracking-tight text-base sm:text-lg">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent">NoteNinja</span>
          </button>
          <nav className="hidden sm:flex items-center gap-6 text-[11px] uppercase tracking-wide">
            <Link to="/browse" className="hover:text-pink-200">Study Guides</Link>
            <Link to="/audio-notes" className="hover:text-pink-200">Audio Notes</Link>
            <Link to="/profile" className="hover:text-pink-200">Profile</Link>
            <Link to="/about" className="hover:text-pink-200">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/signin')} className="hidden md:inline-flex px-4 py-2 rounded-full border border-white/20 hover:border-white/40">
              Sign in
            </button>
            <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-full bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white font-bold shadow-md hover:from-[#a259e6] hover:to-[#7e44a3]">
              Try it now
            </button>
          </div>
        </div>
      </header>

      {/* Hero with background media */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* Fallback image for mobile to save battery/CPU */}
          <img
            className="block md:hidden w-full h-full object-cover opacity-30"
            src="/placeholders/city.jpg"
            alt="background"
            loading="eager"
            decoding="async"
          />
          {/* Video for md+ screens */}
          <video
            className="hidden md:block w-full h-full object-cover opacity-30"
            src="/landing-video.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />
        </div>

        <Section className="pt-14 md:pt-16 pb-8 md:pb-10">
          <div className="flex flex-col items-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-[15vw] leading-[0.9] md:text-8xl font-extrabold tracking-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              NOTE NINJA
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-3 md:mt-4 text-sm md:text-lg text-zinc-200 max-w-xl md:max-w-2xl"
            >
              Waterloo's smartest study tool. Curated study guides, podcast-style audio notes, and review modes that help you learn faster.
            </motion.p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm">
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-100 w-full sm:w-auto"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/browse')}
                className="px-6 py-3 rounded-full border border-white/20 hover:border-white/40 w-full sm:w-auto"
              >
                Browse Study Guides
              </button>
            </div>
            {/* quick feature pills removed per request */}
          </div>
        </Section>
      </div>

      {/* Reference-style left-aligned hero copy */}
      <Section className="py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          <div>
            <h2 className="uppercase font-extrabold tracking-tight text-3xl md:text-6xl leading-[0.95]">
              Rethink how
              <br />
              you study at Waterloo
            </h2>
          </div>
          <div className="text-zinc-300 max-w-xl text-sm md:text-base">
            <p>
              NoteNinja is an AI-powered study platform built for Waterloo students, offering free,
              downloadable study guides for your toughest courses. Tune into podcast-style audio notes on the go
              whether you're at the gym or commuting. Create your profile, explore notes from fellow students,
              and build your own study playlists.
            </p>
            <div className="mt-5 md:mt-6">
              <button onClick={() => navigate('/register')} className="px-5 py-2 rounded-full border border-white/20 hover:border-white/40 w-full sm:w-auto">
                Try it now
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Select Courses */}
      <Section className="py-8 md:py-10">
        <h2 className="uppercase font-extrabold tracking-tight text-3xl md:text-6xl text-center mb-6 md:mb-8">Select Courses</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { code: 'CS246', title: 'Object-Oriented Software Dev', img: '/placeholders/city.jpg' },
            { code: 'MATH137', title: 'Calculus 1', img: '/placeholders/strawberry.jpg' },
            { code: 'STAT230', title: 'Probability', img: '/placeholders/dog.jpg' },
            { code: 'MATH135', title: 'Algebra', img: '/placeholders/cool.jpg' },
          ].map((c) => (
            <div key={c.code} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <img src={c.img} alt={c.title} className="h-28 md:h-36 w-full object-cover" loading="lazy" decoding="async" />
              <div className="p-3 md:p-4 flex flex-col gap-1">
                <div className="text-xs md:text-sm text-zinc-300">{c.code}</div>
                <div className="font-semibold text-sm md:text-base">{c.title}</div>
                <div className="mt-2 md:mt-3">
                  <button onClick={() => navigate(`/guide/${c.code}/notes`)} className="px-3 py-1.5 rounded-full text-xs md:text-sm bg-white text-black font-bold hover:bg-zinc-100">
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Stats */}
      <Section className="py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          {[{k:'Study Guides',v:'100+'},{k:'Audio Minutes',v:'5k+'},{k:'Students',v:'1k+'},{k:'Playlists',v:'300+'}].map((s)=> (
            <div key={s.k} className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5">
              <div className="text-xl md:text-3xl font-extrabold">{s.v}</div>
              <div className="mt-1 text-xs md:text-sm text-zinc-300">{s.k}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Feature Cards */}
      <Section className="py-10" id="features">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-8">Everything you need to crush your exams</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
              className="bg-white/5 rounded-2xl shadow-lg p-4 md:p-6 border border-white/10">
              <h3 className="text-lg md:text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-zinc-300 text-sm md:text-base">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Image strip */}
      <Section className="py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {["/placeholders/city.jpg","/placeholders/strawberry.jpg","/placeholders/dog.jpg","/placeholders/cool.jpg"].map((src, i) => (
            <motion.img key={src} src={src} alt="showcase" className="rounded-2xl object-cover h-28 md:h-40 w-full border border-white/10"
              loading="lazy" decoding="async"
              initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} />
          ))}
        </div>
      </Section>

      {/* CTA banner */}
      <Section className="py-10 md:py-12">
        <div className="relative rounded-3xl overflow-hidden p-6 md:p-12 bg-gradient-to-r from-[#b266ff] to-[#8a2be2]">
          <h3 className="text-xl md:text-3xl font-extrabold mb-2">Make every study session count</h3>
          <p className="text-white/90 max-w-2xl text-sm md:text-base">Join students turning notes into momentum. NoteNinja helps you retain more in less time—backed by spaced repetition and smart audio.</p>
          <div className="mt-4 md:mt-5 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm">
            <button onClick={() => navigate('/register')} className="px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-100 w-full sm:w-auto">Create your account</button>
            <button onClick={() => navigate('/signin')} className="px-6 py-3 rounded-full bg-white/10 text-white font-bold border border-white/30 hover:bg-white/20 w-full sm:w-auto">Sign in</button>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-5 md:mb-6">Frequently asked</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[
            { q: 'Is NoteNinja free?', a: 'You can start free. Pro adds faster audio processing and unlimited saved notes.' },
            { q: 'Can I request new courses?', a: 'Yes. Use Request a Course from your dashboard—we prioritize popular requests.' },
            { q: 'Does it work on mobile?', a: 'Absolutely. It’s optimized for phones, tablets, and desktops.' },
            { q: 'How do audio notes work?', a: 'We prefetch and cache tracks for instant playback and minimal waiting.' }
          ].map((item) => (
            <details key={item.q} className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10">
              <summary className="cursor-pointer font-semibold text-base">{item.q}</summary>
              <p className="mt-2 text-zinc-300 text-sm">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <SiteFooter />
    </div>
  );
}