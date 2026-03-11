import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../src/lib/theme";
export default function AdminBookingsScreen() {
  return <View style={s.c}><Text style={s.t}>Bookings</Text><Text style={s.st}>All bookings from your dashboard</Text></View>;
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: colors.ivory, justifyContent: "center", alignItems: "center" }, t: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.tobacco, marginBottom: 8 }, st: { fontFamily: fonts.body, fontSize: 14, color: "rgba(44,24,16,0.55)" } });
