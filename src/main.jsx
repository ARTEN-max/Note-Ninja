import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import performanceMonitor from "./utils/performanceMonitor";
import imageOptimizer from "./utils/imageOptimizer";

// Initialize performance monitoring
performanceMonitor;

// Preload critical resources
if (typeof window !== 'undefined') {
  // Preload critical images
  imageOptimizer.preloadCriticalImages();
  
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap';
  fontLink.as = 'style';
  document.head.appendChild(fontLink);
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