import React, {useState, useEffect, useCallback} from "react";
import {
  Plus,
  X,
  Settings2,
  CheckCircle2,
  MapPin,
  Sparkles,
  Loader2,
  Wand2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import ModalBlank from "../../../components/ModalBlank";
import {
  PROPERTY_SYSTEMS,
  STANDARD_CUSTOM_SYSTEM_FIELDS,
} from "../constants/propertySystems";
import useGooglePlacesAutocomplete from "../../../hooks/useGooglePlacesAutocomplete";
import AppApi from "../../../api/api";

/** All AI-predictable identity fields keyed by display group. */
const AI_FIELD_GROUPS = [
  {
    label: "General",
    fields: [
      {key: "propertyType", label: "Property Type"},
      {key: "subType", label: "Sub Type"},
      {key: "roofType", label: "Roof Type"},
      {key: "yearBuilt", label: "Year Built", type: "number"},
      {
        key: "effectiveYearBuilt",
        label: "Effective Year Built",
        type: "number",
      },
      {key: "effectiveYearBuiltSource", label: "Effective Yr Built Source"},
    ],
  },
  {
    label: "Size & Lot",
    fields: [
      {key: "sqFtTotal", label: "Total ft²", type: "number"},
      {key: "sqFtFinished", label: "Finished ft²", type: "number"},
      {key: "sqFtUnfinished", label: "Unfinished ft²", type: "number"},
      {key: "garageSqFt", label: "Garage ft²", type: "number"},
      {key: "totalDwellingSqFt", label: "Total Dwelling ft²", type: "number"},
      {key: "lotSize", label: "Lot Size"},
    ],
  },
  {
    label: "Rooms & Baths",
    fields: [
      {key: "bedCount", label: "Bedrooms", type: "number"},
      {key: "bathCount", label: "Bathrooms", type: "number"},
      {key: "fullBaths", label: "Full Baths", type: "number"},
      {key: "threeQuarterBaths", label: "3/4 Baths", type: "number"},
      {key: "halfBaths", label: "Half Baths", type: "number"},
      {key: "numberOfShowers", label: "Showers", type: "number"},
      {key: "numberOfBathtubs", label: "Bathtubs", type: "number"},
    ],
  },
  {
    label: "Features & Parking",
    fields: [
      {key: "fireplaces", label: "Fireplaces", type: "number"},
      {key: "fireplaceTypes", label: "Fireplace Types"},
      {key: "basement", label: "Basement"},
      {key: "parkingType", label: "Parking Type"},
      {key: "totalCoveredParking", label: "Covered Parking", type: "number"},
      {
        key: "totalUncoveredParking",
        label: "Uncovered Parking",
        type: "number",
      },
    ],
  },
  {
    label: "Schools",
    fields: [
      {key: "schoolDistrict", label: "School District"},
      {key: "elementarySchool", label: "Elementary"},
      {key: "juniorHighSchool", label: "Junior High"},
      {key: "seniorHighSchool", label: "Senior High"},
    ],
  },
];

function SystemsSetupModal({
  modalOpen,
  setModalOpen,
  selectedSystemIds = [],
  customSystems = [],
  isNewProperty = false,
  skipIdentityStep = false,
  formData = {},
  onIdentityFieldsChange,
  onSave,
}) {
  const initialIds = selectedSystemIds ?? [];
  const [selected, setSelected] = useState(new Set(initialIds));
  const [custom, setCustom] = useState(
    customSystems.length
      ? customSystems.map((n) => ({id: `custom-${n}`, name: n}))
      : [],
  );
  const [newCustomName, setNewCustomName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const showSystemsOnly = skipIdentityStep || !isNewProperty;
  const [step, setStep] = useState(showSystemsOnly ? "systems" : "identity");
  const [identityFields, setIdentityFields] = useState({
    propertyName: "",
    address: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    county: "",
  });

  const [aiFields, setAiFields] = useState({});
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState(null);
  const [predictConfidence, setPredictConfidence] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [hasPredicted, setHasPredicted] = useState(false);

  const handlePlaceSelected = useCallback((parsed) => {
    setIdentityFields((prev) => ({
      ...prev,
      address: parsed.formattedAddress,
      addressLine1: parsed.addressLine1,
      addressLine2: parsed.addressLine2 || prev.addressLine2,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      county: parsed.county,
    }));
  }, []);

  const {
    inputRef: addressInputRef,
    isLoaded: placesLoaded,
    error: placesError,
  } = useGooglePlacesAutocomplete({onPlaceSelected: handlePlaceSelected});

  useEffect(() => {
    if (!modalOpen) return;
    const systemsOnly = skipIdentityStep || !isNewProperty;
    setStep(systemsOnly ? "systems" : "identity");
    setIdentityFields({
      propertyName: formData?.propertyName ?? "",
      address:
        formData?.address ||
        formData?.fullAddress ||
        [formData?.address, formData?.city, formData?.state, formData?.zip]
          .filter(Boolean)
          .join(", ") ||
        "",
      addressLine1: formData?.addressLine1 ?? "",
      addressLine2: formData?.addressLine2 ?? "",
      city: formData?.city ?? "",
      state: formData?.state ?? "",
      zip: formData?.zip ?? "",
      county: formData?.county ?? "",
    });
    setAiFields({});
    setSelected(new Set(selectedSystemIds ?? []));
    setCustom(
      customSystems.length
        ? customSystems.map((n) => ({id: `custom-${n}`, name: n}))
        : [],
    );
    setNewCustomName("");
    setShowSuccess(false);
    setPredicting(false);
    setPredictError(null);
    setPredictConfidence(null);
    setHasPredicted(false);
    // Fetch usage on open
    AppApi.getAiUsage()
      .then(setAiUsage)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, skipIdentityStep, isNewProperty]);

  const handleIdentityFieldChange = (key, value) => {
    setIdentityFields((prev) => ({...prev, [key]: value}));
  };

  const handleIdentityContinue = () => {
    onIdentityFieldsChange?.(identityFields);
    setStep("details");
  };

  const handleDetailsContinue = () => {
    const payload = {...identityFields};
    for (const group of AI_FIELD_GROUPS) {
      for (const f of group.fields) {
        const val = aiFields[f.key];
        if (val !== undefined && val !== null && val !== "") {
          payload[f.key] = f.type === "number" ? Number(val) : val;
        }
      }
    }
    onIdentityFieldsChange?.(payload);
    setStep("systems");
  };

  const handlePredictWithAI = async () => {
    setPredicting(true);
    setPredictError(null);
    setPredictConfidence(null);
    try {
      const propertyInfo = {
        propertyName: identityFields.propertyName,
        address: identityFields.address,
        addressLine1: identityFields.addressLine1,
        city: identityFields.city,
        state: identityFields.state,
        zip: identityFields.zip,
        county: identityFields.county,
        propertyType: formData?.propertyType ?? "",
        sqFtTotal: formData?.sqFtTotal ?? formData?.squareFeet ?? "",
        yearBuilt: formData?.yearBuilt ?? "",
      };
      const result = await AppApi.predictPropertyDetails(propertyInfo);
      if (result?.prediction) {
        const p = result.prediction;
        const newFields = {};
        for (const group of AI_FIELD_GROUPS) {
          for (const f of group.fields) {
            if (
              p[f.key] !== undefined &&
              p[f.key] !== null &&
              p[f.key] !== ""
            ) {
              newFields[f.key] = p[f.key];
            }
          }
        }
        setAiFields(newFields);
        setPredictConfidence(p.confidence);
        setHasPredicted(true);
      }
      if (result?.usage) {
        setAiUsage(result.usage);
      }
    } catch (err) {
      const msg =
        err?.message || "Failed to predict. Please enter values manually.";
      setPredictError(msg);
    } finally {
      setPredicting(false);
    }
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
    const baseName = newCustomName.trim();
    if (!baseName) return;
    setCustom((prev) => {
      const existingNames = new Set(prev.map((s) => s.name));
      let name = baseName;
      let counter = 2;
      while (existingNames.has(name)) {
        name = `${baseName} ${counter}`;
        counter++;
      }
      return [...prev, {id: `custom-${Date.now()}`, name}];
    });
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

        {/* Step 1: Identity & Address — property name + address only (details from OpenAI) */}
        {step === "identity" && isNewProperty && (
          <div className="space-y-10">
            {/* Centered header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#456564]/15 to-[#456564]/5 dark:from-[#456564]/25 dark:to-[#456564]/10 mb-5">
                <Sparkles
                  className="w-8 h-8 text-[#456564]"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Let's set up your property
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                Enter the name and address. Additional details will be filled in
                by AI.
              </p>
            </div>

            {/* Centered form — property name + address only */}
            <div className="flex justify-center">
              <div className="w-full max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Property name
                  </label>
                  <input
                    type="text"
                    value={identityFields.propertyName}
                    onChange={(e) =>
                      handleIdentityFieldChange("propertyName", e.target.value)
                    }
                    placeholder="e.g. Lakewood Estate, My Home"
                    className="form-input w-full rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#456564]/30 focus:border-[#456564] transition-colors py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Address
                    {placesLoaded && (
                      <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs font-normal">
                        Autocomplete active
                      </span>
                    )}
                  </label>
                  <input
                    key={String(modalOpen)}
                    ref={addressInputRef}
                    type="text"
                    defaultValue={identityFields.address}
                    placeholder="Start typing an address to search..."
                    className="form-input w-full rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#456564]/30 focus:border-[#456564] transition-colors py-3"
                    autoComplete="off"
                  />
                  {placesError && (
                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                      {placesError} — you can still type the address manually.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setStep("details");
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

        {/* Step 2: AI Autofill — predict all identity fields (new properties only) */}
        {step === "details" && isNewProperty && (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#456564]/12 to-[#456564]/5 dark:from-[#456564]/20 dark:to-[#456564]/8 mb-4">
                <Wand2 className="w-8 h-8 text-[#456564]" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                AI Property Autofill
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                Let AI populate property details based on the address you
                provided. You can review and edit every field before saving.
              </p>
            </div>

            {/* Budget indicator */}
            {aiUsage && (
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        aiUsage.remaining <= 0
                          ? "bg-red-500"
                          : aiUsage.spent / aiUsage.cap > 0.8
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(100, (aiUsage.spent / aiUsage.cap) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ${aiUsage.spent.toFixed(2)} / ${aiUsage.cap.toFixed(2)} this
                    month
                  </span>
                </div>
              </div>
            )}

            {/* AI Prediction button */}
            {(() => {
              const hasAddress = !!(
                identityFields.address?.trim() ||
                identityFields.addressLine1?.trim()
              );
              return (
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    disabled={
                      predicting ||
                      !hasAddress ||
                      (aiUsage && aiUsage.remaining <= 0)
                    }
                    onClick={handlePredictWithAI}
                    className="btn bg-gradient-to-r from-[#456564] to-[#3a5548] hover:from-[#34514f] hover:to-[#2d4640] text-white shadow-sm inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    {predicting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    {predicting
                      ? "Analyzing property..."
                      : hasPredicted
                        ? "Re-run AI prediction"
                        : "Populate with AI"}
                  </button>
                  {predictConfidence && (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        predictConfidence === "high"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : predictConfidence === "medium"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {predictConfidence} confidence
                    </span>
                  )}
                  {aiUsage && aiUsage.remaining <= 0 && (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      Monthly AI budget exhausted. Resets on the 1st of next
                      month.
                    </p>
                  )}
                  {predictError && (
                    <div className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{predictError}</span>
                    </div>
                  )}
                  {!hasAddress && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Enter an address on the previous step to use AI
                      prediction.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* AI-predicted fields (editable) */}
            {hasPredicted && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-5 md:p-6 space-y-5 max-h-[45vh] overflow-y-auto">
                {AI_FIELD_GROUPS.map((group) => (
                  <div key={group.label}>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {group.label}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {group.fields.map((f) => (
                        <div key={f.key}>
                          <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {f.label}
                          </label>
                          <input
                            type={f.type === "number" ? "number" : "text"}
                            value={aiFields[f.key] ?? ""}
                            onChange={(e) =>
                              setAiFields((prev) => ({
                                ...prev,
                                [f.key]: e.target.value,
                              }))
                            }
                            className="form-input w-full text-sm rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#456564]/20 focus:border-[#456564] transition-colors py-1.5"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("identity")}
                className="btn border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("systems")}
                  className="btn border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleDetailsContinue}
                  className="btn bg-[#456564] hover:bg-[#34514f] text-white"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Property Systems (always shown for existing properties, or when user continues from details) */}
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
