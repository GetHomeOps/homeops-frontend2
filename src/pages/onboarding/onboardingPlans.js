/**
 * Onboarding plan definitions for role-based tier selection.
 * Used by OnboardingWizard Step 2.
 */

export const HOMEOWNER_PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Get started with the basics",
    priceMonthly: null,
    priceYearly: null,
    features: [
      "1 property",
      "Up to 20 personal contacts",
      "No AI Smart Assistance",
      "1 emergency contact share",
      "Basic reporting (PDF only)",
    ],
    popular: false,
  },
  {
    id: "maintain",
    name: "Maintain",
    tagline: "Smart tools for proactive homeowners",
    priceMonthly: 24,
    priceYearly: 240,
    features: [
      "Up to 20 properties",
      "Smart reporting (PDF + CSV)",
      "Smart AI assistance",
      "Up to 50 personal contacts",
      "Priority support badge",
    ],
    popular: true,
  },
  {
    id: "win",
    name: "Win",
    tagline: "Everything you need to scale",
    priceMonthly: 49,
    priceYearly: 490,
    features: [
      "Unlimited properties",
      "Unlimited contacts",
      "Everything in Maintain",
      "Advanced analytics dashboard",
      "Early access to new features",
    ],
    popular: false,
  },
];

export const AGENT_PLANS = [
  {
    id: "basic",
    name: "Basic",
    tagline: "For agents managing a few properties",
    priceMonthly: 39,
    priceYearly: 390,
    features: [
      "Up to 10 properties",
      "Same limits as Homeowner Free otherwise",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Professional tools for growing agents",
    priceMonthly: 99,
    priceYearly: 990,
    features: [
      "Up to 50 properties",
      "Same feature set as Homeowner Maintain",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Unlimited power for top performers",
    priceMonthly: 179,
    priceYearly: 1790,
    features: [
      "Unlimited properties",
      "Same feature set as Homeowner Win",
    ],
    popular: false,
  },
];

/** Format plan price for display */
export function formatPlanPrice(plan, billingInterval) {
  if (plan.priceMonthly == null && plan.priceYearly == null) return "Free";
  const amount = billingInterval === "yearly" ? plan.priceYearly : plan.priceMonthly;
  if (billingInterval === "yearly") {
    return `$${amount}/year`;
  }
  return `$${amount}/month`;
}

/** Plan limits for confirmation summary */
export const PLAN_LIMITS = {
  homeowner: {
    free: { properties: 1, contacts: 20 },
    maintain: { properties: 20, contacts: 50 },
    win: { properties: "Unlimited", contacts: "Unlimited" },
  },
  agent: {
    basic: { properties: 10, contacts: 20 },
    pro: { properties: 50, contacts: 50 },
    premium: { properties: "Unlimited", contacts: "Unlimited" },
  },
};
