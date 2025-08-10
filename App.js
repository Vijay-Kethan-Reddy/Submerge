import React, { useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import { AuthProvider, useAuthContext } from './src/context/AuthContext'; // NEW

// Screens
import AuthScreen from './src/views/AuthScreen';
import BottomTabs from './src/navigation/BottomTabs';
import HomeScreen from './src/views/HomeScreen';
import SearchScreen from './src/views/SearchScreen';
import MusicPlayerScreen from './src/views/MusicPlayerScreen';
import ArtistScreen from './src/views/ArtistScreen';
import CreatePostScreen from './src/views/CreatePostScreen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

function RootNavigator() {
  const { user, initializing } = useAuthContext();

  const [appIsReady, setAppIsReady] = useState(false);

  // Load fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'RobotoCondensed-Bold': require('./src/assets/fonts/RobotoCondensed-Bold.ttf'),
          'Poppins-Bold': require('./src/assets/fonts/Poppins-Bold.ttf'),
        });
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && !initializing) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, initializing]);

  if (!appIsReady || initializing) return null;

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="BottomTabs" component={BottomTabs} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="MusicPlayerScreen" component={MusicPlayerScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="ArtistScreen" component={ArtistScreen} />
            <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
