import React, {useState, useRef, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Search,
  ExternalLink,
} from "lucide-react";
import Transition from "../../../utils/Transition";
import AppApi from "../../../api/api";
import DatePickerInput from "../../../components/DatePickerInput";

function AIAssistantSidebar({
  isOpen,
  onClose,
  systemLabel,
  propertyId,
  contacts = [],
  initialPrompt,
  onScheduleSuccess,
}) {
  const navigate = useNavigate();
  const {accountUrl} = useParams();
  const professionalsPath = accountUrl ? `/${accountUrl}/professionals` : "/professionals";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const hasSentInitialPromptRef = useRef(false);
  const [contractors, setContractors] = useState([]);
  const [contractorSearch, setContractorSearch] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [eventType, setEventType] = useState(null);
  const [scheduledFor, setScheduledFor] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(null);

  useEffect(() => {
    if (scheduleSuccess) {
      const t = setTimeout(() => setScheduleSuccess(null), 5000);
      return () => clearTimeout(t);
    }
  }, [scheduleSuccess]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && propertyId) {
      inputRef.current?.focus();
    }
  }, [isOpen, propertyId]);

  /* Auto-send initialPrompt when sidebar opens with report context */
  useEffect(() => {
    if (!isOpen) {
      hasSentInitialPromptRef.current = false;
      return;
    }
    if (!initialPrompt || !propertyId || hasSentInitialPromptRef.current || loading) return;
    hasSentInitialPromptRef.current = true;
    setMessages((prev) => [...prev, {role: "user", content: initialPrompt}]);
    setLoading(true);
    AppApi.aiChat({propertyId, message: initialPrompt})
      .then((res) => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.assistantMessage,
            uiDirectives: res.uiDirectives,
          },
        ]);
      if (res.uiDirectives?.type === "SCHEDULE_PROPOSAL") {
        setScheduleDraft({
          actionDraftId: res.uiDirectives.actionDraftId,
          tasks: res.uiDirectives.tasks || [],
        });
        setSelectedContractor(null);
        setEventType(null);
        setScheduledFor("");
        setScheduledTime("");
        setScheduleNotes("");
      }
      })
      .catch((err) => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Sorry, something went wrong: ${err?.message || "Please try again."}`,
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [isOpen, initialPrompt, propertyId]);

  useEffect(() => {
    if (!propertyId || !scheduleDraft) return;
    AppApi.getPropertyContractors(propertyId, contractorSearch)
      .then(setContractors)
      .catch(() => setContractors([]));
  }, [propertyId, scheduleDraft, contractorSearch]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !propertyId || loading) return;

    setInput("");
    setMessages((prev) => [...prev, {role: "user", content: text}]);
    setLoading(true);

    try {
      const res = await AppApi.aiChat({
        propertyId,
        message: text,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.assistantMessage,
          uiDirectives: res.uiDirectives,
        },
      ]);

      if (res.uiDirectives?.type === "SCHEDULE_PROPOSAL") {
        setScheduleDraft({
          actionDraftId: res.uiDirectives.actionDraftId,
          tasks: res.uiDirectives.tasks || [],
        });
        setSelectedContractor(null);
        setEventType(null);
        setScheduledFor("");
        setScheduledTime("");
        setScheduleNotes("");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, something went wrong: ${err?.message || "Please try again."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContractor = async (contractor) => {
    if (!scheduleDraft?.actionDraftId) return;
    setSelectedContractor(contractor);
    try {
      await AppApi.aiSelectContractor(scheduleDraft.actionDraftId, {
        contractorId: contractor.id,
        contractorSource: contractor.source,
        contractorName: contractor.name,
      });
    } catch (err) {
      console.error("Failed to select contractor:", err);
    }
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleDraft?.actionDraftId || !selectedContractor || !eventType || !scheduledFor) return;
    setScheduling(true);
    try {
      const res = await AppApi.aiConfirmSchedule(scheduleDraft.actionDraftId, {
        scheduledFor,
        scheduledTime: scheduledTime?.trim() || undefined,
        eventType,
        notes: scheduleNotes || undefined,
      });
      setScheduleSuccess(res);
      setScheduleDraft(null);
      setSelectedContractor(null);
      onScheduleSuccess?.();
    } catch (err) {
      console.error("Failed to schedule:", err);
    } finally {
      setScheduling(false);
    }
  };

  const filteredContractors = contractorSearch.trim()
    ? contractors.filter(
        (c) =>
          c.name?.toLowerCase().includes(contractorSearch.toLowerCase()) ||
          c.email?.toLowerCase().includes(contractorSearch.toLowerCase())
      )
    : contractors;

  return (
    <Transition
      show={isOpen}
      tag="div"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col"
      enter="transition ease-out duration-200 transform"
      enterStart="translate-x-full"
      enterEnd="translate-x-0"
      leave="transition ease-in duration-150 transform"
      leaveStart="translate-x-0"
      leaveEnd="translate-x-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#456564]" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              AI Assistant
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {systemLabel && (
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Context: <span className="font-medium text-gray-700 dark:text-gray-300">{systemLabel}</span>
            </p>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-6 text-center">
              <Sparkles className="w-10 h-10 text-[#456564] mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ask anything about your property.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                I can help with maintenance, inspections, and scheduling.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-[#456564] text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.uiDirectives?.type === "SCHEDULE_PROPOSAL" && (
                  <p className="mt-2 text-xs opacity-90">
                    I can help you schedule. Choose the event type, contractor, date, and time below.
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-700">
                <Loader2 className="w-4 h-4 animate-spin text-[#456564]" />
              </div>
            </div>
          )}

          {scheduleSuccess && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Scheduled!</span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Your maintenance has been added to the calendar.
              </p>
            </div>
          )}

          {scheduleDraft && !scheduleSuccess && (
            <div className="rounded-xl border border-[#456564]/30 dark:border-[#456564]/50 bg-[#456564]/5 p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Schedule (fill in the details below)
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {scheduleDraft.tasks.map((t, i) => (
                  <li key={i}>
                    {t.task} — {t.suggestedWhen}
                  </li>
                ))}
              </ul>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Event type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEventType("inspection")}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      eventType === "inspection"
                        ? "border-[#456564] bg-[#456564]/10 text-[#456564] dark:text-[#7aa3a2]"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Inspection
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType("maintenance")}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      eventType === "maintenance"
                        ? "border-[#456564] bg-[#456564]/10 text-[#456564] dark:text-[#7aa3a2]"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Maintenance
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  <Users className="w-3.5 h-3.5 inline mr-1" />
                  Select contractor
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={contractorSearch}
                    onChange={(e) => setContractorSearch(e.target.value)}
                    placeholder="Search contacts & professionals..."
                    className="form-input w-full pl-8 text-sm py-1.5"
                  />
                </div>
                <div className="mt-1.5 max-h-32 overflow-y-auto space-y-0.5">
                  {filteredContractors.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectContractor(c)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 ${
                        selectedContractor?.id === c.id
                          ? "bg-[#456564]/20 text-[#456564] dark:text-[#7aa3a2]"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {selectedContractor?.id === c.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      {c.name}
                    </button>
                  ))}
                  {filteredContractors.length === 0 && (
                    <p className="px-2 py-1.5 text-xs text-gray-500">
                      No contractors found.{" "}
                      <button
                        type="button"
                        onClick={() => navigate(professionalsPath)}
                        className="text-[#456564] hover:underline font-medium inline-flex items-center gap-0.5"
                      >
                        Browse professionals directory
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Date
                  </label>
                  <DatePickerInput
                    name="scheduledFor"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    popoverClassName="z-[300]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Time (optional)
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="form-input w-full text-sm py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="Add any notes..."
                  className="form-input w-full text-sm py-1.5"
                />
              </div>

              <button
                type="button"
                onClick={handleConfirmSchedule}
                disabled={!selectedContractor || !eventType || !scheduledFor || scheduling}
                className="w-full py-2 rounded-lg text-sm font-medium bg-[#456564] hover:bg-[#34514f] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {scheduling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Confirm schedule"
                )}
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {propertyId && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask about your property..."
                className="form-input flex-1 rounded-lg text-sm py-2"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2 rounded-lg bg-[#456564] hover:bg-[#34514f] text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!propertyId && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Save the property to use the AI assistant.
            </p>
          </div>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[-1] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </Transition>
  );
}

export default AIAssistantSidebar;
