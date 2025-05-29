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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-200 to-pink-300">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        className="backdrop-blur-lg bg-white/60 p-8 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-md border border-pink-200"
        style={{ boxShadow: "0 8px 32px 0 rgba(245,175,175,0.25)" }}
      >
        <h1 className="text-3xl font-extrabold text-pink-700 mb-2 tracking-tight" style={{ fontFamily: 'Inknut Antiqua, serif', letterSpacing: -1 }}>NOTE NINJA</h1>
        <p className="text-pink-700 text-base font-medium mb-6">Reset your password</p>
        <form className="w-full space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label htmlFor="email" className="block mb-1 text-pink-700 font-semibold text-sm">Email Address</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-base bg-white"
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
            className="w-full py-2 rounded-md text-white font-bold text-lg bg-gradient-to-r from-pink-400 to-pink-300 shadow transition hover:from-pink-500 hover:to-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-60"
            style={{ fontFamily: 'Inter, Arial, sans-serif', letterSpacing: 1 }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </motion.button>
        </form>
        <div className="w-full flex flex-col items-center mt-4 gap-2">
          <span className="text-pink-700 text-sm">Remembered your password? <a href="/signin" className="text-pink-400 font-semibold hover:text-pink-500 transition-colors">Sign in</a></span>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 