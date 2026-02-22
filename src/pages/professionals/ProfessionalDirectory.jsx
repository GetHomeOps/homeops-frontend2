import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowRight, Bookmark, Search} from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import useCurrentDb from "../../hooks/useCurrentDb";
import {LocationBar, CategorySectionRow, ProfessionalCard} from "./components";
import {
  CATEGORY_SECTIONS,
  SERVICE_CATEGORIES,
  MOCK_PROFESSIONALS,
} from "./data/mockData";

function ProfessionalDirectory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();
  const {currentDb} = useCurrentDb();
  const dbUrl = currentDb?.url || "";

  const savedPros = MOCK_PROFESSIONALS.filter((p) => p.saved).slice(0, 4);

  const goToMyPros = () => {
    navigate(dbUrl ? `/${dbUrl}/my-professionals` : "/my-professionals");
  };

  const goToSearch = () => {
    const params = new URLSearchParams();
    if (location?.city) params.set("city", location.city);
    if (location?.state) params.set("state", location.state);
    const base = dbUrl
      ? `/${dbUrl}/professionals/search`
      : "/professionals/search";
    navigate(`${base}?${params.toString()}`);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
            {/* Hero / Location Bar */}
            <div className="relative mb-10 rounded-2xl p-8 sm:p-10 bg-gradient-to-br from-[#07342b] via-[#0d4a3e] to-[#0a1614] shadow-xl">
              <div className="absolute inset-0 opacity-[0.12]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                      `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <g fill="none" stroke="white" stroke-width="0.4">
                        <path d="M0 50 Q25 20 50 50 T100 50" stroke-linecap="round"/>
                        <path d="M0 25 Q50 0 100 25 T100 75" stroke-linecap="round"/>
                        <path d="M0 75 Q50 50 100 75" stroke-linecap="round"/>
                        <path d="M50 0 Q75 50 50 100" stroke-linecap="round"/>
                        <path d="M25 0 Q50 25 75 0 T100 50" stroke-linecap="round"/>
                        <path d="M0 10 Q30 50 0 90" stroke-linecap="round"/>
                        <path d="M100 10 Q70 50 100 90" stroke-linecap="round"/>
                      </g>
                    </svg>`,
                    )}")`,
                  }}
                />
              </div>
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Find Home Service Professionals
                </h1>
                <p className="text-white/70 mb-6 text-sm sm:text-base">
                  Browse top-rated local pros for any home project
                </p>
                <div className="flex gap-2">
                  <LocationBar
                    value={location}
                    onChange={setLocation}
                    className="flex-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={goToSearch}
                  className="mt-4 inline-flex items-center gap-2 bg-white text-[#07342b] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  Browse All Professionals
                </button>
              </div>
            </div>

            {/* My Professionals teaser */}
            {savedPros.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-[#456564]" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      My Professionals
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={goToMyPros}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#456564] hover:text-[#34514f] dark:text-[#7aa3a2] transition-colors"
                  >
                    View all
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl">
                  {savedPros.map((pro) => (
                    <ProfessionalCard
                      key={pro.id}
                      professional={pro}
                      variant="directory-teaser"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Service Categories — Houzz-style sections with photos */}
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Browse by Service
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Select a category to find specialists in your area
                </p>
              </div>
              {CATEGORY_SECTIONS.map((section) => {
                const categories = section.categoryIds
                  .map((id) => SERVICE_CATEGORIES.find((c) => c.id === id))
                  .filter(Boolean);
                return (
                  <CategorySectionRow
                    key={section.id}
                    title={section.title}
                    categories={categories}
                    location={location}
                  />
                );
              })}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProfessionalDirectory;
