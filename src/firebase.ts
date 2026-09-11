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

const PARTIES_STORAGE_KEY = 'torqmax_registered_parties_v2';

export interface RegisteredCustomer {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  businessName?: string | null;
  photoURL: string | null;
  role: 'owner' | 'customer';
  lastLoginAt?: string;
  lastSeenAt?: string;
}

export const getLocalRegisteredParties = (): RegisteredCustomer[] => {
  try {
    const raw = localStorage.getItem(PARTIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Firebase Realtime Database Endpoint (Guaranteed Cloud Sync for all cross-device orders & parties)
const RTDB_BASE_URL = 'https://torqmax-90fa1-default-rtdb.firebaseio.com';

export const syncOrderToRTDB = async (order: DispatchOrder): Promise<void> => {
  try {
    await fetch(`${RTDB_BASE_URL}/orders/${order.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
  } catch (err) {
    console.warn('Cloud sync (RTDB) order notice:', err);
  }
};

export const syncPartyToRTDB = async (party: RegisteredCustomer): Promise<void> => {
  try {
    const rawKey = (party.email || party.phone || party.uid).toLowerCase().trim();
    const safeKey = rawKey.replace(/[^a-zA-Z0-9_-]/g, '_');
    await fetch(`${RTDB_BASE_URL}/parties/${safeKey}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(party),
    });
  } catch (err) {
    console.warn('Cloud sync (RTDB) party notice:', err);
  }
};

export const fetchOrdersFromRTDB = async (): Promise<DispatchOrder[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${RTDB_BASE_URL}/orders.json`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    if (data && typeof data === 'object') {
      return Object.values(data).filter(
        (o: any): o is DispatchOrder => Boolean(o && typeof o === 'object' && o.id),
      );
    }
    return [];
  } catch (err) {
    console.warn('Cloud fetch (RTDB) notice:', err);
    return [];
  }
};

export const fetchPartiesFromRTDB = async (): Promise<RegisteredCustomer[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${RTDB_BASE_URL}/parties.json`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    if (data && typeof data === 'object') {
      return Object.values(data).filter(
        (p: any): p is RegisteredCustomer => Boolean(p && typeof p === 'object' && p.displayName),
      );
    }
    return [];
  } catch (err) {
    console.warn('Cloud fetch (RTDB) parties notice:', err);
    return [];
  }
};

export const saveRegisteredPartyLocally = (party: RegisteredCustomer): void => {
  try {
    const list = getLocalRegisteredParties();
    const cleanEmail = (party.email || '').toLowerCase().trim();
    const cleanPhone = (party.phone || '').replace(/\D/g, '');
    const existingIdx = list.findIndex(
      p =>
        (cleanEmail && (p.email || '').toLowerCase().trim() === cleanEmail) ||
        (cleanPhone && (p.phone || '').replace(/\D/g, '') === cleanPhone) ||
        p.uid === party.uid,
    );
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...party };
    } else {
      list.push(party);
    }
    localStorage.setItem(PARTIES_STORAGE_KEY, JSON.stringify(list));

    // Also sync to cloud Realtime Database in background
    syncPartyToRTDB(party).catch(err => console.warn('Party cloud sync notice:', err));
  } catch (err) {
    console.warn('Failed to save party locally:', err);
  }
};

/**
 * Save an order to both cloud Realtime Database, Firestore (if available), and localStorage
 */
export const recordDispatchOrder = async (order: DispatchOrder): Promise<void> => {
  // Always persist locally first so order is immediately secure
  saveLocalOrder(order);

  // Extract customer party to local parties registry and cloud
  if (order.customer) {
    const partyName =
      order.customer.businessName?.trim() ||
      order.customer.name?.trim() ||
      'B2B Partner';
    const email = order.customerEmail || null;
    const phone = order.customer.phone || null;
    const party: RegisteredCustomer = {
      uid: order.customerUid || 'party_' + ((phone || '').replace(/\D/g, '') || order.id),
      email,
      displayName: partyName,
      businessName: order.customer.businessName || null,
      phone,
      city: order.customer.city || null,
      state: order.customer.state || null,
      photoURL: null,
      role: (email || '').toLowerCase() === OWNER_EMAIL.toLowerCase() ? 'owner' : 'customer',
      lastLoginAt: order.createdAt,
      lastSeenAt: order.createdAt,
    };
    saveRegisteredPartyLocally(party);
  }

  // 1. Cloud Sync via Firebase Realtime Database (guaranteed delivery)
  await syncOrderToRTDB(order);

  // 2. Background Firestore attempt if configured
  if (isFirebaseConfigured && db) {
    setDoc(doc(db, 'orders', order.id), order).catch(err => {
      console.warn('Firestore order sync notice (synced to RTDB):', err);
    });
  }
};

/**
 * Fetch all orders from Cloud (RTDB + local cache), with instant response
 */
