import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

export default function AuthLayout() {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
