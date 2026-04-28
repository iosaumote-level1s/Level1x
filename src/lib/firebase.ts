import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
// @ts-ignore
import firebaseConfigJSON from '../../firebase-applet-config.json';

const getFirebaseConfig = () => {
  // Try import.meta.env first (standard Vite)
  // We use a safe check for import.meta.env as it might not be available in all envs
  const metaConfig = (typeof import.meta !== 'undefined' && import.meta.env) 
    ? import.meta.env.VITE_FIREBASE_CONFIG 
    : undefined;
  
  // Try process.env (injected via vite.config.ts define or polyfilled)
  const processConfig = (typeof process !== 'undefined' && process.env) 
    ? process.env.VITE_FIREBASE_CONFIG 
    : undefined;

  const configStr = metaConfig || processConfig;

  if (configStr) {
    // If it's already an object (sometimes Vite/infrastructure does this)
    if (typeof configStr === 'object' && configStr !== null) {
      return configStr;
    }
    
    if (typeof configStr === 'string') {
      const trimmed = configStr.trim();
      
      // If it's the dreaded "[object Object]" string
      if (trimmed.startsWith('[object')) {
        console.warn("VITE_FIREBASE_CONFIG is '[object Object]'. Falling back to local config.");
        return firebaseConfigJSON;
      }

      // If it's empty or invalid
      if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
        return firebaseConfigJSON;
      }

      // If it looks like a JSON object, try parsing it
      if (trimmed.startsWith('{')) {
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          console.error("Failed to parse VITE_FIREBASE_CONFIG as JSON string", e);
        }
      }

      // Handle potential double stringification
      try {
        const firstParse = JSON.parse(configStr);
        if (typeof firstParse === 'object' && firstParse !== null) {
          return firstParse;
        }
        if (typeof firstParse === 'string' && firstParse.trim().startsWith('{')) {
          return JSON.parse(firstParse);
        }
      } catch (e) {
        // If it was just a regular string that didn't start with '{', it might not be JSON
        // We only log if it seems like it should have been.
        if (trimmed.startsWith('{') || trimmed.startsWith('"')) {
          console.error("Failed to parse VITE_FIREBASE_CONFIG environment variable", e);
        }
      }
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
