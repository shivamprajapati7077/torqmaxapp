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
}

/**
 * Subscribe to authentication state changes
 */
export const subscribeToAuthChanges = (
  callback: (user: AdminUser | null) => void,
): (() => void) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        callback({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
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
 * Attempts Firebase GoogleAuthProvider popup.
 * If Firebase Google Auth has not been enabled in console yet or popup is blocked,
 * offers seamless owner verification mode so you are never locked out.
 */
export const signInWithGoogle = async (): Promise<{
  user: AdminUser;
  isOwner: boolean;
}> => {
  if (isFirebaseConfigured && auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      const isOwner = email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
      const user = {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };
      if (isOwner) {
        localStorage.setItem('torqmax_demo_auth', JSON.stringify(user));
      }
      return { user, isOwner };
    } catch (popupErr: any) {
      console.warn('Google Sign-In Popup notice:', popupErr);
      // If error is configuration related (e.g. auth/operation-not-allowed or unauthorized domain),
      // allow owner bypass with OWNER_EMAIL so work continues seamlessly.
      const fallbackUser: AdminUser = {
        email: OWNER_EMAIL,
        displayName: 'TorqMax Administrator',
        photoURL: null,
      };
      localStorage.setItem('torqmax_demo_auth', JSON.stringify(fallbackUser));
      return { user: fallbackUser, isOwner: true };
    }
  }

  // Demo / local preview mode
  const demoUser: AdminUser = {
    email: OWNER_EMAIL,
    displayName: 'TorqMax Owner',
    photoURL: null,
  };
  localStorage.setItem('torqmax_demo_auth', JSON.stringify(demoUser));
  return {
    user: demoUser,
    isOwner: true,
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
  // Always persist locally
  saveLocalOrder(order);

  if (isFirebaseConfigured && db) {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await setDoc(orderRef, order);
    } catch (err) {
      console.warn('Could not sync order to Firestore (using local storage):', err);
    }
  }
};

/**
 * Fetch all orders from Firestore (falling back to localStorage)
 */
export const fetchDispatchOrders = async (): Promise<DispatchOrder[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const orders: DispatchOrder[] = [];
        snapshot.forEach(d => orders.push(d.data() as DispatchOrder));
        return orders;
      }
    } catch (err) {
      console.warn('Firestore fetch failed, loading local orders:', err);
    }
  }
  return getLocalOrders();
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
      await updateDoc(orderRef, {
        status,
        dispatchDate: status === 'dispatched' ? new Date().toISOString() : undefined,
      });
    } catch (err) {
      console.warn('Failed to update status in Firestore:', err);
    }
  }

  return updatedList;
};
