import React from "react";
import { Database, Building2, CreditCard, Users } from "lucide-react";
import StatCard from "./StatCard";

/**
 * Stat cards section for the SuperAdmin dashboard (Databases, Properties, Paid Subscriptions, Users).
 */
function SuperAdminHomeStats({
  t,
  totalDatabases,
  totalProperties,
  totalUsers,
  subscriptionData,
  platformKpis,
  analyticsLoading,
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Database}
        label={t("superAdminHome.totalDatabases") || "Databases"}
        value={totalDatabases}
        subtitle={`${platformKpis.activeDatabases} ${t("superAdminHome.active") || "active"}`}
        color="bg-[#456564]"
        trend="+12%"
        trendDirection="up"
        loading={analyticsLoading}
      />
      <StatCard
        icon={Building2}
        label={t("superAdminHome.totalProperties") || "Properties"}
        value={totalProperties}
        subtitle={`${platformKpis.avgPropertiesPerDb} ${t("superAdminHome.avgPerDb") || "avg per database"}`}
        color="bg-blue-500"
        trend="+8%"
        trendDirection="up"
        loading={analyticsLoading}
      />
      <StatCard
        icon={CreditCard}
        label={t("superAdminHome.paidSubscriptions") || "Paid Subscriptions"}
        value={subscriptionData.paid}
        subtitle={`${totalDatabases > 0 ? Math.round((subscriptionData.paid / totalDatabases) * 100) : 0}% ${t("superAdminHome.conversionRate") || "conversion rate"}`}
        color="bg-emerald-500"
        trend="+5%"
        trendDirection="up"
        loading={analyticsLoading}
      />
      <StatCard
        icon={Users}
        label={t("superAdminHome.totalUsers") || "Users"}
        value={totalUsers}
        subtitle={`${platformKpis.avgUsersPerDb} ${t("superAdminHome.avgPerDb") || "avg per database"}`}
        color="bg-purple-500"
        trend="+15%"
        trendDirection="up"
        loading={analyticsLoading}
      />
    </div>
  );
}

export default SuperAdminHomeStats;
