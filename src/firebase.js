import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// import { getPerformance } from "firebase/performance";

const firebaseConfig = {
    apiKey: "AIzaSyDnGj_3XAolFqcAWcPKpnaA35DAXizDkbg",
    authDomain: "note-ninja-856f6.firebaseapp.com",
    projectId: "note-ninja-856f6",
    storageBucket: "note-ninja-856f6.appspot.com",
    messagingSenderId: "339566291830",
    appId: "1:339566291830:web:6b45d2864ef5e5ec4ea857",
    measurementId: "G-81P446BR61"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Primary storage: user's specified bucket
export const storage = getStorage(app, 'gs://note-ninja-856f6.firebasestorage.app');
// Fallback storage: original default bucket used historically
export const storageFallback = getStorage(app, 'gs://note-ninja-856f6.appspot.com');
// export const perf = getPerformance(app); 