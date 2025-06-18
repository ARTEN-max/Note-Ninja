import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

// Cache keys
const getLikeCountCacheKey = (courseCode) => `likeCount_${courseCode}`;
const getUserLikesCacheKey = (userId) => `userLikes_${userId}`;

export async function getLikeCount(courseCode) {
  if (!courseCode || typeof courseCode !== 'string') return 0;
  // Check cache first
  const cached = localStorage.getItem(getLikeCountCacheKey(courseCode));
  if (cached !== null) {
    return parseInt(cached);
  }
  
  // Fetch from Firebase
  const docRef = doc(db, 'courseLikes', courseCode);
  const docSnap = await getDoc(docRef);
  const count = docSnap.exists() ? docSnap.data().count || 0 : 0;
  
  // Cache the result
  localStorage.setItem(getLikeCountCacheKey(courseCode), count.toString());
  return count;
}

export async function getUserLikes(userId) {
  // Check cache first
  const cached = localStorage.getItem(getUserLikesCacheKey(userId));
  if (cached !== null) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // If cache is corrupted, remove it
      localStorage.removeItem(getUserLikesCacheKey(userId));
    }
  }
  
  // Fetch from Firebase
  const docRef = doc(db, 'userLikes', userId);
  const docSnap = await getDoc(docRef);
  const likedCourses = docSnap.exists() ? docSnap.data().likedCourses || [] : [];
  
  // Cache the result
  localStorage.setItem(getUserLikesCacheKey(userId), JSON.stringify(likedCourses));
  return likedCourses;
}

export async function toggleLike(courseCode, userId, liked) {
  try {
    // Get current user likes from cache first
    const cached = localStorage.getItem(getUserLikesCacheKey(userId));
    let likedCourses = [];
    if (cached !== null) {
      try {
        likedCourses = JSON.parse(cached);
      } catch (e) {
        // If cache is corrupted, fetch from Firebase
        const userDoc = await getDoc(doc(db, 'userLikes', userId));
        likedCourses = userDoc.exists() ? userDoc.data().likedCourses || [] : [];
      }
    } else {
      // Fetch from Firebase if no cache
      const userDoc = await getDoc(doc(db, 'userLikes', userId));
      likedCourses = userDoc.exists() ? userDoc.data().likedCourses || [] : [];
    }
    
    if (liked) {
      // Unlike
      likedCourses = likedCourses.filter(code => code !== courseCode);
    } else {
      // Like
      if (!likedCourses.includes(courseCode)) {
        likedCourses.push(courseCode);
      }
    }
    
    // Update cache immediately
    localStorage.setItem(getUserLikesCacheKey(userId), JSON.stringify(likedCourses));
    
    // Update Firebase in background (non-blocking)
    setDoc(doc(db, 'userLikes', userId), { likedCourses }, { merge: true }).catch(console.error);
    
    // Update like count in background
    const currentCount = parseInt(localStorage.getItem(getLikeCountCacheKey(courseCode)) || '0');
    const newCount = liked ? Math.max(0, currentCount - 1) : currentCount + 1;
    localStorage.setItem(getLikeCountCacheKey(courseCode), newCount.toString());
    
    // Update Firebase count in background
    const courseDocRef = doc(db, 'courseLikes', courseCode);
    if (liked) {
      updateDoc(courseDocRef, { count: increment(-1) }).catch(console.error);
    } else {
      updateDoc(courseDocRef, { count: increment(1) }).catch(console.error);
    }
    
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

export function listenLikeCount(courseCode, callback) {
  const docRef = doc(db, 'courseLikes', courseCode);
  return onSnapshot(docRef, (docSnap) => {
    const count = docSnap.exists() ? docSnap.data().count || 0 : 0;
    // Update cache when Firebase changes
    localStorage.setItem(getLikeCountCacheKey(courseCode), count.toString());
    callback(count);
  });
}

export function listenUserLikes(userId, callback) {
  const docRef = doc(db, 'userLikes', userId);
  return onSnapshot(docRef, (docSnap) => {
    const likedCourses = docSnap.exists() ? docSnap.data().likedCourses || [] : [];
    // Update cache when Firebase changes
    localStorage.setItem(getUserLikesCacheKey(userId), JSON.stringify(likedCourses));
    callback(likedCourses);
  });
}
