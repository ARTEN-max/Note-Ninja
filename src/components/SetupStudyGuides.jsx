import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import studyGuides from "../data/studyGuides";

export default function SetupStudyGuides() {
  const [status, setStatus] = useState("");

  const handleSetup = async () => {
    setStatus("Setting up...");
    try {
      for (const guide of studyGuides) {
        const guideRef = doc(db, "studyGuides", guide.courseCode);
        await setDoc(guideRef, {
          courseCode: guide.courseCode,
          title: guide.title,
          description: guide.description,
          imageUrl: guide.imageUrl,
        });
      }
      setStatus("Study guides set up successfully!");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Setup Study Guides</h2>
      <button
        onClick={handleSetup}
        style={{
          padding: "12px 32px",
          background: "#c2185b",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        Create Study Guides in Firestore
      </button>
      <div style={{ marginTop: 16, color: "#880E4F", fontWeight: "bold" }}>{status}</div>
    </div>
  );
} 