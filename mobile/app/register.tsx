import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { colors, fonts } from "../src/lib/theme";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register({ name, email: email.toLowerCase().trim(), password, phone: phone || undefined });
      // Navigation handled by AppRouter after user state updates
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      Alert.alert("Error", message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Join Havana Cleaning to book services and manage your home.</Text>

        <View style={s.card}>
          <Text style={s.label}>FULL NAME</Text>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="rgba(44,24,16,0.35)" />

          <Text style={s.label}>EMAIL</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor="rgba(44,24,16,0.35)" keyboardType="email-address" autoCapitalize="none" />

          <Text style={s.label}>PHONE (OPTIONAL)</Text>
          <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="(305) 555-0000" placeholderTextColor="rgba(44,24,16,0.35)" keyboardType="phone-pad" />

          <Text style={s.label}>PASSWORD</Text>
          <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="Min 6 characters" placeholderTextColor="rgba(44,24,16,0.35)" secureTextEntry />

          <Text style={s.label}>CONFIRM PASSWORD</Text>
          <TextInput style={s.input} value={confirm} onChangeText={setConfirm} placeholder="Repeat password" placeholderTextColor="rgba(44,24,16,0.35)" secureTextEntry />

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.5 }]} onPress={handleRegister} disabled={loading}>
            <Text style={s.btnText}>{loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</Text>
          </TouchableOpacity>

          <View style={s.loginRow}>
            <Text style={s.loginText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity><Text style={s.loginLink}>Sign In</Text></TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 100, paddingBottom: 40 },
  title: { fontFamily: fonts.displayBlack, fontSize: 28, color: colors.tobacco, textAlign: "center", marginBottom: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.sand, textAlign: "center", marginBottom: 28 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(44,24,16,0.1)", borderRadius: 16, padding: 24 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 1, color: colors.sand, marginBottom: 6 },
  input: { backgroundColor: colors.ivory, borderWidth: 1, borderColor: "rgba(44,24,16,0.1)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontFamily: fonts.body, fontSize: 14, color: colors.tobacco, marginBottom: 16 },
  btn: { backgroundColor: colors.green, borderRadius: 10, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  btnText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.white, letterSpacing: 0.6 },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  loginText: { fontFamily: fonts.body, fontSize: 14, color: colors.sand },
  loginLink: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.greenLight },
});
