import React, {useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {format} from "date-fns";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import useCurrentAccount from "../../hooks/useCurrentAccount";
import {useAuth} from "../../context/AuthContext";
import AppApi from "../../api/api";
import {PAGE_LAYOUT} from "../../constants/layout";

function Support() {
  const {t} = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {currentAccount} = useCurrentAccount();
  const {currentUser} = useAuth();
  const [type, setType] = useState("support");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const accountId = currentAccount?.id;

  useEffect(() => {
    if (!currentUser?.id) return;
    async function fetchTickets() {
      try {
        setLoadingTickets(true);
        const list = await AppApi.getMySupportTickets();
        setTickets(list || []);
      } catch (err) {
        setTickets([]);
      } finally {
        setLoadingTickets(false);
      }
    }
    fetchTickets();
  }, [currentUser?.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!subject?.trim()) {
      setError(t("support.subjectRequired") || "Subject is required");
      return;
    }
    if (!description?.trim()) {
      setError(t("support.descriptionRequired") || "Description is required");
      return;
    }
    if (!accountId) {
      setError(t("support.selectAccount") || "Please select an account");
      return;
    }

    setSubmitting(true);
    try {
      const attachmentKeys = [];

      if (attachmentFiles.length > 0) {
        for (const file of attachmentFiles) {
          try {
            const doc = await AppApi.uploadDocument(file);
            if (doc?.key) attachmentKeys.push(doc.key);
          } catch (uploadErr) {
            console.warn("File upload not fully implemented:", uploadErr);
          }
        }
      }

      await AppApi.createSupportTicket({
        type,
        subject: subject.trim(),
        description: description.trim(),
        accountId,
        attachmentKeys: attachmentKeys.length ? attachmentKeys : undefined,
      });

      setSubject("");
      setDescription("");
      setAttachmentFiles([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      const list = await AppApi.getMySupportTickets();
      setTickets(list || []);
    } catch (err) {
      setError(err.message || err.messages?.[0] || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    setAttachmentFiles((prev) => [...prev, ...files].slice(0, 5));
  }

  function removeFile(index) {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const statusBadgeClass = (status) => {
    switch (status) {
      case "new":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300";
      case "working_on_it":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "solved":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300";
      default:
        return "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300";
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case "new":
        return t("support.statusNew") || "New";
      case "working_on_it":
        return t("support.statusWorking") || "Working on It";
      case "solved":
        return t("support.statusSolved") || "Solved";
      default:
        return status || "—";
    }
  };

  if (!accountId) {
    return (
      <div className="flex h-[100dvh] overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className={`grow ${PAGE_LAYOUT.listPaddingX} py-8`}>
            <p className="text-gray-600 dark:text-gray-400">
              {t("support.selectAccount") ||
                "Select an account to submit a support ticket."}
            </p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className={PAGE_LAYOUT.list}>
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {t("support.title") || "Support & Feedback"}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("support.description") ||
                  "Submit a support request or share feedback. We'll get back to you as soon as possible."}
              </p>
            </div>

            <div className="space-y-8">
              {/* Submission form */}
              <section className="rounded-xl bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/60">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {t("support.submitTicket") || "Submit a Ticket"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("support.submitDescription") ||
                      "Describe your issue or feedback. Required fields are marked."}
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                      {t("support.submitted") ||
                        "Ticket submitted successfully."}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="ticket-type"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t("support.type") || "Type"}
                    </label>
                    <select
                      id="ticket-type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="form-select w-full max-w-xs"
                    >
                      <option value="support">
                        {t("support.typeSupport") || "Support"}
                      </option>
                      <option value="feedback">
                        {t("support.typeFeedback") || "Feedback"}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-subject"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t("support.subject") || "Subject"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="ticket-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="form-input w-full"
                      placeholder={
                        t("support.subjectPlaceholder") ||
                        "Brief summary of your request"
                      }
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t("support.descriptionLabel") || "Description"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="ticket-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="form-input w-full min-h-[120px]"
                      placeholder={
                        t("support.descriptionPlaceholder") ||
                        "Provide details about your issue or feedback"
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("support.attachments") || "Attachments"} (
                      {t("support.optional") || "optional"})
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-300"
                    />
                    {attachmentFiles.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {attachmentFiles.map((f, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <span className="truncate">{f.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white disabled:opacity-50"
                    >
                      {submitting
                        ? t("saving") || "Submitting..."
                        : t("support.submit") || "Submit Ticket"}
                    </button>
                  </div>
                </form>
              </section>

              {/* My tickets list */}
              <section className="rounded-xl bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/60">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {t("support.myTickets") || "My Tickets"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("support.myTicketsDescription") ||
                      "Tickets you've submitted. Status updates will appear here."}
                  </p>
                </div>
                <div className="p-6">
                  {loadingTickets ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      {t("loading") || "Loading..."}
                    </p>
                  ) : tickets.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      {t("support.noTickets") || "No tickets yet."}
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {tickets.map((ticket) => (
                        <li
                          key={ticket.id}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mr-2 capitalize">
                                {ticket.type}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(ticket.status)}`}
                              >
                                {statusLabel(ticket.status)}
                              </span>
                              <p className="mt-1 font-medium text-gray-900 dark:text-white truncate">
                                {ticket.subject}
                              </p>
                              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {ticket.description}
                              </p>
                              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {format(new Date(ticket.createdAt), "PPp")}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Support;
