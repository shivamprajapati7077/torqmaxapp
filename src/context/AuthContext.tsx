import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  isFirebaseConfigured,
  OWNER_EMAIL,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOutAdmin,
} from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface AppUser {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  uid?: string;
  isOwner: boolean;
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isOwner: boolean;
  loginWithGoogle: () => Promise<AppUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CUSTOMER_AUTH_KEY = 'torqmax_customer_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, firebaseUser => {
        if (firebaseUser) {
          const email = firebaseUser.email || '';
          const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
          const appUser: AppUser = {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            uid: firebaseUser.uid,
            isOwner,
          };
          setUser(appUser);
          try {
            localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(appUser));
          } catch {
            // ignore
          }
        } else {
          // If logged out from Firebase, check local fallback
          const saved = localStorage.getItem(CUSTOMER_AUTH_KEY);
          if (!saved) setUser(null);
        }
        setIsLoading(false);
      });
      return () => unsub();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async (): Promise<AppUser> => {
    setIsLoading(true);
    try {
      const res = await firebaseSignInWithGoogle();
      const isOwner = res.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
      const appUser: AppUser = {
        email: res.user.email,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
        uid: res.user.uid,
        isOwner,
      };
      setUser(appUser);
      localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(appUser));
      setIsLoading(false);
      return appUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    await signOutAdmin();
    localStorage.removeItem(CUSTOMER_AUTH_KEY);
    setUser(null);
  };

  const isOwner = Boolean(user?.isOwner);

  return (
    <AuthContext.Provider value={{ user, isLoading, isOwner, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
