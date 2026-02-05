import React, {useState, useContext} from "react";
import {Pencil} from "lucide-react";
import {useTranslation} from "react-i18next";
import UserContext from "../../../context/UserContext";
import HomeOpsTeamModal from "./HomeOpsTeamModal";

function HomeOpsTeam({teamMembers = [], propertyId, dbUrl, onTeamChange}) {
  const {t} = useTranslation();
  const {users = []} = useContext(UserContext);
  const [modalOpen, setModalOpen] = useState(false);

  /* Handles the edit of the team */
  const handleEditTeam = () => {
    // Defer open so the opening click doesn't bubble to ModalBlank's "click outside" handler and close the modal immediately
    setTimeout(() => setModalOpen(true), 0);
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6">
      <HomeOpsTeamModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        teamMembers={teamMembers}
        users={users}
        dbUrl={dbUrl}
        propertyId={propertyId}
        onSave={onTeamChange}
      />
      <div className="flex items-center justify-between mb-4">
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
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
          return (
            <div
              key={member.id}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
              style={{
                backgroundColor: "#f6f7fa",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 2px 4px rgba(0, 0, 0, 0.08)";
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
                style={{backgroundColor: "#456654"}}
              >
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="text-center w-full">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
                  {member.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
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
