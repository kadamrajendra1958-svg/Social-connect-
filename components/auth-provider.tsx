"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/lib/data';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() } as User);
        } else {
          // Keep profile null until they complete profile setup screen
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const updateProfile = async (newProfileData: Partial<User>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      const fullProfile = {
        name: newProfileData.name,
        handle: newProfileData.handle,
        avatar: newProfileData.avatar || user.photoURL || '',
        email: user.email || '',
        bio: '',
        coverImage: '',
        followers: 0,
        following: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, fullProfile);
      setProfile({ id: user.uid, ...fullProfile } as User);
    } else {
      await setDoc(userRef, { ...newProfileData, updatedAt: serverTimestamp() }, { merge: true });
      setProfile(prev => prev ? { ...prev, ...newProfileData, id: user.uid } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
