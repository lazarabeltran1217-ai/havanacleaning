"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  XCircle,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Download,
  ClipboardCheck,
  Globe,
  Users,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Wrench,
  Languages,
  Smartphone,
  Search,
  Moon,
  BarChart3,
  Calendar,
  Package,
  FileText,
  MessageSquare,
  Settings,
  PenTool,
  Star,
  UserPlus,
  Building2,
} from "lucide-react";

/* ─── Types ─── */
type TestStatus = "untested" | "pass" | "fail";

interface TestItem {
  id: string;
  label: string;
  hint?: string;
  status: TestStatus;
  note: string;
}

interface TestSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  items: TestItem[];
  collapsed: boolean;
}

/* ─── UAT Data ─── */
function buildSections(): TestSection[] {
  const s = (
    id: string,
    title: string,
    icon: React.ReactNode,
    color: string,
    items: [string, string?][]
  ): TestSection => ({
    id,
    title,
    icon,
    color,
    collapsed: true,
    items: items.map(([label, hint], i) => ({
      id: `${id}-${i}`,
      label,
      hint,
      status: "untested" as TestStatus,
      note: "",
    })),
  });

  return [
    /* ── 1. PUBLIC WEBSITE ── */
    s("pub-home", "Homepage", <Globe className="w-4 h-4" />, "text-teal", [
      ["Hero section loads with video or fallback image", "Check eyebrow, headline, subtitle, CTAs"],
      ["Hero stats display (500+ homes, 4.9 rating, 20+ areas)"],
      ["Trust bar shows 5 checkmarks (background-checked, same-day, bilingual, guaranteed, nationwide)"],
      ["Services section loads with dynamic service cards from DB"],
      ["About section displays editable content"],
      ["Handyman services showcase renders (NYC badge, 6 cards)"],
      ["Testimonials section shows featured reviews with ratings"],
      ["FAQ section renders with expandable accordions"],
      ["Service areas section shows clickable area links"],
      ["Final CTA section with dual buttons works"],
      ["Dark mode toggle works across all homepage sections"],
      ["Language switcher (EN/ES) translates all content"],
    ]),

    s("pub-services", "Services & Pricing Pages", <Star className="w-4 h-4" />, "text-gold", [
      ["Services listing page loads with all active services", "/services"],
      ["Service detail pages load with full content", "/services/[slug]"],
      ["Service detail shows pricing table (bedroom/bathroom matrix)"],
      ["Service detail shows features, benefits, FAQs, add-ons"],
      ["'Book This Service' CTA navigates to booking page"],
      ["Pricing page loads with all service pricing", "/pricing"],
      ["Recurring plan discounts display (weekly 20%, biweekly 15%, monthly 10%)"],
      ["Add-on services listed with prices"],
    ]),

    s("pub-book", "Booking Flow", <Calendar className="w-4 h-4" />, "text-green", [
      ["Step 1 - Service selection shows all active services with icons"],
      ["Step 2 - Area/item selection shows included vs extra items with pricing"],
      ["Step 3 - Date picker, time window (morning/midday/afternoon) work"],
      ["Step 3 - Frequency selector shows discount percentages"],
      ["Step 3 - Rush option and add-ons selectable"],
      ["Step 3 - Special instructions text field works"],
      ["Step 4 - Contact form pre-fills if logged in"],
      ["Step 4 - Address fields (street, unit, city, state, zip) work"],
      ["Step 4 - Saved address selection works for logged-in users"],
      ["Step 4 - Stripe card payment element loads and accepts input"],
      ["Price calculation updates live (base + rooms + extras + add-ons - discounts)"],
      ["Booking confirmation page shows with booking number"],
      ["Booking appears in customer account after completion"],
    ]),

    s("pub-handyman", "Handyman Flow", <Wrench className="w-4 h-4" />, "text-amber", [
      ["Handyman page loads with hero, trust signals, service grid", "/handyman"],
      ["Handyman service categories display with pricing from DB"],
      ["Handyman booking wizard opens and allows multi-category selection"],
      ["Project description, date/time, address, rush option all work"],
      ["Contact info form + account creation option works"],
      ["Success page shows after submission"],
      ["Inquiry appears in admin handyman panel"],
    ]),

    s("pub-other", "Other Public Pages", <FileText className="w-4 h-4" />, "text-sand", [
      ["About page loads with company info", "/about"],
      ["FAQ page shows expandable questions", "/faq"],
      ["Reviews page shows customer testimonials", "/reviews"],
      ["Blog listing loads with posts", "/blog"],
      ["Blog detail page renders full post", "/blog/[slug]"],
      ["Careers page loads with application form", "/careers"],
      ["Career application submit + success page work"],
      ["Commercial cleaning inquiry form works", "/commercial"],
      ["Commercial success page displays"],
      ["Service areas listing loads", "/areas"],
      ["Individual area detail pages work", "/areas/[slug]"],
      ["Privacy policy page loads", "/privacy"],
      ["Terms of service page loads", "/terms"],
      ["Support/contact page loads", "/support"],
    ]),

    /* ── 2. AUTHENTICATION ── */
    s("auth", "Authentication & Roles", <ShieldCheck className="w-4 h-4" />, "text-red-400", [
      ["Login page loads with email/password fields", "/login"],
      ["Login with valid CUSTOMER credentials redirects to /account"],
      ["Login with valid EMPLOYEE credentials redirects to /portal"],
      ["Login with valid OWNER credentials redirects to /admin"],
      ["Invalid credentials show error message"],
      ["Registration page loads and creates account", "/register"],
      ["Auto-login after registration works"],
      ["Forgot password sends reset email", "/forgot-password"],
      ["Password reset link works and updates password"],
      ["Logout button works from all portals"],
      ["Unauthorized access to /admin redirects to /login"],
      ["Unauthorized access to /portal redirects to /login"],
      ["Unauthorized access to /account redirects to /login"],
      ["Google OAuth button present (if configured)"],
    ]),

    /* ── 3. CUSTOMER PORTAL ── */
    s("cust-dash", "Customer Dashboard", <Users className="w-4 h-4" />, "text-teal", [
      ["Dashboard loads with greeting banner (time-of-day aware)", "/account"],
      ["Quick stats badges show (upcoming, total bookings, addresses)"],
      ["Upcoming bookings card displays current/future bookings"],
      ["Quick Actions: 'Book a Cleaning' opens booking wizard"],
      ["Quick Actions: 'Book a Handyman' opens handyman wizard"],
      ["Stats grid shows total bookings, total spent, upcoming, addresses"],
      ["My Bookings section shows all bookings with filter tabs"],
      ["Booking filter tabs work (All, Upcoming, Completed, Cancelled)"],
      ["Pay Now button opens Stripe payment for unpaid bookings"],
      ["My Addresses section lists saved addresses"],
      ["Add address form works (label, street, unit, city, zip)"],
      ["Handyman Requests section shows inquiries or empty state"],
      ["Book a Handyman link works from handyman section"],
    ]),

    s("cust-sub", "Customer Sub-Pages", <ClipboardCheck className="w-4 h-4" />, "text-gold", [
      ["My Bookings page loads with all bookings", "/account/bookings"],
      ["Booking cards show service, status, date, price, address"],
      ["Pay Now navigates to payment page"],
      ["Payment page loads Stripe form", "/account/bookings/[id]/pay"],
      ["Payment completes and booking status updates"],
      ["3D Secure redirect works and returns to account"],
      ["My Addresses page shows saved addresses", "/account/addresses"],
      ["Add/edit/delete addresses work"],
      ["Default address marking works"],
      ["Settings page loads with profile info", "/account/settings"],
      ["Edit name, phone, language preference and save"],
      ["Language change persists across pages"],
    ]),

    /* ── 4. EMPLOYEE PORTAL ── */
    s("emp-portal", "Employee Portal", <Briefcase className="w-4 h-4" />, "text-green", [
      ["Portal dashboard loads with welcome banner", "/portal"],
      ["Banner shows current date, job count, clock status"],
      ["Clock In/Out card shows current time (Eastern)"],
      ["Select job from today's list and clock in (GPS captured)"],
      ["Timer starts counting after clock-in (HH:MM:SS)"],
      ["Clock out button works with option to complete job"],
      ["Today's Jobs card shows assigned jobs with details"],
      ["Job cards show service, customer name/phone, address, notes"],
      ["Google Maps link opens for job address"],
      ["Schedule card shows weekly view with navigation"],
      ["Week previous/next buttons work"],
      ["Current day highlighted in schedule"],
      ["Hours & Earnings card shows week/month toggle"],
      ["Summary stats: total hours, earnings, shifts, hourly rate"],
      ["Time entries grouped by date with clock in/out times"],
      ["Supplies card shows checked-out inventory items"],
      ["Return button works for supply items"],
      ["Pay Stubs card shows earnings and stubs list"],
      ["Expandable pay stub details (hours, rate, gross, deductions, net)"],
      ["Profile card shows name/email with edit fields"],
      ["Save profile changes (name, phone, language)"],
      ["Sign out button works"],
    ]),

    /* ── 5. ADMIN DASHBOARD ── */
    s("admin-dash", "Admin Dashboard Overview", <BarChart3 className="w-4 h-4" />, "text-amber", [
      ["Dashboard loads with 8 stat cards", "/admin"],
      ["Monthly revenue, total bookings, today's jobs display correctly"],
      ["Pending bookings, employees, customers counts accurate"],
      ["New applicants and inquiries counts with links"],
      ["6-month revenue trend chart renders"],
      ["Bookings by status chart renders"],
      ["Revenue by service chart renders (top 7)"],
      ["Recent bookings section shows latest 5"],
      ["Quick Actions sidebar: New Booking, Add Employee, Applicants, Commercial"],
    ]),

    s("admin-book", "Admin Bookings Management", <ClipboardCheck className="w-4 h-4" />, "text-teal", [
      ["Bookings page loads with summary cards", "/admin/bookings"],
      ["Summary shows total, pending, today, revenue"],
      ["Quick Book form creates new booking inline"],
      ["Bookings table shows all bookings with full details"],
      ["Filter by status works"],
      ["Booking detail page loads", "/admin/bookings/[id]"],
      ["Change booking status (confirm, complete, cancel)"],
      ["Assign employee to booking works"],
      ["Payment info displays correctly"],
    ]),

    s("admin-staff", "Admin Staff Management", <UserPlus className="w-4 h-4" />, "text-green", [
      ["Staff page loads with summary cards", "/admin/staff"],
      ["Staff table shows all employees with details"],
      ["Add new employee form works", "/admin/staff/new"],
      ["Edit employee details (name, email, phone, rate)"],
      ["Toggle active/inactive status"],
      ["Stripe Connect status indicator shows"],
      ["Stripe Connect onboarding flow initiates"],
    ]),

    s("admin-clients", "Admin Client Management", <Users className="w-4 h-4" />, "text-gold", [
      ["Clients page loads with summary cards", "/admin/clients"],
      ["Summary shows total customers, new this month, bookings, revenue"],
      ["Client table displays all customers"],
      ["Add customer form works"],
      ["View client details and booking history"],
    ]),

    s("admin-apps", "Admin Job Applications", <FileText className="w-4 h-4" />, "text-amber", [
      ["Applicants page loads with pipeline summary", "/admin/applicants"],
      ["Summary: total, new, in pipeline, hired"],
      ["Applications table shows all applications"],
      ["Application detail page loads", "/admin/applicants/[id]"],
      ["Status change workflow (review, phone screen, interview, hired/rejected)"],
      ["Resume and references viewable"],
    ]),

    s("admin-handy", "Admin Handyman Management", <Wrench className="w-4 h-4" />, "text-teal", [
      ["Handyman page loads with inquiry summary", "/admin/handyman"],
      ["Summary: total, pending, confirmed, rush count"],
      ["Inquiry table shows all requests with details"],
      ["Inquiry detail page loads", "/admin/handyman/[id]"],
      ["Send quote form works"],
      ["Status management (confirm, complete, cancel)"],
      ["Payment tracking for handyman jobs"],
    ]),

    s("admin-pay", "Admin Payments & Payroll", <CreditCard className="w-4 h-4" />, "text-green", [
      ["Payments page loads with summary", "/admin/payments"],
      ["Summary: total collected, pending, succeeded, this month"],
      ["Payments table shows all transactions"],
      ["Stripe receipt links work"],
      ["Payroll page loads with summary", "/admin/payroll"],
      ["Summary: total paid, draft, approved, paid counts"],
      ["Generate payroll for period works"],
      ["Approve pending payroll works"],
      ["Pay via Stripe Connect works"],
      ["Payroll details expand with breakdown"],
    ]),

    s("admin-inv", "Admin Inventory", <Package className="w-4 h-4" />, "text-amber", [
      ["Inventory page loads with summary", "/admin/inventory"],
      ["Summary: total items, low stock alerts, total value, categories"],
      ["Inventory table shows all items with stock levels"],
      ["Add new inventory item works"],
      ["Edit item details (name, SKU, category, stock, cost)"],
      ["Checkout item to employee works"],
      ["Return/adjust stock works"],
      ["Inventory detail page loads", "/admin/inventory/[id]"],
      ["Transaction history displays"],
    ]),

    s("admin-sched", "Admin Schedule", <Calendar className="w-4 h-4" />, "text-teal", [
      ["Schedule page loads with calendar view", "/admin/schedule"],
      ["Jobs display on correct dates"],
      ["Employee assignments visible per job"],
    ]),

    s("admin-services", "Admin Services & Content", <Settings className="w-4 h-4" />, "text-gold", [
      ["Services page loads with all service cards", "/admin/services"],
      ["Edit service details (price, hours, description)"],
      ["Service items management (add/edit/delete items)"],
      ["Handyman prices editor works"],
      ["Content manager loads all editable sections", "/admin/content"],
      ["Edit homepage hero content (headline, CTAs, stats)"],
      ["Edit page-specific content (careers, commercial, handyman)"],
      ["Video URL / hero image editing works"],
      ["Bilingual content editing (EN/ES fields)"],
    ]),

    s("admin-blog", "Admin Blog", <PenTool className="w-4 h-4" />, "text-amber", [
      ["Blog manager loads with summary", "/admin/blog"],
      ["Summary: total posts, published, drafts"],
      ["Create new post with title, slug, excerpt, content"],
      ["Bilingual post fields (title/excerpt/content EN & ES)"],
      ["Featured image upload works"],
      ["Publish/unpublish toggle works"],
      ["Edit existing post works"],
      ["AI blog generation works (if configured)"],
    ]),

    s("admin-seo", "Admin SEO", <Search className="w-4 h-4" />, "text-teal", [
      ["SEO dashboard loads", "/admin/seo"],
      ["Target keywords list (add/edit/delete)"],
      ["FAQ management (create/edit/delete)"],
      ["Directory listings section works"],
      ["Google Analytics ID field works"],
      ["Run site audit triggers background analysis"],
      ["Audit results show scores (technical, content, structured data, geo, AEO, CRO)"],
      ["Page-by-page audit results viewable"],
      ["Audit trend charts render"],
    ]),

    s("admin-social", "Admin Social Media", <MessageSquare className="w-4 h-4" />, "text-gold", [
      ["Social media manager loads", "/admin/social"],
      ["AI-powered content generation works"],
      ["Schedule posts for future dates"],
      ["Publish post to platform"],
      ["Batch content generation works"],
    ]),

    s("admin-comm", "Admin Commercial & Settings", <Building2 className="w-4 h-4" />, "text-amber", [
      ["Commercial inquiries page loads", "/admin/commercial"],
      ["Inquiry details viewable with quote capability"],
      ["Revenue analytics page loads with charts", "/admin/revenue"],
      ["Clock/time tracking admin page loads", "/admin/clock"],
      ["Admin settings page loads", "/admin/settings"],
      ["Company info editable"],
    ]),

    /* ── 6. CROSS-CUTTING ── */
    s("i18n", "Bilingual (EN/ES)", <Languages className="w-4 h-4" />, "text-teal", [
      ["Language switcher visible in navbar on all pages"],
      ["Switching to ES translates all UI labels, buttons, messages"],
      ["Booking form labels translate to Spanish"],
      ["Customer dashboard translates fully"],
      ["Employee portal translates fully"],
      ["Date formatting respects locale (EN vs ES)"],
      ["Service names show Spanish variant when available"],
      ["FAQ questions/answers show in selected language"],
      ["Blog posts show Spanish content when available"],
      ["Switching back to EN restores English content"],
    ]),

    s("dark", "Dark Mode", <Moon className="w-4 h-4" />, "text-gold", [
      ["Dark mode toggle in navbar works"],
      ["Homepage renders correctly in dark mode"],
      ["Customer dashboard renders correctly in dark mode"],
      ["Employee portal renders correctly in dark mode"],
      ["Booking flow renders correctly in dark mode"],
      ["All cards, inputs, buttons styled properly in dark"],
      ["Text contrast readable in dark mode"],
      ["Preference persists across page navigation"],
    ]),

    s("mobile", "Mobile & Responsive", <Smartphone className="w-4 h-4" />, "text-amber", [
      ["Homepage responsive on mobile (< 768px)"],
      ["Mobile hamburger menu opens/closes"],
      ["Booking flow usable on mobile"],
      ["Customer dashboard stacks properly on mobile"],
      ["Employee portal usable on mobile"],
      ["Admin sidebar collapses to hamburger on mobile"],
      ["Admin bottom nav shows on mobile"],
      ["All forms usable on mobile (inputs not cut off)"],
      ["Payment Stripe element renders on mobile"],
      ["Tables scroll horizontally on small screens"],
    ]),

    s("payments", "Payments (Stripe)", <CreditCard className="w-4 h-4" />, "text-green", [
      ["Stripe card element loads in booking checkout"],
      ["Test card (4242 4242 4242 4242) processes successfully"],
      ["Declined card shows proper error message"],
      ["3D Secure test card redirects and returns correctly"],
      ["Payment intent created on server before client confirm"],
      ["Successful payment updates booking status"],
      ["Payment appears in admin payments table"],
      ["Stripe webhook processes events correctly"],
      ["Employee Stripe Connect onboarding flow works"],
      ["Payroll payment via Stripe Connect processes"],
    ]),

    s("seo-tech", "SEO & Performance", <Search className="w-4 h-4" />, "text-teal", [
      ["Sitemap generates at /sitemap.xml"],
      ["Robots.txt accessible at /robots.txt"],
      ["Meta titles and descriptions present on all pages"],
      ["JSON-LD schema renders on homepage (AggregateRating)"],
      ["JSON-LD schema renders on service pages"],
      ["Canonical URLs set correctly"],
      ["Images have alt text"],
      ["Pages load in under 3 seconds"],
    ]),
  ];
}

