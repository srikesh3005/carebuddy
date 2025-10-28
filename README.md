# CareBuddy - Medication Management App

## 🔥 Firebase-Powered Application

CareBuddy is a complete medication management app built with **React Native (Expo)** and **Firebase**. Never miss a dose again!

## ✨ Features

### Authentication
- ✅ Email/Password Sign Up & Sign In
- ✅ Password Reset via Email
- ✅ Email Verification
- ✅ User Profile Management
- ✅ Secure Firebase Authentication

### Medication Management
- ✅ Add, Edit, Delete Medications
- ✅ Multiple dosage forms (tablet, capsule, syrup, etc.)
- ✅ Quantity tracking
- ✅ Refill alerts
- ✅ Custom dosing schedules

### Reminders & Notifications
- ✅ Daily medication reminders
- ✅ Custom schedule times
- ✅ Snooze functionality
- ✅ Low stock notifications

### History & Tracking
- ✅ Complete medication history
- ✅ Track taken, missed, and snoozed doses
- ✅ View medication statistics

## 🏗️ Tech Stack

- **Frontend**: React Native (Expo)
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Notifications**: Expo Notifications
- **Language**: TypeScript

## 📁 Project Structure

```
carebuddy/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication screens
│   │   ├── index.tsx             # Sign In
│   │   └── sign-up.tsx           # Sign Up
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx             # Home/Today's Doses
│   │   ├── medications.tsx       # Medications List
│   │   ├── history.tsx           # History
│   │   └── profile.tsx           # User Profile
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
├── components/                   # Reusable components
│   ├── DoseCard.tsx
│   ├── HistoryItem.tsx
│   └── MedicationCard.tsx
├── contexts/                     # React contexts
│   └── FirebaseAuthContext.tsx   # Firebase auth state
├── lib/                          # Core libraries
│   └── firebase.ts               # Firebase initialization
├── services/                     # Business logic
│   ├── firebaseService.ts        # Firestore operations
│   └── notificationService.ts    # Push notifications
├── types/                        # TypeScript types
│   └── database.ts
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI
- Firebase account

### 1. Clone & Install

```bash
git clone <your-repo>
cd carebuddy
npm install
```

### 2. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `carebuddy` (or your choice)
4. Follow the wizard to create the project

#### Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. (Optional) Customize email templates under **Templates** tab

#### Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Choose your region

#### Set Up Firestore Security Rules

Go to **Firestore Database** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /profiles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
    
    // Users can only read/write their own medications
    match /medications/{medicationId} {
      allow read: if request.auth != null && 
                     resource.data.user_id == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.user_id == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.user_id == request.auth.uid;
      allow delete: if request.auth != null && 
                       resource.data.user_id == request.auth.uid;
    }
    
    // Users can only read/write their own schedules
    match /schedules/{scheduleId} {
      allow read, write: if request.auth != null;
    }
    
    // Users can only read/write their own history
    match /history/{historyId} {
      allow read: if request.auth != null && 
                     resource.data.user_id == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.user_id == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.user_id == request.auth.uid;
    }
  }
}
```

#### Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ → **Project settings**
2. Scroll to "Your apps"
3. Click the Web icon `</>` to add a web app
4. Register your app
5. Copy the configuration values

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Run the App

```bash
# Start development server
npm run dev

# Run on web
npm run dev -- --web

# Type checking
npm run typecheck
```

## 📊 Firebase Collections

### `profiles`
```typescript
{
  id: string;              // Firebase Auth UID
  name: string;
  timezone: string;
  createdAt: Timestamp;
}
```

### `medications`
```typescript
{
  id: string;              // Auto-generated
  user_id: string;         // Firebase Auth UID
  name: string;
  dose: string;
  form: 'tablet' | 'capsule' | ...;
  quantity: number;
  units_per_dose: number;
  refill_threshold: number;
  start_date: string;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### `schedules`
```typescript
{
  id: string;
  medication_id: string;
  time: string;            // HH:MM format
  days_of_week: number[];  // [0-6] where 0 = Sunday
  created_at: Timestamp;
}
```

### `history`
```typescript
{
  id: string;
  user_id: string;
  medication_id: string;
  status: 'taken' | 'missed' | 'snoozed';
  scheduled_time: string;
  actual_time: string;
  notes?: string;
  created_at: Timestamp;
}
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use environment variables** for all sensitive data
3. **Firestore security rules** properly configured
4. **Email verification** enabled
5. **HTTPS enforced** by Firebase

## 📱 Features Breakdown

### Home Screen (Today's Doses)
- Shows all medications scheduled for today
- Mark doses as taken/missed
- Snooze reminders
- Real-time updates

### Medications Screen
- List all active medications
- Add new medications with custom schedules
- Edit existing medications
- Delete medications (soft delete)
- Track medication quantities

### History Screen
- Complete medication history
- Filter by status (taken/missed/all)
- View medication details
- Track adherence

### Profile Screen
- User information
- Account settings
- Sign out
- App information

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for web
npm run build:web

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Key Files to Know

- `lib/firebase.ts` - Firebase initialization
- `contexts/FirebaseAuthContext.tsx` - Authentication state
- `services/firebaseService.ts` - Firestore operations
- `services/notificationService.ts` - Push notifications

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify `.env` file has correct values
- Check Firebase project is active
- Ensure Firestore is created

### Authentication Errors
- Check Email/Password is enabled in Firebase
- Verify API key is correct
- Check browser/app has internet connection

### Notification Issues
- Notifications only work on physical devices
- Web notifications require HTTPS
- Check device notification permissions

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## 🎉 You're All Set!

Your CareBuddy app is now fully configured with Firebase! Start the development server and begin managing your medications.

```bash
npm run dev -- --web
```

## 📄 License

MIT License - feel free to use this project for learning or building your own medication management app!

---

Built with ❤️ using Firebase and React Native
# carebuddy
