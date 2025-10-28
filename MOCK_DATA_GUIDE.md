# Mock Data Service Guide

This app now supports temporary in-memory mock data storage for testing and development without Firebase.

## Current Setup

The app is currently configured to use **mock data** instead of Firebase. This means:

- ✅ Medications are stored in memory (not persisted across app restarts)
- ✅ All CRUD operations work (Create, Read, Update, Delete)
- ✅ Includes sample medications (Vitamin D and Aspirin) on first load
- ✅ No Firebase connection required
- ✅ Works completely offline

## Features

### Mock Data Service (`services/mockDataService.ts`)

Provides in-memory storage that mimics the Firebase service interface:

- **MockMedicationService**: Manages medications and schedules
- **MockHistoryService**: Tracks medication history
- **Auto-initialization**: Includes 2 sample medications on first load
- **Same API**: Drop-in replacement for Firebase services

### Sample Data

Initial mock data includes:

1. **Vitamin D**
   - Dose: 1000 IU
   - Form: Tablet
   - Quantity: 30
   - Schedule: 9:00 AM daily

2. **Aspirin**
   - Dose: 81 mg
   - Form: Tablet
   - Quantity: 15 (low stock)
   - Schedule: 8:00 AM and 8:00 PM daily

## How to Switch Between Mock and Firebase

### Currently Using: Mock Data ✅

To switch back to Firebase, update the following files:

**1. `app/(tabs)/medications.tsx`**
```typescript
// Change from:
import { MockMedicationService as MedicationService } from '@/services/mockDataService';

// To:
import { MedicationService } from '@/services/firebaseService';
```

**2. `app/(tabs)/index.tsx`**
```typescript
// Change from:
import { MockMedicationService as MedicationService, MockHistoryService as HistoryService } from '@/services/mockDataService';

// To:
import { MedicationService, HistoryService } from '@/services/firebaseService';
```

**3. `app/(tabs)/history.tsx`**
```typescript
// Change from:
import { MockHistoryService as HistoryService } from '@/services/mockDataService';

// To:
import { HistoryService } from '@/services/firebaseService';
```

Also update the user checks in each file:
```typescript
// Change from:
const userId = user?.uid || 'mock_user';

// To:
if (!user) return;
const userId = user.uid;
```

## Testing

You can test all medication features:

1. ✅ **Add new medications** - Click the + button
2. ✅ **Edit medications** - Tap on any medication card
3. ✅ **Delete medications** - Swipe or tap to delete
4. ✅ **Update schedules** - Add/edit medication times
5. ✅ **Track history** - Mark doses as taken/missed
6. ✅ **Low stock alerts** - Aspirin shows low stock badge

## Utilities

### Reset Mock Data
```typescript
import { resetMockData } from '@/services/mockDataService';

// Call this to reset to initial sample data
resetMockData();
```

### Get All Mock Data (Debugging)
```typescript
import { getMockData } from '@/services/mockDataService';

const { medications, schedules, history } = getMockData();
console.log('Current mock data:', { medications, schedules, history });
```

## Notes

- ⚠️ Mock data is cleared when the app restarts
- ⚠️ Not suitable for production use
- ✅ Perfect for development and testing
- ✅ No Firebase configuration needed
- ✅ Fast and responsive
