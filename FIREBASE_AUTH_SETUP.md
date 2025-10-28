# Firebase Email Authentication Setup

## ✅ What's Been Implemented

Firebase email authentication has been successfully integrated into your CareBuddy app with the following features:

### 🔐 Authentication Features

1. **Email/Password Registration**
   - User sign-up with name, email, and password
   - Automatic email verification sending
   - User profile creation in Firestore
   - Password strength validation (minimum 6 characters)

2. **Email/Password Sign-In**
   - Secure login with email and password
   - Detailed error messages for common issues
   - Automatic session management

3. **Password Reset**
   - "Forgot Password" functionality
   - Password reset emails sent via Firebase
   - Easy-to-use interface

4. **User Profile Management**
   - Display name updates
   - Timezone preferences
   - Profile data stored in Firestore

5. **Email Verification**
   - Automatic verification email on registration
   - Resend verification email option

## 📁 Files Created/Modified

### New Files
- `lib/firebase.ts` - Firebase initialization and configuration
- `contexts/FirebaseAuthContext.tsx` - Firebase authentication context and hooks

### Modified Files
- `app/_layout.tsx` - Uses FirebaseAuthProvider
- `app/index.tsx` - Uses Firebase auth state
- `app/(auth)/_layout.tsx` - Uses Firebase auth state
- `app/(auth)/index.tsx` - Sign-in with Firebase + password reset
- `app/(auth)/sign-up.tsx` - Sign-up with Firebase
- `app/(tabs)/profile.tsx` - Profile management with Firebase
- `.env` - Added Firebase configuration variables

## 🔧 Configuration

Your `.env` file already contains the Firebase credentials:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCYLdvhPBLQ3Y8Y_-w_ejeI5WsJbDklWwE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=carebuddy-3cf0a.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=carebuddy-3cf0a
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=carebuddy-3cf0a.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=530243854293
EXPO_PUBLIC_FIREBASE_APP_ID=1:530243854293:web:aaf0d3b20d82b6795ba75c
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-CJMEQYBCV9
```

## 🚀 Firebase Console Setup

### 1. Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `carebuddy-3cf0a`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. Enable both **Email/Password** and **Email link (passwordless sign-in)** if desired
6. Click **Save**

### 2. Configure Authorized Domains

1. In the **Authentication** section, go to **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for local development)
   - Your production domain when ready

### 3. Customize Email Templates (Optional)

1. Go to **Authentication** → **Templates**
2. Customize the following templates:
   - Email address verification
   - Password reset
   - Email address change

### 4. Set Up Firestore Database

1. Go to **Firestore Database** in the Firebase Console
2. Click **Create database**
3. Start in **production mode** (or test mode for development)
4. Choose a location (select the closest to your users)

### 5. Create Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /profiles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false; // Profiles cannot be deleted
    }
    
    // Users can only read/write their own medications
    match /medications/{medicationId} {
      allow read: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📱 Usage Examples

### Using the Authentication Hook

```typescript
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

function MyComponent() {
  const { 
    user,           // Current Firebase user
    profile,        // User profile from Firestore
    loading,        // Loading state
    signIn,         // Sign in function
    signUp,         // Sign up function
    signOut,        // Sign out function
    resetPassword,  // Password reset function
    updateUserProfile,        // Update profile function
    resendVerificationEmail   // Resend verification email
  } = useFirebaseAuth();

  // Check if user is signed in
  if (user) {
    console.log('User email:', user.email);
    console.log('User name:', profile?.name);
  }
}
```

### Sign Up Example

```typescript
const { signUp } = useFirebaseAuth();

const handleSignUp = async () => {
  const { error } = await signUp(email, password, name);
  
  if (error) {
    console.error('Sign up failed:', error.message);
  } else {
    console.log('Account created! Verification email sent.');
  }
};
```

### Sign In Example

```typescript
const { signIn } = useFirebaseAuth();

const handleSignIn = async () => {
  const { error } = await signIn(email, password);
  
  if (error) {
    console.error('Sign in failed:', error.message);
  } else {
    console.log('Signed in successfully!');
  }
};
```

### Password Reset Example

```typescript
const { resetPassword } = useFirebaseAuth();

const handlePasswordReset = async () => {
  const { error } = await resetPassword(email);
  
  if (error) {
    console.error('Password reset failed:', error.message);
  } else {
    console.log('Password reset email sent!');
  }
};
```

## 🔍 Error Handling

The authentication system provides detailed error messages for common Firebase errors:

### Sign In Errors
- `auth/invalid-email` → "Invalid email address."
- `auth/user-disabled` → "This account has been disabled."
- `auth/user-not-found` → "No account found with this email."
- `auth/wrong-password` → "Incorrect password."
- `auth/invalid-credential` → "Invalid email or password."

### Sign Up Errors
- `auth/email-already-in-use` → "This email is already registered."
- `auth/invalid-email` → "Invalid email address."
- `auth/weak-password` → "Password is too weak. Please use a stronger password."

## 🗄️ Data Structure

### User Profile (Firestore: `profiles` collection)

```typescript
interface UserProfile {
  id: string;           // Firebase Auth UID
  email: string;        // User's email
  name: string;         // Display name
  timezone: string;     // User's timezone
  createdAt: string;    // ISO 8601 date string
}
```

## 🎨 UI Features

### Sign In Page
- Email and password input fields
- "Forgot Password?" link
- Password reset functionality
- Error handling with user-friendly messages
- Loading states

### Sign Up Page
- Name, email, password, and confirm password fields
- Password strength validation
- Email verification notification
- Error handling

### Profile Page
- Display user information
- Edit name and timezone
- Member since date
- Sign out functionality

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** - Minimum 6 characters enforced
3. **Email verification** - Automatically sent on registration
4. **Firestore security rules** - Properly configured to protect user data
5. **HTTPS only** - Firebase enforces HTTPS for production

## 🚦 Next Steps

1. **Test the authentication flow**
   ```bash
   npm run dev -- --web
   ```

2. **Set up email verification** in Firebase Console
3. **Customize email templates** for your brand
4. **Add social authentication** (Google, Apple, etc.) if needed
5. **Implement multi-factor authentication** for enhanced security

## 📚 Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Expo and Firebase](https://docs.expo.dev/guides/using-firebase/)

## ⚠️ Important Notes

1. The old Supabase authentication code is still present but not being used
2. You can safely remove `contexts/AuthContext.tsx` if you're fully migrating to Firebase
3. Make sure to restart your development server after adding Firebase
4. Email verification is required for production apps

## 🎉 You're All Set!

Your CareBuddy app now has a complete Firebase email authentication system with:
- ✅ User registration
- ✅ Email/password login
- ✅ Password reset
- ✅ Email verification
- ✅ User profile management
- ✅ Secure Firestore data storage

Enjoy building your app! 🚀
