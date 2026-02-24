import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Home, Briefcase, ChevronLeft, ChevronRight, Check, Loader2} from "lucide-react";
import {useAuth} from "../../context/AuthContext";
import AppApi from "../../api/api";
import {HOMEOWNER_PLANS, AGENT_PLANS, PLAN_LIMITS, formatPlanPrice} from "./onboardingPlans";

const ROLE_OPTIONS = [
  {
    id: "homeowner",
    title: "Homeowner",
    description: "I own or manage my own properties",
    icon: Home,
  },
  {
    id: "agent",
    title: "Agent",
    description: "I help clients manage their properties",
    icon: Briefcase,
  },
];

function StepIndicator({currentStep, totalSteps}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Step {currentStep} of {totalSteps}
      </span>
      <div className="flex gap-1.5">
        {Array.from({length: totalSteps}).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i + 1 <= currentStep
                ? "w-6 bg-violet-600 dark:bg-violet-500"
                : "w-1.5 bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Step1Role({role, onSelect}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
        Are you a Homeowner or an Agent?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {ROLE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = role === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`relative flex flex-col items-center p-6 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-violet-600 dark:border-violet-500 bg-violet-50 dark:bg-violet-950/40 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <Check className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
              )}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                  isSelected ? "bg-violet-100 dark:bg-violet-900/50" : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${isSelected ? "text-violet-600 dark:text-violet-400" : "text-gray-500 dark:text-gray-400"}`}
                />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{opt.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BillingToggle({billingInterval, onChange}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className={`text-sm font-medium transition-colors ${
          billingInterval === "monthly" ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        Monthly
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={billingInterval === "yearly"}
        onClick={() => onChange(billingInterval === "monthly" ? "yearly" : "monthly")}
        className="relative w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            billingInterval === "yearly" ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium transition-colors ${
          billingInterval === "yearly" ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        Yearly
      </span>
      <span className="text-xs text-violet-600 dark:text-violet-400 font-medium bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 rounded">
        Save 17%
      </span>
    </div>
  );
}

function Step2Plan({role, plan, onSelect, billingInterval, onBillingChange}) {
  const plans = role === "homeowner" ? HOMEOWNER_PLANS : AGENT_PLANS;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
        Choose your plan
      </h2>
      <BillingToggle billingInterval={billingInterval} onChange={onBillingChange} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {plans.map((p) => {
          const isSelected = plan === p.id;
          const isPopular = p.popular;
          return (
            <div
              key={p.id}
              className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                isSelected
                  ? "border-violet-600 dark:border-violet-500 shadow-lg shadow-violet-500/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              } ${isPopular ? "ring-2 ring-violet-500/20" : ""}`}
            >
              {isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-violet-600 dark:bg-violet-500 text-white text-xs font-medium py-1.5 text-center">
                  Most Popular
                </div>
              )}
              <div className={`p-6 ${isPopular ? "pt-10" : ""}`}>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{p.tagline}</p>
                <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatPlanPrice(p, billingInterval)}
                </p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className={`mt-6 w-full py-2.5 rounded-lg font-medium transition-colors ${
                    isSelected
                      ? "bg-violet-600 text-white dark:bg-violet-500"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {isSelected ? "Selected" : "Select Plan"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Step3Confirmation({role, plan, limits, billingInterval}) {
  const roleLabel = role === "homeowner" ? "Homeowner" : "Agent";
  const planData =
    role === "homeowner"
      ? HOMEOWNER_PLANS.find((p) => p.id === plan)
      : AGENT_PLANS.find((p) => p.id === plan);
  const planLabel = planData?.name ?? plan;
  const priceLabel = planData ? formatPlanPrice(planData, billingInterval) : null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
        Confirm your selection
      </h2>
      <div className="max-w-md mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Role</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{roleLabel}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Plan</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{planLabel}</span>
        </div>
        {priceLabel && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Billing</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{priceLabel}</span>
          </div>
        )}
        <hr className="border-gray-200 dark:border-gray-700" />
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">Summary of limits</p>
          <ul className="space-y-1">
            <li>• Properties: {limits?.properties ?? "—"}</li>
            <li>• Personal contacts: {limits?.contacts ?? "—"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const {currentUser, refreshCurrentUser} = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [plan, setPlan] = useState(null);
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const limits =
    role && plan
      ? PLAN_LIMITS[role]?.[plan] ?? {properties: "—", contacts: "—"}
      : null;

  const canContinue =
    (step === 1 && role) || (step === 2 && plan) || step === 3;

  async function handleComplete() {
    setError(null);
    setIsSubmitting(true);
    try {
      await AppApi.completeOnboarding({role, subscriptionTier: plan});
      await refreshCurrentUser();
      const accounts = await AppApi.getUserAccounts(currentUser?.id);
      const accountUrl =
        accounts?.[0]?.url?.replace(/^\/+/, "") || accounts?.[0]?.name;
      if (accountUrl) {
        navigate(`/${accountUrl}/home`, {replace: true});
      } else {
        navigate("/", {replace: true});
      }
    } catch (err) {
      setError(err?.message || "Failed to complete onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <StepIndicator currentStep={step} totalSteps={3} />

        <div className="w-full max-w-2xl">
          {step === 1 && <Step1Role role={role} onSelect={setRole} />}
          {step === 2 && (
            <Step2Plan
              role={role}
              plan={plan}
              onSelect={setPlan}
              billingInterval={billingInterval}
              onBillingChange={setBillingInterval}
            />
          )}
          {step === 3 && (
            <Step3Confirmation
              role={role}
              plan={plan}
              limits={limits}
              billingInterval={billingInterval}
            />
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        )}

        <div className="flex items-center justify-between w-full max-w-2xl mt-10 gap-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
              className="btn bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-500 dark:hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
              className="btn bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-500 dark:hover:bg-violet-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Completing...
                </>
              ) : (
                "Confirm & Continue"
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
