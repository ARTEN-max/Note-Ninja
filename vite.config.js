import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          ui: ['framer-motion', 'react-icons', 'lucide-react', '@headlessui/react'],
          routing: ['react-router-dom'],
          utils: ['react-window'],
          analytics: ['@vercel/analytics/react', '@vercel/speed-insights/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        toplevel: true
      }
    },
    sourcemap: false,
    target: 'es2019',
    cssCodeSplit: true,
    reportCompressedSize: true,
    assetsInlineLimit: 4096
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'firebase/app', 
      'firebase/auth', 
      'firebase/firestore', 
      'firebase/storage', 
      'framer-motion',
      'react-router-dom',
      'react-icons',
      'lucide-react',
      '@headlessui/react'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg', '**/*.webp'],
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: filename }
      } else {
        return { relative: true }
      }
    }
  },
  define: {
    __DEV__: false
  }
}) 