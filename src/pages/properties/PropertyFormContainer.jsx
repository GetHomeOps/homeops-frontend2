import React, {useMemo, useState, useRef, useEffect} from "react";
import {useNavigate, useLocation, useParams} from "react-router-dom";
import useCurrentDb from "../../hooks/useCurrentDb";
import SystemsTab from "./SystemsTab";
import MaintenanceTab from "./MaintenanceTab";
import IdentityTab from "./IdentityTab";
import DocumentsTab from "./DocumentsTab";
import {
  Bed,
  Bath,
  Ruler,
  Calendar,
  CheckCircle2,
  MoreVertical,
  FileText,
  Settings,
  Wrench,
  Image as ImageIcon,
  ClipboardList,
  Home,
  MapPin,
  Building,
  Zap,
  Droplet,
  Shield,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const propertyProfile = {
  id: "HPS-100234",
  address: "1234 Maplewood Lane",
  city: "Anytown",
  state: "USA",
  zip: "12345",
  price: 785000,
  rooms: 4,
  bathrooms: 3,
  squareFeet: 2800,
  yearBuilt: 1995,
  hpsScore: 92,
  healthScore: 92,
  mainPhoto:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  summary:
    "Recently updated colonial home with modern systems, solar, smart security, and low-maintenance landscaping.",
  agentId: "USR-002",
  homeownerIds: ["USR-201", "USR-204"],
  teamMembers: [
    {id: "USR-201", name: "Jordan Lee", role: "Homeowner", image: ""},
    {id: "USR-204", name: "Lena Ortiz", role: "Homeowner", image: ""},
    {id: "USR-002", name: "Marcus Reed", role: "Primary Agent", image: ""},
    {id: "USR-003", name: "Olivia Park", role: "Mortgage Partner", image: ""},
  ],
  healthMetrics: {
    documentsUploaded: {current: 8, total: 10},
    systemsIdentified: {current: 3, total: 6},
    maintenanceProfileSetup: {complete: true},
  },
  healthHighlights: [
    {
      label: "Roof",
      status: "Good",
      note: "Replaced in 2021 with 30-year architectural shingles.",
    },
    {
      label: "HVAC",
      status: "Needs Attention",
      note: "Annual service overdue by two months.",
    },
    {
      label: "Foundation",
      status: "Good",
      note: "No cracks detected in latest inspection.",
    },
  ],
  photos: [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  ],
  maintenanceHistory: [
    {
      id: "MT-2311",
      date: "2024-08-04",
      title: "Quarterly HVAC Service",
      status: "Scheduled",
      notes: "Filter replacement and condenser cleaning.",
    },
    {
      id: "MT-2265",
      date: "2024-04-17",
      title: "Exterior Paint Refresh",
      status: "Completed",
      notes: "Repainted siding and trim. Touch-up required in spring.",
    },
    {
      id: "MT-2198",
      date: "2023-12-02",
      title: "Gutter Cleaning",
      status: "Completed",
      notes: "Cleared all gutters and installed new guards.",
    },
  ],
  documents: [
    {
      id: "DOC-8841",
      name: "Inspection Report - May 2024.pdf",
      type: "PDF",
      size: "2.1 MB",
      updatedAt: "2024-05-22",
    },
    {
      id: "DOC-8732",
      name: "Solar Performance Summary.csv",
      type: "CSV",
      size: "780 KB",
      updatedAt: "2024-03-18",
    },
    {
      id: "DOC-8510",
      name: "Insurance Policy - 2024.pdf",
      type: "PDF",
      size: "1.4 MB",
      updatedAt: "2024-01-08",
    },
  ],
};

const platformUsers = [
  {id: "USR-001", name: "Amelia Barton", role: "Agent"},
  {id: "USR-002", name: "Marcus Reed", role: "Agent"},
  {id: "USR-003", name: "Olivia Park", role: "Agent"},
  {id: "USR-201", name: "Jordan Lee", role: "Homeowner"},
  {id: "USR-202", name: "Priya Patel", role: "Homeowner"},
  {id: "USR-203", name: "Noah Garcia", role: "Homeowner"},
  {id: "USR-204", name: "Lena Ortiz", role: "Homeowner"},
];

const tabs = [
  {id: "identity", label: "Identity"},
  {id: "systems", label: "Systems"},
  {id: "maintenance", label: "Maintenance"},
  {id: "documents", label: "Documents"},
  {id: "media", label: "Media"},
];

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const createInitialPropertyState = () => ({
  ...propertyProfile,
  homeownerIds: [...propertyProfile.homeownerIds],
  photos: [...propertyProfile.photos],
  healthHighlights: propertyProfile.healthHighlights.map((highlight) => ({
    ...highlight,
  })),
  maintenanceHistory: propertyProfile.maintenanceHistory.map((item) => ({
    ...item,
  })),
  documents: propertyProfile.documents.map((doc) => ({...doc})),
});

// Circular Progress Component for HPS Score
function CircularProgress({percentage, size = 120, strokeWidth = 8}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{width: size, height: size}}
    >
      <svg
        className="transform -rotate-90 absolute inset-0"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-green-400 dark:text-green-500 transition-all duration-500"
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
          {percentage}
        </div>
        <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
          HPS
        </div>
      </div>
    </div>
  );
}

