import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./Register.css"; // Reuse the same styles
import { motion } from "framer-motion";

const StudentInfoPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate("/signin");
      } else {
        setUser(u);
        // Fetch existing student info
        const docRef = doc(db, "students", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setUsername(data.username || "");
          setFaculty(data.faculty || "");
          setYear(data.year || "");
        }
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    if (!faculty || !year || !username) {
      setError("Faculty, year of study, and username are required.");
      setLoading(false);
      return;
    }
    try {
      // Store username in lowercase for consistent searching
      await setDoc(doc(db, "students", user.uid), {
        name,
        username: username.toLowerCase(),
        displayUsername: username, // Keep original case for display
        faculty,
        year,
        uid: user.uid,
        email: user.email,
      }, { merge: true });
      setSuccess(true);
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError("Failed to save info. Please try again.");
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
            <p className="title" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Complete Your Profile</p>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div className="form_group" style={{ marginBottom: '0.75rem' }}>
                <label className="sub_title" htmlFor="name" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Name</label>
                <input
                  placeholder="Enter your full name"
                  className="form_style"
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form_group" style={{ marginBottom: '0.75rem' }}>
                <label className="sub_title" htmlFor="username" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Username</label>
                <input
                  placeholder="Enter your username"
                  className="form_style"
                  type="text"
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form_group" style={{ marginBottom: '0.75rem' }}>
                <label className="sub_title" htmlFor="faculty" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Faculty</label>
                <select
                  id="faculty"
                  className="form_style"
                  value={faculty}
                  onChange={e => setFaculty(e.target.value)}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.95rem' }}
                >
                  <option value="" disabled>Select your faculty</option>
                  <option value="Arts">Arts</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Environment">Environment</option>
                  <option value="Health">Health</option>
                </select>
              </div>
              <div className="form_group" style={{ marginBottom: '0.75rem' }}>
                <label className="sub_title" htmlFor="year" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Year of Study</label>
                <input
                  placeholder="e.g. 1, 2, 3, 4"
                  className="form_style"
                  type="text"
                  id="year"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  required
                  disabled={loading}
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
                {loading ? "Saving..." : "Save & Continue"}
              </button>
              {error && <div style={{ color: "red", marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
              {success && <div style={{ color: "green", marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>Saved! Redirecting...</div>}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentInfoPage; 