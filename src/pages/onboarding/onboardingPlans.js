/**
 * Onboarding plan definitions for role-based tier selection.
 * Plan codes map to backend subscription_products.code (data/plans.json).
 * Used by OnboardingWizard Step 2. Limits are editable in Super Admin > Billing Plans.
 */

export const HOMEOWNER_PLANS = [
  { id: "homeowner_free", code: "homeowner_free", name: "Free", tagline: "1 property, 2 AI insights/mo, 1 GB storage", popular: false },
  { id: "homeowner_maintain", code: "homeowner_maintain", name: "Maintain", tagline: "Core protection: AI assistant, contractor scheduling", popular: true },
  { id: "homeowner_win", code: "homeowner_win", name: "Win", tagline: "Up to 3 properties, unlimited AI, 25 GB", popular: false },
];

export const AGENT_PLANS = [
  { id: "agent_basic", code: "agent_basic", name: "Basic", tagline: "5 properties, limited AI, 10 GB", popular: false },
  { id: "agent_pro", code: "agent_pro", name: "Pro", tagline: "25 properties, AI summaries, reporting", popular: true },
  { id: "agent_premium", code: "agent_premium", name: "Premium", tagline: "Unlimited properties, API, white-label", popular: false },
];

/** Plan limits for confirmation summary (fallback when API not loaded). Editable in Super Admin. */
export const PLAN_LIMITS = {
  homeowner: {
    homeowner_free: { properties: 1, contacts: 25 },
    homeowner_maintain: { properties: 1, contacts: 100 },
    homeowner_win: { properties: 3, contacts: 500 },
  },
  agent: {
    agent_basic: { properties: 5, contacts: 100 },
    agent_pro: { properties: 25, contacts: 500 },
    agent_premium: { properties: "Unlimited", contacts: "Unlimited" },
  },
};
