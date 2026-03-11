import { Tabs } from "expo-router";
import Svg, { Path, Polyline, Rect, Line, Circle } from "react-native-svg";
import { View, StyleSheet } from "react-native";
import { colors, fonts } from "../../src/lib/theme";

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: "rgba(44,24,16,0.06)", height: 85, paddingBottom: 28 },
        tabBarActiveTintColor: colors.greenLight,
        tabBarInactiveTintColor: "rgba(44,24,16,0.35)",
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><Polyline points="9 22 9 12 15 12 15 22" /></Svg> }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings", tabBarIcon: ({ color }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Rect x={3} y={4} width={18} height={18} rx={2} /><Line x1={16} y1={2} x2={16} y2={6} /><Line x1={8} y1={2} x2={8} y2={6} /><Line x1={3} y1={10} x2={21} y2={10} /></Svg> }} />
      <Tabs.Screen name="create" options={{ title: "New", tabBarIcon: () => <View style={st.el}><Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><Line x1={12} y1={5} x2={12} y2={19} /><Line x1={5} y1={12} x2={19} y2={12} /></Svg></View> }} />
      <Tabs.Screen name="clients" options={{ title: "Clients", tabBarIcon: ({ color }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><Circle cx={9} cy={7} r={4} /><Path d="M23 21v-2a4 4 0 0 0-3-3.87" /><Path d="M16 3.13a4 4 0 0 1 0 7.75" /></Svg> }} />
      <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Line x1={4} y1={6} x2={20} y2={6} /><Line x1={4} y1={12} x2={20} y2={12} /><Line x1={4} y1={18} x2={20} y2={18} /></Svg> }} />
    </Tabs>
  );
}

const st = StyleSheet.create({
  el: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", marginTop: -22, shadowColor: colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8, borderWidth: 3.5, borderColor: colors.white },
});
