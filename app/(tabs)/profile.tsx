import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, User, Bell, Shield, Info, Calendar } from 'lucide-react-native';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

export default function Profile() {
  const { user, profile, signOut, updateUserProfile } = useFirebaseAuth();
  const router = useRouter();

  const [name, setName] = useState(profile?.name || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    const { error } = await updateUserProfile(name, timezone);

    if (error) {
      Alert.alert('Error', 'Failed to update profile');
    } else {
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User color="#14B8A6" size={48} strokeWidth={2} />
          </View>
          <Text style={styles.userName}>{name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Personal Information Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.card}>
            <View style={styles.cardAccent} />
            
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={name}
              onChangeText={setName}
              editable={isEditing}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>Timezone</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={timezone}
              onChangeText={setTimezone}
              editable={isEditing}
              placeholder="Enter your timezone"
              placeholderTextColor="#94A3B8"
            />

            {isEditing ? (
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => {
                    setName(profile?.name || '');
                    setTimezone(profile?.timezone || 'UTC');
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonPrimaryText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonPrimaryText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Account Stats Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: '#14B8A6' }]} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={styles.infoIcon}>
                  <Info size={18} color="#14B8A6" strokeWidth={2} />
                </View>
                <Text style={styles.infoLabel}>App Version</Text>
              </View>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={styles.infoIcon}>
                  <Calendar size={18} color="#14B8A6" strokeWidth={2} />
                </View>
                <Text style={styles.infoLabel}>Member Since</Text>
              </View>
              <Text style={styles.infoValue}>
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* App Info Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About CareBuddy</Text>

          <View style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: '#14B8A6' }]} />
            
            <View style={styles.appIconBox}>
              <Shield size={32} color="#14B8A6" strokeWidth={2} />
            </View>
            <Text style={styles.appTitle}>CareBuddy</Text>
            <Text style={styles.appTagline}>Never miss a dose again.</Text>
            <Text style={styles.appDescription}>
              CareBuddy helps you manage your medications with timely reminders,
              dosage tracking, and refill alerts. Stay on track with your health journey.
            </Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut color="#EF4444" size={20} strokeWidth={2.5} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  
  // Avatar Section
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: '#64748B',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#14B8A6',
  },

  // Form Elements
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#1E293B',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },

  // Buttons
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonPrimary: {
    backgroundColor: '#14B8A6',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 15,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // App Info
  appIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 4,
    textAlign: 'center',
  },
  appTagline: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  appDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'center',
  },

  // Sign Out Button
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
