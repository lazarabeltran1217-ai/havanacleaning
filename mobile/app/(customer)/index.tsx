import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import Svg, { Path, Polyline, Rect, Line, Circle } from "react-native-svg";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { apiGet } from "../../src/lib/api";
import { colors, fonts } from "../../src/lib/theme";

interface DashData {
  profile: { name: string };
  upcomingBookings: Array<{
    id: string;
    bookingNumber: string;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
    service: { name: string; icon: string };
    address: { street: string; city: string; state: string };
  }>;
  stats: { totalBookings: number; totalSpent: number };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    CONFIRMED: { bg: "rgba(201,148,26,0.1)", color: colors.gold },
    PENDING: { bg: "rgba(232,168,32,0.1)", color: colors.amber },
    COMPLETED: { bg: "rgba(45,106,79,0.1)", color: colors.greenLight },
    CANCELLED: { bg: "rgba(220,38,38,0.1)", color: "#DC2626" },
  };
  const style = map[status] || map.PENDING;
  return (
    <View style={[s.badge, { backgroundColor: style.bg }]}>
      <Text style={[s.badgeText, { color: style.color }]}>{status}</Text>
    </View>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const d = await apiGet("/api/account/dashboard");
      setData(d);
    } catch {
      // Error loading
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <View style={s.loadWrap}><ActivityIndicator size="large" color={colors.gold} /></View>;
  }

  const firstName = (data?.profile?.name || user?.name || "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const quickActions = [
    { label: "Book", tab: "/(customer)/book", icon: <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}><Rect x={3} y={4} width={18} height={18} rx={2} /><Line x1={16} y1={2} x2={16} y2={6} /><Line x1={8} y1={2} x2={8} y2={6} /><Line x1={3} y1={10} x2={21} y2={10} /><Line x1={12} y1={14} x2={12} y2={18} /><Line x1={10} y1={16} x2={14} y2={16} /></Svg> },
    { label: "History", tab: "/(customer)/bookings", icon: <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}><Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><Polyline points="14 2 14 8 20 8" /><Line x1={16} y1={13} x2={8} y2={13} /><Line x1={16} y1={17} x2={8} y2={17} /></Svg> },
    { label: "Profile", tab: "/(customer)/settings", icon: <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx={12} cy={7} r={4} /></Svg> },
    { label: "Settings", tab: "/(customer)/settings", icon: <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}><Circle cx={12} cy={12} r={3} /><Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" /></Svg> },
  ];

  return (
    <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.gold} />}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.greeting}>{greeting}</Text>
            <Text style={s.name}>{firstName}</Text>
          </View>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {(data?.profile?.name || "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.quickRow}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.label} style={s.quickAction} onPress={() => router.push(a.tab as never)}>
              <View style={s.quickIcon}>{a.icon}</View>
              <Text style={s.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Body */}
      <View style={s.body}>
        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{data?.stats.totalBookings || 0}</Text>
            <Text style={s.statLabel}>Total Bookings</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: colors.greenLight }]}>{data?.upcomingBookings?.length || 0}</Text>
            <Text style={s.statLabel}>Upcoming</Text>
          </View>
        </View>

        {/* Upcoming */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Upcoming</Text>
          <TouchableOpacity onPress={() => router.push("/(customer)/bookings" as never)}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {data?.upcomingBookings?.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No upcoming bookings</Text>
          </View>
        )}

        {data?.upcomingBookings?.map((b) => (
          <View key={b.id} style={s.bookingCard}>
            <View style={s.bookingHeader}>
              <View style={s.bookingService}>
                <View style={[s.svcIcon, { backgroundColor: "rgba(201,148,26,0.1)" }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}>
                    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <Polyline points="9 22 9 12 15 12 15 22" />
                  </Svg>
                </View>
                <View>
                  <Text style={s.serviceName}>{b.service.name}</Text>
                  <Text style={s.bookingNum}>{b.bookingNumber}</Text>
                </View>
              </View>
              <StatusBadge status={b.status} />
            </View>
            <View style={s.bookingDetails}>
              <View style={s.detailRow}>
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(44,24,16,0.35)" strokeWidth={2}>
                  <Rect x={3} y={4} width={18} height={18} rx={2} />
                  <Line x1={16} y1={2} x2={16} y2={6} />
                  <Line x1={8} y1={2} x2={8} y2={6} />
                  <Line x1={3} y1={10} x2={21} y2={10} />
                </Svg>
                <Text style={s.detailText}>
                  {new Date(b.scheduledDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  {b.scheduledTime ? ` at ${b.scheduledTime}` : ""}
                </Text>
              </View>
              <View style={s.detailRow}>
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(44,24,16,0.35)" strokeWidth={2}>
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <Circle cx={12} cy={10} r={3} />
                </Svg>
                <Text style={s.detailText}>{b.address?.street}, {b.address?.city}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  loadWrap: { flex: 1, backgroundColor: colors.ivory, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: colors.tobacco, paddingTop: 54, paddingHorizontal: 24, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  greeting: { fontFamily: fonts.body, fontSize: 13, color: colors.sand, opacity: 0.8 },
  name: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.cream, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.display, fontSize: 18, color: colors.tobacco },
  quickRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  quickAction: { flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(201,148,26,0.15)", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  quickIcon: { width: 36, height: 36, backgroundColor: "rgba(201,148,26,0.15)", borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  quickLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.sand },
  body: { padding: 20, paddingBottom: 100 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(44,24,16,0.06)", borderRadius: 16, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  statValue: { fontFamily: fonts.displayBlack, fontSize: 28, color: colors.tobacco },
  statLabel: { fontFamily: fonts.body, fontSize: 12, color: "rgba(44,24,16,0.55)", marginTop: 2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.tobacco },
  seeAll: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.greenLight },
  bookingCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(44,24,16,0.06)", borderRadius: 16, padding: 18, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  bookingService: { flexDirection: "row", alignItems: "center", gap: 10 },
  svcIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  serviceName: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.tobacco },
  bookingNum: { fontFamily: fonts.body, fontSize: 12, color: "rgba(44,24,16,0.35)", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontFamily: fonts.bodySemiBold, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.3 },
  bookingDetails: { gap: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontFamily: fonts.body, fontSize: 13, color: "rgba(44,24,16,0.55)" },
  emptyCard: { backgroundColor: colors.white, borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(44,24,16,0.06)" },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: "rgba(44,24,16,0.35)" },
});
