import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDnGj_3XAolFqcAWcPKpnaA35DAXizDkbg",
    authDomain: "note-ninja-856f6.firebaseapp.com",
    projectId: "note-ninja-856f6",
    storageBucket: "note-ninja-856f6.firebasestorage.app",
    messagingSenderId: "339566291830",
    appId: "1:339566291830:web:6b45d2864ef5e5ec4ea857",
    measurementId: "G-81P446BR61"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage }; 