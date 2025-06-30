import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
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
import ChapterStudyCards from "./pages/ChapterStudyCards";
import ChapterNotesPage from "./pages/ChapterNotesPage";
import AudioNotesPage from "./pages/AudioNotesPage";
import UserProfilePage from "./pages/UserProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import MobileNav from "./components/MobileNav";
import SetupStudyGuides from "./components/SetupStudyGuides";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AudioProvider, useAudio } from './contexts/AudioContext';
import "./App.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import MiniPlayer from "./components/MiniPlayer";
import NewUserProfilePage from "./pages/NewUserProfilePage";
import PlaylistViewPage from "./pages/PlaylistViewPage";
import { Analytics } from "@vercel/analytics/react";

function PlaceholderPage() {
  return <div style={{ fontSize: 32, textAlign: 'center', marginTop: 100 }}>Placeholder Page</div>;
}

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);
  const location = useLocation();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
  if (user === undefined) return <div style={{textAlign:'center',marginTop:100}}>Loading...</div>;
  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />;
  return children;
}

function RedirectToAccountProfile() {
  const { username } = useParams();
  return <Navigate to={`/account?username=${username}`} replace />;
}

function AppContent() {
  const location = useLocation();
  const { currentAudio } = useAudio();
  const { currentUser } = useAuth();
  const showSidebar = !['/signin', '/register', '/student-info'].includes(location.pathname);
  const showMinimize = location.pathname !== "/";
  return (
    <div className="bg-sour-lavender flex flex-col md:flex-row min-h-screen w-full">
      {showSidebar && <Sidebar showMinimize={showMinimize} />}
      <div className={showSidebar ? 'w-full md:ml-[240px] transition-all duration-300' : 'w-full'} style={{ width: '100%' }}>
        <div className="px-4 md:px-0 w-full">
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
              path="/guide/:guideId/notes"
              element={
                <ProtectedRoute>
                  <ChapterNotesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide/:guideId/chapter/:chapterId"
              element={
                <ProtectedRoute>
                  <ChapterStudyCards />
                </ProtectedRoute>
              }
            />
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
              path="/setup-guides"
              element={
                <ProtectedRoute>
                  <SetupStudyGuides />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audio-notes"
              element={
                <ProtectedRoute>
                  <AudioNotesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <NewUserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/u/:username" element={<NewUserProfilePage />} />
            <Route
              path="/playlist/:playlistId"
              element={
                <ProtectedRoute>
                  <PlaylistViewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "1.2rem 2rem 2rem 2rem", boxSizing: "border-box" }}>
                    <NoteDashboard />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
          {currentUser && currentAudio && <MiniPlayer />}
          <Analytics />
        </div>
      </div>
      {currentUser && <MobileNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 