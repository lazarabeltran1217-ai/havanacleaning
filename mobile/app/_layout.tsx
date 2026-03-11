import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { PlayfairDisplay_700Bold, PlayfairDisplay_700Bold_Italic, PlayfairDisplay_800ExtraBold } from "@expo-google-fonts/playfair-display";
import Svg, { Path, G } from "react-native-svg";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { colors, fonts } from "../src/lib/theme";
import * as SecureStore from "expo-secure-store";

const ONBOARDED_KEY = "havana_onboarded";

function PalmTreeLogo({ size = 130 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 500 500">
      <G>
        <G>
          <Path fill="#C98C40" d="M236.38,125.98c0,0-41.82,165.77,0,362.2h45.82c0,0-64.41-156.52-20.81-362.2H236.38z" />
          <Path fill="#15AA78" d="M311.49,108.36c-0.79-0.64-1.56-1.24-2.3-1.75c-6.14-3.37-11.59-4.39-11.59-4.39 c9.18-2.25,17.81,2.25,22.23,5.2c9.12-2.06,18.12-3.47,26.89-4.39c-7.27-7.97-15.87-11.79-15.87-11.79 c10.47-0.05,18.85,6.48,23.48,11.12c11.57-0.85,22.63-0.87,32.9-0.35c-4.14-7.78-9.95-13.5-13.49-16.53 c-0.36-0.2-0.57-0.31-0.57-0.31c0.13,0.05,0.26,0.1,0.39,0.15c-1.79-1.52-2.95-2.32-2.95-2.32c13.25,2.49,21.66,13.94,25.05,19.55 c33.88,2.71,57.13,10.63,57.13,10.63C389.58,46.76,332.27,51.8,294.89,68.15c2.57-3.3,5.24-6.4,7.96-9.3 c-5.72-0.68-10.56,0.82-10.56,0.82c4.3-3.75,9.98-4.06,13.46-3.81c4.47-4.47,9.02-8.43,13.43-11.88c-4.36-1.72-8.71-2-11.2-1.98 c6.31-3.71,13.68-2,17-0.9 c14.88-10.97,27.15-16.01,27.15-16.01c-61.59-6.01-80.28,31.59-85.9,52.66c-8.9-27.12-38.53-83.88-128.21-65.96 c0,0,17.73,5.28,39.89,18.43c4.45-1.98,14.44-5.37,23.7-1.11 c-3.46,0.32-9.45,1.31-15.26,4.31c6.59,4.17,13.45,9.02,20.28,14.61c4.8-0.84,12.72-1.2,19.21,3.41 c0,0-6.93-1.41-14.77,0.34c5.06,4.4,10.06,9.21,14.86,14.47c3.97,0.11,11.2,1.11,15.96,6.51c0,0-3.81-1.75-9.03-2.36 c-0.46,0-0.94,0-1.44,0.03c-31.82-20.82-85.2-36.21-152.58,17.71c0,0,21.94-4.17,52.98-2.38c3.67-4.59,12.49-13.77,24.78-14.34 c-3.53,2.27-9.4,6.65-13.97,13.08 c9.38,0.82,19.42,2.21,29.84,4.41c4.68-3.56,12.97-8.35,22.47-7c0,0-8.21,2.34-15.64,8.55c7.86,1.91,15.89,4.29,23.96,7.26 c4.31-2.08,12.62-5.02,20.72-1.88c0,0-5.05,0.24-10.98,2.48c-1.03,0.52-2.12,1.14-3.26,1.9 C157,97.4,86.47,108.31,47.23,210.57c0,0,19.85-17.32,52.52-33.99c1-6.86,4.51-21.46,16.69-29.37 c-2.24,4.41-5.61,12.37-6.43,21.64c10.03-4.75,21.09-9.32,33-13.29 c2.64-6.42,8.23-16.23,18.71-20.52c0,0-6.96,7.27-10.83,18.02c9.14-2.74,18.74-5.1,28.72-6.88c3.15-4.69,9.86-12.64,19.98-14.26 c0,0-5.01,3.25-9.7,9.07c-0.74,1.14-1.48,2.43-2.19,3.87c7.44-1.07,15.09-1.81,22.9-2.15c-20.39,9.98-41.92,31.79-40.24,79.45 c0,0,6.06-12.49,18.47-27.31c-0.93-3.53-2.23-11.34,2.05-17.68 c-0.18,2.6-0.17,7.15,1.34,11.82c3.89-4.37,8.31-8.87,13.27-13.25c-0.04-3.66,0.65-9.57,4.85-13.81 c0,0-1.88,4.96-1.54,10.97c3.87-3.21,8.04-6.33,12.51-9.25c0.56-2.92,2.18-8.16,6.76-11.03c0,0-1.76,2.61-2.84,6.4 c-0.12,0.71-0.22,1.48-0.27,2.33c7.61-4.61,16.06-8.61,25.32-11.56c7.42,6.34,13.95,13.18,19.69,20.26 c0.34-5.1-0.65-9.05-0.65-9.05c4.32,5.51,4,12.6,3.4,16.42c4.18,5.53,7.89,11.16,11.2,16.78 c3.05-7.18,2.94-14.06,2.94-14.06c3.26,7.02,1.5,14.52-0.15,18.97c4.13,7.52,7.55,14.94,10.37,21.98 c3.89-5.03,5.9-10.57,6.82-13.83 c2.43,9.61-2.58,18.56-5.26,22.46c8.64,23.52,10.55,41.41,10.55,41.41c24.14-60.34,4.45-97.09-17.4-117.7 c10,3.78,15.18,13.3,17.41,18.75 c9.82,3.92,19.12,8.33,27.89,13.05c-1.69-11.79-7.28-20.68-7.28-20.68c9.8,6.59,13.44,17.78,14.8,24.88 c11.33,6.55,21.67,13.54,30.92,20.5c1.11-9.64-0.66-18.47-2.02-23.45 c10.77,10.63,11.3,26.28,10.88,33.49c29.87,23.88,46.5,45.73,46.5,45.73 C407.7,152.32,355.55,119.01,311.49,108.36z" />
        </G>
        <Path fill="#C98C40" d="M295.87,491.54c-5.9-19.75-24.2-34.16-45.87-34.16c-21.67,0-39.97,14.4-45.87,34.16H295.87z" />
      </G>
    </Svg>
  );
}

