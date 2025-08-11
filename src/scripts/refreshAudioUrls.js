import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

// Reuse the same config as src/firebase.js without importing browser-only modules
const firebaseConfig = {
  apiKey: 'AIzaSyDnGj_3XAolFqcAWcPKpnaA35DAXizDkbg',
  authDomain: 'note-ninja-856f6.firebaseapp.com',
  projectId: 'note-ninja-856f6',
  storageBucket: 'note-ninja-856f6.appspot.com',
  messagingSenderId: '339566291830',
  appId: '1:339566291830:web:6b45d2864ef5e5ec4ea857',
  measurementId: 'G-81P446BR61'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

function normalizeUrl(url) {
  if (!url) return url;
  return url.replace(/\.firebasestorage\.app/gi, '.appspot.com');
}

function extractPathFromUrl(url) {
  try {
    const fixed = normalizeUrl(url);
    const oIndex = fixed.indexOf('/o/');
    if (oIndex === -1) return null;
    const afterO = fixed.substring(oIndex + 3);
    const pathEncoded = afterO.split('?')[0];
    return decodeURIComponent(pathEncoded);
  } catch {
    return null;
  }
}

async function resolveFreshUrl(urlOrPath) {
  // Try path first if it looks like a path
  try {
    if (urlOrPath && !urlOrPath.startsWith('http')) {
      const r = storageRef(storage, urlOrPath);
      return await getDownloadURL(r);
    }
  } catch (_) {}

  // Try URL directly as a ref
  try {
    const r2 = storageRef(storage, urlOrPath);
    return await getDownloadURL(r2);
  } catch (_) {}

  // Try extracting path from URL
  const path = extractPathFromUrl(urlOrPath);
  if (path) {
    const r3 = storageRef(storage, path);
    return await getDownloadURL(r3);
  }
  throw new Error('Could not resolve fresh URL');
}

async function main() {
  const snap = await getDocs(collection(db, 'audioNotes'));
  let updated = 0;
  let failed = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const current = data.audioUrl || data.url || '';
    if (!current) continue;
    try {
      const fresh = await resolveFreshUrl(current);
      const normalizedFresh = normalizeUrl(fresh);
      const normalizedCurrent = normalizeUrl(current);
      if (normalizedFresh && normalizedFresh !== normalizedCurrent) {
        await updateDoc(doc(db, 'audioNotes', d.id), {
          audioUrl: normalizedFresh,
          url: normalizedFresh,
          updatedAt: new Date().toISOString()
        });
        updated++;
        console.log(`[UPDATED] ${d.id}`);
      }
    } catch (e) {
      failed++;
      console.warn(`[SKIP] ${d.id} -> ${e.message}`);
    }
  }
  console.log(`Done. Updated: ${updated}, Failed: ${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
