import React, { useEffect, useState, useCallback } from "react";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert, Text, View, ActivityIndicator } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Prevent splash screen from auto-hiding until setup is done
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn("SplashScreen.preventAutoHideAsync error:", error);
});

export const unstable_settings = {
  initialRouteName: "index",
};

// 🔐 Auth-gated Navigation Logic
function RootNavigation() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth check
    if (user) {
      // ✅ Route by role
      if (user.role === "admin") {
        router.replace("/(admin)/dashboard");
      } else if (user.role === "parent") {
        router.replace("/(parent)/dashboard");
      } else {
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [user, loading]);

  // Show loader while verifying token or fetching user data
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#003049" }}>
          Checking your session...
        </Text>
      </View>
    );
  }

  // Once authenticated, render the correct stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(parent)" />
    </Stack>
  );
}

// ✅ Main Root Layout
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [appIsReady, setAppIsReady] = useState(false);

  // 🧩 Load fonts
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // 🧠 Prepare app (fonts, splash, etc.)
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn("Error hiding splash screen:", error);
      }
    }
  }, [appIsReady]);

  useEffect(() => {
    async function prepare() {
      try {
        console.log("App: Preparing...");
        if (fontsLoaded || fontError) {
          if (fontError) {
            console.warn("Font loading error, continuing:", fontError);
          }
          await new Promise((resolve) => setTimeout(resolve, 150));
          setAppIsReady(true);
        }
      } catch (e) {
        console.error("App prep error:", e);
        setAppIsReady(true);
      }
    }
    prepare();
  }, [fontsLoaded, fontError]);

  // 🌐 Network status alerts
  useEffect(() => {
    if (
      networkState.isConnected === false &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your data will sync automatically once you're online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  // 🧱 Fallback for font load errors
  if (fontError) {
    console.error("Font loading failed:", fontError);
    return (
      <GestureHandlerRootView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text
          style={{
            color: "#003049",
            fontSize: 16,
            textAlign: "center",
            paddingHorizontal: 24,
          }}
        >
          Something went wrong while starting CrècheConnect. Please restart the app.
        </Text>
      </GestureHandlerRootView>
    );
  }

  if (!appIsReady) return null;

  // 🎨 Themes
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

  // ✅ Combined Root Layout
  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <RootNavigation />
            <SystemBars style="auto" />
          </GestureHandlerRootView>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
