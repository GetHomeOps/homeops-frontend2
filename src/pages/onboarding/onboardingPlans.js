/**
 * Onboarding plan definitions for role-based tier selection.
 * Plan codes map to backend subscription_products.code.
 * Used by OnboardingWizard Step 2.
 */

export const HOMEOWNER_PLANS = [
  { id: "homeowner_free", code: "homeowner_free", name: "Free", tagline: "Get started with the basics", popular: false },
  { id: "homeowner_maintain", code: "homeowner_maintain", name: "Maintain", tagline: "Smart tools for proactive homeowners", popular: true },
  { id: "homeowner_win", code: "homeowner_win", name: "Win", tagline: "Everything you need to scale", popular: false },
];

export const AGENT_PLANS = [
  { id: "agent_basic", code: "agent_basic", name: "Basic", tagline: "For agents managing a few properties", popular: false },
  { id: "agent_pro", code: "agent_pro", name: "Pro", tagline: "Professional tools for growing agents", popular: true },
  { id: "agent_premium", code: "agent_premium", name: "Premium", tagline: "Unlimited power for top performers", popular: false },
];

/** Plan limits for confirmation summary (fallback when API not loaded) */
export const PLAN_LIMITS = {
  homeowner: {
    homeowner_free: { properties: 1, contacts: 20 },
    homeowner_maintain: { properties: 20, contacts: 50 },
    homeowner_win: { properties: "Unlimited", contacts: "Unlimited" },
  },
  agent: {
    agent_basic: { properties: 10, contacts: 20 },
    agent_pro: { properties: 50, contacts: 50 },
    agent_premium: { properties: "Unlimited", contacts: "Unlimited" },
  },
};
