import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
// @ts-ignore
import firebaseConfigJSON from '../../firebase-applet-config.json';

const getFirebaseConfig = () => {
  const envConfig = process.env.VITE_FIREBASE_CONFIG;
  if (envConfig) {
    try {
      return JSON.parse(envConfig);
    } catch (e) {
      console.error("Failed to parse VITE_FIREBASE_CONFIG environment variable", e);
    }
  }
  return firebaseConfigJSON;
};

let app;
let db: any;
let auth: any;

try {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey) {
    throw new Error("Invalid Firebase configuration. Please check VITE_FIREBASE_CONFIG.");
  }
  app = initializeApp(config);
  db = getFirestore(app, config.firestoreDatabaseId);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // We'll export dummy/throwing versions or just handle it in components
}

export { db, auth };

// Connectivity check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network.");
    }
  }
}
testConnection();
