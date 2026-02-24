import React, {useContext, useMemo} from "react";
import {Plus, Users, Crown} from "lucide-react";
import UserContext from "../../../context/UserContext";

function HomeOpsTeam({teamMembers = [], onOpenShareModal}) {
  const {users = []} = useContext(UserContext);

  /* Sort so owner(s) appear first, then others */
  const sortedMembers = useMemo(() => {
    const list = [...(teamMembers ?? [])];
    return list.sort((a, b) => {
      const aOwner = (a.role ?? "").toLowerCase() === "homeowner";
      const bOwner = (b.role ?? "").toLowerCase() === "homeowner";
      if (aOwner && !bOwner) return -1;
      if (!aOwner && bOwner) return 1;
      return 0;
    });
  }, [teamMembers]);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-[#456564]/20 dark:border-[#5a7a78]/30 p-6 md:p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#456564]/15 dark:bg-[#5a7a78]/25 flex items-center justify-center shadow-sm">
            <Users className="w-6 h-6 text-[#456564] dark:text-[#5a7a78]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Opsy team
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              People with access to this property
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {sortedMembers?.map((member) => {
          const initials = member.name
            ? member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "?";
          const userFromContext = users?.find(
            (u) =>
              u && member?.id != null && Number(u.id) === Number(member.id),
          );
          const photoUrl =
            member.image_url ??
            member.image ??
            userFromContext?.image_url ??
            userFromContext?.image;
          const isOwner = (member.role ?? "").toLowerCase() === "homeowner";

          return (
            <div
              key={member.id}
              className={`flex items-center gap-3 py-2.5 pl-2.5 pr-4 rounded-full transition-colors duration-150 cursor-default ${
                isOwner
                  ? "bg-[#456564]/10 dark:bg-[#5a7a78]/20 border-2 border-[#456564]/30 dark:border-[#5a7a78]/40 ring-1 ring-[#456564]/10"
                  : "bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/80"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0 ${
                  isOwner ? "bg-[#456564] dark:bg-[#5a7a78]" : "bg-[#456564]"
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
                    {member.name}
                  </p>
                  {isOwner && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#456564]/20 dark:bg-[#5a7a78]/30 text-[#456564] dark:text-[#5a7a78] text-xs font-semibold shrink-0">
                      <Crown className="w-3 h-3" />
                      Owner
                    </span>
                  )}
                </div>
                {!isOwner && (
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
          className="w-11 h-11 rounded-full border-2 border-dashed border-gray-300/80 dark:border-gray-600/80 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-[#456564]/50 hover:text-[#456564] dark:hover:border-[#5a7a78]/50 dark:hover:text-[#5a7a78] hover:bg-[#456564]/5 dark:hover:bg-[#5a7a78]/5 transition-all duration-200 flex-shrink-0"
          aria-label="Add team member"
          title="Add team member"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}

export default HomeOpsTeam;
