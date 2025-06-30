import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./Register.css";
import { motion } from "framer-motion";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    let threeScript = null;
    let vantaScript = null;

    const initVanta = () => {
      if (window.VANTA && window.THREE && !vantaEffect.current && vantaRef.current) {
        try {
          vantaEffect.current = window.VANTA.BIRDS({
            el: vantaRef.current,
            THREE: window.THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            backgroundColor: 0xe3b8f9,
            color1: 0xb266ff,
            color2: 0x8a2be2,
            colorMode: "variance",
            birdSize: 1.50,
            wingSpan: 20.00,
            speedLimit: 3.00,
            separation: 50.00,
            alignment: 5.00,
            cohesion: 5.00,
            quantity: 3.00
          });
        } catch (error) {
          console.error("Error initializing Vanta effect:", error);
        }
      }
    };

    // Load THREE.js first
    threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
    threeScript.async = true;
    threeScript.onload = () => {
      // After THREE.js loads, load Vanta
      vantaScript = document.createElement('script');
      vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.birds.min.js';
      vantaScript.async = true;
      vantaScript.onload = initVanta;
      document.body.appendChild(vantaScript);
    };
    document.body.appendChild(threeScript);

    // Cleanup function
    return () => {
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (error) {
          console.error("Error destroying Vanta effect:", error);
        }
      }
      // Remove scripts
      if (threeScript && threeScript.parentNode) {
        threeScript.parentNode.removeChild(threeScript);
      }
      if (vantaScript && vantaScript.parentNode) {
        vantaScript.parentNode.removeChild(vantaScript);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save the user's username and email to Firestore
      await setDoc(doc(db, "students", user.uid), {
        username: username.toLowerCase(),
        displayUsername: username,
        email: user.email,
        uid: user.uid,
      });

      // Redirect to dashboard or home page
      navigate("/");
    } catch (err) {
      setError(err.message.replace("Firebase:", "").replace("(auth/", "").replace(")", "").trim());
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(to bottom, #e3b8f9, #c895f2)'
    }}>
      <div 
        ref={vantaRef} 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'transparent'
        }} 
      />
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        padding: '1rem'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#5E2A84',
            marginBottom: '1rem',
            textAlign: 'center',
            textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff'
          }} className="note-ninja-heading">
            Welcome to Note Ninja
          </h1>
          <div className="form_area" style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px 0 #e3b8f9',
            width: '100%',
            maxWidth: '25rem',
            padding: '1.5rem',
            borderRadius: '20px'
          }}>
            <p className="title" style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#7E44A3' }}>SIGN UP</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                  disabled={loading}
                  required
                />
              </div>
              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white font-bold text-lg mt-4 shadow-lg hover:from-[#a259e6] hover:to-[#7c1fa2] transition-colors"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "SIGN UP"}
              </button>
              {error && <div style={{ color: "red", marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
              <p style={{ textAlign: 'center', fontSize: '0.9rem', margin: 0 }}>
                Have an Account?{" "}
                <span className="link" onClick={() => navigate("/signin")}
                  style={{ 
                    color: '#5E2A84',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}>Login Here!</span>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register; 