import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import type { DispatchOrder, OrderStatus } from './types/order';
import {
  saveLocalOrder,
  getLocalOrders,
  updateLocalOrderStatus,
} from './services/orderStorage';

// Authorized admin email
export const OWNER_EMAIL = 'torqmaxautoaccessories@gmail.com';

// User's Firebase Project Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB8gLHP4myHvvOIXiu627pU_7K2nA4v3hc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'torqmax-90fa1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'torqmax-90fa1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'torqmax-90fa1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '109232828307',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:109232828307:web:7cefa45f58ee7994aac266',
  measurementId: 'G-DF7B2HLB45',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('Firebase initialization error, using local fallback:', err);
  }
}

export { auth, db };

export interface AdminUser {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  uid?: string;
}

/**
 * Subscribe to authentication state changes
 */
export const subscribeToAuthChanges = (
  callback: (user: AdminUser | null) => void,
): (() => void) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const isOwner = (firebaseUser.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase();
        const userData: AdminUser = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid,
        };

        // Sync customer record to Firestore in background
        if (db) {
          try {
            await setDoc(
              doc(db, 'customers', firebaseUser.uid),
              {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: isOwner ? 'owner' : 'customer',
                lastSeenAt: new Date().toISOString(),
              },
              { merge: true },
            );
          } catch (syncErr) {
            console.warn('Customer record sync notice:', syncErr);
          }
        }

        callback(userData);
      } else {
        callback(getSavedAuthUser());
      }
    });
  } else {
    callback(getSavedAuthUser());
    return () => {};
  }
};

/**
 * Sign in with Google.
 * Uses Firebase GoogleAuthProvider popup.
 * Automatically saves customer profile to Firestore 'customers' collection.
 */
export const signInWithGoogle = async (): Promise<{
  user: AdminUser;
  isOwner: boolean;
}> => {
  if (isFirebaseConfigured && auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || '';
      const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
      const user: AdminUser = {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      };

      // Non-blocking background Firestore sync with 2.5s safety timeout
      if (db) {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500),
        );
        Promise.race([
          setDoc(
            doc(db, 'customers', result.user.uid),
            {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              role: isOwner ? 'owner' : 'customer',
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true },
          ),
          timeoutPromise,
        ]).catch(dbErr => {
          console.warn('Firestore customer save notice (background):', dbErr);
        });
      }

      if (isOwner) {
        localStorage.setItem('torqmax_demo_auth', JSON.stringify(user));
      }
      return { user, isOwner };
    } catch (popupErr: any) {
      console.warn('Google Sign-In Popup notice:', popupErr);
      throw popupErr;
    }
  }

  // Local fallback mode
  const defaultUser: AdminUser = {
    email: 'dealer@torqmax.com',
    displayName: 'B2B Partner',
    photoURL: null,
    uid: 'local_partner',
  };
  return {
    user: defaultUser,
    isOwner: false,
  };
};

export const signOutAdmin = async (): Promise<void> => {
  if (isFirebaseConfigured && auth) {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  }
  localStorage.removeItem('torqmax_demo_auth');
};

export const getSavedAuthUser = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem('torqmax_demo_auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Save an order to both Firestore (if available) and localStorage
 */
export const recordDispatchOrder = async (order: DispatchOrder): Promise<void> => {
  // Always persist locally first so order is immediately secure
  saveLocalOrder(order);

  if (isFirebaseConfigured && db) {
    try {
      const orderRef = doc(db, 'orders', order.id);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 2500),
      );
      await Promise.race([setDoc(orderRef, order), timeoutPromise]);
    } catch (err) {
      console.warn('Could not sync order to Firestore (stored safely locally):', err);
    }
  }
};

/**
 * Fetch all orders from Firestore, merged with local storage so no orders are ever missed
 */
export const fetchDispatchOrders = async (): Promise<DispatchOrder[]> => {
  const localOrders = getLocalOrders();
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 2500),
      );
      const snapshot = await Promise.race([getDocs(q), timeoutPromise]);
      if (!snapshot.empty) {
        const firestoreOrders: DispatchOrder[] = [];
        snapshot.forEach(d => firestoreOrders.push(d.data() as DispatchOrder));

        // Merge orders by ID so both cloud & local orders are completely preserved
        const mergedMap = new Map<string, DispatchOrder>();
        firestoreOrders.forEach(o => mergedMap.set(o.id, o));
        localOrders.forEach(o => {
          if (!mergedMap.has(o.id)) mergedMap.set(o.id, o);
        });

        return Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }
    } catch (err) {
      console.warn('Firestore fetch notice (using local orders):', err);
    }
  }
  return localOrders;
};

/**
 * Update an order's status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<DispatchOrder[]> => {
  const updatedList = updateLocalOrderStatus(orderId, status);

  if (isFirebaseConfigured && db) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 2500),
      );
      await Promise.race([
        updateDoc(orderRef, {
          status,
          dispatchDate: status === 'dispatched' ? new Date().toISOString() : undefined,
        }),
        timeoutPromise,
      ]);
    } catch (err) {
      console.warn('Failed to update status in Firestore:', err);
    }
  }

  return updatedList;
};

export interface RegisteredCustomer {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone?: string | null;
  photoURL: string | null;
  role: 'owner' | 'customer';
  lastLoginAt?: string;
  lastSeenAt?: string;
}

/**
 * Fetch all registered customers from Firestore
 */
export const fetchRegisteredCustomers = async (): Promise<RegisteredCustomer[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'customers'));
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 2500),
      );
      const snapshot = await Promise.race([getDocs(q), timeoutPromise]);
      if (!snapshot.empty) {
        const list: RegisteredCustomer[] = [];
        snapshot.forEach(d => list.push(d.data() as RegisteredCustomer));
        return list;
      }
    } catch (err) {
      console.warn('Firestore fetchRegisteredCustomers notice:', err);
    }
  }
  return [];
};
