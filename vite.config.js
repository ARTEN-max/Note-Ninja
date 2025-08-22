import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { splitVendorChunkPlugin } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  build: {
    // Reduce chunk size limit warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          ui: ['framer-motion', '@headlessui/react', '@heroicons/react'],
          audio: ['react-icons/fi']
        }
      }
    },
    // Enable source maps for better debugging
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Compress assets
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    // Enable compression
    compress: true,
    // Optimize dev server
    hmr: {
      overlay: false
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'framer-motion'
    ]
  },
  // Enable legacy browser support if needed
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})