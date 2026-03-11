import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../src/lib/theme";

export default function BookScreen() {
  return (
    <View style={s.container}>
      <Text style={s.title}>Book a Cleaning</Text>
      <Text style={s.subtitle}>Coming soon - use havanacleaning.com/book to schedule</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  title: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.tobacco, marginBottom: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: "rgba(44,24,16,0.55)", textAlign: "center" },
});
