import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message.replace("Firebase:", "").replace("(auth/", "").replace(")", "").trim());
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-200 to-pink-300 relative overflow-hidden">
      {/* Floating icons (optional, can be added for extra polish) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.08, y: 0 }}
        className="absolute left-10 top-10 text-6xl select-none pointer-events-none"
      >🎓</motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.08, x: 0 }}
        className="absolute right-10 top-16 text-6xl select-none pointer-events-none"
      >📚</motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.08, y: 0 }}
        className="absolute left-16 bottom-16 text-6xl select-none pointer-events-none"
      >📝</motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.08, x: 0 }}
        className="absolute right-16 bottom-10 text-6xl select-none pointer-events-none"
      >🏆</motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.08, y: 0 }}
        className="absolute right-24 bottom-24 text-6xl select-none pointer-events-none"
      >🎯</motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.08, x: 0 }}
        className="absolute left-24 top-1/2 text-6xl select-none pointer-events-none"
      >📝</motion.div>
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        className="w-full max-w-xl bg-white/90 backdrop-blur-lg rounded-[2.5rem] shadow-2xl flex flex-col items-center px-8 py-10 md:py-12 border border-pink-100"
        style={{ boxShadow: "0 8px 32px 0 rgba(245,175,175,0.18)" }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#8f3a3a] mb-2 tracking-tight text-center" style={{ fontFamily: 'Inknut Antiqua, serif', letterSpacing: -1 }}>NOTE NINJA</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-[#7a2c2c] mt-2 mb-2 text-center">Welcome back, ninja!</h2>
        <p className="text-gray-600 text-base font-medium mb-6 text-center">Sign in to access your personalized study dashboard</p>
        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit} autoComplete="off">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-[#8f3a3a] font-semibold text-base">Email Address <span className="text-pink-400">*</span></label>
            <input
              id="email"
              type="email"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 text-base bg-white placeholder-gray-400"
              placeholder="your.email@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-[#8f3a3a] font-semibold text-base">Password <span className="text-pink-400">*</span></label>
            <input
              id="password"
              type="password"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 text-base bg-white placeholder-gray-400"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            />
          </div>
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center mt-2">{error}</motion.div>}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-lg bg-[#e9a9a9] shadow transition hover:bg-[#e48b8b] focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-60 mt-2"
            style={{ fontFamily: 'Inter, Arial, sans-serif', letterSpacing: 1 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Next →"}
          </motion.button>
        </form>
        <div className="w-full flex flex-col items-center mt-6 gap-2">
          <a href="/forgot" className="text-pink-400 font-medium hover:text-pink-500 transition-colors text-sm">Forgot password?</a>
          <span className="text-[#8f3a3a] text-sm">Don't have an account? <a href="/register" className="text-pink-400 font-semibold hover:text-pink-500 transition-colors">Sign up</a></span>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn; 