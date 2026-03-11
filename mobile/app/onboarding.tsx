import { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import Svg, { Path, Polyline, Rect, Line, Circle } from "react-native-svg";
import { colors, fonts } from "../src/lib/theme";

const { width } = Dimensions.get("window");

const slides = [
  {
    icon: (
      <Svg width={72} height={72} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 2L2 7l10 5 10-5-10-5z" />
        <Path d="M2 17l10 5 10-5" />
        <Path d="M2 12l10 5 10-5" />
      </Svg>
    ),
    title: "Welcome to\nHavana Cleaning",
    desc: "Professional, family-owned cleaning service bringing warmth and care to every home we touch.",
  },
  {
    icon: (
      <Svg width={72} height={72} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={3} y={4} width={18} height={18} rx={2} />
        <Line x1={16} y1={2} x2={16} y2={6} />
        <Line x1={8} y1={2} x2={8} y2={6} />
        <Line x1={3} y1={10} x2={21} y2={10} />
      </Svg>
    ),
    title: "Book in\nJust Minutes",
    desc: "Choose your service, pick a date, and get instant pricing. No phone calls needed.",
  },
  {
    icon: (
      <Svg width={72} height={72} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <Polyline points="22 4 12 14.01 9 11.01" />
      </Svg>
    ),
    title: "Track &\nManage",
    desc: "View upcoming bookings, manage payments, and stay updated with your cleaning schedule.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const finish = async () => {
    await SecureStore.setItemAsync("havana_onboarded", "true");
    router.replace("/login");
  };

  const next = () => {
    if (current < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: current + 1, animated: true });
      setCurrent(current + 1);
    } else {
      finish();
    }
  };

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.skipBtn} onPress={finish}>
        <Text style={s.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrent(idx);
        }}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={s.slide}>
            <View style={s.iconWrap}>{item.icon}</View>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.desc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={s.footer}>
        <View style={s.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[s.dot, i === current && s.dotActive]} />
          ))}
        </View>
        <View style={s.actions}>
          <TouchableOpacity style={s.skipAction} onPress={finish}>
            <Text style={s.skipActionText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.nextAction} onPress={next}>
            <Text style={s.nextActionText}>
              {current === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.tobacco },
  skipBtn: { position: "absolute", top: 60, right: 24, zIndex: 10 },
  skipText: { color: colors.sand, fontSize: 14, fontFamily: fonts.bodyMedium, opacity: 0.6 },
  slide: { width, flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36, paddingBottom: 160 },
  iconWrap: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(201,148,26,0.08)", borderWidth: 2, borderColor: "rgba(201,148,26,0.15)",
    alignItems: "center", justifyContent: "center", marginBottom: 40,
  },
  title: { fontFamily: fonts.displayBlack, fontSize: 28, color: colors.cream, textAlign: "center", lineHeight: 33 },
  desc: { fontFamily: fonts.body, fontSize: 15, color: colors.sand, textAlign: "center", lineHeight: 24, opacity: 0.8, maxWidth: 300, marginTop: 14 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 36, paddingBottom: 52 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(201,148,26,0.25)" },
  dotActive: { width: 24, backgroundColor: colors.gold },
  actions: { flexDirection: "row", gap: 12 },
  skipAction: { flex: 1, paddingVertical: 16, borderRadius: 12, borderWidth: 1.5, borderColor: "rgba(212,184,150,0.25)", alignItems: "center" },
  skipActionText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.sand },
  nextAction: { flex: 2, paddingVertical: 16, borderRadius: 12, backgroundColor: colors.gold, alignItems: "center" },
  nextActionText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.tobacco },
});
