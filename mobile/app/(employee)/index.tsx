import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import Svg, { Path, Circle, Polyline, Rect, Line } from "react-native-svg";
import { useAuth } from "../../src/context/AuthContext";
import { apiGet } from "../../src/lib/api";
import { colors, fonts } from "../../src/lib/theme";

interface PortalData {
  clock: { isClockedIn: boolean; currentEntry: unknown };
  todayJobs: Array<{ booking: { id: string; bookingNumber: string; scheduledTime: string; status: string; service: { name: string }; customer: { name: string; phone: string }; address: { street: string; city: string } } }>;
  hours: { summary: { totalHours: number; totalEntries: number; estimatedEarnings: number } };
  profile: { name: string };
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const d = await apiGet("/api/portal/dashboard");
      setData(d);
    } catch { /* */ } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.gold} /></View>;

  const firstName = (data?.profile?.name || user?.name || "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.gold} />}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.greeting}>{greeting}</Text>
            <Text style={s.name}>{firstName}</Text>
          </View>
          <View style={[s.avatar, { backgroundColor: colors.green }]}>
            <Text style={s.avatarText}>{(data?.profile?.name || "").split(" ").map((n) => n[0]).join("").slice(0, 2)}</Text>
          </View>
        </View>

        {/* Clock Card */}
        <View style={s.clockCard}>
          <View style={s.clockIconWrap}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
              <Circle cx={12} cy={12} r={10} /><Polyline points="12 6 12 12 16 14" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.clockStatus}>{data?.clock.isClockedIn ? "Clocked In" : "Not Clocked In"}</Text>
            <Text style={s.clockTime}>{data?.clock.isClockedIn ? "Shift in progress" : "Tap to start your shift"}</Text>
          </View>
          <TouchableOpacity style={s.clockBtn}>
            <Text style={s.clockBtnText}>{data?.clock.isClockedIn ? "Clock Out" : "Clock In"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.body}>
        {/* Week summary */}
        <View style={s.weekRow}>
          <View style={s.weekStat}><Text style={s.weekVal}>{(data?.hours.summary.totalHours || 0).toFixed(1)}</Text><Text style={s.weekLabel}>Hours</Text></View>
          <View style={s.weekStat}><Text style={s.weekVal}>{data?.hours.summary.totalEntries || 0}</Text><Text style={s.weekLabel}>Jobs</Text></View>
          <View style={s.weekStat}><Text style={[s.weekVal, { color: colors.greenLight }]}>${(data?.hours.summary.estimatedEarnings || 0).toFixed(0)}</Text><Text style={s.weekLabel}>Earnings</Text></View>
        </View>

        {/* Today's Jobs */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Today&apos;s Jobs</Text>
          <Text style={s.jobCount}>{data?.todayJobs?.length || 0} jobs</Text>
        </View>

        {data?.todayJobs?.length === 0 && <View style={s.emptyCard}><Text style={s.emptyText}>No jobs scheduled for today</Text></View>}

        {data?.todayJobs?.map((j) => (
          <View key={j.booking.id} style={s.jobCard}>
            <View style={s.jobHeader}>
              <View>
                <Text style={s.jobTime}>{j.booking.scheduledTime || "TBD"} - {j.booking.service.name}</Text>
                <Text style={s.bookingNum}>{j.booking.bookingNumber}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: j.booking.status === "CONFIRMED" ? "rgba(201,148,26,0.1)" : "rgba(232,168,32,0.1)" }]}>
                <Text style={[s.badgeText, { color: j.booking.status === "CONFIRMED" ? colors.gold : colors.amber }]}>{j.booking.status}</Text>
              </View>
            </View>
            <Text style={s.customer}>{j.booking.customer.name} - {j.booking.customer.phone}</Text>
            <View style={s.addressRow}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(44,24,16,0.35)" strokeWidth={2}>
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx={12} cy={10} r={3} />
              </Svg>
              <Text style={s.addressText}>{j.booking.address.street}, {j.booking.address.city}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.ivory },
  header: { backgroundColor: colors.tobacco, paddingTop: 54, paddingHorizontal: 24, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  greeting: { fontFamily: fonts.body, fontSize: 13, color: colors.sand, opacity: 0.8 },
  name: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.cream, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.display, fontSize: 18, color: colors.tobacco },
  clockCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(45,106,79,0.12)", borderWidth: 1.5, borderColor: "rgba(82,183,136,0.2)", borderRadius: 16, padding: 18 },
  clockIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" },
  clockStatus: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.cream },
  clockTime: { fontFamily: fonts.body, fontSize: 13, color: colors.sand, opacity: 0.7, marginTop: 2 },
  clockBtn: { paddingHorizontal: 22, paddingVertical: 10, backgroundColor: colors.greenLight, borderRadius: 10 },
  clockBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: "white" },
  body: { padding: 20, paddingBottom: 100 },
  weekRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  weekStat: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(44,24,16,0.06)", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  weekVal: { fontFamily: fonts.displayBlack, fontSize: 22, color: colors.tobacco },
  weekLabel: { fontFamily: fonts.body, fontSize: 11, color: "rgba(44,24,16,0.55)", marginTop: 2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.tobacco },
  jobCount: { fontFamily: fonts.body, fontSize: 13, color: "rgba(44,24,16,0.35)" },
  jobCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(44,24,16,0.06)", borderRadius: 16, padding: 16, marginBottom: 12 },
  jobHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  jobTime: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.tobacco },
  bookingNum: { fontFamily: fonts.body, fontSize: 12, color: "rgba(44,24,16,0.35)", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontFamily: fonts.bodySemiBold, fontSize: 11, textTransform: "uppercase" },
  customer: { fontFamily: fonts.body, fontSize: 13, color: "rgba(44,24,16,0.55)", marginBottom: 6 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  addressText: { fontFamily: fonts.body, fontSize: 12, color: "rgba(44,24,16,0.35)" },
  emptyCard: { backgroundColor: colors.white, borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(44,24,16,0.06)" },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: "rgba(44,24,16,0.35)" },
});
