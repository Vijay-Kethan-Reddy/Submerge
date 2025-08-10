// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBWeIDldtd1yVypyvmUhXahHPJCtE4rdU4',
  authDomain: 'submerge-music.firebaseapp.com',
  projectId: 'submerge-music',
  storageBucket: 'submerge-music.appspot.com',
  messagingSenderId: '32819840112',
  appId: '1:32819840112:android:71da83e1abff4e7395e0b5',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);

