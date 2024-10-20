import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, push, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { School, Message } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('Firebase config:', firebaseConfig);

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

export const getSchoolsData = async (): Promise<School[]> => {
  const schoolsRef = ref(db, 'schools');
  try {
    const snapshot = await get(schoolsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.entries(data).map(([id, school]: [string, any]) => ({
        id,
        name: school.name,
        email: school.email,
        candidates: school.candidates
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching schools data:', error);
    throw error;
  }
};

export const listenToSchoolsData = (callback: (schools: School[], error: Error | null) => void) => {
  const schoolsRef = ref(db, 'schools');
  console.log('Listening to schools data...');
  const listener = onValue(schoolsRef, 
    (snapshot) => {
      const data = snapshot.val();
      console.log('Raw data from Firebase:', data);
      if (data) {
        const schoolsArray: School[] = Object.entries(data).map(([id, school]: [string, any]) => ({
          id,
          name: school.name,
          email: school.email,
          candidates: school.candidates
        }));
        console.log('Processed schools data:', schoolsArray);
        callback(schoolsArray, null);
      } else {
        console.log('No data available');
        callback([], null);
      }
    }, 
    (error) => {
      console.error('Error fetching schools data:', error);
      callback([], error);
    }
  );

  return () => {
    console.log('Unsubscribing from schools data');
    off(schoolsRef, 'value', listener);
  };
};

export const updateCandidates = async (schoolId: string, updatedCandidates: School['candidates']) => {
  const schoolRef = ref(db, `schools/${schoolId}/candidates`);
  try {
    await set(schoolRef, updatedCandidates);
    console.log('Candidates updated successfully');
  } catch (error) {
    console.error('Error updating candidates:', error);
    throw error;
  }
};

export const sendMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
  const messagesRef = ref(db, 'messages');
  return push(messagesRef, {
    ...message,
    timestamp: Date.now()
  });
};