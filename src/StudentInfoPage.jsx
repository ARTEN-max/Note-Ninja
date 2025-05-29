import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const StudentInfoPage = () => {
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/signin");
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    if (!name || !faculty || !year) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    try {
      await setDoc(doc(db, "students", user.uid), {
        name,
        faculty,
        year,
        uid: user.uid,
        email: user.email,
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError("Failed to save info. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-200 to-pink-300">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl flex flex-col items-center px-8 py-10 border border-pink-100">
        <h1 className="text-3xl font-extrabold text-pink-700 mb-2 tracking-tight text-center font-inknut" style={{ fontFamily: 'Inknut Antiqua, serif', letterSpacing: -1 }}>Student Info</h1>
        <p className="text-pink-700 text-base font-medium mb-6 text-center">Please complete your profile to continue</p>
        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit} autoComplete="off">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-[#8f3a3a] font-semibold text-base">Name</label>
            <input
              id="name"
              type="text"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 text-base bg-white placeholder-gray-400"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="faculty" className="text-[#8f3a3a] font-semibold text-base">Faculty</label>
            <div className="relative">
              <select
                id="faculty"
                className="w-full px-5 py-3 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 text-base bg-white appearance-none shadow-sm transition focus:border-pink-400 focus:bg-pink-50"
                value={faculty}
                onChange={e => setFaculty(e.target.value)}
                required
                disabled={loading}
              >
                <option value="" disabled>Select your faculty</option>
                <option value="Arts">Arts</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Environment">Environment</option>
                <option value="Health">Health</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="year" className="text-[#8f3a3a] font-semibold text-base">Year of Study</label>
            <input
              id="year"
              type="text"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 text-base bg-white placeholder-gray-400"
              placeholder="e.g. 1, 2, 3, 4"
              value={year}
              onChange={e => setYear(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center mt-2">Saved! Redirecting...</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-lg bg-[#e9a9a9] shadow transition hover:bg-[#e48b8b] focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-60 mt-2"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentInfoPage; 