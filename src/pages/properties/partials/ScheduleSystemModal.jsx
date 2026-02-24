import React, {useState, useEffect, useMemo, useCallback} from "react";
import {useNavigate, useParams} from "react-router-dom";
import useCurrentAccount from "../../../hooks/useCurrentAccount";
import {
  X,
  Calendar,
  CheckCircle2,
  Users,
  Search,
  ExternalLink,
  Clock,
  Bell,
  Star,
} from "lucide-react";
import ModalBlank from "../../../components/ModalBlank";
import DatePickerInput from "../../../components/DatePickerInput";
import AppApi from "../../../api/api";

const STEPS = [
  {id: "type", label: "Type"},
  {id: "professional", label: "Professional"},
  {id: "details", label: "Details"},
];

/* ──────────────────────────── Step Indicator ──────────────────────────── */

function StepIndicator({currentStep, steps}) {
  return (
    <div className="mb-6">
      <div className="flex items-start">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div
                  className={`flex-shrink-0 h-px w-4 sm:w-8 self-[18px] transition-colors duration-200 ${
                    idx <= currentStep
                      ? "bg-[#456564]"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                />
              )}
              <div className="flex-1 min-w-0 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200 flex-shrink-0 ${
                    isCompleted
                      ? "border-[#456564] bg-[#456564] text-white"
                      : isActive
                        ? "border-[#456564] bg-[#456564] text-white"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium mt-1.5 text-center leading-tight max-w-full truncate px-0.5 ${
                    isActive || isCompleted
                      ? "text-[#456564] dark:text-[#7aa3a2]"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                  title={step.label}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────── Step 1: Type ──────────────────── */

function TypeStep({scheduleType, setScheduleType}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Is this for an Inspection or Maintenance?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose the type of service you need.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setScheduleType("inspection")}
          className={`py-4 px-4 rounded-xl text-sm font-medium border-2 transition-all duration-150 flex flex-col items-center gap-1.5 ${
            scheduleType === "inspection"
              ? "border-[#456564] bg-[#456564]/10 text-[#456564] dark:text-[#7aa3a2] dark:border-[#7aa3a2] dark:bg-[#7aa3a2]/10"
              : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
          }`}
        >
          <span className="font-semibold">Inspection</span>
          <span className="text-xs opacity-90">
            Assess condition, identify issues
          </span>
        </button>
        <button
          type="button"
          onClick={() => setScheduleType("maintenance")}
          className={`py-4 px-4 rounded-xl text-sm font-medium border-2 transition-all duration-150 flex flex-col items-center gap-1.5 ${
            scheduleType === "maintenance"
              ? "border-[#456564] bg-[#456564]/10 text-[#456564] dark:text-[#7aa3a2] dark:border-[#7aa3a2] dark:bg-[#7aa3a2]/10"
              : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
          }`}
        >
          <span className="font-semibold">Maintenance</span>
          <span className="text-xs opacity-90">
            Routine service, repairs
          </span>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────── Step 2: Professional ──────────────────── */

function ProfessionalStep({
  hasProfessional,
  setHasProfessional,
  selectedProfessional,
  setSelectedProfessional,
  professionalSearch,
  setProfessionalSearch,
  contacts = [],
  savedProfessionals = [],
  onBrowseDirectory,
  professionalsPath,
}) {
  const filteredContacts = useMemo(() => {
    if (!contacts?.length) return [];
    let list = contacts;
    if (professionalSearch.trim()) {
      const q = professionalSearch.toLowerCase();
      list = list.filter((c) => c.name?.toLowerCase().includes(q));
    }
    return list;
  }, [contacts, professionalSearch]);

  const filteredSaved = useMemo(() => {
    if (!savedProfessionals?.length) return [];
    let list = savedProfessionals;
    if (professionalSearch.trim()) {
      const q = professionalSearch.toLowerCase();
      list = list.filter(
        (p) =>
          `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase().includes(q) ||
          p.company_name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [savedProfessionals, professionalSearch]);

  const proDisplayName = (p) =>
    p.company_name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Professional";

  const [searchFocused, setSearchFocused] = useState(false);
  const hasSearchQuery = professionalSearch.trim().length > 0;
  const suggestedContacts = hasSearchQuery ? filteredContacts : filteredContacts.slice(0, 2);
  const suggestedSaved = hasSearchQuery ? filteredSaved : filteredSaved.slice(0, 2);
  const showSearchDropdown =
    searchFocused &&
    (suggestedContacts.length > 0 || suggestedSaved.length > 0 || hasSearchQuery);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Do you already have a professional?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select from your contacts or saved professionals, or browse the directory.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setHasProfessional(true)}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all duration-150 ${
            hasProfessional === true
              ? "border-[#456564] bg-[#456564]/10 text-[#456564] dark:text-[#7aa3a2] dark:border-[#7aa3a2] dark:bg-[#7aa3a2]/10"
              : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => {
            setHasProfessional(false);
            setSelectedProfessional(null);
          }}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all duration-150 ${
            hasProfessional === false
              ? "border-[#456564] bg-[#456564]/10 text-[#456564] dark:text-[#7aa3a2] dark:border-[#7aa3a2] dark:bg-[#7aa3a2]/10"
              : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
          }`}
        >
          No
        </button>
      </div>

      {hasProfessional === true && (
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4 text-[#456564]" />
                Search My Contacts & Saved Professionals
              </span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={professionalSearch}
                onChange={(e) => setProfessionalSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                placeholder="Search by name..."
                className="form-input w-full pl-9 text-sm"
                autoComplete="off"
              />
            </div>
            {showSearchDropdown && (
              <div
                className="absolute left-0 right-0 mt-1 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-[210] max-h-64 overflow-y-auto"
                style={{top: "100%"}}
              >
                {suggestedContacts.length > 0 && (
                  <div className="px-3 py-1.5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      My Contacts
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {suggestedContacts.map((c) => (
                        <button
                          key={`contact-${c.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedProfessional({
                              id: `contact-${c.id}`,
                              sourceId: c.id,
                              name: c.name,
                              source: "contact",
                            });
                            setProfessionalSearch("");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                            {c.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {c.name}
                            </p>
                            {(c.phone || c.email) && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {c.phone || c.email}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {suggestedSaved.length > 0 && (
                  <div className={`px-3 py-1.5 ${suggestedContacts.length > 0 ? "border-t border-gray-100 dark:border-gray-700" : ""}`}>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      Saved Professionals
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {suggestedSaved.map((p) => (
                        <button
                          key={`pro-${p.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedProfessional({
                              id: `pro-${p.id}`,
                              sourceId: p.id,
                              name: proDisplayName(p),
                              source: "professional",
                            });
                            setProfessionalSearch("");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                            {proDisplayName(p)?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {proDisplayName(p)}
                            </p>
                            {p.category_name && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {p.category_name}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {hasSearchQuery && suggestedContacts.length === 0 && suggestedSaved.length === 0 && (
                  <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    No matches found. Try a different search or browse the directory.
                  </p>
                )}
              </div>
            )}
          </div>

          {selectedProfessional && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#456564]/5 dark:bg-[#456564]/10 border border-[#456564]/20 dark:border-[#7aa3a2]/20">
              <CheckCircle2 className="w-5 h-5 text-[#456564] dark:text-[#7aa3a2] flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Selected: {selectedProfessional.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProfessional(null)}
                className="ml-auto text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {hasProfessional === false && (
        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-center space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Find a professional in our directory.
          </p>
          <button
            type="button"
            onClick={onBrowseDirectory}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#456564] hover:bg-[#34514f] text-white transition-colors"
          >
            Browse Professionals Directory
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────── Step 3: Scheduling Details ──────────────────── */

function DetailsStep({
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  notes,
  setNotes,
  reminderEnabled,
  setReminderEnabled,
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Scheduling Details
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pick a date and time, add notes, and set a reminder.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#456564]" />
              Date
            </span>
          </label>
          <DatePickerInput
            name="scheduledDate"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#456564]" />
              Time (optional)
            </span>
          </label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="form-input w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes for this appointment..."
          rows={3}
          className="form-input w-full resize-none"
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#456564]" />
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Reminder
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              24 hours before
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={reminderEnabled}
          onClick={() => setReminderEnabled(!reminderEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            reminderEnabled
              ? "bg-[#456564]"
              : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              reminderEnabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Main Modal ═══════════════════════════ */

function ScheduleSystemModal({
  isOpen,
  onClose,
  systemLabel,
  systemType,
  contacts = [],
  onSchedule,
}) {
  const navigate = useNavigate();
  const {accountUrl: paramAccountUrl} = useParams();
  const {currentAccount} = useCurrentAccount();
  const accountUrl = paramAccountUrl || currentAccount?.url || "";
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const [scheduleType, setScheduleType] = useState(null);
  const [hasProfessional, setHasProfessional] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [professionalSearch, setProfessionalSearch] = useState("");
  const [savedProfessionals, setSavedProfessionals] = useState([]);

  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const professionalsPath = accountUrl ? `/${accountUrl}/professionals` : "/professionals";

  useEffect(() => {
    if (!isOpen) return;
    AppApi.getSavedProfessionals()
      .then((data) => setSavedProfessionals(data || []))
      .catch(() => setSavedProfessionals([]));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setShowSuccess(false);
      setScheduleType(null);
      setHasProfessional(null);
      setSelectedProfessional(null);
      setProfessionalSearch("");
      setScheduledDate("");
      setScheduledTime("");
      setNotes("");
      setReminderEnabled(true);
    }
  }, [isOpen]);

  const handleBrowseDirectory = useCallback(() => {
    onClose(false);
    navigate(professionalsPath);
  }, [navigate, professionalsPath, onClose]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const canAdvance = () => {
    if (currentStep === 0) return scheduleType !== null;
    if (currentStep === 1) return hasProfessional !== null;
    if (currentStep === 2) return !!scheduledDate;
    return true;
  };

  const handleSubmit = () => {
    if (scheduledDate && onSchedule) {
      onSchedule(scheduledDate);
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose(false);
    }, 1200);
  };

  if (showSuccess) {
    return (
      <ModalBlank
        id="schedule-system-modal"
        modalOpen={isOpen}
        setModalOpen={onClose}
        closeOnClickOutside={false}
        contentClassName="max-w-md"
      >
        <div className="relative p-8 flex flex-col items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              Scheduled!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {scheduleType === "inspection" ? "Inspection" : "Maintenance"} for {systemLabel}
            </p>
          </div>
        </div>
      </ModalBlank>
    );
  }

  return (
    <ModalBlank
      id="schedule-system-modal"
      modalOpen={isOpen}
      setModalOpen={onClose}
      closeOnClickOutside={false}
      contentClassName="max-w-lg"
    >
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-200 dark:bg-emerald-700/60 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-800 dark:text-emerald-100" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Schedule
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {systemLabel}
              </p>
            </div>
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <div
          key={currentStep}
          className="min-h-[220px]"
          style={{
            animation: "scheduleStepFadeIn 0.2s ease-out forwards",
          }}
        >
          <style>{`
            @keyframes scheduleStepFadeIn {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {currentStep === 0 && (
            <TypeStep scheduleType={scheduleType} setScheduleType={setScheduleType} />
          )}
          {currentStep === 1 && (
            <ProfessionalStep
              hasProfessional={hasProfessional}
              setHasProfessional={setHasProfessional}
              selectedProfessional={selectedProfessional}
              setSelectedProfessional={setSelectedProfessional}
              professionalSearch={professionalSearch}
              setProfessionalSearch={setProfessionalSearch}
              contacts={contacts}
              savedProfessionals={savedProfessionals}
              onBrowseDirectory={handleBrowseDirectory}
              professionalsPath={professionalsPath}
            />
          )}
          {currentStep === 2 && (
            <DetailsStep
              scheduledDate={scheduledDate}
              setScheduledDate={setScheduledDate}
              scheduledTime={scheduledTime}
              setScheduledTime={setScheduledTime}
              notes={notes}
              setNotes={setNotes}
              reminderEnabled={reminderEnabled}
              setReminderEnabled={setReminderEnabled}
            />
          )}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={currentStep === 0 ? () => onClose(false) : handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </button>
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#456564] hover:bg-[#34514f] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canAdvance()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#456564] hover:bg-[#34514f] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Schedule
            </button>
          )}
        </div>
      </div>
    </ModalBlank>
  );
}

export default ScheduleSystemModal;
