import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import Svg, { Path, Polyline, Rect, Line, Circle } from "react-native-svg";
import { apiGet } from "../../src/lib/api";
import { colors, fonts } from "../../src/lib/theme";

interface AdminData {
  totalBookings: number;
  todayBookings: number;
  confirmedToday: number;
  totalRevenue: number;
  totalCustomers: number;
  totalEmployees: number;
  recentBookings: Array<{
    id: string;
    bookingNumber: string;
    scheduledDate: string;
    scheduledTime: string;
    total: number;
    status: string;
    customer: { name: string };
    service: { name: string };
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const d = await apiGet("/api/admin/bookings");
      // Parse what we can from the admin bookings API
      const bookings = d.bookings || d || [];
      const today = new Date().toISOString().split("T")[0];
      const todayBookings = Array.isArray(bookings) ? bookings.filter((b: { scheduledDate: string }) => b.scheduledDate?.startsWith(today)) : [];
      setData({
        totalBookings: Array.isArray(bookings) ? bookings.length : 0,
        todayBookings: todayBookings.length,
        confirmedToday: todayBookings.filter((b: { status: string }) => b.status === "CONFIRMED").length,
        totalRevenue: Array.isArray(bookings) ? bookings.reduce((sum: number, b: { total?: number }) => sum + (b.total || 0), 0) : 0,
        totalCustomers: 0,
        totalEmployees: 0,
        recentBookings: Array.isArray(bookings) ? bookings.slice(0, 5) : [],
      });
    } catch { /* */ } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.gold} /></View>;

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.gold} />}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.dashTitle}>Dashboard</Text>
            <Text style={s.date}>{today}</Text>
          </View>
          <View style={[s.avatar, { backgroundColor: colors.rum }]}>
            <Text style={s.avatarText}>HC</Text>
          </View>
        </View>

        {/* Overview Stats */}
        <View style={s.overviewGrid}>
          <View style={s.overviewCard}>
            <Text style={s.overviewLabel}>REVENUE</Text>
            <Text style={s.overviewValue}>${(data?.totalRevenue || 0).toLocaleString()}</Text>
          </View>
          <View style={s.overviewCard}>
            <Text style={s.overviewLabel}>BOOKINGS TODAY</Text>
            <Text style={s.overviewValue}>{data?.todayBookings || 0}</Text>
            <Text style={s.overviewChange}>{data?.confirmedToday || 0} confirmed</Text>
          </View>
          <View style={s.overviewCard}>
            <Text style={s.overviewLabel}>TOTAL BOOKINGS</Text>
            <Text style={s.overviewValue}>{data?.totalBookings || 0}</Text>
          </View>
          <View style={s.overviewCard}>
            <Text style={s.overviewLabel}>ACTIVE STAFF</Text>
            <Text style={s.overviewValue}>{data?.totalEmployees || "--"}</Text>
          </View>
        </View>
      </View>

      <View style={s.body}>
        {/* Quick Actions */}
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.quickGrid}>
          {[
            { label: "Bookings", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}><Rect x={3} y={4} width={18} height={18} rx={2} /><Line x1={16} y1={2} x2={16} y2={6} /><Line x1={8} y1={2} x2={8} y2={6} /><Line x1={3} y1={10} x2={21} y2={10} /></Svg> },
            { label: "Staff", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><Circle cx={9} cy={7} r={4} /></Svg> },
            { label: "Payroll", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}><Line x1={12} y1={1} x2={12} y2={23} /><Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Svg> },
            { label: "Clients", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx={12} cy={7} r={4} /></Svg> },
            { label: "Schedule", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}><Rect x={2} y={3} width={20} height={14} rx={2} /><Line x1={8} y1={21} x2={16} y2={21} /><Line x1={12} y1={17} x2={12} y2={21} /></Svg> },
            { label: "Revenue", icon: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}><Path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><Path d="M22 12A10 10 0 0 0 12 2v10z" /></Svg> },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={s.quickItem}>
              <View style={s.quickIcon}>{item.icon}</View>
              <Text style={s.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Bookings */}
        <View style={s.recentCard}>
          <View style={s.recentHeader}>
            <Text style={s.chartTitle}>Recent Bookings</Text>
            <TouchableOpacity><Text style={s.seeAll}>View all</Text></TouchableOpacity>
          </View>
          {data?.recentBookings?.map((b) => (
            <View key={b.id} style={s.bookingRow}>
              <View style={[s.svcIcon, { backgroundColor: "rgba(201,148,26,0.1)" }]}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}>
                  <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <Polyline points="9 22 9 12 15 12 15 22" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.bookingName}>{b.customer?.name || "Customer"}</Text>
                <Text style={s.bookingMeta}>{b.service?.name || "Cleaning"} - {b.scheduledTime || new Date(b.scheduledDate).toLocaleDateString()}</Text>
              </View>
              <Text style={s.bookingAmount}>${b.total || 0}</Text>
            </View>
          ))}
          {(!data?.recentBookings || data.recentBookings.length === 0) && <Text style={s.emptyText}>No recent bookings</Text>}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.ivory },
  header: { backgroundColor: colors.tobacco, paddingTop: 54, paddingHorizontal: 24, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  dashTitle: { fontFamily: fonts.displayBlack, fontSize: 22, color: colors.cream },
  date: { fontFamily: fonts.body, fontSize: 13, color: colors.sand, opacity: 0.7 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.display, fontSize: 18, color: colors.cream },
  overviewGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 },
  overviewCard: { width: "48%" as unknown as number, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(201,148,26,0.12)", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 },
  overviewLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.sand, opacity: 0.7, letterSpacing: 0.6 },
  overviewValue: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.cream, marginTop: 4 },
  overviewChange: { fontFamily: fonts.body, fontSize: 11, color: colors.greenLight, marginTop: 2 },
  body: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.tobacco, marginBottom: 12 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  quickItem: { width: "31%" as unknown as number, backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(44,24,16,0.06)", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  quickIcon: { width: 40, height: 40, backgroundColor: "rgba(201,148,26,0.08)", borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  quickLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: "rgba(44,24,16,0.55)" },
  recentCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(44,24,16,0.06)", borderRadius: 16, padding: 18 },
  recentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  chartTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.tobacco },
  seeAll: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.greenLight },
  bookingRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(44,24,16,0.08)" },
  svcIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  bookingName: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.tobacco },
  bookingMeta: { fontFamily: fonts.body, fontSize: 12, color: "rgba(44,24,16,0.55)", marginTop: 1 },
  bookingAmount: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.tobacco },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: "rgba(44,24,16,0.35)", textAlign: "center", paddingVertical: 20 },
});
