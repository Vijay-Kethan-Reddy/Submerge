import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('user'); // 'user' or 'musician'
  const [about, setAbout] = useState(''); // For musician bio

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Additional validation for musician signup
    if (!isLogin && userType === 'musician' && !about.trim()) {
      Alert.alert('Error', 'Please tell us about yourself as a musician');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: email,
          userType: userType, // 'user' or 'musician'
          about: userType === 'musician' ? about.trim() : '',
          displayName: email.split('@')[0], // Default display name from email
          createdAt: serverTimestamp(),
          // Add additional fields based on user type
          ...(userType === 'musician' && {
            verified: false,
            followers: [], // Array of user IDs who follow this musician
            followersCount: 0, // Counter for followers
            following: 0,
            postsCount: 0,
          }),
          ...(userType === 'user' && {
            favoriteGenres: [],
            followingMusicians: [], // Array of musician IDs this user follows
          })
        });

        console.log('User created successfully with type:', userType);
      }
    } catch (error) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent! Check your inbox.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setUserType('user'); // Reset to default user type
    setAbout(''); // Reset about field
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00A6CB" barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 60 }]}>
            <Text style={styles.appTitle}>SUBMERGE</Text>
          </View>

          {/* Auth Form */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>

              {/* User Type Selection (Sign Up Only) */}
              {!isLogin && (
                <View style={styles.userTypeContainer}>
                  <Text style={styles.userTypeTitle}>I am a:</Text>
                  <View style={styles.userTypeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.userTypeButton,
                        userType === 'user' && styles.userTypeButtonActive
                      ]}
                      onPress={() => setUserType('user')}
                    >
                      <Icon
                        name="person-outline"
                        size={20}
                        color={userType === 'user' ? 'white' : '#00A6CB'}
                        style={styles.userTypeIcon}
                      />
                      <Text style={[
                        styles.userTypeButtonText,
                        userType === 'user' && styles.userTypeButtonTextActive
                      ]}>
                        Music Lover
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.userTypeButton,
                        userType === 'musician' && styles.userTypeButtonActive
                      ]}
                      onPress={() => setUserType('musician')}
                    >
                      <Icon
                        name="musical-note-outline"
                        size={20}
                        color={userType === 'musician' ? 'white' : '#00A6CB'}
                        style={styles.userTypeIcon}
                      />
                      <Text style={[
                        styles.userTypeButtonText,
                        userType === 'musician' && styles.userTypeButtonTextActive
                      ]}>
                        Musician
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={20} color="#00A6CB" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email Address"
                  placeholderTextColor="#7A9BA8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color="#00A6CB" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor="#7A9BA8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#7A9BA8"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input (Sign Up Only) */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Icon name="lock-closed-outline" size={20} color="#00A6CB" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm Password"
                    placeholderTextColor="#7A9BA8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Icon
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#7A9BA8"
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* About/Bio Input (Musician Sign Up Only) */}
              {!isLogin && userType === 'musician' && (
                <View style={styles.textAreaContainer}>
                  <Icon name="document-text-outline" size={20} color="#00A6CB" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textArea}
                    placeholder="Tell us about yourself, your music style, and experience..."
                    placeholderTextColor="#7A9BA8"
                    value={about}
                    onChangeText={setAbout}
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                    autoCapitalize="sentences"
                    autoCorrect={true}
                  />
                </View>
              )}

              {/* Forgot Password (Login Only) */}
              {isLogin && (
                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {/* Auth Button */}
              <TouchableOpacity
                style={[styles.authButton, loading && styles.authButtonDisabled]}
                onPress={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={styles.authButtonText}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                    <Icon name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
                  </>
                )}
              </TouchableOpacity>

              {/* Toggle Auth Mode */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </Text>
                <TouchableOpacity onPress={toggleAuthMode}>
                  <Text style={styles.toggleButton}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00A6CB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  // Header Styles
  header: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  appTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 2,
  },

  // Form Styles
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    padding: 35,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  formTitle: {
    fontFamily: 'RobotoCondensed-Bold',
    fontSize: 26,
    fontWeight: '700',
    color: '#00A6CB',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontFamily: 'RobotoCondensed-Bold',
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },

  // User Type Selection Styles
  userTypeContainer: {
    marginBottom: 25,
  },
  userTypeTitle: {
    fontFamily: 'RobotoCondensed-Bold',
    fontSize: 16,
    color: '#00A6CB',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  userTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 166, 203, 0.15)',
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#00A6CB',
  },
  userTypeButtonActive: {
    backgroundColor: '#00A6CB',
    borderColor: '#00A6CB',
    elevation: 2,
    shadowColor: '#00A6CB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  userTypeIcon: {
    marginRight: 8,
  },
  userTypeButtonText: {
    fontFamily: 'RobotoCondensed-Bold',
    fontSize: 14,
    color: '#00A6CB',
    fontWeight: '700',
  },
  userTypeButtonTextActive: {
    fontFamily: 'RobotoCondensed-Bold',
    color: 'white',
    fontWeight: '700',
  },

  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 248, 255, 0.8)',
    borderRadius: 15,
    marginBottom: 16,
    paddingHorizontal: 18,
    height: 56,
    borderWidth: 2,
    borderColor: 'rgba(0, 166, 203, 0.2)',
  },
  inputIcon: {
    marginRight: 14,
  },
  textInput: {
    fontFamily: 'RobotoCondensed-Bold',
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 6,
  },

  // Text Area Styles (for musician bio)
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 248, 255, 0.8)',
    borderRadius: 15,
    marginBottom: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    minHeight: 100,
    borderWidth: 2,
    borderColor: 'rgba(0, 166, 203, 0.2)',
    alignItems: 'flex-start',
  },
  textArea: {
    fontFamily: 'RobotoCondensed-Bold',
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    minHeight: 80,
    maxHeight: 120,
  },

  // Button Styles
  authButton: {
    flexDirection: 'row',
    backgroundColor: '#00A6CB',
    borderRadius: 15,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#00A6CB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonText: {
    fontFamily: 'RobotoCondensed-Bold',
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },

  // Forgot Password
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontFamily: 'RobotoCondensed-Bold',
    color: '#00A6CB',
    fontSize: 14,
    fontWeight: '600',
  },

  // Toggle Auth Mode
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleText: {
    fontFamily: 'RobotoCondensed-Bold',
    color: '#00A6CB',
    fontSize: 15,
    marginRight: 8,
    fontWeight: '500',
  },
  toggleButton: {
    fontFamily: 'RobotoCondensed-Bold',
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: '#00A6CB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
});