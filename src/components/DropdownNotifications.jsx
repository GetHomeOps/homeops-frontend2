import React, {useState, useRef, useEffect} from "react";
import {Link} from "react-router-dom";
import {Bell, Calendar, AlertCircle, ChevronRight} from "lucide-react";
import Transition from "../utils/Transition";
import AppApi from "../api/api";
import useCurrentAccount from "../hooks/useCurrentAccount";

function formatEventDate(dateStr, timeStr) {
  const d = new Date(dateStr + (timeStr ? `T${timeStr}` : "T12:00:00"));
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"});
}

function formatEventTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  if (h === 0) return "12:00 AM";
  if (h < 12) return `${h}:${String(m).padStart(2, "0")} AM`;
  if (h === 12) return `12:${String(m).padStart(2, "0")} PM`;
  return `${h - 12}:${String(m).padStart(2, "0")} PM`;
}

function DropdownNotifications({align = "right"}) {
  const {currentAccount} = useCurrentAccount();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);

  const accountUrl = currentAccount?.url || "";
  const calendarPath = accountUrl ? `/${accountUrl}/calendar` : "/calendar";

  useEffect(() => {
    if (!dropdownOpen) return;
    setLoading(true);
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 14);
    const startStr = today.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    AppApi.getCalendarEvents(startStr, endStr)
      .then((raw) => {
        setEvents(
          raw
            .sort((a, b) => (a.scheduledDate > b.scheduledDate ? 1 : -1))
            .slice(0, 8),
        );
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [dropdownOpen]);

  useEffect(() => {
    const clickHandler = ({target}) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current?.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({keyCode}) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const todayEvents = events.filter(
    (e) => new Date(e.scheduledDate).toDateString() === new Date().toDateString(),
  );
  const upcomingEvents = events.filter(
    (e) => new Date(e.scheduledDate).toDateString() !== new Date().toDateString(),
  );
  const hasAlerts = todayEvents.length > 0;
  const badgeCount = events.length;

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full transition-colors ${
          dropdownOpen ? "bg-gray-200 dark:bg-gray-800" : ""
        }`}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Notifications</span>
        <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" strokeWidth={1.75} />
        {badgeCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-amber-500 dark:bg-amber-500 rounded-full">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      <Transition
        className={`origin-top-right z-50 absolute top-full mt-1 min-w-[320px] max-w-[360px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg shadow-lg overflow-hidden ${
          align === "right" ? "right-0" : "left-0"
        }`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div ref={dropdown} onFocus={() => setDropdownOpen(true)} onBlur={() => setDropdownOpen(false)}>
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700/60">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Upcoming events & alerts
            </h3>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <div className="py-8 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                Loading…
              </div>
            ) : events.length === 0 ? (
              <div className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                <p>No upcoming events</p>
                <Link
                  to={calendarPath}
                  onClick={() => setDropdownOpen(false)}
                  className="mt-2 inline-flex items-center gap-1 text-[#456564] dark:text-teal-400 hover:underline"
                >
                  View calendar <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <ul className="py-2">
                {hasAlerts && (
                  <>
                    <li className="px-4 py-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" /> Today
                      </span>
                    </li>
                    {todayEvents.map((ev) => (
                      <li key={ev.id} className="border-b border-gray-100 dark:border-gray-700/40 last:border-0">
                        <Link
                          to={calendarPath}
                          onClick={() => setDropdownOpen(false)}
                          className="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {ev.systemName} {ev.type === "inspection" ? "Inspection" : "Maintenance"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {ev.propertyName}
                              {ev.scheduledTime && ` · ${formatEventTime(ev.scheduledTime)}`}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </>
                )}
                {upcomingEvents.length > 0 && (
                  <>
                    <li className="px-4 py-1.5 mt-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Upcoming
                      </span>
                    </li>
                    {upcomingEvents.map((ev) => (
                      <li key={ev.id} className="border-b border-gray-100 dark:border-gray-700/40 last:border-0">
                        <Link
                          to={calendarPath}
                          onClick={() => setDropdownOpen(false)}
                          className="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {ev.systemName} {ev.type === "inspection" ? "Inspection" : "Maintenance"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatEventDate(ev.scheduledDate, ev.scheduledTime)}
                              {ev.contractorName && ` · ${ev.contractorName}`}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            )}
          </div>

          {events.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50">
              <Link
                to={calendarPath}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-[#456564] dark:text-teal-400 hover:text-[#3a5554] dark:hover:text-teal-300"
              >
                View all events <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </Transition>
    </div>
  );
}

export default DropdownNotifications;