export const fetchDispatchOrders = async (): Promise<DispatchOrder[]> => {
  const mergedMap = new Map<string, DispatchOrder>();

  // 1. First add local cached orders
  const localOrders = getLocalOrders();
  localOrders.forEach(o => {
    if (o && o.id) mergedMap.set(o.id, o);
  });

  // 2. Fetch all cloud orders from Firebase Realtime Database
  const rtdbOrders = await fetchOrdersFromRTDB();
  rtdbOrders.forEach(o => {
    if (o && o.id) {
      mergedMap.set(o.id, o);
      // Cache into local storage
      saveLocalOrder(o);
    }
  });

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

/**
 * Update an order's status across local storage, RTDB, and Firestore
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<DispatchOrder[]> => {
  const updatedList = updateLocalOrderStatus(orderId, status);
  const dispatchDate = status === 'dispatched' ? new Date().toISOString() : undefined;

  // Cloud status update via RTDB
  try {
    await fetch(`${RTDB_BASE_URL}/orders/${orderId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        ...(dispatchDate ? { dispatchDate } : {}),
      }),
    });
  } catch (err) {
    console.warn('Failed to update status in RTDB:', err);
  }

  // Background Firestore update if configured
  if (isFirebaseConfigured && db) {
    updateDoc(doc(db, 'orders', orderId), {
      status,
      ...(dispatchDate ? { dispatchDate } : {}),
    }).catch(err => {
      console.warn('Failed to update status in Firestore:', err);
    });
  }

  return updatedList;
};

/**
 * Fetch all registered customers and B2B parties from Cloud, local registry, and orders
 */
export const fetchRegisteredCustomers = async (
  currentOrders?: DispatchOrder[],
): Promise<RegisteredCustomer[]> => {
  const mergedMap = new Map<string, RegisteredCustomer>();

  // 1. Load locally registered parties
  const localParties = getLocalRegisteredParties();
  localParties.forEach(p => {
    const key = (p.email || p.phone || p.uid).toLowerCase().trim();
    mergedMap.set(key, p);
  });

  // 2. Load cloud parties from RTDB
  const rtdbParties = await fetchPartiesFromRTDB();
  rtdbParties.forEach(p => {
    const key = (p.email || p.phone || p.uid).toLowerCase().trim();
    const existing = mergedMap.get(key);
    mergedMap.set(key, { ...existing, ...p });
  });

  // 3. Extract customer parties from all orders (so every customer who placed an order is visible!)
  const orders = currentOrders || (await fetchDispatchOrders());
  orders.forEach(o => {
    if (!o.customer) return;
    const email = (o.customerEmail || '').toLowerCase().trim();
    const phone = (o.customer.phone || '').replace(/\D/g, '');
    const key = email || phone || o.id;
    const existing = mergedMap.get(key);

    const displayName =
      o.customer.businessName?.trim() ||
      o.customer.name?.trim() ||
      existing?.displayName ||
      'B2B Partner';

    const partyData: RegisteredCustomer = {
      uid: existing?.uid || o.customerUid || 'party_' + (phone || o.id),
      email: email || existing?.email || null,
      displayName,
      businessName: o.customer.businessName || existing?.businessName || null,
      phone: o.customer.phone || existing?.phone || null,
      city: o.customer.city || existing?.city || null,
      state: o.customer.state || existing?.state || null,
      photoURL: existing?.photoURL || null,
      role: email === OWNER_EMAIL.toLowerCase() ? 'owner' : 'customer',
      lastLoginAt: o.createdAt || existing?.lastLoginAt,
      lastSeenAt: o.createdAt || existing?.lastSeenAt,
    };
    mergedMap.set(key, partyData);
  });

  // 4. Include current logged in user from localStorage if present
  try {
    const currentRaw = localStorage.getItem('torqmax_customer_auth_user');
    if (currentRaw) {
      const cu = JSON.parse(currentRaw);
      if (cu?.email) {
        const key = cu.email.toLowerCase().trim();
        const existing = mergedMap.get(key);
        mergedMap.set(key, {
          uid: cu.uid || existing?.uid || 'usr_' + key.replace(/[^a-zA-Z0-9]/g, '_'),
          email: cu.email,
          displayName: cu.displayName || existing?.displayName || 'B2B Partner',
          phone: cu.phone || existing?.phone || null,
          city: existing?.city || null,
          state: existing?.state || null,
          photoURL: cu.photoURL || existing?.photoURL || null,
          role: cu.isOwner ? 'owner' : 'customer',
          lastLoginAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        });
      }
    }
  } catch {
    // ignore
  }

  // 5. Try Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'customers'));
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 2500),
      );
      const snapshot = await Promise.race([getDocs(q), timeoutPromise]);
      if (!snapshot.empty) {
        snapshot.forEach(d => {
          const data = d.data() as RegisteredCustomer;
          const key = (data.email || data.phone || data.uid).toLowerCase().trim();
          mergedMap.set(key, { ...mergedMap.get(key), ...data });
        });
      }
    } catch (err) {
      console.warn('Firestore fetchRegisteredCustomers notice:', err);
    }
  }

  return Array.from(mergedMap.values());
};
