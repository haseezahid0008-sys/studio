
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as fbUpdatePassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { addUser } from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    if(user) {
        await addUser({
            uid: user.uid,
            email: user.email,
            createdAt: new Date(),
            role: 'Worker', // Default role for new signups
        });
    }
    return userCredential;
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };
  
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error("No user is signed in.");
    }
    if (!user.email) {
      throw new Error("User does not have an email.");
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    
    // Re-authenticate the user
    await reauthenticateWithCredential(user, credential);
    
    // Update the password
    await fbUpdatePassword(user, newPassword);
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}
