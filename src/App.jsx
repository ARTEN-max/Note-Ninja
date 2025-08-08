import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DownloadNotesPage from "./DownloadNotesPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import MobileNav from "./components/MobileNav";
import SetupStudyGuides from "./components/SetupStudyGuides";
import { useAuth } from "./contexts/AuthContext";
import { AudioProvider, useAudio } from './contexts/AudioContext';
import "./App.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import MiniPlayer from "./components/MiniPlayer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import imageOptimizer from "./utils/imageOptimizer";

// Lazy load components with preloading hints
const StudentInfoPage = lazy(() => import('./StudentInfoPage'));
const SignIn = lazy(() => import('./SignIn'));
const Register = lazy(() => import('./Register'));
const NoteDashboard = lazy(() => import('./components/NoteDashboard'));
const BrowsePage = lazy(() => import('./BrowsePage'));
const UploadPage = lazy(() => import('./UploadPage'));
const AudioNotesPage = lazy(() => import('./pages/AudioNotesPage'));
const MyNotesPage = lazy(() => import('./MyNotesPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const NewUserProfilePage = lazy(() => import('./pages/NewUserProfilePage'));
const CramModePage = lazy(() => import('./CramModePage'));
const DeepDivePage = lazy(() => import('./DeepDivePage'));
const ExamReviewPage = lazy(() => import('./ExamReviewPage'));
const QuickRecapPage = lazy(() => import('./QuickRecapPage'));
const NightOwlPage = lazy(() => import('./NightOwlPage'));
const ChillReviewPage = lazy(() => import('./ChillReviewPage'));
const PlaylistViewPage = lazy(() => import('./pages/PlaylistViewPage'));
const ChapterPage = lazy(() => import('./pages/ChapterPage'));
const ChapterNotesPage = lazy(() => import('./pages/ChapterNotesPage'));
const ChapterStudyCards = lazy(() => import('./pages/ChapterStudyCards'));
const StudyGuideChapters = lazy(() => import('./pages/StudyGuideChapters'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));

// Optimized loading component with skeleton
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      <div className="text-purple-600 font-medium">Loading...</div>
    </div>
  </div>
);

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
  
  if (user === undefined) return <LoadingSpinner />;
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

  // Preload critical images on app mount
  useEffect(() => {
    imageOptimizer.preloadCriticalImages();
  }, []);

  // Preload components based on current route
  useEffect(() => {
    const preloadComponents = () => {
      // Preload components based on current path
      if (location.pathname.startsWith('/browse')) {
        import('./BrowsePage');
      }
      if (location.pathname.startsWith('/audio-notes')) {
        import('./pages/AudioNotesPage');
      }
      if (location.pathname.startsWith('/my-notes')) {
        import('./MyNotesPage');
      }
      if (location.pathname.startsWith('/profile') || location.pathname.startsWith('/account')) {
        import('./pages/NewUserProfilePage');
      }
    };

    // Small delay to avoid blocking initial render
    const timer = setTimeout(preloadComponents, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="bg-sour-lavender flex flex-col md:flex-row min-h-screen w-full">
      {showSidebar && <Sidebar showMinimize={showMinimize} />}
      <div className={showSidebar ? 'w-full md:ml-[240px] transition-all duration-300' : 'w-full'} style={{ width: '100%' }}>
        <div className="px-4 md:px-0 w-full">
          <Routes>
            <Route path="/signin" element={
              <Suspense fallback={<LoadingSpinner />}>
                <SignIn />
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Register />
              </Suspense>
            } />
            <Route path="/forgot-password" element={
              <Suspense fallback={<LoadingSpinner />}>
                <ForgotPassword />
              </Suspense>
            } />
            <Route path="/student-info" element={
              <Suspense fallback={<LoadingSpinner />}>
                <StudentInfoPage />
              </Suspense>
            } />
            <Route path="/download/:id" element={<DownloadNotesPage />} />
            <Route path="/cram-mode" element={
              <Suspense fallback={<LoadingSpinner />}>
                <CramModePage />
              </Suspense>
            } />
            <Route path="/deep-dive" element={
              <Suspense fallback={<LoadingSpinner />}>
                <DeepDivePage />
              </Suspense>
            } />
            <Route path="/exam-review" element={
              <Suspense fallback={<LoadingSpinner />}>
                <ExamReviewPage />
              </Suspense>
            } />
            <Route path="/quick-recap" element={
              <Suspense fallback={<LoadingSpinner />}>
                <QuickRecapPage />
              </Suspense>
            } />
            <Route path="/night-owl" element={
              <Suspense fallback={<LoadingSpinner />}>
                <NightOwlPage />
              </Suspense>
            } />
            <Route path="/chill-review" element={
              <Suspense fallback={<LoadingSpinner />}>
                <ChillReviewPage />
              </Suspense>
            } />
            <Route
              path="/guide/:guideId/notes"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ChapterNotesPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide/:guideId/chapter/:chapterId"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ChapterStudyCards />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <UploadPage />
                  </Suspense>
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
                  <Suspense fallback={<LoadingSpinner />}>
                    <BrowsePage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-notes"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <MyNotesPage />
                  </Suspense>
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
                  <Suspense fallback={<LoadingSpinner />}>
                    <AudioNotesPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <UserProfilePage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <NewUserProfilePage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route path="/u/:username" element={
              <Suspense fallback={<LoadingSpinner />}>
                <NewUserProfilePage />
              </Suspense>
            } />
            <Route
              path="/playlist/:playlistId"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <PlaylistViewPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "1.2rem 2rem 2rem 2rem", boxSizing: "border-box" }}>
                    <Suspense fallback={<LoadingSpinner />}>
                      <NoteDashboard />
                    </Suspense>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
          <MiniPlayer />
          <Analytics />
          <SpeedInsights />
        </div>
      </div>
      {currentUser && <MobileNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </BrowserRouter>
  );
}

export default App; 