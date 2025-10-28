import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  timezone: string;
  createdAt: string;
}

interface FirebaseAuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateUserProfile: (name: string, timezone?: string) => Promise<{ error: any }>;
  resendVerificationEmail: () => Promise<{ error: any }>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await loadUserProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        console.log('No profile found for user');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Update display name
      await firebaseUpdateProfile(newUser, { displayName: name });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        id: newUser.uid,
        email: newUser.email!,
        name,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'profiles', newUser.uid), userProfile);

      // Send verification email
      await sendEmailVerification(newUser);

      // Load the profile
      await loadUserProfile(newUser.uid);

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error };
    }
  };

  const updateUserProfile = async (name: string, timezone?: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Update Firebase Auth profile
      await firebaseUpdateProfile(user, { displayName: name });

      // Update Firestore profile
      const updateData: Partial<UserProfile> = { name };
      if (timezone) {
        updateData.timezone = timezone;
      }

      await updateDoc(doc(db, 'profiles', user.uid), updateData);

      // Reload profile
      await loadUserProfile(user.uid);

      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      await sendEmailVerification(user);
      return { error: null };
    } catch (error: any) {
      console.error('Resend verification error:', error);
      return { error };
    }
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateUserProfile,
        resendVerificationEmail,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}
