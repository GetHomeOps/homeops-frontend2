import React, {useState, useEffect, useRef, useMemo} from "react";
import {UserPlus, Mail, Send, ArrowRight, Check, ChevronDown} from "lucide-react";
import ModalBlank from "../../../components/ModalBlank";
import SelectDropdown from "../../contacts/SelectDropdown";

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function SearchableEmailField({
  contacts,
  value,
  onChange,
  placeholder = "Type to search contacts or enter email…",
}) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const contactsWithEmail = useMemo(
    () => contacts.filter((c) => c.email?.trim()),
    [contacts],
  );

  const filteredContacts = useMemo(() => {
    const term = inputValue.trim().toLowerCase();
    if (!term) return contactsWithEmail;
    return contactsWithEmail.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [contactsWithEmail, inputValue]);

  const showCustomOption =
    inputValue.trim() &&
    EMAIL_REGEX.test(inputValue.trim()) &&
    !contactsWithEmail.some(
      (c) => c.email?.trim().toLowerCase() === inputValue.trim().toLowerCase(),
    );

  const options = showCustomOption
    ? [
        ...filteredContacts,
        {
          id: "__custom__",
          email: inputValue.trim(),
          name: `Use "${inputValue.trim()}"`,
          isCustom: true,
        },
      ]
    : filteredContacts;

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (contact) => {
    const email = contact.email?.trim() || contact.email;
    setInputValue(email);
    onChange(email);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v);
    onChange(v);
    setIsOpen(true);
    setHighlightIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsOpen(true);
      e.preventDefault();
      return;
    }
    if (!isOpen) return;
    if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightIndex(-1);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      setHighlightIndex((i) =>
        i < options.length - 1 ? i + 1 : i,
      );
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowUp") {
      setHighlightIndex((i) => (i > 0 ? i - 1 : -1));
      e.preventDefault();
      return;
    }
    if (e.key === "Enter" && highlightIndex >= 0 && options[highlightIndex]) {
      handleSelect(options[highlightIndex]);
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIndex];
      el?.scrollIntoView({block: "nearest"});
    }
  }, [highlightIndex]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="form-input w-full pr-9"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-auto"
          role="listbox"
        >
          {options.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {inputValue.trim()
                ? "No matching contacts. Type a full email address."
                : "No contacts with email. Type an email address."}
            </li>
          ) : (
            options.map((contact, idx) => (
              <li
                key={contact.id || contact.email}
                role="option"
                aria-selected={highlightIndex === idx}
                className={`px-4 py-2.5 text-sm cursor-pointer ${
                  highlightIndex === idx
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                    : "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onMouseEnter={() => setHighlightIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(contact);
                }}
              >
                {contact.isCustom
                  ? contact.name
                  : `${contact.name || "Unknown"} (${contact.email?.trim()})`}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function SharePropertyModal({
  modalOpen,
  setModalOpen,
  propertyAddress = "",
  users = [],
  contacts = [],
  onShareWithUser,
  onSendByEmail,
}) {
  const [mode, setMode] = useState("choose"); // "choose" | "user" | "email"
  const [selectedUserId, setSelectedUserId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successType, setSuccessType] = useState(null); // "user" | "email" | null

  useEffect(() => {
    if (modalOpen) {
      setMode("choose");
      setSelectedUserId("");
      setEmail("");
      setMessage("");
      setSuccessType(null);
    }
  }, [modalOpen]);

  const effectiveEmail = email?.trim() || "";

  const userOptions = users.map((u) => ({
    id: u.id,
    value: String(u.id),
    label: u.name || u.email || `User ${u.id}`,
    name: u.name || u.email || `User ${u.id}`,
  }));

  const isValidEmail = EMAIL_REGEX.test(effectiveEmail);

  const handleShareWithUser = async () => {
    if (!selectedUserId) return;
    setIsSubmitting(true);
    try {
      await onShareWithUser?.(selectedUserId);
      setSuccessType("user");
      setTimeout(() => {
        setModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendByEmail = async () => {
    if (!isValidEmail) return;
    setIsSubmitting(true);
    try {
      await onSendByEmail?.({
        email: effectiveEmail,
        message: message.trim(),
      });
      setSuccessType("email");
      setTimeout(() => {
        setModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccessOverlay = successType !== null;

  return (
    <ModalBlank
      id="share-property-modal"
      modalOpen={modalOpen}
      setModalOpen={setModalOpen}
      contentClassName="max-w-lg min-w-[20rem]"
    >
      <div
        className={`p-6 md:p-8 relative ${
          showSuccessOverlay ? "min-h-[14rem]" : ""
        }`}
      >
        {/* Success overlay */}
        {showSuccessOverlay && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-gray-800/95 rounded-lg z-10 px-6 py-8 min-w-0"
            style={{
              animation: "shareModalFadeIn 0.3s ease-out forwards",
            }}
          >
            <style>{`
              @keyframes shareModalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes shareModalCheckPop {
                from { opacity: 0; transform: scale(0.6); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
            <div
              className="flex flex-col items-center gap-3 w-full max-w-sm min-w-[min(18rem,100%)]"
              style={{
                animation:
                  "shareModalCheckPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              <div className="w-14 h-14 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white text-center break-words w-full">
                {successType === "user"
                  ? "Property shared successfully!"
                  : "Email sent successfully!"}
              </p>
            </div>
          </div>
        )}

        {!showSuccessOverlay && (
          <>
            {(mode === "user" || mode === "email") && (
              <button
                type="button"
                onClick={() => setMode("choose")}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1 -ml-1 mb-4"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
            )}

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Share Property
              </h2>
              {propertyAddress && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-full">
                  {propertyAddress}
                </p>
              )}
            </div>

            {mode === "choose" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setMode("user")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-200 text-left group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                    <UserPlus className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Share with existing user
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Grant access to a user in your organization
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 flex-shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setMode("email")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-200 text-left group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                    <Mail className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Send via email
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email property details to any address
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 flex-shrink-0" />
                </button>
              </div>
            )}

            {mode === "user" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select user
                  </label>
                  <SelectDropdown
                    options={userOptions}
                    value={selectedUserId}
                    onChange={(v) => setSelectedUserId(v)}
                    placeholder="Choose a user to share with"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWithUser}
                    disabled={!selectedUserId || isSubmitting}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                        Sharing…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Share
                        <Send className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === "email" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email address
                    </label>
                    <SearchableEmailField
                      contacts={contacts}
                      value={email}
                      onChange={setEmail}
                      placeholder="Type to search contacts or enter email…"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="share-message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Message <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      id="share-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a personal message..."
                      rows={4}
                      className="form-input w-full resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendByEmail}
                    disabled={!isValidEmail || isSubmitting}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                        Sending…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send email
                        <Send className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ModalBlank>
  );
}

export default SharePropertyModal;