function SplashScreen() {
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={sp.container}>
      {/* Diagonal stripe pattern */}
      <View style={sp.pattern} />

      {/* Palm tree silhouettes */}
      <View style={sp.palmLeft}>
        <PalmTreeLogo size={180} />
      </View>
      <View style={sp.palmRight}>
        <PalmTreeLogo size={180} />
      </View>

      {/* Main content */}
      <View style={sp.content}>
        <PalmTreeLogo size={130} />
        <Text style={sp.title}>Havana{"\n"}<Text style={sp.titleAccent}>Cleaning</Text></Text>
        <Text style={sp.tagline}>WHERE SPOTLESS MEETS SOUL</Text>
        <Animated.View style={[sp.loader, { transform: [{ rotate: spin }] }]} />
      </View>
    </View>
  );
}

const sp = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.tobacco, alignItems: "center", justifyContent: "center" },
  pattern: { ...StyleSheet.absoluteFillObject, opacity: 0.04, backgroundColor: "transparent" },
  palmLeft: { position: "absolute", bottom: 0, left: -30, opacity: 0.06 },
  palmRight: { position: "absolute", bottom: 0, right: -30, opacity: 0.06, transform: [{ scaleX: -1 }] },
  content: { alignItems: "center", zIndex: 2 },
  title: { fontFamily: fonts.displayBlack, fontSize: 34, color: colors.amber, textAlign: "center", lineHeight: 40, marginTop: 32 },
  titleAccent: { color: colors.greenLight, fontFamily: fonts.displayItalic },
  tagline: { fontFamily: fonts.body, fontSize: 13, color: colors.sand, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 10, opacity: 0.7 },
  loader: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: "rgba(201,148,26,0.15)", borderTopColor: colors.gold, marginTop: 48 },
});

function AppRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    (async () => {
      const val = await SecureStore.getItemAsync(ONBOARDED_KEY);
      setOnboarded(val === "true");
    })();
  }, []);

  const navigate = useCallback(() => {
    if (loading || onboarded === null) return;

    const inAuth = segments[0] === "login" || segments[0] === "register" || segments[0] === "onboarding";
    const inApp = segments[0] === "(customer)" || segments[0] === "(employee)" || segments[0] === "(admin)";

    if (!onboarded) {
      if (segments[0] !== "onboarding") router.replace("/onboarding");
      return;
    }

    if (!user) {
      // Only redirect to login if not already on an auth screen
      if (!inAuth) router.replace("/login");
      return;
    }

    // User is logged in — only navigate if not already in the app
    if (!inApp || !hasNavigated) {
      setHasNavigated(true);
      if (user.role === "EMPLOYEE") {
        router.replace("/(employee)");
      } else if (user.role === "OWNER") {
        router.replace("/(admin)");
      } else {
        router.replace("/(customer)");
      }
    }
  }, [user, loading, onboarded, segments, hasNavigated]);

  useEffect(() => {
    navigate();
  }, [navigate]);

  if (loading || onboarded === null) {
    return <SplashScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_700Bold_Italic,
    PlayfairDisplay_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppRouter />
    </AuthProvider>
  );
}
