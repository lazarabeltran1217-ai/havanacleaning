import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, Link } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../src/context/AuthContext";
import { colors, fonts } from "../src/lib/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
      // Navigate directly after successful login — don't wait for AppRouter
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      Alert.alert("Error", message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Pattern overlay */}
      <View style={s.pattern} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <Text style={s.brand}>
            Havana <Text style={s.brandAccent}>Cleaning</Text>
          </Text>
          <Text style={s.subtitle}>Sign in to your account</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          {/* Google Button */}
          <TouchableOpacity style={s.btnGoogle}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </Svg>
            <Text style={s.btnGoogleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Apple Button */}
          <TouchableOpacity style={s.btnApple}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill={colors.cream}>
              <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </Svg>
            <Text style={s.btnAppleText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>OR SIGN IN WITH EMAIL</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Form */}
          <Text style={s.label}>EMAIL</Text>
          <TextInput
            style={s.input}
            placeholder="hello@havanacleaning.com"
            placeholderTextColor="rgba(44,24,16,0.35)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={s.labelRow}>
            <Text style={s.label}>PASSWORD</Text>
            <TouchableOpacity>
              <Text style={s.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={s.input}
            placeholder="Enter your password"
            placeholderTextColor="rgba(44,24,16,0.35)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[s.btnSignIn, loading && { opacity: 0.5 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={s.btnSignInText}>
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </Text>
          </TouchableOpacity>

          <View style={s.registerRow}>
            <Text style={s.registerText}>Don&apos;t have an account? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={s.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Privacy Policy</Text>
          <Text style={s.footerDot}> &middot; </Text>
          <Text style={s.footerText}>Terms of Service</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.tobacco },
  pattern: { ...StyleSheet.absoluteFillObject, opacity: 0.04 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 36 },
  brand: { fontFamily: fonts.displayBlack, fontSize: 28, color: colors.amber },
  brandAccent: { color: colors.greenLight, fontFamily: fonts.displayItalic },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.sand, marginTop: 8, opacity: 0.7 },
  card: { backgroundColor: colors.cream, borderRadius: 20, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 40, elevation: 10 },
  btnGoogle: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1.5, borderColor: "rgba(44,24,16,0.12)", marginBottom: 12 },
  btnGoogleText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.tobacco },
  btnApple: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.tobacco, marginBottom: 24 },
  btnAppleText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.cream },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(44,24,16,0.08)" },
  dividerText: { fontFamily: fonts.body, fontSize: 11, color: "rgba(44,24,16,0.35)", letterSpacing: 0.8 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 1, color: "rgba(44,24,16,0.35)", marginBottom: 8 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  forgotLink: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.greenLight },
  input: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: "rgba(44,24,16,0.08)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontFamily: fonts.body, fontSize: 14, color: colors.tobacco, marginBottom: 18 },
  btnSignIn: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  btnSignInText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.tobacco, letterSpacing: 0.6 },
  registerRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  registerText: { fontFamily: fonts.body, fontSize: 14, color: "rgba(44,24,16,0.55)" },
  registerLink: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.greenLight },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: "auto", paddingTop: 28 },
  footerText: { fontFamily: fonts.body, fontSize: 14, color: colors.sand, opacity: 0.7 },
  footerDot: { color: colors.sand, opacity: 0.7 },
});