/* ─── LocalStorage ─── */
const STORAGE_KEY = "havana-uat-state";

function saveState(sections: TestSection[]) {
  const data = sections.map((s) => ({
    id: s.id,
    collapsed: s.collapsed,
    items: s.items.map((it) => ({ id: it.id, status: it.status, note: it.note })),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState(sections: TestSection[]): TestSection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sections;
    const saved = JSON.parse(raw) as { id: string; collapsed: boolean; items: { id: string; status: TestStatus; note: string }[] }[];
    const map = new Map(saved.map((s) => [s.id, s]));
    return sections.map((sec) => {
      const sState = map.get(sec.id);
      if (!sState) return sec;
      const itemMap = new Map(sState.items.map((it) => [it.id, it]));
      return {
        ...sec,
        collapsed: sState.collapsed,
        items: sec.items.map((it) => {
          const iState = itemMap.get(it.id);
          return iState ? { ...it, status: iState.status, note: iState.note } : it;
        }),
      };
    });
  } catch {
    return sections;
  }
}

/* ─── Status icon ─── */
function StatusIcon({ status }: { status: TestStatus }) {
  if (status === "pass") return <CheckCircle2 className="w-5 h-5 text-green flex-shrink-0" />;
  if (status === "fail") return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
  return <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />;
}

/* ─── Export to CSV ─── */
function exportCSV(sections: TestSection[]) {
  const rows = [["Section", "Test", "Status", "Note"]];
  for (const s of sections) {
    for (const it of s.items) {
      rows.push([s.title, it.label, it.status, it.note]);
    }
  }
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `havana-uat-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Main Page ─── */
export default function UATPage() {
  const [sections, setSections] = useState<TestSection[]>([]);
  const [ready, setReady] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  useEffect(() => {
    setSections(loadState(buildSections()));
    setReady(true);
  }, []);

  const update = useCallback((fn: (prev: TestSection[]) => TestSection[]) => {
    setSections((prev) => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  const toggleCollapse = (sId: string) => {
    update((prev) => prev.map((s) => (s.id === sId ? { ...s, collapsed: !s.collapsed } : s)));
  };

  const cycleStatus = (sId: string, iId: string) => {
    const order: TestStatus[] = ["untested", "pass", "fail"];
    update((prev) =>
      prev.map((s) =>
        s.id !== sId
          ? s
          : {
              ...s,
              items: s.items.map((it) =>
                it.id !== iId ? it : { ...it, status: order[(order.indexOf(it.status) + 1) % 3] }
              ),
            }
      )
    );
  };

  const setNote = (sId: string, iId: string, note: string) => {
    update((prev) =>
      prev.map((s) =>
        s.id !== sId
          ? s
          : { ...s, items: s.items.map((it) => (it.id !== iId ? it : { ...it, note })) }
      )
    );
  };

  const resetAll = () => {
    if (confirm("Reset all UAT progress? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      setSections(buildSections());
    }
  };

  /* ─── Stats ─── */
  const allItems = sections.flatMap((s) => s.items);
  const total = allItems.length;
  const passed = allItems.filter((i) => i.status === "pass").length;
  const failed = allItems.filter((i) => i.status === "fail").length;
  const untested = total - passed - failed;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 text-sm">Loading UAT checklist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-tobacco">UAT Testing Checklist</h1>
          <p className="text-gray-500 text-sm mt-1">
            Click the circle icon to cycle: untested &rarr; pass &rarr; fail. Click the test label to add notes.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(sections)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-tobacco transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-300 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All
          </button>
        </div>
      </div>

      {/* ─── Progress Bar ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-lg text-tobacco">Overall Progress</span>
          <span className="font-display text-2xl text-tobacco">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
          {passed > 0 && (
            <div
              className="h-full bg-green transition-all duration-500"
              style={{ width: `${(passed / total) * 100}%` }}
            />
          )}
          {failed > 0 && (
            <div
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${(failed / total) * 100}%` }}
            />
          )}
        </div>
        <div className="flex gap-5 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green inline-block" /> {passed} Passed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> {failed} Failed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" /> {untested} Untested
          </span>
          <span className="ml-auto font-medium text-tobacco">{total} Total Tests</span>
        </div>
      </div>

      {/* ─── Sections ─── */}
      {sections.map((sec) => {
        const sPassed = sec.items.filter((i) => i.status === "pass").length;
        const sFailed = sec.items.filter((i) => i.status === "fail").length;
        const sTotal = sec.items.length;
        const done = sPassed === sTotal;

        return (
          <div key={sec.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleCollapse(sec.id)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              {sec.collapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <span className={sec.color}>{sec.icon}</span>
              <span className="font-display text-tobacco text-[0.95rem] flex-1">{sec.title}</span>
              <span className="flex items-center gap-2 text-xs text-gray-400">
                {sFailed > 0 && (
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    {sFailed} fail
                  </span>
                )}
                <span className={done ? "text-green font-medium" : ""}>
                  {sPassed}/{sTotal}
                </span>
              </span>
            </button>

            {/* Items */}
            {!sec.collapsed && (
              <div className="border-t border-gray-100">
                {sec.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 px-5 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors ${
                      item.status === "pass" ? "bg-green/[0.03]" : item.status === "fail" ? "bg-red-500/[0.03]" : ""
                    }`}
                  >
                    <button onClick={() => cycleStatus(sec.id, item.id)} className="mt-0.5">
                      <StatusIcon status={item.status} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => setEditingNote(editingNote === item.id ? null : item.id)}
                        className={`text-left text-sm ${
                          item.status === "pass"
                            ? "text-gray-400 line-through"
                            : item.status === "fail"
                            ? "text-red-700"
                            : "text-tobacco"
                        }`}
                      >
                        {item.label}
                      </button>
                      {item.hint && <p className="text-[0.7rem] text-gray-400 mt-0.5">{item.hint}</p>}
                      {item.note && editingNote !== item.id && (
                        <p className="text-xs text-amber mt-1 italic">&quot;{item.note}&quot;</p>
                      )}
                      {editingNote === item.id && (
                        <input
                          autoFocus
                          value={item.note}
                          onChange={(e) => setNote(sec.id, item.id, e.target.value)}
                          onBlur={() => setEditingNote(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingNote(null)}
                          placeholder="Add a note..."
                          className="mt-1.5 w-full text-xs px-2 py-1 border border-gray-200 rounded bg-white text-tobacco focus:outline-none focus:ring-1 focus:ring-gold/40"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* ─── Footer ─── */}
      <div className="text-center text-xs text-gray-400 pb-8">
        Havana Cleaning UAT Checklist &mdash; {total} tests across {sections.length} sections
      </div>
    </div>
  );
}
