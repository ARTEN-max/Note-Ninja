import React, { useState } from "react";
import { motion } from "framer-motion";

const notes = [
  { id: 1, title: "CS246 - OOP Guide", desc: "Object-Oriented Programming principles and patterns." },
  { id: 2, title: "CS246 - Exam Review", desc: "Comprehensive review for the final exam." },
  { id: 3, title: "CS246 - Quick Recap", desc: "Summary of key concepts." },
];

const CramModePage = () => {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-200 to-pink-300 relative overflow-hidden">
      {/* Only one animation: Heading at the top, scales and fades in */}
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-pink-800 mt-12 mb-8"
        style={{ fontFamily: 'Inknut Antiqua, serif', textAlign: 'center', position: 'relative', zIndex: 20 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onAnimationComplete={() => setTimeout(() => setShowNotes(true), 400)}
      >
        Welcome to Cram Mode!
      </motion.h1>
      {/* Notes List */}
      {showNotes && (
        <motion.div
          className="w-full max-w-2xl mx-auto flex flex-col gap-6 mt-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 } }}
        >
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-xl shadow-md p-6 border border-pink-100">
              <div className="font-bold text-lg text-pink-800 mb-1">{note.title}</div>
              <div className="text-gray-600">{note.desc}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CramModePage;
