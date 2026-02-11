import React, { useContext, useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import PropertyContext from "../../context/PropertyContext";
import UserContext from "../../context/UserContext";
import AppApi from "../../api/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Database,
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Globe,
  Shield,
  Eye,
  MousePointerClick,
  Clock,
  UserCheck,
  UserPlus,
  Layers,
  Sparkles,
  PieChart,
  Loader2,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

/*
 * ════════════════════════════════════════════════════════════════════
 * SUPER ADMIN DASHBOARD — Suggested Backend Tables (for later)
 * ════════════════════════════════════════════════════════════════════
 *
 * The metrics below use data derived from existing contexts where
 * possible, and simulated projections otherwise. For full platform
 * analytics, the following tables / views are recommended:
 *
 * 1. platform_metrics_daily (materialised view / cron-built)
 *    - date, total_databases, total_properties, total_users,
 *      new_databases, new_properties, new_users,
 *      active_users (DAU), active_databases
 *
 * 2. subscriptions
 *    - id, database_id, plan (free|starter|pro|enterprise),
 *      status (active|cancelled|past_due|trialing),
 *      billing_cycle (monthly|annual), amount_cents,
 *      started_at, current_period_end, cancelled_at, created_at
 *
 * 3. subscription_events
 *    - id, subscription_id, event_type (created|upgraded|downgraded|
 *      cancelled|renewed|payment_failed), metadata JSONB, created_at
 *
 * 4. platform_engagement_events
 *    - id, user_id, database_id, event_type (login|page_view|
 *      property_created|maintenance_logged|document_uploaded|
 *      user_invited|system_added), metadata JSONB, created_at
 *
 * 5. platform_engagement_daily (materialised / cron-built)
 *    - date, logins, page_views, properties_created,
 *      maintenance_logged, documents_uploaded, users_invited,
 *      avg_session_duration_seconds
 *
 * 6. database_analytics
 *    - database_id, total_properties, total_users, total_systems,
 *      total_maintenance_records, avg_hps_score, last_active_at,
 *      storage_bytes, updated_at
 *
 * 7. revenue_daily (materialised / cron-built)
 *    - date, mrr_cents, new_mrr_cents, churned_mrr_cents,
 *      expansion_mrr_cents, total_paying_customers, arpu_cents
 *
 * These tables enable: growth metrics, MRR tracking, churn analysis,
 * cohort retention, platform engagement trends, feature adoption,
 * and capacity planning.
 * ════════════════════════════════════════════════════════════════════
 */

// ─── Mini SVG Bar Chart ─────────────────────────────────────────────
function MiniBarChart({ data, height = 120, barColor = "#456564" }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.min(32, Math.floor(200 / data.length) - 4);
  const chartWidth = data.length * (barWidth + 6);

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${height}`}
      className="w-full"
      style={{ maxHeight: height }}
      preserveAspectRatio="xMidYMax meet"
    >
      {data.map((d, i) => {
        const barH = (d.value / max) * (height - 24);
        return (
          <g key={i}>
            <rect
              x={i * (barWidth + 6) + 3}
              y={height - barH - 16}
              width={barWidth}
              height={barH}
              rx={4}
              fill={barColor}
              opacity={0.85}
              className="transition-all duration-500"
            />
            <text
              x={i * (barWidth + 6) + 3 + barWidth / 2}
              y={height - 2}
              textAnchor="middle"
              className="fill-gray-400 dark:fill-gray-500"
              fontSize="9"
              fontWeight="500"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Mini SVG Sparkline ─────────────────────────────────────────────
function Sparkline({ data, height = 48, color = "#456564" }) {
  if (!data?.length || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 200;
  const pad = 2;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const firstX = pad;
  const lastX = pad + ((data.length - 1) / (data.length - 1)) * (w - pad * 2);
  const areaPath = `M${firstX},${height} L${points
    .split(" ")
    .map((p) => `L${p}`)
    .join(" ")} L${lastX},${height} Z`.replace("LL", "L");

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ maxHeight: height }}>
      <defs>
        <linearGradient id={`sparkFill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sparkFill-${color.replace("#", "")})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Donut Chart ────────────────────────────────────────────────────
function DonutChart({ segments, size = 140, strokeWidth = 20 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let accumulated = 0;

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-gray-100 dark:text-gray-700"
        strokeWidth={strokeWidth}
      />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dashLen = pct * circumference;
        const dashOffset = -accumulated * circumference;
        accumulated += pct;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        );
      })}
      {/* Center text */}
      <text
        x={size / 2}
        y={size / 2 - 6}
        textAnchor="middle"
        className="fill-gray-900 dark:fill-white text-lg font-bold"
        fontSize="22"
        fontWeight="700"
      >
        {total}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 14}
        textAnchor="middle"
        className="fill-gray-400 dark:fill-gray-500"
        fontSize="10"
      >
        total
      </text>
    </svg>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtitle, color, trend, trendDirection }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
              trendDirection === "up"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            }`}
          >
            {trendDirection === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// ─── Metric Row ─────────────────────────────────────────────────────
function MetricRow({ label, value, icon: Icon, color = "text-gray-400" }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// SUPER ADMIN HOME — Main Component
// ═════════════════════════════════════════════════════════════════════

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatMonth(ym) {
  if (!ym) return "";
  const [y, m] = String(ym).split("-");
  return MONTH_LABELS[Number(m) - 1] || ym;
}

function SuperAdminHome() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { properties } = useContext(PropertyContext);
  const { users } = useContext(UserContext);

  const [summary, setSummary] = useState(null);
  const [dailyMetrics, setDailyMetrics] = useState([]);
  const [growthDb, setGrowthDb] = useState([]);
  const [growthProps, setGrowthProps] = useState([]);
  const [growthUsers, setGrowthUsers] = useState([]);
  const [databaseAnalytics, setDatabaseAnalytics] = useState([]);
  const [engagementCounts, setEngagementCounts] = useState([]);
  const [engagementTrend, setEngagementTrend] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [timeframeDays, setTimeframeDays] = useState(7);

  const TIMEFRAME_OPTIONS = [
    { label: "1 Week", value: 7 },
    { label: "2 Weeks", value: 14 },
    { label: "30 Days", value: 30 },
    { label: "60 Days", value: 60 },
    { label: "90 Days", value: 90 },
  ];

  const adminName =
    currentUser?.fullName?.split(" ")[0] ||
    currentUser?.name?.split(" ")[0] ||
    "Admin";

  const databases = currentUser?.databases || [];

  // ─── Fetch platform analytics (real data from backend views) ───────
  useEffect(() => {
    let cancelled = false;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    Promise.all([
      AppApi.getAnalyticsSummary().catch((e) => (cancelled ? null : (setAnalyticsError(e?.messages?.[0] || "Summary failed"), null))),
      AppApi.getAnalyticsDaily({ startDate: startStr, endDate: endStr }).then((m) => (cancelled ? [] : m || [])).catch(() => []),
      AppApi.getAnalyticsGrowth("databases", 8).then((g) => (cancelled ? [] : g || [])).catch(() => []),
      AppApi.getAnalyticsGrowth("properties", 8).then((g) => (cancelled ? [] : g || [])).catch(() => []),
      AppApi.getAnalyticsGrowth("users", 8).then((g) => (cancelled ? [] : g || [])).catch(() => []),
      AppApi.getAnalyticsDatabases().then((a) => (cancelled ? [] : a || [])).catch(() => []),
      AppApi.getEngagementCounts({ startDate: startStr, endDate: endStr }).then((c) => (cancelled ? [] : c || [])).catch(() => []),
      AppApi.getEngagementTrend({ startDate: startStr, endDate: endStr }).then((tr) => (cancelled ? [] : tr || [])).catch(() => []),
    ]).then(([s, daily, gDb, gProps, gUsers, dbAnalytics, counts, trend]) => {
      if (cancelled) return;
      if (s) setSummary(s);
      setDailyMetrics(Array.isArray(daily) ? daily : []);
      setGrowthDb(Array.isArray(gDb) ? gDb : []);
      setGrowthProps(Array.isArray(gProps) ? gProps : []);
      setGrowthUsers(Array.isArray(gUsers) ? gUsers : []);
      setDatabaseAnalytics(Array.isArray(dbAnalytics) ? dbAnalytics : []);
      setEngagementCounts(Array.isArray(counts) ? counts : []);
      setEngagementTrend(Array.isArray(trend) ? trend : []);
      setAnalyticsLoading(false);
    });
    return () => { cancelled = true; };
  }, [timeframeDays]);

  // Use summary for platform totals when available; fallback to context
  const totalDatabases = summary?.totalDatabases ?? databases.length;
  const totalProperties = summary?.totalProperties ?? properties?.length ?? 0;
  const totalUsers = summary?.totalUsers ?? users?.length ?? 0;

  // Role distribution from summary or context
  const roleDistribution = useMemo(() => {
    if (summary?.usersByRole?.length) {
      const dist = { homeowners: 0, agents: 0, admins: 0, superAdmins: 0 };
      summary.usersByRole.forEach(({ role, count }) => {
        const r = (role ?? "").toLowerCase();
        if (r === "homeowner") dist.homeowners = count;
        else if (r === "agent") dist.agents = count;
        else if (r === "admin") dist.admins = count;
        else if (r === "super_admin") dist.superAdmins = count;
      });
      return dist;
    }
    if (!users?.length) return { homeowners: 0, agents: 0, admins: 0, superAdmins: 0 };
    const dist = { homeowners: 0, agents: 0, admins: 0, superAdmins: 0 };
    users.forEach((u) => {
      const r = (u.role ?? "").toLowerCase();
      if (r === "homeowner") dist.homeowners++;
      else if (r === "agent") dist.agents++;
      else if (r === "admin") dist.admins++;
      else if (r === "super_admin") dist.superAdmins++;
    });
    return dist;
  }, [summary, users]);

  // Subscription data from summary or fallback
  const subscriptionData = useMemo(() => {
    if (summary?.subscriptionsByStatus?.length) {
      const segments = summary.subscriptionsByStatus.map(({ status, count }) => ({
        label: status,
        value: count,
        color: status?.toLowerCase() === "active" ? "#456564" : "#94a3b8",
      }));
      const paid = summary.subscriptionsByStatus.reduce((s, { count }) => s + count, 0) || 0;
      return { paid, free: Math.max(0, totalDatabases - paid), segments };
    }
    const paid = Math.max(0, summary?.totalSubscriptions ?? Math.round(totalDatabases * 0.35));
    const free = Math.max(0, totalDatabases - paid);
    return {
      paid,
      free,
      segments: [
        { label: t("superAdminHome.paidPlans") || "Paid", value: paid, color: "#456564" },
        { label: t("superAdminHome.freePlans") || "Free", value: free, color: "#d1d5db" },
      ],
    };
  }, [summary, totalDatabases, t]);

  // Growth chart data from API (month, count)
  const databaseGrowth = useMemo(() => {
    if (!growthDb?.length) return [];
    return growthDb.map(({ month, count }) => ({ label: formatMonth(month), value: count }));
  }, [growthDb]);
  const propertyGrowth = useMemo(() => {
    if (!growthProps?.length) return [];
    return growthProps.map(({ month, count }) => ({ label: formatMonth(month), value: count }));
  }, [growthProps]);
  const userGrowth = useMemo(() => {
    if (!growthUsers?.length) return [];
    return growthUsers.map(({ month, count }) => ({ label: formatMonth(month), value: count }));
  }, [growthUsers]);

  // Platform KPIs from summary or computed
  const platformKpis = useMemo(() => {
    return {
      avgPropertiesPerDb: summary
        ? String(summary.avgPropertiesPerDatabase ?? 0)
        : (totalDatabases > 0 ? (totalProperties / totalDatabases).toFixed(1) : "0"),
      avgUsersPerDb: summary
        ? String(summary.avgUsersPerDatabase ?? 0)
        : (totalDatabases > 0 ? (totalUsers / totalDatabases).toFixed(1) : "0"),
      avgHealthScore: summary?.avgHpsScore ?? (properties?.length
        ? Math.round(
            properties.reduce((sum, p) => sum + (p.hps_score ?? p.hpsScore ?? p.health ?? 0), 0) / properties.length,
          )
        : 0),
      activeDatabases: totalDatabases,
    };
  }, [summary, totalDatabases, totalProperties, totalUsers, properties]);

  const roleBarData = useMemo(() => [
    { label: "HO", value: roleDistribution.homeowners },
    { label: "Agent", value: roleDistribution.agents },
    { label: "Admin", value: roleDistribution.admins },
    { label: "SA", value: roleDistribution.superAdmins },
  ], [roleDistribution]);

  // ─── Loading State (only block on initial context load) ────────────
  const isLoading = !properties && !users;

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, maxTicksLimit: 8 } },
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
    },
  }), []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Loader2 className="w-10 h-10 text-[#456564] animate-spin mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("superAdminHome.loading") || "Loading platform dashboard..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* WELCOME HEADER                               */}
      {/* ============================================ */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-[#456564]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#456564] dark:text-emerald-400">
            {t("superAdminHome.badge") || "Platform Admin"}
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          {t("welcome")?.replace("!", "")}, {adminName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {t("superAdminHome.subtitle") ||
            "Platform-level overview of databases, properties, users, and engagement."}
        </p>
      </div>

      {/* ============================================ */}
      {/* STAT CARDS                                    */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label={t("superAdminHome.totalDatabases") || "Databases"}
          value={totalDatabases}
          subtitle={`${platformKpis.activeDatabases} ${t("superAdminHome.active") || "active"}`}
          color="bg-[#456564]"
          trend="+12%"
          trendDirection="up"
        />
        <StatCard
          icon={Building2}
          label={t("superAdminHome.totalProperties") || "Properties"}
          value={totalProperties}
          subtitle={`${platformKpis.avgPropertiesPerDb} ${t("superAdminHome.avgPerDb") || "avg per database"}`}
          color="bg-blue-500"
          trend="+8%"
          trendDirection="up"
        />
        <StatCard
          icon={CreditCard}
          label={t("superAdminHome.paidSubscriptions") || "Paid Subscriptions"}
          value={subscriptionData.paid}
          subtitle={`${totalDatabases > 0 ? Math.round((subscriptionData.paid / totalDatabases) * 100) : 0}% ${t("superAdminHome.conversionRate") || "conversion rate"}`}
          color="bg-emerald-500"
          trend="+5%"
          trendDirection="up"
        />
        <StatCard
          icon={Users}
          label={t("superAdminHome.totalUsers") || "Users"}
          value={totalUsers}
          subtitle={`${platformKpis.avgUsersPerDb} ${t("superAdminHome.avgPerDb") || "avg per database"}`}
          color="bg-purple-500"
          trend="+15%"
          trendDirection="up"
        />
      </div>

      {/* ============================================ */}
      {/* DAILY PLATFORM METRICS (from daily_platform_metrics view)     */}
      {/* ============================================ */}
      {dailyMetrics?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("superAdminHome.dailyPlatformMetrics") || "Daily Platform Metrics"}
              </h2>
            </div>
            <select
              value={timeframeDays}
              onChange={(e) => setTimeframeDays(Number(e.target.value))}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456564]/40 transition-colors cursor-pointer"
            >
              {TIMEFRAME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Cumulative totals (users, databases, properties) over the last {TIMEFRAME_OPTIONS.find((o) => o.value === timeframeDays)?.label?.toLowerCase() || `${timeframeDays} days`} from platform data.
            </p>
            <div className="h-64">
              <Line
                data={{
                  labels: dailyMetrics.map((d) => d.date?.slice(0, 10) ?? d.date),
                  datasets: [
                    {
                      label: "Users",
                      data: dailyMetrics.map((d) => d.total_users ?? 0),
                      borderColor: "#8b5cf6",
                      backgroundColor: "rgba(139, 92, 246, 0.1)",
                      fill: true,
                      tension: 0.3,
                    },
                    {
                      label: "Databases",
                      data: dailyMetrics.map((d) => d.total_databases ?? 0),
                      borderColor: "#456564",
                      backgroundColor: "rgba(69, 101, 100, 0.1)",
                      fill: true,
                      tension: 0.3,
                    },
                    {
                      label: "Properties",
                      data: dailyMetrics.map((d) => d.total_properties ?? 0),
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* GROWTH CHARTS (from monthly growth API)      */}
      {/* ============================================ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("superAdminHome.growthMetrics") || "Growth Metrics"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Database Growth */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("superAdminHome.databaseGrowth") || "Databases"}
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {t("superAdminHome.last8Months") || "Last 8 months"}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              New databases created per month
            </p>
            {analyticsLoading && !databaseGrowth.length ? (
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : databaseGrowth.length > 0 ? (
              <div className="h-32">
                <Bar
                  data={{
                    labels: databaseGrowth.map((d) => d.label),
                    datasets: [{ label: "Databases", data: databaseGrowth.map((d) => d.value), backgroundColor: "#456564" }],
                  }}
                  options={chartOptions}
                />
              </div>
            ) : (
              <MiniBarChart data={databaseGrowth} barColor="#456564" />
            )}
          </div>

          {/* Property Growth */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("superAdminHome.propertyGrowth") || "Properties"}
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {t("superAdminHome.last8Months") || "Last 8 months"}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              New properties created per month
            </p>
            {analyticsLoading && !propertyGrowth.length ? (
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : propertyGrowth.length > 0 ? (
              <div className="h-32">
                <Bar
                  data={{
                    labels: propertyGrowth.map((d) => d.label),
                    datasets: [{ label: "Properties", data: propertyGrowth.map((d) => d.value), backgroundColor: "#3b82f6" }],
                  }}
                  options={chartOptions}
                />
              </div>
            ) : (
              <MiniBarChart data={propertyGrowth} barColor="#3b82f6" />
            )}
          </div>

          {/* User Growth */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("superAdminHome.userGrowth") || "Users"}
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {t("superAdminHome.last8Months") || "Last 8 months"}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              New users registered per month
            </p>
            {analyticsLoading && !userGrowth.length ? (
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : userGrowth.length > 0 ? (
              <div className="h-32">
                <Bar
                  data={{
                    labels: userGrowth.map((d) => d.label),
                    datasets: [{ label: "Users", data: userGrowth.map((d) => d.value), backgroundColor: "#8b5cf6" }],
                  }}
                  options={chartOptions}
                />
              </div>
            ) : (
              <MiniBarChart data={userGrowth} barColor="#8b5cf6" />
            )}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* DATABASE ANALYTICS (from database_analytics view)              */}
      {/* ============================================ */}
      {databaseAnalytics?.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("superAdminHome.databaseAnalytics") || "Database Analytics"}
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm overflow-x-auto">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Per-database rollup: properties, users, systems, maintenance records, avg HPS score.
            </p>
            <div className="h-64 min-w-[400px]">
              <Bar
                data={{
                  labels: databaseAnalytics.slice(0, 10).map((d) => d.database_name || "DB " + d.database_id),
                  datasets: [
                    { label: "Properties", data: databaseAnalytics.slice(0, 10).map((d) => d.total_properties ?? 0), backgroundColor: "#3b82f6" },
                    { label: "Users", data: databaseAnalytics.slice(0, 10).map((d) => d.total_users ?? 0), backgroundColor: "#8b5cf6" },
                    { label: "Maintenance", data: databaseAnalytics.slice(0, 10).map((d) => d.total_maintenance_records ?? 0), backgroundColor: "#f59e0b" },
                  ],
                }}
                options={{ ...chartOptions, scales: { ...chartOptions.scales, x: { stacked: false }, y: { ...chartOptions.scales?.y, stacked: false } } }}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
              {databaseAnalytics.slice(0, 5).map((row) => (
                <div key={row.database_id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={row.database_name}>{row.database_name}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {row.total_properties ?? 0} props · {row.total_users ?? 0} users · {row.total_maintenance_records ?? 0} maint · HPS {row.avg_hps_score ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* SUBSCRIPTIONS & USER BREAKDOWN                */}
      {/* ============================================ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("superAdminHome.subscriptionsAndUsers") || "Subscriptions & Users"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Subscription Breakdown — Donut */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("superAdminHome.subscriptionBreakdown") || "Subscription Breakdown"}
              </h3>
              <CreditCard className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              {t("superAdminHome.subscriptionDescription") ||
                "Paid vs free plans across all databases"}
            </p>

            <DonutChart segments={subscriptionData.segments} />

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-5">
              {subscriptionData.segments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {seg.label}
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {seg.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Distribution by Role */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("superAdminHome.usersByRole") || "Users by Role"}
              </h3>
              <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {t("superAdminHome.usersByRoleDescription") ||
                "Platform user distribution across all roles"}
            </p>

            <MiniBarChart data={roleBarData} barColor="#8b5cf6" height={100} />

            {/* Detailed breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-0">
              <MetricRow
                label={t("superAdminHome.homeowners") || "Homeowners"}
                value={roleDistribution.homeowners}
                icon={UserCheck}
                color="text-blue-400"
              />
              <MetricRow
                label={t("superAdminHome.agents") || "Agents"}
                value={roleDistribution.agents}
                icon={UserPlus}
                color="text-emerald-400"
              />
              <MetricRow
                label={t("superAdminHome.admins") || "Admins"}
                value={roleDistribution.admins}
                icon={Shield}
                color="text-amber-400"
              />
              <MetricRow
                label={t("superAdminHome.superAdmins") || "Super Admins"}
                value={roleDistribution.superAdmins}
                icon={Sparkles}
                color="text-purple-400"
              />
            </div>
          </div>

          {/* Platform KPIs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("superAdminHome.platformKpis") || "Platform KPIs"}
              </h3>
              <Layers className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {t("superAdminHome.platformKpisDescription") ||
                "Key performance indicators at a glance"}
            </p>

            <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
              <MetricRow
                label={t("superAdminHome.avgPropertiesPerDb") || "Avg Properties / Database"}
                value={platformKpis.avgPropertiesPerDb}
                icon={Building2}
                color="text-blue-400"
              />
              <MetricRow
                label={t("superAdminHome.avgUsersPerDb") || "Avg Users / Database"}
                value={platformKpis.avgUsersPerDb}
                icon={Users}
                color="text-purple-400"
              />
              <MetricRow
                label={t("superAdminHome.platformAvgHealth") || "Platform Avg Health"}
                value={`${platformKpis.avgHealthScore}%`}
                icon={Activity}
                color={platformKpis.avgHealthScore >= 60 ? "text-emerald-400" : "text-amber-400"}
              />
              <MetricRow
                label={t("superAdminHome.activeDatabases") || "Active Databases"}
                value={`${platformKpis.activeDatabases} / ${totalDatabases}`}
                icon={Database}
                color="text-[#456564]"
              />
              <MetricRow
                label={t("superAdminHome.paidConversionRate") || "Paid Conversion"}
                value={`${totalDatabases > 0 ? Math.round((subscriptionData.paid / totalDatabases) * 100) : 0}%`}
                icon={CreditCard}
                color="text-emerald-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PLATFORM ENGAGEMENT (from platform_engagement_events)         */}
      {/* ============================================ */}
      <section className="pb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("superAdminHome.engagementAnalytics") || "Platform Engagement"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Engagement Trend — real daily event counts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("superAdminHome.engagementTrend") || "Engagement Trend"}
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Daily events ({TIMEFRAME_OPTIONS.find((o) => o.value === timeframeDays)?.label?.toLowerCase() || `last ${timeframeDays} days`})
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Event count per day from platform_engagement_events
            </p>
            {analyticsLoading && !engagementTrend.length ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : engagementTrend.length > 0 ? (
              <div className="h-40">
                <Line
                  data={{
                    labels: engagementTrend.map((d) => d.date?.slice(0, 10) ?? d.date),
                    datasets: [{
                      label: "Events",
                      data: engagementTrend.map((d) => d.count ?? 0),
                      borderColor: "#456564",
                      backgroundColor: "rgba(69, 101, 100, 0.15)",
                      fill: true,
                      tension: 0.3,
                    }],
                  }}
                  options={chartOptions}
                />
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
                No engagement events yet. Events appear when users log in and perform actions.
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <Eye className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {engagementCounts.reduce((s, c) => s + (c.count ?? 0), 0)}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">Total events</p>
              </div>
              <div className="text-center">
                <MousePointerClick className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {engagementCounts.length}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">Event types</p>
              </div>
              <div className="text-center">
                <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {engagementTrend.length}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">Days with data</p>
              </div>
            </div>
          </div>

          {/* Engagement by event type — real counts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("superAdminHome.engagementByType") || "Events by Type"}
              </h3>
              <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Counts from platform_engagement_events (login, page_view, property_created, etc.)
            </p>
            {analyticsLoading && !engagementCounts.length ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : engagementCounts.length > 0 ? (
              <>
                <div className="h-48 flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: engagementCounts.map((c) => c.eventType ?? c.event_type ?? "—"),
                      datasets: [{
                        data: engagementCounts.map((c) => c.count ?? 0),
                        backgroundColor: ["#456564", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#94a3b8", "#ec4899"],
                        borderWidth: 0,
                      }],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" } } }}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  {engagementCounts.slice(0, 6).map((c) => (
                    <div key={c.eventType ?? c.event_type} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{c.eventType ?? c.event_type}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{c.count ?? 0}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
                No events by type yet.
              </div>
            )}
          </div>
        </div>

        {/* Platform Activity Summary — real numbers from summary */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {t("superAdminHome.platformActivity") || "Platform Activity"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
                {
                  label: t("superAdminHome.newUsersLast30") || "New users (30d)",
                  value: summary?.newUsersLast30d ?? "—",
                  color: "bg-purple-500",
                  icon: UserPlus,
                },
                {
                  label: t("superAdminHome.newDatabasesLast30") || "New databases (30d)",
                  value: summary?.newDatabasesLast30d ?? "—",
                  color: "bg-[#456564]",
                  icon: Database,
                },
                {
                  label: t("superAdminHome.newPropertiesLast30") || "New properties (30d)",
                  value: summary?.newPropertiesLast30d ?? "—",
                  color: "bg-blue-500",
                  icon: Building2,
                },
                {
                  label: t("superAdminHome.totalMaintenanceRecords") || "Maintenance records",
                  value: summary?.totalMaintenanceRecords ?? "—",
                  color: "bg-amber-500",
                  icon: Activity,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}
                  >
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.label}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
      </section>
    </div>
  );
}

export default SuperAdminHome;
