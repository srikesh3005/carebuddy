import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Shield, Heart, ArrowRight } from 'lucide-react-native';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { signIn, resetPassword } = useFirebaseAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      let errorMessage = 'Failed to sign in. Please try again.';
      
      // Firebase error codes
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      
      Alert.alert('Sign In Failed', errorMessage);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password reset email sent! Check your inbox.');
      setShowResetPassword(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative Header Background */}
        <View style={styles.headerBackground}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Shield size={32} color="#14B8A6" strokeWidth={2.5} />
            </View>
            <Text style={styles.appName}>CareBuddy</Text>
          </View>
          <Text style={styles.headerTagline}>Your health companion</Text>
        </View>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue managing your medications</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconBox}>
                <Mail size={20} color="#14B8A6" strokeWidth={2} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconBox}>
                <Lock size={20} color="#14B8A6" strokeWidth={2} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => setShowResetPassword(true)}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, loading && styles.signInButtonDisabled]} 
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.signInButtonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
              {!loading && <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpPrompt}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={styles.signUpLink}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Secure & Private</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    top: -120,
    right: -80,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    top: 20,
    left: -60,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerTagline: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  contentCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  formSection: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    gap: 8,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  signUpPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signUpText: {
    fontSize: 15,
    color: '#64748B',
  },
  signUpLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14B8A6',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
