import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import performanceMonitor, { preconnectOrigins, warmRoutesWhenIdle } from "./utils/performanceMonitor";
import imageOptimizer from "./utils/imageOptimizer";

// Initialize performance tweaks (no heavy work)
performanceMonitor;

// Preconnect important origins early
if (typeof window !== 'undefined') {
  preconnectOrigins([
    'https://firebaseapp.com',
    'https://firestore.googleapis.com',
    'https://storage.googleapis.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]);
}

// Preload critical resources
if (typeof window !== 'undefined') {
  // Image preloading disabled to prevent console warnings
  // imageOptimizer.preloadCriticalImages();
  
  // Warm common routes on landing
  if (location && location.pathname === '/') {
    warmRoutesWhenIdle(['/dashboard','/browse','/audio-notes']);
  }
}

// Register service worker for caching and offline support (production only)
if ('serviceWorker' in navigator) {
  if (import.meta && import.meta.env && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  } else {
    // In development, ensure any existing service workers are unregistered
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    }).catch(() => {});
    // Also clear caches created by any prior SW
    if (window.caches && typeof window.caches.keys === 'function') {
      caches.keys().then(keys => keys.forEach(key => caches.delete(key))).catch(() => {});
    }
  }
}

// Optimize React rendering
const root = ReactDOM.createRoot(document.getElementById("root"));

// Use requestIdleCallback for better performance
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
  });
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(() => {
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
  }, 0);
} 