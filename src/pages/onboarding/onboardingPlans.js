/**
 * Onboarding plan definitions for role-based tier selection.
 * Used by OnboardingWizard Step 2.
 * No Stripe/pricing yet — just store selected plan in user record.
 */

export const HOMEOWNER_PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Get started with the basics",
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
    features: [
      "Unlimited properties",
      "Same feature set as Homeowner Win",
    ],
    popular: false,
  },
];

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
