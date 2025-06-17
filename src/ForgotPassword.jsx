import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSent(false);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError(err.message.replace("Firebase:", "").replace("(auth/", "").replace(")", "").trim());
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e3b8f9] to-[#c895f2]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        className="backdrop-blur-lg bg-white/60 p-8 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-md border border-[#e3b8f9]"
        style={{ boxShadow: "0 8px 32px 0 #e3b8f9" }}
      >
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight note-ninja-heading" style={{ letterSpacing: -1, color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff' }}>NOTE NINJA</h1>
        <p className="text-base font-medium mb-6" style={{ color: '#7E44A3' }}>Reset your password</p>
        <form className="w-full space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold text-sm" style={{ color: '#7E44A3' }}>Email Address</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b266ff] text-base bg-white"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            />
          </div>
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">{error}</motion.div>}
          {sent && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-sm text-center">Password reset email sent!</motion.div>}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-2 rounded-md text-white font-bold text-lg bg-gradient-to-r from-[#b266ff] to-[#8a2be2] shadow transition hover:from-[#a259e6] hover:to-[#7e44a3] focus:outline-none focus:ring-2 focus:ring-[#b266ff] disabled:opacity-60"
            style={{ fontFamily: 'Inter, Arial, sans-serif', letterSpacing: 1 }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </motion.button>
        </form>
        <div className="w-full flex flex-col items-center mt-4 gap-2">
          <span className="text-sm" style={{ color: '#7E44A3' }}>Remembered your password? <a href="/signin" className="font-semibold hover:underline transition-colors" style={{ color: '#5E2A84' }}>Sign in</a></span>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 