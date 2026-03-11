import { Tabs } from "expo-router";
import Svg, { Path, Polyline, Rect, Line, Circle } from "react-native-svg";
import { View, StyleSheet } from "react-native";
import { colors, fonts } from "../../src/lib/theme";

export default function EmployeeLayout() {
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
      <Tabs.Screen name="index" options={{ title: "Today", tabBarIcon: ({ color }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><Polyline points="9 22 9 12 15 12 15 22" /></Svg> }} />
      <Tabs.Screen name="jobs" options={{ title: "Jobs", tabBarIcon: ({ color }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><Polyline points="14 2 14 8 20 8" /><Line x1={16} y1={13} x2={8} y2={13} /><Line x1={16} y1={17} x2={8} y2={17} /></Svg> }} />
      <Tabs.Screen name="clock" options={{ title: "Clock", tabBarIcon: () => <View style={st.el}><Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><Circle cx={12} cy={12} r={10} /><Polyline points="12 6 12 12 16 14" /></Svg></View> }} />
      <Tabs.Screen name="schedule" options={{ title: "Schedule", tabBarIcon: ({ color }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Rect x={3} y={4} width={18} height={18} rx={2} /><Line x1={16} y1={2} x2={16} y2={6} /><Line x1={8} y1={2} x2={8} y2={6} /><Line x1={3} y1={10} x2={21} y2={10} /></Svg> }} />
      <Tabs.Screen name="pay" options={{ title: "Pay", tabBarIcon: ({ color }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Rect x={2} y={5} width={20} height={14} rx={2} /><Line x1={2} y1={10} x2={22} y2={10} /></Svg> }} />
    </Tabs>
  );
}

const st = StyleSheet.create({
  el: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", marginTop: -22, shadowColor: colors.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8, borderWidth: 3.5, borderColor: colors.white },
});
