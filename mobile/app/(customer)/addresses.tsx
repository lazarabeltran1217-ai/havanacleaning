import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { apiGet, apiPost, apiDelete } from "../../src/lib/api";
import { colors, fonts } from "../../src/lib/theme";

interface Address {
  id: string;
  label: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: "Home", street: "", unit: "", city: "Miami", state: "FL", zipCode: "" });

  const load = async () => {
    try {
      const d = await apiGet("/api/account/addresses");
      setAddresses(d.addresses || []);
    } catch { /* */ } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.street.trim() || !form.zipCode.trim()) {
      Alert.alert("Error", "Street and ZIP code are required");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/api/account/addresses", {
        label: form.label || "Home",
        street: form.street.trim(),
        unit: form.unit.trim() || undefined,
        city: form.city.trim() || "Miami",
        state: form.state.trim() || "FL",
        zipCode: form.zipCode.trim(),
      });
      setShowAdd(false);
      setForm({ label: "Home", street: "", unit: "", city: "Miami", state: "FL", zipCode: "" });
      load();
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to add address");
    } finally { setSaving(false); }
  };

  const handleDelete = (addr: Address) => {
    Alert.alert(
      "Delete Address",
      `Remove "${addr.label}" at ${addr.street}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              await apiDelete("/api/account/addresses", { id: addr.id });
              setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
            } catch (err: unknown) {
              Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete");
            }
          },
        },
      ]
    );
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.gold} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.gold} />}>
        <View style={s.headerRow}>
          <Text style={s.title}>My Addresses</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2.5}>
              <Line x1={12} y1={5} x2={12} y2={19} />
              <Line x1={5} y1={12} x2={19} y2={12} />
            </Svg>
          </TouchableOpacity>
        </View>

        {addresses.map((a) => (
          <View key={a.id} style={s.card}>
            <View style={s.cardRow}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth={2}>
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <Circle cx={12} cy={10} r={3} />
              </Svg>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>{a.label || "Address"}</Text>
                <Text style={s.street}>{a.street}{a.unit ? `, ${a.unit}` : ""}</Text>
                <Text style={s.city}>{a.city}, {a.state} {a.zipCode}</Text>
              </View>
              <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(a)}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2}>
                  <Path d="M3 6h18" />
                  <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {addresses.length === 0 && (
          <View style={s.emptyCard}>
            <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="rgba(44,24,16,0.2)" strokeWidth={1.5}>
              <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <Circle cx={12} cy={10} r={3} />
            </Svg>
            <Text style={s.emptyTitle}>No saved addresses</Text>
            <Text style={s.emptyText}>Add your home or office address</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setShowAdd(true)}>
              <Text style={s.emptyBtnText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>New Address</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}>
                  <Line x1={18} y1={6} x2={6} y2={18} />
                  <Line x1={6} y1={6} x2={18} y2={18} />
                </Svg>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.fieldLabel}>LABEL</Text>
              <View style={s.labelChips}>
                {["Home", "Office", "Other"].map((l) => (
                  <TouchableOpacity key={l} style={[s.chip, form.label === l && s.chipActive]} onPress={() => setForm({ ...form, label: l })}>
                    <Text style={[s.chipText, form.label === l && s.chipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.fieldLabel}>STREET ADDRESS *</Text>
              <TextInput style={s.input} placeholder="123 Main St" placeholderTextColor="rgba(44,24,16,0.3)" value={form.street} onChangeText={(t) => setForm({ ...form, street: t })} />

              <Text style={s.fieldLabel}>UNIT / APT</Text>
              <TextInput style={s.input} placeholder="Apt 4B (optional)" placeholderTextColor="rgba(44,24,16,0.3)" value={form.unit} onChangeText={(t) => setForm({ ...form, unit: t })} />

              <View style={s.rowFields}>
                <View style={{ flex: 2 }}>
                  <Text style={s.fieldLabel}>CITY</Text>
                  <TextInput style={s.input} placeholder="Miami" placeholderTextColor="rgba(44,24,16,0.3)" value={form.city} onChangeText={(t) => setForm({ ...form, city: t })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>STATE</Text>
                  <TextInput style={s.input} placeholder="FL" placeholderTextColor="rgba(44,24,16,0.3)" value={form.state} onChangeText={(t) => setForm({ ...form, state: t })} maxLength={2} autoCapitalize="characters" />
                </View>
              </View>

              <Text style={s.fieldLabel}>ZIP CODE *</Text>
              <TextInput style={s.input} placeholder="33101" placeholderTextColor="rgba(44,24,16,0.3)" value={form.zipCode} onChangeText={(t) => setForm({ ...form, zipCode: t })} keyboardType="number-pad" maxLength={5} />

              <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.5 }]} onPress={handleAdd} disabled={saving}>
                <Text style={s.saveBtnText}>{saving ? "SAVING..." : "SAVE ADDRESS"}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.ivory },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.tobacco },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(44,24,16,0.06)" },
  cardRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.tobacco, marginBottom: 2 },
  street: { fontFamily: fonts.body, fontSize: 14, color: colors.tobacco },
  city: { fontFamily: fonts.body, fontSize: 13, color: "rgba(44,24,16,0.55)", marginTop: 2 },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(220,38,38,0.08)", alignItems: "center", justifyContent: "center" },
  emptyCard: { backgroundColor: colors.white, borderRadius: 16, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "rgba(44,24,16,0.06)", marginTop: 20 },
  emptyTitle: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.tobacco, marginTop: 16 },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: "rgba(44,24,16,0.35)", marginTop: 4 },
  emptyBtn: { backgroundColor: colors.green, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 },
  emptyBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.white },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modal: { backgroundColor: colors.ivory, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontFamily: fonts.displayBlack, fontSize: 20, color: colors.tobacco },
  fieldLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 1, color: "rgba(44,24,16,0.4)", marginBottom: 8, marginTop: 4 },
  labelChips: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(44,24,16,0.1)" },
  chipActive: { backgroundColor: colors.tobacco, borderColor: colors.tobacco },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: "rgba(44,24,16,0.55)" },
  chipTextActive: { color: colors.cream },
  input: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: "rgba(44,24,16,0.08)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontFamily: fonts.body, fontSize: 14, color: colors.tobacco, marginBottom: 16 },
  rowFields: { flexDirection: "row", gap: 12 },
  saveBtn: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 8, marginBottom: 20 },
  saveBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.tobacco, letterSpacing: 0.6 },
});
