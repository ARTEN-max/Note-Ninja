import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
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

// Register service worker for caching and offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
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