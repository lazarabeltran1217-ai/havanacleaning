import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Modal, Linking, KeyboardAvoidingView, Platform } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { useAuth } from "../../src/context/AuthContext";
import { apiPost } from "../../src/lib/api";
import { colors, fonts } from "../../src/lib/theme";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/api/account/profile", { name: name.trim() });
      Alert.alert("Success", "Profile updated");
      setShowEdit(false);
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to update profile");
    } finally { setSaving(false); }
  };

  const menuItems = [
    {
      label: "Edit Profile",
      icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx={12} cy={7} r={4} /></Svg>,
      onPress: () => { setName(user?.name || ""); setShowEdit(true); },
    },
    {
      label: "Privacy Policy",
      icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Svg>,
      onPress: () => Linking.openURL("https://havanacleaning.com/privacy"),
    },
    {
      label: "Terms of Service",
      icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}><Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><Line x1={16} y1={13} x2={8} y2={13} /><Line x1={16} y1={17} x2={8} y2={17} /></Svg>,
      onPress: () => Linking.openURL("https://havanacleaning.com/terms"),
    },
    {
      label: "Help & Support",
      icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}><Circle cx={12} cy={12} r={10} /><Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><Line x1={12} y1={17} x2={12.01} y2={17} /></Svg>,
      onPress: () => Linking.openURL("https://havanacleaning.com/support"),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScrollView style={s.container}>
        <Text style={s.title}>Settings</Text>

        <View style={s.card}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(user?.name || "").split(" ").map((n) => n[0]).join("").slice(0, 2)}</Text>
          </View>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.email}>{user?.email}</Text>
        </View>

        <View style={s.section}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={item.label} style={[s.menuItem, i === menuItems.length - 1 && { borderBottomWidth: 0 }]} onPress={item.onPress}>
              {item.icon}
              <Text style={s.menuLabel}>{item.label}</Text>
              <View style={{ flex: 1 }} />
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(44,24,16,0.25)" strokeWidth={2}>
                <Path d="M9 18l6-6-6-6" />
              </Svg>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEdit} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}>
                  <Line x1={18} y1={6} x2={6} y2={18} />
                  <Line x1={6} y1={6} x2={18} y2={18} />
                </Svg>
              </TouchableOpacity>
            </View>

            <Text style={s.fieldLabel}>FULL NAME</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="rgba(44,24,16,0.3)" autoFocus />

            <Text style={s.fieldLabel}>EMAIL</Text>
            <View style={[s.input, { backgroundColor: "rgba(44,24,16,0.03)" }]}>
              <Text style={{ fontFamily: fonts.body, fontSize: 14, color: "rgba(44,24,16,0.4)" }}>{user?.email}</Text>
            </View>

            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSaveProfile} disabled={saving}>
              <Text style={s.saveBtnText}>{saving ? "SAVING..." : "SAVE CHANGES"}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.tobacco, marginBottom: 20 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(44,24,16,0.06)", marginBottom: 24 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontFamily: fonts.display, fontSize: 24, color: colors.tobacco },
  name: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.tobacco },
  email: { fontFamily: fonts.body, fontSize: 13, color: "rgba(44,24,16,0.55)", marginTop: 2 },
  section: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: "rgba(44,24,16,0.06)", overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(44,24,16,0.06)" },
  menuLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.tobacco },
  logoutBtn: { marginTop: 24, backgroundColor: "rgba(220,38,38,0.1)", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  logoutText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: "#DC2626" },
  version: { fontFamily: fonts.body, fontSize: 12, color: "rgba(44,24,16,0.25)", textAlign: "center", marginTop: 16, marginBottom: 100 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modal: { backgroundColor: colors.ivory, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontFamily: fonts.displayBlack, fontSize: 20, color: colors.tobacco },
  fieldLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 1, color: "rgba(44,24,16,0.4)", marginBottom: 8 },
  input: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: "rgba(44,24,16,0.08)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontFamily: fonts.body, fontSize: 14, color: colors.tobacco, marginBottom: 16 },
  saveBtn: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 8, marginBottom: 20 },
  saveBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.tobacco, letterSpacing: 0.6 },
});
