import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Svg, { Path, Line, Circle, Rect } from "react-native-svg";
import { useAuth } from "../../src/context/AuthContext";
import { colors, fonts } from "../../src/lib/theme";

const menuItems = [
  { label: "Staff", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><Circle cx={9} cy={7} r={4} /></Svg> },
  { label: "Payroll", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}><Line x1={12} y1={1} x2={12} y2={23} /><Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Svg> },
  { label: "Revenue", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}><Path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><Path d="M22 12A10 10 0 0 0 12 2v10z" /></Svg> },
  { label: "Inventory", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}><Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></Svg> },
  { label: "Services", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}><Path d="M12 3l1.5 3.2 3.5.5-2.5 2.5.6 3.5L12 11l-3.1 1.7.6-3.5L7 6.7l3.5-.5z" /></Svg> },
  { label: "Settings", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.tobacco} strokeWidth={2}><Circle cx={12} cy={12} r={3} /><Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83" /></Svg> },
];

export default function MoreScreen() {
  const { logout } = useAuth();

  return (
    <View style={s.container}>
      <Text style={s.title}>More</Text>
      <View style={s.section}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={s.menuItem}>
            {item.icon}
            <Text style={s.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert("Sign Out", "Are you sure?", [{ text: "Cancel" }, { text: "Sign Out", style: "destructive", onPress: logout }])}>
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.tobacco, marginBottom: 20 },
  section: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: "rgba(44,24,16,0.06)", overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(44,24,16,0.06)" },
  menuLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.tobacco },
  logoutBtn: { marginTop: 24, backgroundColor: "rgba(220,38,38,0.1)", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  logoutText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: "#DC2626" },
});
