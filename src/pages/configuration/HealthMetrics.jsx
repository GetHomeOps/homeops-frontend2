import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import Banner from "../../partials/containers/Banner";
import {
  FileText,
  Settings,
  Wrench,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

// Default values from the Scorecard
const defaultDocuments = [
  {id: 1, name: "Inspection Report", description: "Essential for identifying property condition, potential issues, and establishing baseline for maintenance planning"},
  {id: 2, name: "Insurance Policy", description: "Critical for protection against damages and required for mortgage compliance"},
  {id: 3, name: "Warranty Documents", description: "Important for coverage verification and warranty claims, saving significant repair costs"},
  {id: 4, name: "Permits & Certificates", description: "Required for legal compliance, ensuring all work meets building codes and regulations"},
  {id: 5, name: "Tax Records", description: "Essential for tax filing, property value assessment, and financial planning"},
  {id: 6, name: "HOA Documents", description: "Required to understand rules, fees, and responsibilities within the homeowners association"},
  {id: 7, name: "Utility Bills", description: "Important for tracking usage patterns, identifying inefficiencies, and budgeting"},
  {id: 8, name: "Maintenance Records", description: "Critical for tracking service history, warranty claims, and maintaining property value"},
  {id: 9, name: "Appraisal Report", description: "Essential for accurate property valuation, insurance, and refinancing decisions"},
  {id: 10, name: "Title Documents", description: "Critical for proving ownership and required for all property transactions"},
];

const defaultSystems = [
  {id: 1, name: "Roof", description: "Critical system that protects the entire property - regular identification ensures proper maintenance and prevents costly water damage"},
  {id: 2, name: "HVAC", description: "Essential for comfort and air quality - proper identification enables efficient maintenance and reduces energy costs"},
  {id: 3, name: "Plumbing", description: "Vital system that requires regular monitoring - identifying all components prevents leaks and water damage"},
  {id: 4, name: "Electrical", description: "Safety-critical system - complete identification ensures code compliance and prevents fire hazards"},
  {id: 5, name: "Foundation", description: "Structural integrity depends on this - identifying issues early prevents expensive repairs and property devaluation"},
  {id: 6, name: "Windows", description: "Important for energy efficiency and security - proper identification enables weatherization and maintenance planning"},
];

const defaultMaintenance = [
  {id: 1, name: "Schedule Setup", description: "Essential for proactive maintenance - prevents costly emergency repairs and extends system lifespan"},
  {id: 2, name: "Define Maintenance Tasks", description: "Critical for consistent care - ensures all systems receive proper attention at the right intervals"},
  {id: 3, name: "Set Reminder Intervals", description: "Important for maintaining schedules - prevents missed maintenance that leads to system failures"},
  {id: 4, name: "Configure Notifications", description: "Vital for staying on track - timely reminders ensure maintenance tasks are never overlooked"},
];


// Table Row Component for editable items
function HealthMetricRow({
  item,
  onEdit,
  onDelete,
  isEditing,
  onSave,
  onCancel,
  rowIndex,
}) {
  const [editName, setEditName] = useState(item.name);
  const [editDescription, setEditDescription] = useState(item.description);

  if (isEditing) {
    const rowColorClass =
      rowIndex % 2 === 0
        ? "bg-white dark:bg-gray-700/10"
        : "bg-gray-50 dark:bg-gray-700/20";

    return (
      <tr className={rowColorClass}>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 font-medium text-gray-800 dark:text-gray-100"
            placeholder="Name"
          />
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3">
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-gray-600 dark:text-gray-300"
            placeholder="Description"
          />
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave({...item, name: editName, description: editDescription})}
              className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              title="Save"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
              </svg>
            </button>
            <button
              onClick={onCancel}
              className="p-1.5 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  const rowColorClass =
    rowIndex % 2 === 0
      ? "bg-white dark:bg-gray-700/10"
      : "bg-gray-50 dark:bg-gray-700/20";

  return (
    <tr
      className={`${rowColorClass} hover:bg-gray-200/60 dark:hover:bg-gray-700/90`}
    >
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="font-medium text-gray-800 dark:text-gray-100">
          {item.name}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3">
        <div className="text-gray-600 dark:text-gray-300">
          {item.description}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function HealthMetrics() {
  const {t} = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [bannerType, setBannerType] = useState("success");
  const [bannerMessage, setBannerMessage] = useState("");

  const [expandedSections, setExpandedSections] = useState({
    documents: true,
    systems: false,
    maintenance: false,
  });

  const [documents, setDocuments] = useState(defaultDocuments);
  const [systems, setSystems] = useState(defaultSystems);
  const [maintenance, setMaintenance] = useState(defaultMaintenance);

  const [editingItem, setEditingItem] = useState(null);
  const [newItemSection, setNewItemSection] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleAddItem = (section) => {
    setNewItemSection(section);
    setNewItemName("");
    setNewItemDescription("");
  };

  const handleSaveNewItem = () => {
    if (!newItemName.trim()) {
      setBannerMessage("Name is required");
      setBannerType("error");
      setBannerOpen(true);
      return;
    }

    const newItem = {
      id: Date.now(),
      name: newItemName,
      description: newItemDescription || "",
    };

    if (newItemSection === "documents") {
      setDocuments((prev) => [...prev, newItem]);
    } else if (newItemSection === "systems") {
      setSystems((prev) => [...prev, newItem]);
    } else if (newItemSection === "maintenance") {
      setMaintenance((prev) => [...prev, newItem]);
    }

    setNewItemSection(null);
    setNewItemName("");
    setNewItemDescription("");
    setBannerMessage("Item added successfully");
    setBannerType("success");
    setBannerOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (updatedItem) => {
    if (!updatedItem.name.trim()) {
      setBannerMessage("Name is required");
      setBannerType("error");
      setBannerOpen(true);
      return;
    }

    if (documents.find((d) => d.id === updatedItem.id)) {
      setDocuments((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
    } else if (systems.find((s) => s.id === updatedItem.id)) {
      setSystems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
    } else if (maintenance.find((m) => m.id === updatedItem.id)) {
      setMaintenance((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
    }

    setEditingItem(null);
    setBannerMessage("Item updated successfully");
    setBannerType("success");
    setBannerOpen(true);
  };

  const handleDeleteItem = (id, section) => {
    if (section === "documents") {
      setDocuments((prev) => prev.filter((item) => item.id !== id));
    } else if (section === "systems") {
      setSystems((prev) => prev.filter((item) => item.id !== id));
    } else if (section === "maintenance") {
      setMaintenance((prev) => prev.filter((item) => item.id !== id));
    }

    setBannerMessage("Item deleted successfully");
    setBannerType("success");
    setBannerOpen(true);
  };

  const sections = [
    {
      id: "documents",
      title: "Documents",
      icon: FileText,
      items: documents,
      setItems: setDocuments,
    },
    {
      id: "systems",
      title: "Systems",
      icon: Settings,
      items: systems,
      setItems: setSystems,
    },
    {
      id: "maintenance",
      title: "Maintenance",
      icon: Wrench,
      items: maintenance,
      setItems: setMaintenance,
    },
  ];

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="fixed right-0 w-auto sm:w-full z-50">
          <Banner
            type={bannerType}
            open={bannerOpen}
            setOpen={setBannerOpen}
            className={`transition-opacity duration-600 ${
              bannerOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {bannerMessage}
          </Banner>
        </div>

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  Health Metrics Configuration
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage documents, systems, and maintenance items for property health scoring
                </p>
              </div>
            </div>

            {/* Single Table with Collapsible Groups */}
            <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl relative">
              {/* Top white bar with metrics */}
              <header className="px-5 py-4">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                  Health Metrics Configuration{" "}
                  <span className="text-gray-400 dark:text-gray-500 font-medium">
                    {documents.length + systems.length + maintenance.length}
                  </span>
                </h2>
              </header>

              <div className="overflow-hidden rounded-b-xl">
                <div className="overflow-x-auto">
                  <table className="table-auto w-full dark:text-gray-300">
                    <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60">
                      <tr>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-left">Name</th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-left">Description</th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
                      {sections.map((section, sectionIndex) => {
                        const isOpen = expandedSections[section.id];
                        const sectionItems = section.items;
                        const isNewItemRow = newItemSection === section.id;

                        return (
                          <React.Fragment key={section.id}>
                            {/* Group Header Row */}
                            <tr
                              onClick={() => toggleSection(section.id)}
                              className="bg-gray-200/90 dark:bg-gray-900/50 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900/70 transition-colors"
                            >
                              <td colSpan="3" className="px-2 first:pl-5 last:pr-5 py-3">
                                <button className="flex items-center text-gray-600 dark:text-gray-300">
                                  <svg
                                    className={`w-4 h-4 mr-2 fill-current ${
                                      isOpen ? "rotate-90" : ""
                                    }`}
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M9.4 6.6L5.8 3 4.4 4.4 6.8 7l-2.4 2.6L5.8 11l3.6-3.6-1.4-1.4z" />
                                  </svg>
                                  <span className="font-medium">{section.title}</span>
                                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                                    ({sectionItems.length})
                                  </span>
                                </button>
                              </td>
                            </tr>

                          {/* Section Items */}
                          {isOpen && (
                            <>
                              {sectionItems.map((item, itemIndex) => (
                                <HealthMetricRow
                                  key={item.id}
                                  item={item}
                                  onEdit={handleEditItem}
                                  onDelete={(id) => handleDeleteItem(id, section.id)}
                                  isEditing={editingItem?.id === item.id}
                                  onSave={handleSaveEdit}
                                  onCancel={() => setEditingItem(null)}
                                  rowIndex={itemIndex}
                                />
                              ))}

                              {/* New Item Row */}
                              {isNewItemRow && (
                                <tr className="bg-gray-50 dark:bg-gray-700/30">
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <input
                                      type="text"
                                      value={newItemName}
                                      onChange={(e) => setNewItemName(e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 font-medium text-gray-800 dark:text-gray-100"
                                      placeholder="Name"
                                      autoFocus
                                    />
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3">
                                    <input
                                      type="text"
                                      value={newItemDescription}
                                      onChange={(e) => setNewItemDescription(e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-gray-600 dark:text-gray-300"
                                      placeholder="Description"
                                    />
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={handleSaveNewItem}
                                        className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                        title="Save"
                                      >
                                        <svg
                                          className="w-4 h-4 fill-current"
                                          viewBox="0 0 16 16"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setNewItemSection(null);
                                          setNewItemName("");
                                          setNewItemDescription("");
                                        }}
                                        className="p-1.5 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        title="Cancel"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}

                              {/* Add New Item Button Row */}
                              {!isNewItemRow && (
                                <tr>
                                  <td colSpan="3" className="px-2 first:pl-5 last:pr-5 py-3">
                                    <button
                                      onClick={() => handleAddItem(section.id)}
                                      className="w-full flex items-center justify-center gap-2 p-2 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:border-[#456654] hover:text-[#456654] dark:hover:border-[#456654] dark:hover:text-[#456654] transition-colors text-sm font-medium"
                                    >
                                      <Plus className="w-4 h-4" />
                                      <span>Add New Item</span>
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default HealthMetrics;
