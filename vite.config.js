import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { splitVendorChunkPlugin } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  build: {
    // Reduce chunk size limit warnings
    chunkSizeWarningLimit: 1000,
    // Ensure proper asset directory structure
    assetsDir: 'assets',
    // Enable proper format detection
    target: 'es2015',
    rollupOptions: {
      output: {
        // Ensure JS files have proper extensions
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/media/[name]-[hash].${extType}`;
          }
          if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${extType}`;
          }
          return `assets/[name]-[hash].${extType}`;
        },
        // Manual chunking for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          ui: ['framer-motion', '@headlessui/react', '@heroicons/react'],
          icons: ['react-icons/fi', 'lucide-react']
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