// Donut Chart Component for Health Score
function DonutChart({percentage, size = 160, strokeWidth = 12}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Adjust text size based on chart size
  const textSizeClass = size <= 80 ? "text-xl" : "text-4xl";

  return (
    <div className="relative" style={{width: size, height: size}}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-green-400 dark:text-green-500 transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div
            className={`${textSizeClass} font-bold text-gray-900 dark:text-white`}
          >
            {percentage}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock properties list for navigation (should be replaced with actual properties context/API)
const mockProperties = [
  {id: "HPS-100234", address: "1234 Maplewood Lane"},
  {id: "PROP-1001", address: "123 Main St"},
  {id: "PROP-1002", address: "48 Pine Ridge Rd"},
  {id: "PROP-1003", address: "890 Sunset Blvd"},
  {id: "PROP-1004", address: "221B Baker St"},
  {id: "PROP-1005", address: "742 Evergreen Terrace"},
  {id: "PROP-1006", address: "500 Market St"},
  {id: "PROP-1007", address: "2300 Riverside Dr"},
  {id: "PROP-1008", address: "30 Rockefeller Plaza"},
];

function PropertyFormContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const {id} = useParams();
  const {currentDb} = useCurrentDb();
  const dbUrl = currentDb?.url || currentDb?.name || "";
  const [propertyData, setPropertyData] = useState(createInitialPropertyState);
  const [activeTab, setActiveTab] = useState("identity");
  const [formChanged, setFormChanged] = useState(false);
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const teamMenuRef = useRef(null);

  // Close team menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (teamMenuRef.current && !teamMenuRef.current.contains(event.target)) {
        setTeamMenuOpen(false);
      }
    }

    if (teamMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [teamMenuOpen]);

  const agentOptions = useMemo(
    () => platformUsers.filter((user) => user.role === "Agent"),
    []
  );

  const homeownerOptions = useMemo(
    () => platformUsers.filter((user) => user.role === "Homeowner"),
    []
  );

  const handleInputChange = (event) => {
    const {name, value} = event.target;
    setPropertyData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "squareFeet" || name === "rooms"
          ? Number(value)
          : value,
    }));
    setFormChanged(true);
  };

  const handleAgentChange = (event) => {
    const agentId = event.target.value;
    setPropertyData((prev) => ({...prev, agentId}));
    setFormChanged(true);
  };

  const handleHomeownerToggle = (id) => {
    setPropertyData((prev) => {
      const homeownerIds = prev.homeownerIds.includes(id)
        ? prev.homeownerIds.filter((homeownerId) => homeownerId !== id)
        : [...prev.homeownerIds, id];
      return {...prev, homeownerIds};
    });
    setFormChanged(true);
  };

  const handleBackToProperties = () => navigate(`/${dbUrl}/properties`);
  const handleNewProperty = () => navigate(`/${dbUrl}/properties/new`);

  const handleCancelChanges = () => {
    setPropertyData(createInitialPropertyState());
    setFormChanged(false);
  };

  const handleUpdate = () => {
    // Placeholder for future API integration
    setFormChanged(false);
  };

  // Helper function to build navigation state from properties
  const buildNavigationState = (propertyId) => {
    // Sort properties by address (or use the same sorting logic as PropertiesList)
    const sortedProperties = [...mockProperties].sort((a, b) => {
      return a.address.localeCompare(b.address);
    });

    const propertyIndex = sortedProperties.findIndex(
      (property) => property.id === propertyId
    );

    if (propertyIndex === -1) {
      // If property not found, return null
      return null;
    }

    return {
      currentIndex: propertyIndex + 1,
      totalItems: sortedProperties.length,
      visiblePropertyIds: sortedProperties.map((property) => property.id),
    };
  };

  return (
    <div className="px-4 sm:px-6 lg:px-1 pt-1">
      {/* Navigation and Actions */}
      <div className="flex justify-between items-center mb-4">
        <button
          className="btn text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-600 mb-2 pl-0 focus:outline-none shadow-none"
          onClick={handleBackToProperties}
        >
          <svg
            className="fill-current shrink-0 mr-1"
            width="18"
            height="18"
            viewBox="0 0 18 18"
          >
            <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z"></path>
          </svg>
          <span className="text-lg">Properties</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            className="btn bg-[#456564] hover:bg-[#34514f] text-white transition-colors duration-200 shadow-sm"
            onClick={handleNewProperty}
          >
            Add Property
          </button>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        {/* Property Navigation */}
        <div className="flex items-center">
          {id &&
            id !== "new" &&
            (() => {
              // Use location.state if available, otherwise build from properties
              const navState = location.state || buildNavigationState(id);

              if (!navState) return null;

              return (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    {navState.currentIndex || 1} / {navState.totalItems || 1}
                  </span>
                  <button
                    className="btn shadow-none p-1"
                    title="Previous"
                    onClick={() => {
                      if (
                        navState.visiblePropertyIds &&
                        navState.currentIndex > 1
                      ) {
                        const prevIndex = navState.currentIndex - 2;
                        const prevPropertyId =
                          navState.visiblePropertyIds[prevIndex];
                        const prevNavState =
                          buildNavigationState(prevPropertyId);
                        navigate(`/${dbUrl}/properties/${prevPropertyId}`, {
                          state: prevNavState || {
                            ...navState,
                            currentIndex: navState.currentIndex - 1,
                          },
                        });
                      }
                    }}
                    disabled={
                      !navState.currentIndex || navState.currentIndex <= 1
                    }
                  >
                    <svg
                      className={`fill-current shrink-0 ${
                        !navState.currentIndex || navState.currentIndex <= 1
                          ? "text-gray-200 dark:text-gray-700"
                          : "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-600"
                      }`}
                      width="24"
                      height="24"
                      viewBox="0 0 18 18"
                    >
                      <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z"></path>
                    </svg>
                  </button>

                  <button
                    className="btn shadow-none p-1"
                    title="Next"
                    onClick={() => {
                      if (
                        navState.visiblePropertyIds &&
                        navState.currentIndex < navState.totalItems
                      ) {
                        const nextIndex = navState.currentIndex;
                        const nextPropertyId =
                          navState.visiblePropertyIds[nextIndex];
                        const nextNavState =
                          buildNavigationState(nextPropertyId);
                        navigate(`/${dbUrl}/properties/${nextPropertyId}`, {
                          state: nextNavState || {
                            ...navState,
                            currentIndex: navState.currentIndex + 1,
                          },
                        });
                      }
                    }}
                    disabled={
                      !navState.currentIndex ||
                      !navState.totalItems ||
                      navState.currentIndex >= navState.totalItems
                    }
                  >
                    <svg
                      className={`fill-current shrink-0 ${
                        !navState.currentIndex ||
                        !navState.totalItems ||
                        navState.currentIndex >= navState.totalItems
                          ? "text-gray-200 dark:text-gray-700"
                          : "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-600"
                      }`}
                      width="24"
                      height="24"
                      viewBox="0 0 18 18"
                    >
                      <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"></path>
                    </svg>
                  </button>
                </>
              );
            })()}
        </div>
      </div>

      <div className="space-y-8">
        {/* Hero Section: Property Vitals */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Property Image - Wider with margin */}
            <div className="w-full md:w-2/5 lg:w-2/5 p-4 md:p-6">
              <div className="relative h-56 md:h-64 lg:h-72 rounded-xl overflow-hidden shadow-md">
                <img
                  src={propertyData.mainPhoto}
                  alt={propertyData.address}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
              {/* Top Section: Property ID and HPS Score */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <span className="text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-gray-500 mb-1.5 block">
                    Property ID
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {propertyData.id}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <CircularProgress percentage={propertyData.hpsScore || 92} />
                </div>
              </div>

              {/* Middle Section: Address */}
              <div className="mb-5">
                <h1 className="text-xl md:text-2xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-1.5 tracking-tight leading-tight">
                  {propertyData.address}
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                  {propertyData.city}, {propertyData.state} {propertyData.zip}
                </p>
              </div>

              {/* Bottom Section: Vitals Bar */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Bed className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium">
                    {propertyData.rooms} Beds
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Bath className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium">
                    {propertyData.bathrooms || 3} Baths
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Ruler className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium">
                    {propertyData.squareFeet.toLocaleString()} Sq Ft
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium">
                    Built {propertyData.yearBuilt || 1995}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HomeOps Team */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your HomeOps Team
            </h2>
            <div className="relative" ref={teamMenuRef}>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setTeamMenuOpen(!teamMenuOpen)}
              >
                <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              {teamMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                    onClick={() => {
                      setTeamMenuOpen(false);
                      // Navigate to edit team page
                      navigate(`/${dbUrl}/properties/${propertyData.id}/team`);
                    }}
                  >
                    Edit Team
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {propertyData.teamMembers?.map((member) => {
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

        {/* Property Health & Completeness */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Home Passport Health Status
          </h2>

          <div className="flex flex-col lg:flex-row gap-5 items-center lg:items-start">
            {/* Donut Chart */}
            <div className="flex-shrink-0">
              <DonutChart
                percentage={propertyData.hpsScore || 92}
                size={120}
                strokeWidth={10}
              />
            </div>

            {/* Detailed Checklist */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Documents Uploaded */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Documents Uploaded
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {propertyData.healthMetrics?.documentsUploaded.current ||
                        8}
                      /
                      {propertyData.healthMetrics?.documentsUploaded.total ||
                        10}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-400 dark:bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          ((propertyData.healthMetrics?.documentsUploaded
                            .current || 8) /
                            (propertyData.healthMetrics?.documentsUploaded
                              .total || 10)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Systems Identified */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Systems Identified
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {propertyData.healthMetrics?.systemsIdentified.current ||
                        3}
                      /
                      {propertyData.healthMetrics?.systemsIdentified.total || 6}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-400 dark:bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          ((propertyData.healthMetrics?.systemsIdentified
                            .current || 3) /
                            (propertyData.healthMetrics?.systemsIdentified
                              .total || 6)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Maintenance Profile Setup */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Maintenance Profile Setup
                    </span>
                    {propertyData.healthMetrics?.maintenanceProfileSetup
                      .complete ? (
                      <div
                        className="flex items-center gap-1.5"
                        style={{color: "#456654"}}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-semibold">Complete</span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Incomplete
                      </span>
                    )}
                  </div>
                  {propertyData.healthMetrics?.maintenanceProfileSetup
                    .complete && (
                    <div className="w-full bg-green-400 dark:bg-green-500 rounded-full h-2"></div>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-4">
                <button
                  className="btn text-white text-sm py-2 px-4 transition-colors"
                  style={{
                    backgroundColor: "#456654",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#3a5548";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#456654";
                  }}
                >
                  Complete Outstanding Tasks
                </button>
              </div>

              {/* Scorecard Section */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setScorecardOpen(!scorecardOpen)}
                  className="flex items-center justify-between w-full mb-4 text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Scorecard
                  </h3>
                  {scorecardOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                {scorecardOpen && (
                  <div className="space-y-6 pl-2">
                    {/* Documents Scorecard */}
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-base font-bold text-gray-900 dark:text-white">
                            Documents
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Math.round(
                              ((propertyData.healthMetrics?.documentsUploaded
                                .current || 8) /
                                (propertyData.healthMetrics?.documentsUploaded
                                  .total || 10)) *
                                100
                            )}
                            %
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {propertyData.healthMetrics?.documentsUploaded
                              .current || 8}
                            /
                            {propertyData.healthMetrics?.documentsUploaded
                              .total || 10}
                          </div>
                        </div>
                      </div>

                      {/* Mini Donut Chart */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex-shrink-0">
                          <DonutChart
                            percentage={Math.round(
                              ((propertyData.healthMetrics?.documentsUploaded
                                .current || 8) /
                                (propertyData.healthMetrics?.documentsUploaded
                                  .total || 10)) *
                                100
                            )}
                            size={80}
                            strokeWidth={8}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Completed
                            </span>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {propertyData.healthMetrics?.documentsUploaded
                                .current || 8}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  ((propertyData.healthMetrics
                                    ?.documentsUploaded.current || 8) /
                                    (propertyData.healthMetrics
                                      ?.documentsUploaded.total || 10)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Pending
                            </span>
                            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                              {(propertyData.healthMetrics?.documentsUploaded
                                .total || 10) -
                                (propertyData.healthMetrics?.documentsUploaded
                                  .current || 8)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-orange-500 dark:bg-orange-400 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (((propertyData.healthMetrics
                                    ?.documentsUploaded.total || 10) -
                                    (propertyData.healthMetrics
                                      ?.documentsUploaded.current || 8)) /
                                    (propertyData.healthMetrics
                                      ?.documentsUploaded.total || 10)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Document List */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {[
                            "Inspection Report",
                            "Insurance Policy",
                            "Warranty Documents",
                            "Permits & Certificates",
                            "Tax Records",
                            "HOA Documents",
                            "Utility Bills",
                            "Maintenance Records",
                            "Appraisal Report",
                            "Title Documents",
                          ]
                            .slice(
                              0,
                              propertyData.healthMetrics?.documentsUploaded
                                .total || 10
                            )
                            .map((doc, idx) => {
                              const isCompleted =
                                idx <
                                (propertyData.healthMetrics?.documentsUploaded
                                  .current || 8);
                              return (
                                <div
                                  key={doc}
                                  className="flex items-center gap-2 py-1"
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
                                  )}
                                  <span
                                    className={
                                      isCompleted
                                        ? "text-gray-700 dark:text-gray-300 line-through"
                                        : "text-gray-500 dark:text-gray-400"
                                    }
                                  >
                                    {doc}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Systems Scorecard */}
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="text-base font-bold text-gray-900 dark:text-white">
                            Systems
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Math.round(
                              ((propertyData.healthMetrics?.systemsIdentified
                                .current || 3) /
                                (propertyData.healthMetrics?.systemsIdentified
                                  .total || 6)) *
                                100
                            )}
                            %
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {propertyData.healthMetrics?.systemsIdentified
                              .current || 3}
                            /
                            {propertyData.healthMetrics?.systemsIdentified
                              .total || 6}
                          </div>
                        </div>
                      </div>

                      {/* Mini Donut Chart */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex-shrink-0">
                          <DonutChart
                            percentage={Math.round(
                              ((propertyData.healthMetrics?.systemsIdentified
                                .current || 3) /
                                (propertyData.healthMetrics?.systemsIdentified
                                  .total || 6)) *
                                100
                            )}
                            size={80}
                            strokeWidth={8}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Identified
                            </span>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {propertyData.healthMetrics?.systemsIdentified
                                .current || 3}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  ((propertyData.healthMetrics
                                    ?.systemsIdentified.current || 3) /
                                    (propertyData.healthMetrics
                                      ?.systemsIdentified.total || 6)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Missing
                            </span>
                            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                              {(propertyData.healthMetrics?.systemsIdentified
                                .total || 6) -
                                (propertyData.healthMetrics?.systemsIdentified
                                  .current || 3)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-orange-500 dark:bg-orange-400 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (((propertyData.healthMetrics
                                    ?.systemsIdentified.total || 6) -
                                    (propertyData.healthMetrics
                                      ?.systemsIdentified.current || 3)) /
                                    (propertyData.healthMetrics
                                      ?.systemsIdentified.total || 6)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Systems List */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {[
                            {name: "Roof", icon: Building},
                            {name: "HVAC", icon: Zap},
                            {name: "Plumbing", icon: Droplet},
                            {name: "Electrical", icon: Zap},
                            {name: "Foundation", icon: Building},
                            {name: "Windows", icon: Home},
                          ]
                            .slice(
                              0,
                              propertyData.healthMetrics?.systemsIdentified
                                .total || 6
                            )
                            .map((system, idx) => {
                              const Icon = system.icon;
                              const isIdentified =
                                idx <
                                (propertyData.healthMetrics?.systemsIdentified
                                  .current || 3);
                              return (
                                <div
                                  key={system.name}
                                  className="flex items-center gap-2 py-1"
                                >
                                  {isIdentified ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
                                  )}
                                  <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                  <span
                                    className={
                                      isIdentified
                                        ? "text-gray-700 dark:text-gray-300"
                                        : "text-gray-500 dark:text-gray-400"
                                    }
                                  >
                                    {system.name}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Maintenance Scorecard */}
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          <h4 className="text-base font-bold text-gray-900 dark:text-white">
                            Maintenance
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {propertyData.healthMetrics?.maintenanceProfileSetup
                              .complete
                              ? "100%"
                              : "0%"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {propertyData.healthMetrics?.maintenanceProfileSetup
                              .complete
                              ? "Complete"
                              : "Incomplete"}
                          </div>
                        </div>
                      </div>

                      {/* Mini Donut Chart */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex-shrink-0">
                          <DonutChart
                            percentage={
                              propertyData.healthMetrics
                                ?.maintenanceProfileSetup.complete
                                ? 100
                                : 0
                            }
                            size={80}
                            strokeWidth={8}
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                propertyData.healthMetrics
                                  ?.maintenanceProfileSetup.complete
                                  ? "bg-green-500 dark:bg-green-400"
                                  : "bg-orange-500 dark:bg-orange-400"
                              }`}
                              style={{
                                width: `${
                                  propertyData.healthMetrics
                                    ?.maintenanceProfileSetup.complete
                                    ? 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center gap-2">
                            {propertyData.healthMetrics?.maintenanceProfileSetup
                              .complete ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  Profile Configured
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                  Setup Required
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Maintenance Checklist */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-2 text-sm">
                          {[
                            "Schedule Setup",
                            "Define Maintenance Tasks",
                            "Set Reminder Intervals",
                            "Configure Notifications",
                          ].map((task, idx) => {
                            const isComplete =
                              propertyData.healthMetrics
                                ?.maintenanceProfileSetup.complete && idx < 4;
                            return (
                              <div
                                key={task}
                                className="flex items-center gap-2 py-1"
                              >
                                {isComplete ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
                                )}
                                <span
                                  className={
                                    isComplete
                                      ? "text-gray-700 dark:text-gray-300"
                                      : "text-gray-500 dark:text-gray-400"
                                  }
                                >
                                  {task}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-800 px-6">
            <nav className="flex flex-wrap gap-1">
              {tabs.map((tab) => {
                const icons = {
                  identity: FileText,
                  systems: Settings,
                  maintenance: Wrench,
                  documents: FileText,
                  media: ImageIcon,
                };
                const Icon = icons[tab.id] || FileText;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-4 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    style={
                      activeTab === tab.id
                        ? {
                            borderBottomColor: "#456654",
                            color: "#456654",
                          }
                        : {}
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="p-6">
            {activeTab === "identity" && (
              <IdentityTab
                propertyData={propertyData}
                handleInputChange={handleInputChange}
              />
            )}

            {activeTab === "systems" && (
              <SystemsTab
                propertyData={propertyData}
                handleInputChange={handleInputChange}
              />
            )}

            {activeTab === "maintenance" && (
              <MaintenanceTab propertyData={propertyData} />
            )}

            {activeTab === "media" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Media Content
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {propertyData.photos.map((photo, index) => (
                      <div
                        key={photo}
                        className="relative overflow-hidden rounded-2xl h-48 bg-gray-100"
                      >
                        <img
                          src={photo}
                          alt={`Property photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {propertyData.photos.map((photo, index) => (
                  <div
                    key={photo}
                    className="relative overflow-hidden rounded-2xl h-48 bg-gray-100"
                  >
                    <img
                      src={photo}
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "documents" && (
              <DocumentsTab propertyData={propertyData} />
            )}
          </div>
        </section>

        {formChanged && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-b-2xl shadow-md px-6 py-4 flex flex-wrap items-center justify-end gap-3">
            <button
              className="btn border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200"
              onClick={handleCancelChanges}
            >
              Cancel
            </button>
            <button
              className="btn bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleUpdate}
            >
              Update Property
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyFormContainer;
