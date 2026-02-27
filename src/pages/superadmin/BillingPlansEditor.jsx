import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import useCurrentAccount from "../../hooks/useCurrentAccount";
import AppApi from "../../api/api";
import {Loader2, Save, ChevronDown, ChevronUp} from "lucide-react";

/**
 * Super Admin: Billing Plans Editor
 * Table + form to edit plan name, description, limits, Stripe price IDs.
 */
function BillingPlansEditor() {
  const navigate = useNavigate();
  const {currentAccount} = useCurrentAccount();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [edits, setEdits] = useState({});

  const accountUrl = currentAccount?.url || currentAccount?.name || "";

  useEffect(() => {
    async function fetchPlans() {
      try {
        setError(null);
        const res = await AppApi.getBillingPlansAll();
        setPlans(res.plans || []);
      } catch (err) {
        setError(err?.message || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handlePlanUpdate = (id, data) => {
    setEdits((prev) => ({...prev, [id]: {...(prev[id] || {}), ...data}}));
  };

  const handleSavePlan = async (id) => {
    const data = edits[id];
    if (!data) return;
    setSaving(id);
    try {
      await AppApi.updateBillingPlan(id, data);
      setEdits((prev) => {
        const next = {...prev};
        delete next[id];
        return next;
      });
      const res = await AppApi.getBillingPlansAll();
      setPlans(res.plans || []);
    } catch (err) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveLimits = async (id) => {
    const data = edits[id]?.limits;
    if (!data) return;
    setSaving(id);
    try {
      await AppApi.updateBillingPlanLimits(id, data);
      setEdits((prev) => {
        const next = {...prev};
        if (next[id]) {
          const {limits, ...rest} = next[id];
          next[id] = Object.keys(rest).length ? rest : undefined;
        }
        return next;
      });
      const res = await AppApi.getBillingPlansAll();
      setPlans(res.plans || []);
    } catch (err) {
      setError(err?.message || "Failed to save limits");
    } finally {
      setSaving(null);
    }
  };

  const handleSavePrice = async (id, billingInterval, stripePriceId) => {
    setSaving(id);
    try {
      await AppApi.updateBillingPlanPrice(id, billingInterval, stripePriceId);
      const res = await AppApi.getBillingPlansAll();
      setPlans(res.plans || []);
    } catch (err) {
      setError(err?.message || "Failed to save price");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-0 sm:px-4 lg:px-5 xxl:px-12 py-8 w-full max-w-[96rem] mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                Billing Plans (Super Admin)
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Edit plan names, limits, and Stripe Price IDs. Changes apply immediately.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((p) => {
                  const isExpanded = expandedId === p.id;
                  const planEdits = edits[p.id] || {};
                  const lim = planEdits.limits || p.limits || {};
                  const prices = p.prices || [];
                  const priceMonth = prices.find((r) => r.billing_interval === "month" || r.billingInterval === "month");
                  const priceYear = prices.find((r) => r.billing_interval === "year" || r.billingInterval === "year");

                  return (
                    <div
                      key={p.id}
                      className="rounded-xl bg-white dark:bg-gray-800 shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div
                        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</span>
                          <span className="text-sm text-gray-500">({p.code})</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            {p.targetRole}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                              <input
                                type="text"
                                value={planEdits.name ?? p.name ?? ""}
                                onChange={(e) => handlePlanUpdate(p.id, {name: e.target.value})}
                                className="form-input w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                              <input
                                type="text"
                                value={planEdits.description ?? p.description ?? ""}
                                onChange={(e) => handlePlanUpdate(p.id, {description: e.target.value})}
                                className="form-input w-full"
                              />
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Limits</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Max Properties</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={lim.maxProperties ?? p.limits?.maxProperties ?? ""}
                                  onChange={(e) =>
                                    handlePlanUpdate(p.id, {
                                      limits: {...lim, maxProperties: parseInt(e.target.value, 10) || 0},
                                    })
                                  }
                                  className="form-input w-full"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Max Contacts</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={lim.maxContacts ?? p.limits?.maxContacts ?? ""}
                                  onChange={(e) =>
                                    handlePlanUpdate(p.id, {
                                      limits: {...lim, maxContacts: parseInt(e.target.value, 10) || 0},
                                    })
                                  }
                                  className="form-input w-full"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">AI Tokens/mo</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={lim.aiTokenMonthlyQuota ?? p.limits?.aiTokenMonthlyQuota ?? ""}
                                  onChange={(e) =>
                                    handlePlanUpdate(p.id, {
                                      limits: {...lim, aiTokenMonthlyQuota: parseInt(e.target.value, 10) || 0},
                                    })
                                  }
                                  className="form-input w-full"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Max Viewers</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={lim.maxViewers ?? p.limits?.maxViewers ?? ""}
                                  onChange={(e) =>
                                    handlePlanUpdate(p.id, {
                                      limits: {...lim, maxViewers: parseInt(e.target.value, 10) || 0},
                                    })
                                  }
                                  className="form-input w-full"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Max Team</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={lim.maxTeamMembers ?? p.limits?.maxTeamMembers ?? ""}
                                  onChange={(e) =>
                                    handlePlanUpdate(p.id, {
                                      limits: {...lim, maxTeamMembers: parseInt(e.target.value, 10) || 0},
                                    })
                                  }
                                  className="form-input w-full"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSaveLimits(p.id)}
                              disabled={saving === p.id || !planEdits.limits}
                              className="mt-2 btn bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
                            >
                              {saving === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              Save limits
                            </button>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Stripe Price IDs</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Monthly (price_xxx)</label>
                                <input
                                  type="text"
                                  placeholder="price_..."
                                  value={planEdits.priceMonth ?? priceMonth?.stripe_price_id ?? priceMonth?.stripePriceId ?? ""}
                                  onChange={(e) => handlePlanUpdate(p.id, {priceMonth: e.target.value})}
                                  className="form-input w-full font-mono text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePrice(p.id, "month", planEdits.priceMonth ?? priceMonth?.stripe_price_id ?? priceMonth?.stripePriceId ?? "")}
                                  disabled={saving === p.id}
                                  className="mt-1 text-xs text-violet-600 hover:underline"
                                >
                                  Save monthly price
                                </button>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Annual (price_xxx)</label>
                                <input
                                  type="text"
                                  placeholder="price_..."
                                  value={planEdits.priceYear ?? priceYear?.stripe_price_id ?? priceYear?.stripePriceId ?? ""}
                                  onChange={(e) => handlePlanUpdate(p.id, {priceYear: e.target.value})}
                                  className="form-input w-full font-mono text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePrice(p.id, "year", planEdits.priceYear ?? priceYear?.stripe_price_id ?? priceYear?.stripePriceId ?? "")}
                                  disabled={saving === p.id}
                                  className="mt-1 text-xs text-violet-600 hover:underline"
                                >
                                  Save annual price
                                </button>
                              </div>
                            </div>
                          </div>

                          {(planEdits.name != null || planEdits.description != null) && (
                            <button
                              type="button"
                              onClick={() => handleSavePlan(p.id)}
                              disabled={saving === p.id}
                              className="btn bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
                            >
                              {saving === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              Save plan
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default BillingPlansEditor;
