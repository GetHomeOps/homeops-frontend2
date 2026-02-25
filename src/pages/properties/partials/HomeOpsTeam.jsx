import React, {useContext, useMemo} from "react";
import {Plus, Mail} from "lucide-react";
import UserContext from "../../../context/UserContext";

function HomeOpsTeam({teamMembers = [], onOpenShareModal}) {
  const {users = []} = useContext(UserContext);

  /* Sort so owner(s) appear first, then pending, then others */
  const sortedMembers = useMemo(() => {
    const list = [...(teamMembers ?? [])];
    return list.sort((a, b) => {
      const aPending = a._pending === true;
      const bPending = b._pending === true;
      if (aPending && !bPending) return 1;
      if (!aPending && bPending) return -1;
      const aOwner = (a.role ?? "").toLowerCase() === "homeowner";
      const bOwner = (b.role ?? "").toLowerCase() === "homeowner";
      if (aOwner && !bOwner) return -1;
      if (!aOwner && bOwner) return 1;
      return 0;
    });
  }, [teamMembers]);

  const owner = useMemo(
    () =>
      sortedMembers.find(
        (m) => (m.role ?? "").toLowerCase() === "homeowner" && !m._pending,
      ),
    [sortedMembers],
  );

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-6 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
            Your Opsy team
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            People with access to this property
          </p>
        </div>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Team members
          </span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
        {sortedMembers?.map((member) => {
            const isOwner = member === owner;
            const isPending = member._pending === true;
            const initials = member.name
              ? member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"
              : member.email?.charAt(0)?.toUpperCase() || "?";
            const userFromContext = users?.find(
              (u) =>
                u && member?.id != null && Number(u.id) === Number(member.id),
            );
            const photoUrl =
              member.image_url ??
              member.image ??
              userFromContext?.image_url ??
              userFromContext?.image;

            return (
              <div
                key={member.id ?? `pending-${member.email}`}
                className={`flex items-center gap-3 py-3 pl-3 pr-5 rounded-xl transition-colors duration-150 cursor-default ${
                  isPending
                    ? "bg-gray-100/80 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/60 opacity-75"
                    : "bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/80 border border-gray-200/60 dark:border-gray-700/60"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0 ${
                    isPending
                      ? "bg-gray-400 dark:bg-gray-500"
                      : "bg-[#456564] dark:bg-[#5a7a78]"
                  }`}
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                      {member.name || member.email}
                    </p>
                    {isOwner && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#456564]/15 dark:bg-[#5a7a78]/25 text-[#456564] dark:text-[#5a7a78] text-xs font-semibold shrink-0">
                        Owner
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-200/60 dark:bg-gray-600/40 text-gray-600 dark:text-gray-400 text-xs font-semibold shrink-0">
                        <Mail className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                  {!isPending && !isOwner && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate leading-tight">
                      {member.role}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenShareModal?.();
          }}
          className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-[#456564]/50 hover:text-[#456564] dark:hover:border-[#5a7a78]/50 dark:hover:text-[#5a7a78] hover:bg-[#456564]/5 dark:hover:bg-[#5a7a78]/5 transition-all duration-200 flex-shrink-0"
          aria-label="Add team member"
          title="Add team member"
        >
          <Plus className="w-6 h-6" />
        </button>
        </div>
      </div>
    </section>
  );
}

export default HomeOpsTeam;
