import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import Svg, { Path, Polyline, Rect, Line, Circle } from "react-native-svg";
import { apiGet } from "../../src/lib/api";
import { colors, fonts } from "../../src/lib/theme";

interface Booking {
  id: string;
  bookingNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  total: number;
  service: { name: string };
  address: { street: string; city: string; state: string };
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

type Filter = "ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED";

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("ALL");

  const load = async () => {
    try {
      const d = await apiGet("/api/account/dashboard");
      setBookings(d.allBookings || []);
    } catch { /* */ } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = bookings.filter((b) => {
    if (filter === "ALL") return true;
    if (filter === "UPCOMING") return b.status === "CONFIRMED" || b.status === "PENDING";
    if (filter === "COMPLETED") return b.status === "COMPLETED";
    if (filter === "CANCELLED") return b.status === "CANCELLED";
    return true;
  });

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.gold} /></View>;

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.gold} />}>
      <Text style={s.title}>My Bookings</Text>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterContent}>
        {(["ALL", "UPCOMING", "COMPLETED", "CANCELLED"] as Filter[]).map((f) => (
          <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map((b) => (
        <View key={b.id} style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.row}>
              <View style={s.icon}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}>
                  <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <Polyline points="9 22 9 12 15 12 15 22" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.serviceName}>{b.service?.name}</Text>
                <Text style={s.bookingNum}>{b.bookingNumber}</Text>
              </View>
            </View>
            <StatusBadge status={b.status} />
          </View>

          <View style={s.details}>
            <View style={s.detailRow}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(44,24,16,0.4)" strokeWidth={2}>
                <Rect x={3} y={4} width={18} height={18} rx={2} />
                <Line x1={16} y1={2} x2={16} y2={6} />
                <Line x1={8} y1={2} x2={8} y2={6} />
                <Line x1={3} y1={10} x2={21} y2={10} />
              </Svg>
              <Text style={s.detailText}>
                {new Date(b.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                {b.scheduledTime ? ` at ${b.scheduledTime}` : ""}
              </Text>
            </View>
            {b.address && (
              <View style={s.detailRow}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(44,24,16,0.4)" strokeWidth={2}>
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <Circle cx={12} cy={10} r={3} />
                </Svg>
                <Text style={s.detailText}>{b.address.street}, {b.address.city}</Text>
              </View>
            )}
            {b.total > 0 && (
              <View style={s.detailRow}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(44,24,16,0.4)" strokeWidth={2}>
                  <Line x1={12} y1={1} x2={12} y2={23} />
                  <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </Svg>
                <Text style={s.detailText}>${b.total.toFixed(2)}</Text>
              </View>
            )}
          </View>
        </View>
      ))}

      {filtered.length === 0 && (
        <View style={s.emptyCard}>
          <Text style={s.empty}>{filter === "ALL" ? "No bookings yet" : `No ${filter.toLowerCase()} bookings`}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.ivory },
  title: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.tobacco, marginBottom: 16 },
  filterRow: { marginBottom: 20, flexGrow: 0 },
  filterContent: { gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(44,24,16,0.08)" },
  filterChipActive: { backgroundColor: colors.tobacco, borderColor: colors.tobacco },
  filterText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: "rgba(44,24,16,0.55)", textTransform: "uppercase", letterSpacing: 0.5 },
  filterTextActive: { color: colors.cream },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(44,24,16,0.06)" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  icon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(201,148,26,0.1)", alignItems: "center", justifyContent: "center" },
  serviceName: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.tobacco },
  bookingNum: { fontFamily: fonts.body, fontSize: 12, color: "rgba(44,24,16,0.35)", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontFamily: fonts.bodySemiBold, fontSize: 11, textTransform: "uppercase" },
  details: { gap: 8, borderTopWidth: 1, borderTopColor: "rgba(44,24,16,0.06)", paddingTop: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontFamily: fonts.body, fontSize: 13, color: "rgba(44,24,16,0.55)" },
  emptyCard: { backgroundColor: colors.white, borderRadius: 16, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "rgba(44,24,16,0.06)" },
  empty: { fontFamily: fonts.body, fontSize: 14, color: "rgba(44,24,16,0.35)", textAlign: "center" },
});
