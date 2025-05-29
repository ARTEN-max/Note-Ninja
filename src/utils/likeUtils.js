import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

export async function getLikeCount(courseCode) {
  const docRef = doc(db, 'courseLikes', courseCode);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().count || 0 : 0;
}

export async function getUserLikes(userId) {
  const docRef = doc(db, 'userLikes', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().likedCourses || [] : [];
}

export async function toggleLike(courseCode, userId, liked) {
  const userDocRef = doc(db, 'userLikes', userId);
  const courseDocRef = doc(db, 'courseLikes', courseCode);
  // Get current user likes
  const userDoc = await getDoc(userDocRef);
  let likedCourses = userDoc.exists() ? userDoc.data().likedCourses || [] : [];
  if (liked) {
    // Unlike
    likedCourses = likedCourses.filter(code => code !== courseCode);
    await setDoc(userDocRef, { likedCourses }, { merge: true });
    await updateDoc(courseDocRef, { count: increment(-1) });
  } else {
    // Like
    if (!likedCourses.includes(courseCode)) {
      likedCourses.push(courseCode);
      await setDoc(userDocRef, { likedCourses }, { merge: true });
      await updateDoc(courseDocRef, { count: increment(1) });
    }
  }
}

export function listenLikeCount(courseCode, callback) {
  const docRef = doc(db, 'courseLikes', courseCode);
  return onSnapshot(docRef, (docSnap) => {
    callback(docSnap.exists() ? docSnap.data().count || 0 : 0);
  });
}

export function listenUserLikes(userId, callback) {
  const docRef = doc(db, 'userLikes', userId);
  return onSnapshot(docRef, (docSnap) => {
    callback(docSnap.exists() ? docSnap.data().likedCourses || [] : []);
  });
}
