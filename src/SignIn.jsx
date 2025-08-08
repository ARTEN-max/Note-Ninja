import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from && location.state.from.pathname) ? location.state.from.pathname : '/dashboard';
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
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message.replace("Firebase:", "").replace("(auth/", "").replace(")", "").trim());
      setLoading(false);
    }
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
            <p className="title" style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#7E44A3' }}>SIGN IN</p>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div className="form_group" style={{ marginBottom: '0.75rem' }}>
                <label className="sub_title" htmlFor="email" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Email</label>
                <input
                  placeholder="Enter your email"
                  className="form_style"
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form_group" style={{ marginBottom: '0.75rem' }}>
                <label className="sub_title" htmlFor="password" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Password</label>
                <input
                  placeholder="Enter your password"
                  className="form_style"
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.95rem' }}
                />
              </div>
              <button 
                className="btn bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white font-bold" 
                type="submit" 
                disabled={loading}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                  marginBottom: '0.75rem',
                  boxShadow: '0 2px 16px #e3b8f9'
                }}
              >
                {loading ? "Signing In..." : "SIGN IN"}
              </button>
              {error && <div style={{ color: "red", marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
              <div style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span 
                  onClick={() => navigate("/forgot")}
                  style={{ 
                    color: '#5E2A84',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot Password?
                </span>
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.9rem', margin: 0 }}>
                Don't have an account?{" "}
                <span 
                  onClick={() => navigate("/register")}
                  style={{ 
                    color: '#5E2A84',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Sign Up Here!
                </span>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn; 