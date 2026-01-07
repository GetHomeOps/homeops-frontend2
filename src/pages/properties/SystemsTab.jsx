import React, {useState} from "react";
import {
  Building,
  Droplet,
  Home,
  Zap,
  Shield,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

// Installer Banner Component - Professional Recommendation Style
function InstallerBanner({installerName, systemType}) {
  const getInstallerInfo = (installerName) => {
    if (!installerName) return null;
    return {
      name: installerName,
      phone: "(555) 123-4567",
      email: "contact@installer.com",
      address: "123 Main Street, City, State 12345",
      photo: "",
      rating: 4.8,
      reviews: 127,
      licensed: true,
      insured: true,
      yearsExperience: 15,
    };
  };

  const getRecommendedInstaller = (systemType) => {
    const recommendations = {
      roof: {
        name: "Elite Roofing Solutions",
        phone: "(555) 234-5678",
        email: "info@eliteroofing.com",
        address: "456 Roofing Ave, City, State 12345",
        rating: 4.9,
        reviews: 342,
        licensed: true,
        insured: true,
        yearsExperience: 20,
      },
      gutter: {
        name: "Premium Gutter Pro",
        phone: "(555) 345-6789",
        email: "info@premiumgutter.com",
        address: "789 Gutter Lane, City, State 12345",
        rating: 4.7,
        reviews: 189,
        licensed: true,
        insured: true,
        yearsExperience: 12,
      },
      siding: {
        name: "Expert Siding Co",
        phone: "(555) 456-7890",
        email: "contact@expertsiding.com",
        address: "321 Siding Blvd, City, State 12345",
        rating: 4.8,
        reviews: 256,
        licensed: true,
        insured: true,
        yearsExperience: 18,
      },
      window: {
        name: "Window Masters",
        phone: "(555) 567-8901",
        email: "info@windowmasters.com",
        address: "654 Window Way, City, State 12345",
        rating: 4.9,
        reviews: 421,
        licensed: true,
        insured: true,
        yearsExperience: 25,
      },
      heating: {
        name: "Comfort HVAC Services",
        phone: "(555) 678-9012",
        email: "contact@comforthvac.com",
        address: "987 HVAC Street, City, State 12345",
        rating: 4.8,
        reviews: 298,
        licensed: true,
        insured: true,
        yearsExperience: 22,
      },
      ac: {
        name: "Cool Air Experts",
        phone: "(555) 789-0123",
        email: "info@coolairexperts.com",
        address: "147 AC Avenue, City, State 12345",
        rating: 4.7,
        reviews: 203,
        licensed: true,
        insured: true,
        yearsExperience: 16,
      },
      waterHeating: {
        name: "Hot Water Pros",
        phone: "(555) 890-1234",
        email: "contact@hotwaterpros.com",
        address: "258 Water Road, City, State 12345",
        rating: 4.9,
        reviews: 167,
        licensed: true,
        insured: true,
        yearsExperience: 14,
      },
      electrical: {
        name: "Spark Electric",
        phone: "(555) 901-2345",
        email: "info@sparkelectric.com",
        address: "369 Electric Drive, City, State 12345",
        rating: 4.8,
        reviews: 312,
        licensed: true,
        insured: true,
        yearsExperience: 19,
      },
      plumbing: {
        name: "Flow Plumbing Co",
        phone: "(555) 012-3456",
        email: "contact@flowplumbing.com",
        address: "741 Plumbing Court, City, State 12345",
        rating: 4.9,
        reviews: 445,
        licensed: true,
        insured: true,
        yearsExperience: 28,
      },
    };
    return (
      recommendations[systemType] || {
        name: "Trusted Contractor",
        phone: "(555) 123-4567",
        email: "info@trustedcontractor.com",
        address: "123 Business St, City, State 12345",
        rating: 4.8,
        reviews: 200,
        licensed: true,
        insured: true,
        yearsExperience: 15,
      }
    );
  };

  const installer = installerName ? getInstallerInfo(installerName) : null;
  const recommended = !installer ? getRecommendedInstaller(systemType) : null;
  const displayInstaller = installer || recommended;
  const isRecommended = !installer;

  if (!displayInstaller) return null;

  const initials = displayInstaller.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Extract contact name and company name
  const companyName = displayInstaller.name;
  const contactName =
    installerName && installerName !== companyName ? installerName : null;

  return (
    <div
      className="mb-6 w-1/2 min-w-[400px] max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-4 transition-all duration-300 ease-out"
      style={{
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar/Photo - Left side with subtle shadow */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold text-base flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800"
          style={{
            boxShadow:
              "0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)",
          }}
        >
          {displayInstaller.photo ? (
            <img
              src={displayInstaller.photo}
              alt={companyName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Content - Right side */}
        <div className="flex-1 min-w-0">
          {/* Name/Company */}
          <div className="mb-2.5">
            {contactName ? (
              <>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5 tracking-tight">
                  {contactName}
                </h4>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {companyName}
                </p>
              </>
            ) : (
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                {companyName}
              </h4>
            )}
          </div>

          {/* Contact Info - Stacked vertically with better spacing */}
          <div className="space-y-1.5">
            {/* Address */}
            {displayInstaller.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">
                  {displayInstaller.address}
                </p>
              </div>
            )}

            {/* Phone */}
            {displayInstaller.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <a
                  href={`tel:${displayInstaller.phone}`}
                  className="text-xs text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {displayInstaller.phone}
                </a>
              </div>
            )}

            {/* Email */}
            {displayInstaller.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <a
                  href={`mailto:${displayInstaller.email}`}
                  className="text-xs text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all font-medium"
                >
                  {displayInstaller.email}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  showInstallerBanner = false,
  installerName,
  systemType,
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" style={{color: "#456654"}} />}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h3>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Installer Banner - Always visible, even when collapsed */}
      {showInstallerBanner && (
        <div className="px-6 pb-4">
          <InstallerBanner
            installerName={installerName}
            systemType={systemType}
          />
        </div>
      )}

      {/* Form fields - Only visible when expanded */}
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

function SystemsTab({propertyData, handleInputChange}) {
  const [expandedSections, setExpandedSections] = useState({
    roof: false,
    gutters: false,
    foundation: false,
    exterior: false,
    windows: false,
    heating: false,
    ac: false,
    waterHeating: false,
    electrical: false,
    plumbing: false,
    safety: false,
    inspections: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Systems Section - Roof */}
      <CollapsibleSection
        title="Roof"
        icon={Building}
        isOpen={expandedSections.roof}
        onToggle={() => toggleSection("roof")}
        showInstallerBanner={true}
        installerName={propertyData.roofInstaller}
        systemType="roof"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Material
            </label>
            <input
              type="text"
              name="roofMaterial"
              value={propertyData.roofMaterial || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Install Date
            </label>
            <input
              type="date"
              name="roofInstallDate"
              value={propertyData.roofInstallDate || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Installer
            </label>
            <input
              type="text"
              name="roofInstaller"
              value={propertyData.roofInstaller || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Age
            </label>
            <input
              type="number"
              name="roofAge"
              value={propertyData.roofAge || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Condition
            </label>
            <select
              name="roofCondition"
              value={propertyData.roofCondition || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="roofLastInspection"
              value={propertyData.roofLastInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Warranty
            </label>
            <select
              name="roofWarranty"
              value={propertyData.roofWarranty || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Next Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="roofNextInspection"
              value={propertyData.roofNextInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Known Issues
            </label>
            <textarea
              name="roofKnownIssues"
              value={propertyData.roofKnownIssues || ""}
              onChange={handleInputChange}
              className="form-input w-full min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Systems Section - Gutters */}
      <CollapsibleSection
        title="Gutters"
        icon={Droplet}
        isOpen={expandedSections.gutters}
        onToggle={() => toggleSection("gutters")}
        showInstallerBanner={true}
        installerName={propertyData.gutterInstaller}
        systemType="gutter"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Material
            </label>
            <input
              type="text"
              name="gutterMaterial"
              value={propertyData.gutterMaterial || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Install Date
            </label>
            <input
              type="date"
              name="gutterInstallDate"
              value={propertyData.gutterInstallDate || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Installer
            </label>
            <input
              type="text"
              name="gutterInstaller"
              value={propertyData.gutterInstaller || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Age
            </label>
            <input
              type="number"
              name="gutterAge"
              value={propertyData.gutterAge || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Condition
            </label>
            <select
              name="gutterCondition"
              value={propertyData.gutterCondition || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="gutterLastInspection"
              value={propertyData.gutterLastInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Warranty
            </label>
            <select
              name="gutterWarranty"
              value={propertyData.gutterWarranty || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Next Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="gutterNextInspection"
              value={propertyData.gutterNextInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Known Issues
            </label>
            <textarea
              name="gutterKnownIssues"
              value={propertyData.gutterKnownIssues || ""}
              onChange={handleInputChange}
              className="form-input w-full min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Systems Section - Foundation & Structure */}
      <CollapsibleSection
        title="Foundation & Structure"
        icon={Building}
        isOpen={expandedSections.foundation}
        onToggle={() => toggleSection("foundation")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Foundation Type
            </label>
            <input
              type="text"
              name="foundationType"
              value={propertyData.foundationType || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Condition
            </label>
            <select
              name="foundationCondition"
              value={propertyData.foundationCondition || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="foundationLastInspection"
              value={propertyData.foundationLastInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Next Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="foundationNextInspection"
              value={propertyData.foundationNextInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Known Issues
            </label>
            <textarea
              name="foundationKnownIssues"
              value={propertyData.foundationKnownIssues || ""}
              onChange={handleInputChange}
              className="form-input w-full min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Systems Section - Exterior */}
      <CollapsibleSection
        title="Exterior"
        icon={Building}
        isOpen={expandedSections.exterior}
        onToggle={() => toggleSection("exterior")}
        showInstallerBanner={true}
        installerName={propertyData.sidingInstaller}
        systemType="siding"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Siding Type
            </label>
            <input
              type="text"
              name="sidingType"
              value={propertyData.sidingType || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Install Date
            </label>
            <input
              type="date"
              name="sidingInstallDate"
              value={propertyData.sidingInstallDate || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Installer
            </label>
            <input
              type="text"
              name="sidingInstaller"
              value={propertyData.sidingInstaller || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Age
            </label>
            <input
              type="number"
              name="sidingAge"
              value={propertyData.sidingAge || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Condition
            </label>
            <select
              name="sidingCondition"
              value={propertyData.sidingCondition || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Systems Section - Windows */}
      <CollapsibleSection
        title="Windows"
        icon={Home}
        isOpen={expandedSections.windows}
        onToggle={() => toggleSection("windows")}
        showInstallerBanner={true}
        installerName={propertyData.windowInstaller}
        systemType="window"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Window Type
            </label>
            <input
              type="text"
              name="windowType"
              value={propertyData.windowType || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Install Date
            </label>
            <input
              type="date"
              name="windowInstallDate"
              value={propertyData.windowInstallDate || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Installer
            </label>
            <input
              type="text"
              name="windowInstaller"
              value={propertyData.windowInstaller || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Age
            </label>
            <input
              type="number"
              name="windowAge"
              value={propertyData.windowAge || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Condition
            </label>
            <select
              name="windowCondition"
              value={propertyData.windowCondition || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="windowLastInspection"
              value={propertyData.windowLastInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Warranty
            </label>
            <select
              name="windowWarranty"
              value={propertyData.windowWarranty || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Next Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="windowNextInspection"
              value={propertyData.windowNextInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Known Issues
            </label>
            <textarea
              name="windowKnownIssues"
              value={propertyData.windowKnownIssues || ""}
              onChange={handleInputChange}
              className="form-input w-full min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Systems Section - Heating */}
      <CollapsibleSection
        title="Heating"
        icon={Zap}
        isOpen={expandedSections.heating}
        onToggle={() => toggleSection("heating")}
        showInstallerBanner={true}
        installerName={propertyData.heatingInstaller}
        systemType="heating"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              System Type
            </label>
            <input
              type="text"
              name="heatingSystemType"
              value={propertyData.heatingSystemType || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Install Date
            </label>
            <input
              type="date"
              name="heatingInstallDate"
              value={propertyData.heatingInstallDate || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Installer
            </label>
            <input
              type="text"
              name="heatingInstaller"
              value={propertyData.heatingInstaller || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Age
            </label>
            <input
              type="number"
              name="heatingAge"
              value={propertyData.heatingAge || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Condition
            </label>
            <select
              name="heatingCondition"
              value={propertyData.heatingCondition || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="heatingLastInspection"
              value={propertyData.heatingLastInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Warranty
            </label>
            <select
              name="heatingWarranty"
              value={propertyData.heatingWarranty || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Next Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="heatingNextInspection"
              value={propertyData.heatingNextInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Location
            </label>
            <input
              type="text"
              name="heatingLocation"
              value={propertyData.heatingLocation || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Known Issues
            </label>
            <textarea
              name="heatingKnownIssues"
              value={propertyData.heatingKnownIssues || ""}
              onChange={handleInputChange}
              className="form-input w-full min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Systems Section - Air Conditioning */}
      <CollapsibleSection
        title="Air Conditioning"
        icon={Zap}
        isOpen={expandedSections.ac}
        onToggle={() => toggleSection("ac")}
        showInstallerBanner={true}
        installerName={propertyData.acInstaller}
        systemType="ac"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              System Type
            </label>
            <input
              type="text"
              name="acSystemType"
              value={propertyData.acSystemType || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Install Date
            </label>
            <input
              type="date"
              name="acInstallDate"
              value={propertyData.acInstallDate || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Installer
            </label>
            <input
              type="text"
              name="acInstaller"
              value={propertyData.acInstaller || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Age
            </label>
            <input
              type="number"
              name="acAge"
              value={propertyData.acAge || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Condition
            </label>
            <select
              name="acCondition"
              value={propertyData.acCondition || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="acLastInspection"
              value={propertyData.acLastInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Warranty
            </label>
            <select
              name="acWarranty"
              value={propertyData.acWarranty || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Next Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="acNextInspection"
              value={propertyData.acNextInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Location
            </label>
            <input
              type="text"
              name="acLocation"
              value={propertyData.acLocation || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Known Issues
            </label>
            <textarea
              name="acKnownIssues"
              value={propertyData.acKnownIssues || ""}
              onChange={handleInputChange}
              className="form-input w-full min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Systems Section - Water Heating */}
      <CollapsibleSection
        title="Water Heating"
        icon={Droplet}
        isOpen={expandedSections.waterHeating}
        onToggle={() => toggleSection("waterHeating")}
        showInstallerBanner={true}
        installerName={propertyData.waterHeatingInstaller}
        systemType="waterHeating"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              System Type
            </label>
            <input
              type="text"
              name="waterHeatingSystemType"
              value={propertyData.waterHeatingSystemType || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Install Date
            </label>
            <input
              type="date"
              name="waterHeatingInstallDate"
              value={propertyData.waterHeatingInstallDate || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Installer
            </label>
            <input
              type="text"
              name="waterHeatingInstaller"
              value={propertyData.waterHeatingInstaller || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Age
            </label>
            <input
              type="number"
              name="waterHeatingAge"
              value={propertyData.waterHeatingAge || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Condition
            </label>
            <select
              name="waterHeatingCondition"
              value={propertyData.waterHeatingCondition || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="waterHeatingLastInspection"
              value={propertyData.waterHeatingLastInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Warranty
            </label>
            <select
              name="waterHeatingWarranty"
              value={propertyData.waterHeatingWarranty || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Next Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="waterHeatingNextInspection"
              value={propertyData.waterHeatingNextInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Location
            </label>
            <input
              type="text"
              name="waterHeatingLocation"
              value={propertyData.waterHeatingLocation || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Known Issues
            </label>
            <textarea
              name="waterHeatingKnownIssues"
              value={propertyData.waterHeatingKnownIssues || ""}
              onChange={handleInputChange}
              className="form-input w-full min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Systems Section - Electrical */}
      <CollapsibleSection
        title="Electrical"
        icon={Zap}
        isOpen={expandedSections.electrical}
        onToggle={() => toggleSection("electrical")}
        showInstallerBanner={true}
        installerName={propertyData.electricalInstaller}
        systemType="electrical"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Service Amperage
            </label>
            <input
              type="number"
              name="electricalServiceAmperage"
              value={propertyData.electricalServiceAmperage || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Install Date
            </label>
            <input
              type="date"
              name="electricalInstallDate"
              value={propertyData.electricalInstallDate || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Installer
            </label>
            <input
              type="text"
              name="electricalInstaller"
              value={propertyData.electricalInstaller || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Age
            </label>
            <input
              type="number"
              name="electricalAge"
              value={propertyData.electricalAge || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Condition
            </label>
            <select
              name="electricalCondition"
              value={propertyData.electricalCondition || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="electricalLastInspection"
              value={propertyData.electricalLastInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Warranty
            </label>
            <select
              name="electricalWarranty"
              value={propertyData.electricalWarranty || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Next Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="electricalNextInspection"
              value={propertyData.electricalNextInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Location
            </label>
            <input
              type="text"
              name="electricalLocation"
              value={propertyData.electricalLocation || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Known Issues
            </label>
            <textarea
              name="electricalKnownIssues"
              value={propertyData.electricalKnownIssues || ""}
              onChange={handleInputChange}
              className="form-input w-full min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Systems Section - Plumbing */}
      <CollapsibleSection
        title="Plumbing"
        icon={Droplet}
        isOpen={expandedSections.plumbing}
        onToggle={() => toggleSection("plumbing")}
        showInstallerBanner={true}
        installerName={propertyData.plumbingInstaller}
        systemType="plumbing"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Supply Materials
            </label>
            <input
              type="text"
              name="plumbingSupplyMaterials"
              value={propertyData.plumbingSupplyMaterials || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Waste Type
            </label>
            <select
              name="plumbingWasteType"
              value={propertyData.plumbingWasteType || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="sewer">Sewer</option>
              <option value="septic">Septic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Known Leaks or Backups
            </label>
            <textarea
              name="plumbingKnownIssues"
              value={propertyData.plumbingKnownIssues || ""}
              onChange={handleInputChange}
              className="form-input w-full min-h-[60px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Install Date
            </label>
            <input
              type="date"
              name="plumbingInstallDate"
              value={propertyData.plumbingInstallDate || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Installer
            </label>
            <input
              type="text"
              name="plumbingInstaller"
              value={propertyData.plumbingInstaller || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Age
            </label>
            <input
              type="number"
              name="plumbingAge"
              value={propertyData.plumbingAge || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Condition
            </label>
            <select
              name="plumbingCondition"
              value={propertyData.plumbingCondition || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="plumbingLastInspection"
              value={propertyData.plumbingLastInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Warranty
            </label>
            <select
              name="plumbingWarranty"
              value={propertyData.plumbingWarranty || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Next Inspection (Month/Year)
            </label>
            <input
              type="month"
              name="plumbingNextInspection"
              value={propertyData.plumbingNextInspection || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Main Turnoff Location
            </label>
            <input
              type="text"
              name="plumbingMainTurnoffLocation"
              value={propertyData.plumbingMainTurnoffLocation || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Clearout Location
            </label>
            <input
              type="text"
              name="plumbingClearoutLocation"
              value={propertyData.plumbingClearoutLocation || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Systems Section - Safety */}
      <CollapsibleSection
        title="Safety"
        icon={Shield}
        isOpen={expandedSections.safety}
        onToggle={() => toggleSection("safety")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Smoke/CO Coverage
            </label>
            <input
              type="text"
              name="safetySmokeCOCoverage"
              value={propertyData.safetySmokeCOCoverage || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              GFCI Status
            </label>
            <input
              type="text"
              name="safetyGFCIStatus"
              value={propertyData.safetyGFCIStatus || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Known Hazards (asbestos, lead, poly, knob & tube, etc.)
            </label>
            <textarea
              name="safetyKnownHazards"
              value={propertyData.safetyKnownHazards || ""}
              onChange={handleInputChange}
              className="form-input w-full min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Inspections Section */}
      <CollapsibleSection
        title="Inspections"
        icon={FileCheck}
        isOpen={expandedSections.inspections}
        onToggle={() => toggleSection("inspections")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              General Inspection
            </label>
            <div className="flex gap-4 items-center">
              <select
                name="generalInspection"
                value={propertyData.generalInspection || ""}
                onChange={handleInputChange}
                className="form-select w-24"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {propertyData.generalInspection === "yes" && (
                <>
                  <input
                    type="date"
                    name="generalInspectionDate"
                    value={propertyData.generalInspectionDate || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Date"
                  />
                  <input
                    type="text"
                    name="generalInspectionLink"
                    value={propertyData.generalInspectionLink || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Upload link"
                  />
                </>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Roof Inspection
            </label>
            <div className="flex gap-4 items-center">
              <select
                name="roofInspection"
                value={propertyData.roofInspection || ""}
                onChange={handleInputChange}
                className="form-select w-24"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {propertyData.roofInspection === "yes" && (
                <>
                  <input
                    type="date"
                    name="roofInspectionDate"
                    value={propertyData.roofInspectionDate || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Date"
                  />
                  <input
                    type="text"
                    name="roofInspectionLink"
                    value={propertyData.roofInspectionLink || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Upload link"
                  />
                </>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Sewer Scope
            </label>
            <div className="flex gap-4 items-center">
              <select
                name="sewerScope"
                value={propertyData.sewerScope || ""}
                onChange={handleInputChange}
                className="form-select w-24"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {propertyData.sewerScope === "yes" && (
                <>
                  <input
                    type="date"
                    name="sewerScopeDate"
                    value={propertyData.sewerScopeDate || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Date"
                  />
                  <input
                    type="text"
                    name="sewerScopeLink"
                    value={propertyData.sewerScopeLink || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Upload link"
                  />
                </>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              HVAC Inspection
            </label>
            <div className="flex gap-4 items-center">
              <select
                name="hvacInspection"
                value={propertyData.hvacInspection || ""}
                onChange={handleInputChange}
                className="form-select w-24"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {propertyData.hvacInspection === "yes" && (
                <>
                  <input
                    type="date"
                    name="hvacInspectionDate"
                    value={propertyData.hvacInspectionDate || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Date"
                  />
                  <input
                    type="text"
                    name="hvacInspectionLink"
                    value={propertyData.hvacInspectionLink || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Upload link"
                  />
                </>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Pest Inspection
            </label>
            <div className="flex gap-4 items-center">
              <select
                name="pestInspection"
                value={propertyData.pestInspection || ""}
                onChange={handleInputChange}
                className="form-select w-24"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {propertyData.pestInspection === "yes" && (
                <>
                  <input
                    type="date"
                    name="pestInspectionDate"
                    value={propertyData.pestInspectionDate || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Date"
                  />
                  <input
                    type="text"
                    name="pestInspectionLink"
                    value={propertyData.pestInspectionLink || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Upload link"
                  />
                </>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Other Inspection
            </label>
            <div className="flex gap-4 items-center">
              <select
                name="otherInspection"
                value={propertyData.otherInspection || ""}
                onChange={handleInputChange}
                className="form-select w-24"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {propertyData.otherInspection === "yes" && (
                <>
                  <input
                    type="date"
                    name="otherInspectionDate"
                    value={propertyData.otherInspectionDate || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Date"
                  />
                  <input
                    type="text"
                    name="otherInspectionLink"
                    value={propertyData.otherInspectionLink || ""}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Upload link"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default SystemsTab;
