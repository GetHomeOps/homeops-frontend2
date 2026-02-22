import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import useCurrentAccount from "../../hooks/useCurrentAccount";
import { useAuth } from "../../context/AuthContext";
import AppApi from "../../api/api";

/**
 * Billing page — current plan, usage, upgrade options.
 * Industry best practices: transparent pricing, clear CTAs, next billing date.
 * Visible to agents and homeowners.
 */
function BillingPage() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentAccount } = useCurrentAccount();
  const { currentUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgrading, setUpgrading] = useState(null);

  const accountId = currentAccount?.id;
  const userRole = (currentUser?.role || "homeowner").toLowerCase();
  const targetRole = ["agent", "admin"].includes(userRole) ? "agent" : "homeowner";

  useEffect(() => {
    if (!accountId) {
      setLoading(false);
      return;
    }
    async function fetch() {
      try {
        setError(null);
        const [subs, plans] = await Promise.all([
          AppApi.getSubscriptionsByAccountId(accountId),
          AppApi.getSubscriptionProductsByRole(targetRole),
        ]);
        setSubscriptions(subs || []);
        setAvailablePlans(plans || []);
      } catch (err) {
        setError(err.message || "Failed to load billing data");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [accountId, targetRole]);

  const activeSubscription = subscriptions.find((s) => s.status === "active") || subscriptions[0];
  const currentProduct = activeSubscription
    ? { name: activeSubscription.productName, price: activeSubscription.productPrice }
    : null;

  async function handleUpgrade(productId) {
    if (!accountId) return;
    setUpgrading(productId);
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 1);
      await AppApi.createAccountSubscription({
        accountId,
        subscriptionProductId: productId,
        status: "active",
        currentPeriodStart: today.toISOString(),
        currentPeriodEnd: endDate.toISOString(),
      });
      const subs = await AppApi.getSubscriptionsByAccountId(accountId);
      setSubscriptions(subs || []);
    } catch (err) {
      setError(err.message || "Failed to upgrade");
    } finally {
      setUpgrading(null);
    }
  }

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const formatPrice = (p) => {
    if (p == null || p === undefined) return "$0";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(p));
  };

  if (!accountId) {
    return (
      <div className="flex h-[100dvh] overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="grow px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-gray-600 dark:text-gray-400">Select an account to view billing.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {t("settings.billing") || "Billing"}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("settings.billingDescription") ||
                  "Manage your subscription plan and billing information."}
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-xl bg-white dark:bg-gray-800 shadow-xs p-8 text-center text-gray-500">
                {t("loading") || "Loading..."}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Current plan — industry standard: prominent, transparent */}
                <section className="rounded-xl bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/60">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {t("settings.currentPlan") || "Current Plan"}
                    </h2>
                  </div>
                  <div className="p-6">
                    {activeSubscription ? (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                            {activeSubscription.productName || "Free"}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {formatPrice(activeSubscription.productPrice)}/
                            {(activeSubscription.billingInterval || "month").replace("ly", "")}
                          </p>
                          {activeSubscription.currentPeriodEnd && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              {t("settings.renewsOn") || "Renews on"}{" "}
                              <strong>{formatDate(activeSubscription.currentPeriodEnd)}</strong>
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 font-medium text-emerald-800 dark:text-emerald-300">
                            {activeSubscription.status || "Active"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        {t("settings.noActivePlan") || "No active subscription."}
                      </p>
                    )}
                  </div>
                </section>

                {/* Plan limits — usage transparency (from matching plan) */}
                {activeSubscription && (() => {
                  const plan = availablePlans.find(
                    (p) =>
                      p.id === activeSubscription.subscriptionProductId ||
                      p.name?.toLowerCase() === activeSubscription.productName?.toLowerCase()
                  );
                  if (!plan) return null;
                  return (
                    <section className="rounded-xl bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
                      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/60">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {t("settings.planLimits") || "Plan Limits"}
                        </h2>
                      </div>
                      <div className="p-6">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {t("settings.properties") || "Properties"}
                            </dt>
                            <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                              {plan.maxProperties ?? "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {t("settings.contacts") || "Contacts"}
                            </dt>
                            <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                              {plan.maxContacts ?? "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {t("settings.teamMembers") || "Team Members"}
                            </dt>
                            <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                              {plan.maxTeamMembers ?? "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {t("settings.viewers") || "Viewers"}
                            </dt>
                            <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                              {plan.maxViewers ?? "—"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </section>
                  );
                })()}

                {/* Upgrade options — clear CTAs, plan comparison */}
                {availablePlans.length > 0 && (
                  <section className="rounded-xl bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/60">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {t("settings.availablePlans") || "Available Plans"}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t("settings.upgradeDescription") || "Upgrade to unlock more features."}
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {availablePlans.map((plan) => {
                          const isCurrent =
                            activeSubscription?.subscriptionProductId === plan.id ||
                            activeSubscription?.productName?.toLowerCase() === plan.name?.toLowerCase();
                          return (
                            <div
                              key={plan.id}
                              className={`rounded-lg border-2 p-4 ${
                                isCurrent
                                  ? "border-emerald-500 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                            >
                              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                {plan.name}
                              </p>
                              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                {formatPrice(plan.price)}
                                <span className="text-sm font-normal text-gray-500">
                                  /{(plan.billingInterval || "month").replace("ly", "")}
                                </span>
                              </p>
                              {plan.description && (
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  {plan.description}
                                </p>
                              )}
                              <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                <li>• {plan.maxProperties} {t("settings.properties") || "properties"}</li>
                                <li>• {plan.maxContacts} {t("settings.contacts") || "contacts"}</li>
                                <li>• {plan.maxTeamMembers} {t("settings.teamMembers") || "team members"}</li>
                              </ul>
                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => handleUpgrade(plan.id)}
                                  disabled={upgrading === plan.id}
                                  className="mt-4 w-full rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
                                >
                                  {upgrading === plan.id
                                    ? t("saving") || "Saving..."
                                    : t("settings.upgrade") || "Upgrade"}
                                </button>
                              )}
                              {isCurrent && (
                                <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                  {t("settings.currentPlan") || "Current Plan"}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                )}

                {/* Placeholder for future: Payment method, Invoices */}
                <section className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("settings.paymentMethodComingSoon") ||
                      "Payment method and invoice history will be available when Stripe is integrated."}
                  </p>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default BillingPage;
