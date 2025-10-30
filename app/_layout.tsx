
import React, { useEffect, useState, useCallback } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn('SplashScreen.preventAutoHideAsync error:', error);
});

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Load fonts with error handling
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Prepare app and hide splash screen
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Error hiding splash screen:', error);
      }
    }
  }, [appIsReady]);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('App: Preparing app...');
        console.log('Fonts loaded:', fontsLoaded, 'Font error:', fontError);
        
        // If fonts loaded or there's an error, continue anyway
        if (fontsLoaded || fontError) {
          if (fontError) {
            console.warn('Font loading error, continuing with system fonts:', fontError);
          }
          
          // Small delay to ensure everything is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log('App: Ready to show');
          setAppIsReady(true);
        }
      } catch (e) {
        console.error('Error during app preparation:', e);
        // Continue anyway
        setAppIsReady(true);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  // Network status monitoring
  useEffect(() => {
    if (
      networkState.isConnected === false &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  // Don't render until app is ready
  if (!appIsReady) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "#A9D6E5",
      background: "#FFFFFF",
      card: "#F3F3F3",
      text: "#003049",
      border: "#A9D6E5",
      notification: "#E76F51",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "#A9D6E5",
      background: "#003049",
      card: "#264653",
      text: "#FFFFFF",
      border: "#A9D6E5",
      notification: "#E76F51",
    },
  };

  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="reset-password" />
              <Stack.Screen name="setup" />
              <Stack.Screen name="(admin)" />
              <Stack.Screen name="(parent)" />
            </Stack>
            <SystemBars style="auto" />
          </GestureHandlerRootView>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
