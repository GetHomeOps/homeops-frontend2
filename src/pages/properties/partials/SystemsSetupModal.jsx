import React, {useState, useEffect} from "react";
import {Plus, X, Settings2, CheckCircle2, MapPin, Sparkles} from "lucide-react";
import ModalBlank from "../../../components/ModalBlank";
import {
  PROPERTY_SYSTEMS,
  STANDARD_CUSTOM_SYSTEM_FIELDS,
  DEFAULT_SYSTEM_IDS,
} from "../constants/propertySystems";
import {usStates} from "../../../data/states";

function SystemsSetupModal({
  modalOpen,
  setModalOpen,
  selectedSystemIds = [],
  customSystems = [],
  isNewProperty = false,
  /** When true, skip identity step and show only systems (e.g. Configure on existing property) */
  skipIdentityStep = false,
  formData = {},
  onIdentityFieldsChange,
  onSave,
}) {
  const initialIds =
    selectedSystemIds?.length > 0 ? selectedSystemIds : DEFAULT_SYSTEM_IDS;
  const [selected, setSelected] = useState(new Set(initialIds));
  const [custom, setCustom] = useState(
    customSystems.length
      ? customSystems.map((n) => ({id: `custom-${n}`, name: n}))
      : []
  );
  const [newCustomName, setNewCustomName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const showSystemsOnly = skipIdentityStep || !isNewProperty;
  const [step, setStep] = useState(showSystemsOnly ? "systems" : "identity");
  const [identityFields, setIdentityFields] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    county: "",
  });

  useEffect(() => {
    if (!modalOpen) return;
    const systemsOnly = skipIdentityStep || !isNewProperty;
    setStep(systemsOnly ? "systems" : "identity");
    setIdentityFields({
      address:
        formData?.address ||
        formData?.fullAddress ||
        [formData?.address, formData?.city, formData?.state, formData?.zip]
          .filter(Boolean)
          .join(", ") ||
        "",
      city: formData?.city ?? "",
      state: formData?.state ?? "",
      zip: formData?.zip ?? "",
      county: formData?.county ?? "",
    });
    setSelected(
      new Set(
        selectedSystemIds?.length > 0 ? selectedSystemIds : DEFAULT_SYSTEM_IDS
      )
    );
    setCustom(
      customSystems.length
        ? customSystems.map((n) => ({id: `custom-${n}`, name: n}))
        : []
    );
    setNewCustomName("");
    setShowSuccess(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, skipIdentityStep, isNewProperty]);

  const handleIdentityFieldChange = (key, value) => {
    setIdentityFields((prev) => ({...prev, [key]: value}));
  };

  const handleIdentityContinue = () => {
    onIdentityFieldsChange?.(identityFields);
    setStep("systems");
  };

  const toggleSystem = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addCustomSystem = () => {
    const name = newCustomName.trim();
    if (!name) return;
    setCustom((prev) => [...prev, {id: `custom-${Date.now()}`, name}]);
    setNewCustomName("");
  };

  const removeCustomSystem = (id) => {
    setCustom((prev) => prev.filter((s) => s.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const persistSystems = () => {
    onSave?.({
      selectedIds: [...selected],
      customNames: custom.map((s) => s.name),
    });
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      persistSystems();
      setModalOpen(false);
    }, 1400);
  };

  const handleSkipSystems = () => {
    persistSystems();
    setModalOpen(false);
  };

  return (
    <ModalBlank
      id="systems-setup-modal"
      modalOpen={modalOpen}
      setModalOpen={setModalOpen}
      contentClassName="max-w-4xl"
    >
      <div className="p-6 md:p-8 relative">
        {/* Success overlay with animation */}
        {showSuccess && (
          <>
            <style>{`
              @keyframes systemsModalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes systemsModalScaleIn {
                from { opacity: 0; transform: scale(0.85); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-gray-800/95 rounded-lg z-10"
              style={{animation: "systemsModalFadeIn 0.3s ease-out forwards"}}
            >
              <div
                className="flex flex-col items-center gap-3"
                style={{
                  animation:
                    "systemsModalScaleIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards",
                }}
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Systems saved successfully!
                </p>
              </div>
            </div>
          </>
        )}

        {/* Step 1: Identity & Address (new properties only — never show for existing) */}
        {step === "identity" && isNewProperty && (
          <div className="space-y-8">
            {/* Setup header */}
            <div className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#456564]/12 to-[#456564]/5 dark:from-[#456564]/20 dark:to-[#456564]/8 mb-4">
                <Sparkles
                  className="w-8 h-8 text-[#456564]"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Let's set up your property
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                Let's start with your address — this will appear in the Identity
                tab.
              </p>
            </div>

            {/* Address form card */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#456564]/10 dark:bg-[#456564]/20">
                  <MapPin className="w-4 h-4 text-[#456564]" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Property address
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Street address
                  </label>
                  <input
                    type="text"
                    value={identityFields.address}
                    onChange={(e) =>
                      handleIdentityFieldChange("address", e.target.value)
                    }
                    placeholder="123 Main St, Apt 4"
                    className="form-input w-full rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#456564]/20 focus:border-[#456564] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={identityFields.city}
                      onChange={(e) =>
                        handleIdentityFieldChange("city", e.target.value)
                      }
                      placeholder="Seattle"
                      className="form-input w-full rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#456564]/20 focus:border-[#456564] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      State
                    </label>
                    <select
                      value={identityFields.state}
                      onChange={(e) =>
                        handleIdentityFieldChange("state", e.target.value)
                      }
                      className="form-input w-full rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#456564]/20 focus:border-[#456564] transition-colors"
                    >
                      <option value="">Select</option>
                      {usStates.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      ZIP code
                    </label>
                    <input
                      type="text"
                      value={identityFields.zip}
                      onChange={(e) =>
                        handleIdentityFieldChange("zip", e.target.value)
                      }
                      placeholder="98101"
                      className="form-input w-full rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#456564]/20 focus:border-[#456564] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      County
                    </label>
                    <input
                      type="text"
                      value={identityFields.county}
                      onChange={(e) =>
                        handleIdentityFieldChange("county", e.target.value)
                      }
                      placeholder="e.g. King"
                      className="form-input w-full rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#456564]/20 focus:border-[#456564] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep("systems");
                }}
                className="btn border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleIdentityContinue}
                className="btn bg-[#456564] hover:bg-[#34514f] text-white"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Property Systems (always shown for existing properties, or when user continues from identity) */}
        {(step === "systems" || (step === "identity" && !isNewProperty)) && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#456564]/10 dark:bg-[#456564]/20">
                <Settings2 className="w-6 h-6 text-[#456564]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Property Systems
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Select the systems included in this property. You can add
                  custom systems below.
                </p>
              </div>
            </div>

            {/* Predefined systems grid */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Common systems
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROPERTY_SYSTEMS.map((sys) => {
                  const Icon = sys.icon;
                  const isSelected = selected.has(sys.id);
                  return (
                    <button
                      key={sys.id}
                      type="button"
                      onClick={() => toggleSystem(sys.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-[#456564] bg-[#456564]/5 dark:bg-[#456564]/10 shadow-sm"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                          isSelected
                            ? "bg-[#456564] text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-sm font-medium truncate ${
                          isSelected
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {sys.name}
                      </span>
                      <div
                        className={`ml-auto w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-[#456564] bg-[#456564]"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 12 12"
                          >
                            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7a1 1 0 10-1.414-1.414z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add custom system */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Add custom system
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Custom systems will appear in the Systems tab with these
                standard fields:
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {STANDARD_CUSTOM_SYSTEM_FIELDS.map((f) => (
                  <span
                    key={f.key}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-xs text-gray-600 dark:text-gray-400"
                  >
                    {f.label}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCustomSystem())
                  }
                  placeholder="e.g. Solar, Pool, Elevator"
                  className="form-input flex-1 rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addCustomSystem}
                  className="btn bg-[#456564] hover:bg-[#34514f] text-white inline-flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Custom systems list */}
            {custom.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Custom systems
                </h3>
                <div className="flex flex-wrap gap-2">
                  {custom.map((sys) => {
                    const isSelected = selected.has(sys.id);
                    return (
                      <div
                        key={sys.id}
                        className={`inline-flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg border ${
                          isSelected
                            ? "border-[#456564] bg-[#456564]/5 dark:bg-[#456564]/10"
                            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSystem(sys.id)}
                          className="text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                          {sys.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCustomSystem(sys.id)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500"
                          aria-label={`Remove ${sys.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSkipSystems}
                className="btn border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn bg-[#456564] hover:bg-[#34514f] text-white"
              >
                Save systems
              </button>
            </div>
          </>
        )}
      </div>
    </ModalBlank>
  );
}

export default SystemsSetupModal;
