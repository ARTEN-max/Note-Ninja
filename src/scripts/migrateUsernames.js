import { db } from '../firebase.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const migrateUsernames = async () => {
  try {
    console.log('Starting username migration...');
    const studentsRef = collection(db, 'students');
    const snapshot = await getDocs(studentsRef);
    
    for (const userDoc of snapshot.docs) {
      const data = userDoc.data();
      if (data.username && !data.displayUsername) {
        console.log(`Migrating username for user ${userDoc.id}...`);
        await updateDoc(doc(db, 'students', userDoc.id), {
          username: data.username.toLowerCase(),
          displayUsername: data.username
        });
        console.log(`Successfully migrated username for user ${userDoc.id}`);
      }
    }
    
    console.log('Username migration completed successfully!');
  } catch (error) {
    console.error('Error during username migration:', error);
  }
};

export default migrateUsernames; 