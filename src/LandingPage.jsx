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
    <div className="min-h-screen w-full bg-black text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/')} className="font-extrabold tracking-tight text-lg">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent">NoteNinja</span>
          </button>
          <nav className="hidden sm:flex items-center gap-6 text-xs uppercase tracking-wide">
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

      {/* Hero with background video */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <video
            className="w-full h-full object-cover opacity-30"
            src="/landing-video.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />
        </div>

        <Section className="pt-16 pb-10">
          <div className="flex flex-col items-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-[12vw] leading-none md:text-8xl font-extrabold tracking-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              NOTE NINJA
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-4 text-base md:text-lg text-zinc-200 max-w-2xl"
            >
              Waterloo's smartest study tool. Curated study guides, podcast-style audio notes, and review modes that help you learn faster.
            </motion.p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-100"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/browse')}
                className="px-6 py-3 rounded-full border border-white/20 hover:border-white/40"
              >
                Browse Study Guides
              </button>
            </div>

            {/* Quick pills */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
              {["Faster Recall", "Audio Notes", "Smart Reviews", "Community"].map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm text-zinc-100 text-center"
                >
                  {label}
                </motion.div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Reference-style left-aligned hero copy */}
      <Section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="uppercase font-extrabold tracking-tight text-4xl md:text-6xl leading-[0.95]">
              Rethink how
              <br />
              you study at Waterloo
            </h2>
          </div>
          <div className="text-zinc-300 max-w-xl">
            <p>
              NoteNinja is an AI-powered study platform built for Waterloo students, offering free,
              downloadable study guides for your toughest courses. Tune into podcast-style audio notes on the go
              whether you're at the gym or commuting. Create your profile, explore notes from fellow students,
              and build your own study playlists.
            </p>
            <div className="mt-6">
              <button onClick={() => navigate('/register')} className="px-5 py-2 rounded-full border border-white/20 hover:border-white/40">
                Try it now
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Select Courses */}
      <Section className="py-10">
        <h2 className="uppercase font-extrabold tracking-tight text-4xl md:text-6xl text-center mb-8">Select Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { code: 'CS246', title: 'Object-Oriented Software Dev', img: '/placeholders/city.jpg' },
            { code: 'MATH137', title: 'Calculus 1', img: '/placeholders/strawberry.jpg' },
            { code: 'STAT230', title: 'Probability', img: '/placeholders/dog.jpg' },
            { code: 'MATH135', title: 'Algebra', img: '/placeholders/cool.jpg' },
          ].map((c) => (
            <div key={c.code} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <img src={c.img} alt={c.title} className="h-36 w-full object-cover" />
              <div className="p-4 flex flex-col gap-1">
                <div className="text-sm text-zinc-300">{c.code}</div>
                <div className="font-semibold">{c.title}</div>
                <div className="mt-3">
                  <button onClick={() => navigate(`/guide/${c.code}/notes`)} className="px-3 py-1.5 rounded-full text-sm bg-white text-black font-bold hover:bg-zinc-100">
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Stats */}
      <Section className="py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{k:'Study Guides',v:'100+'},{k:'Audio Minutes',v:'5k+'},{k:'Students',v:'1k+'},{k:'Playlists',v:'300+'}].map((s,i)=> (
            <div key={s.k} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-2xl md:text-3xl font-extrabold">{s.v}</div>
              <div className="mt-1 text-sm text-zinc-300">{s.k}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Feature Cards */}
      <Section className="py-12" id="features">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Everything you need to crush your exams</h2>
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
              className="bg-white/5 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-zinc-300">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Image strip */}
      <Section className="py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["/placeholders/city.jpg","/placeholders/strawberry.jpg","/placeholders/dog.jpg","/placeholders/cool.jpg"].map((src, i) => (
            <motion.img key={src} src={src} alt="showcase" className="rounded-2xl object-cover h-40 w-full border border-white/10"
              initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} />
          ))}
        </div>
      </Section>

      {/* CTA banner */}
      <Section className="py-12">
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 bg-gradient-to-r from-[#b266ff] to-[#8a2be2]">
          <h3 className="text-2xl md:text-3xl font-extrabold mb-2">Make every study session count</h3>
          <p className="text-white/90 max-w-2xl">Join students turning notes into momentum. NoteNinja helps you retain more in less time—backed by spaced repetition and smart audio.</p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/register')} className="px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-100">Create your account</button>
            <button onClick={() => navigate('/signin')} className="px-6 py-3 rounded-full bg-white/10 text-white font-bold border border-white/30 hover:bg-white/20">Sign in</button>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-6">Frequently asked</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { q: 'Is NoteNinja free?', a: 'You can start free. Pro adds faster audio processing and unlimited saved notes.' },
            { q: 'Can I request new courses?', a: 'Yes. Use Request a Course from your dashboard—we prioritize popular requests.' },
            { q: 'Does it work on mobile?', a: 'Absolutely. It’s optimized for phones, tablets, and desktops.' },
            { q: 'How do audio notes work?', a: 'We prefetch and cache tracks for instant playback and minimal waiting.' }
          ].map((item) => (
            <details key={item.q} className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <summary className="cursor-pointer font-semibold">{item.q}</summary>
              <p className="mt-2 text-zinc-300">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <SiteFooter />
    </div>
  );
}