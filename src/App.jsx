import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import NoteDashboard from "./components/NoteDashboard";
import SignIn from "./SignIn";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import StudentInfoPage from "./StudentInfoPage";
import BrowsePage from "./BrowsePage";
import DownloadNotesPage from "./DownloadNotesPage";
import UploadPage from "./UploadPage";
import MyNotesPage from "./MyNotesPage";
import CramModePage from "./CramModePage";
import DeepDivePage from "./DeepDivePage";
import ExamReviewPage from "./ExamReviewPage";
import QuickRecapPage from "./QuickRecapPage";
import NightOwlPage from "./NightOwlPage";
import ChillReviewPage from "./ChillReviewPage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function PlaceholderPage() {
  return <div style={{ fontSize: 32, textAlign: 'center', marginTop: 100 }}>Placeholder Page</div>;
}

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);
  const [studentInfoChecked, setStudentInfoChecked] = useState(false);
  const [hasStudentInfo, setHasStudentInfo] = useState(true);
  const location = useLocation();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if student info exists
        const docRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(docRef);
        setHasStudentInfo(docSnap.exists());
        setStudentInfoChecked(true);
      } else {
        setStudentInfoChecked(true);
      }
    });
    return () => unsubscribe();
  }, []);
  if (user === undefined || !studentInfoChecked) return <div style={{textAlign:'center',marginTop:100}}>Loading...</div>;
  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />;
  if (!hasStudentInfo && location.pathname !== "/student-info") return <Navigate to="/student-info" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const showSidebar = !['/signin', '/register', '/student-info'].includes(location.pathname);
  const showMinimize = location.pathname !== "/";
  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100vw", background: "linear-gradient(to bottom, rgb(251, 207, 232), rgb(249, 168, 212))" }}>
      {showSidebar && <Sidebar showMinimize={showMinimize} />}
      <div className="w-full md:ml-[240px]" style={{ width: '100%' }}>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/student-info" element={<StudentInfoPage />} />
          <Route path="/download/:id" element={<DownloadNotesPage />} />
          <Route path="/cram-mode" element={<CramModePage />} />
          <Route path="/deep-dive" element={<DeepDivePage />} />
          <Route path="/exam-review" element={<ExamReviewPage />} />
          <Route path="/quick-recap" element={<QuickRecapPage />} />
          <Route path="/night-owl" element={<NightOwlPage />} />
          <Route path="/chill-review" element={<ChillReviewPage />} />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/placeholder"
            element={
              <ProtectedRoute>
                <PlaceholderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <BrowsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-notes"
            element={
              <ProtectedRoute>
                <MyNotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "1rem 2rem 2rem 2rem", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <NoteDashboard />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App; 