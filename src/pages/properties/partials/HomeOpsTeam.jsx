import React, {useState, useContext} from "react";
import {Pencil} from "lucide-react";
import {useTranslation} from "react-i18next";
import UserContext from "../../../context/UserContext";
import HomeOpsTeamModal from "./HomeOpsTeamModal";

function HomeOpsTeam({
  teamMembers = [],
  propertyId,
  accountUrl,
  onTeamChange,
  creatorId,
  canEditAgent = true,
}) {
  const {t} = useTranslation();
  const {users = []} = useContext(UserContext);
  const [modalOpen, setModalOpen] = useState(false);

  /* Handles the edit of the team */
  const handleEditTeam = () => {
    // Defer open so the opening click doesn't bubble to ModalBlank's "click outside" handler and close the modal immediately
    setTimeout(() => setModalOpen(true), 0);
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-5">
      <HomeOpsTeamModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        teamMembers={teamMembers}
        users={users}
        accountUrl={accountUrl}
        propertyId={propertyId}
        onSave={onTeamChange}
        creatorId={creatorId}
        canEditAgent={canEditAgent}
      />
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("yourHomeOpsTeam")}
        </h2>
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={handleEditTeam}
          aria-label="Edit team"
        >
          <Pencil className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {teamMembers?.map((member) => {
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
          return (
            <div
              key={member.id}
              className="group flex flex-col items-center gap-2 p-3 md:p-3.5 rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-gradient-to-b from-gray-50/90 to-white dark:from-gray-800/50 dark:to-gray-800/30 hover:border-[#456564]/30 dark:hover:border-[#456564]/40 hover:shadow-md dark:hover:shadow-lg dark:shadow-black/10 transition-all duration-200"
            >
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-white dark:ring-gray-700/50 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-800 overflow-hidden bg-[#456564] flex-shrink-0"
                style={{minWidth: "3.5rem", minHeight: "3.5rem"}}
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
              <div className="text-center w-full min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {member.name}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {member.role}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HomeOpsTeam;
