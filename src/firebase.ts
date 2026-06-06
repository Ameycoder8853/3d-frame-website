import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { FrameConfig } from './types';

let app: any = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

async function ensureFirebase() {
  if (app && db && auth) {
    return { db, auth };
  }
  
  try {
    const res = await fetch('/api/firebase-config');
    if (!res.ok) {
      throw new Error(`Failed to fetch Firebase configuration from server: ${res.statusText}`);
    }
    const firebaseConfig = await res.json();
    
    app = initializeApp(firebaseConfig);
    db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    auth = getAuth(app);
    return { db, auth };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
}

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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, authInstance: Auth | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid || null,
      email: authInstance?.currentUser?.email || null,
      emailVerified: authInstance?.currentUser?.emailVerified || null,
      isAnonymous: authInstance?.currentUser?.isAnonymous || null,
      tenantId: authInstance?.currentUser?.tenantId || null,
      providerInfo: authInstance?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function saveFrameConfig(config: FrameConfig): Promise<void> {
  const path = `frames/${config.id}`;
  const { db: firestoreDb, auth: authInstance } = await ensureFirebase();
  try {
    await setDoc(doc(firestoreDb, 'frames', config.id), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, authInstance);
  }
}

export async function loadFrameConfig(id: string): Promise<FrameConfig | null> {
  const path = `frames/${id}`;
  const { db: firestoreDb, auth: authInstance } = await ensureFirebase();
  try {
    const docSnap = await getDoc(doc(firestoreDb, 'frames', id));
    if (docSnap.exists()) {
      return docSnap.data() as FrameConfig;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path, authInstance);
  }
  return null;
}
