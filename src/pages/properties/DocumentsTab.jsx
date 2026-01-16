import React, {useState, useMemo, useEffect} from "react";
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  File,
  FileCheck,
  Receipt,
  Shield,
  ClipboardList,
  Building,
  Droplet,
  Zap,
  Home,
  Folder,
  MoreVertical,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Calendar,
} from "lucide-react";

// System categories with icons
const systemCategories = [
  {id: "general", label: "General", icon: Folder, color: "text-gray-600"},
  {id: "roof", label: "Roof", icon: Building, color: "text-blue-600"},
  {id: "gutters", label: "Gutters", icon: Droplet, color: "text-cyan-600"},
  {
    id: "foundation",
    label: "Foundation",
    icon: Building,
    color: "text-amber-600",
  },
  {
    id: "exterior",
    label: "Exterior/Siding",
    icon: Building,
    color: "text-orange-600",
  },
  {id: "windows", label: "Windows", icon: Home, color: "text-indigo-600"},
  {id: "heating", label: "Heating", icon: Zap, color: "text-red-600"},
  {id: "ac", label: "Air Conditioning", icon: Zap, color: "text-blue-500"},
  {
    id: "waterHeating",
    label: "Water Heating",
    icon: Droplet,
    color: "text-teal-600",
  },
  {id: "electrical", label: "Electrical", icon: Zap, color: "text-yellow-600"},
  {id: "plumbing", label: "Plumbing", icon: Droplet, color: "text-sky-600"},
  {id: "safety", label: "Safety", icon: Shield, color: "text-red-500"},
  {
    id: "inspections",
    label: "Inspections",
    icon: FileCheck,
    color: "text-green-600",
  },
];

// Document types
const documentTypes = [
  {id: "contract", label: "Contract", icon: FileText},
  {id: "warranty", label: "Warranty", icon: Shield},
  {id: "receipt", label: "Receipt", icon: Receipt},
  {id: "inspection", label: "Inspection Report", icon: FileCheck},
  {id: "permit", label: "Permit", icon: ClipboardList},
  {id: "other", label: "Other", icon: File},
];

// Mock documents data - in real app, this would come from props/API
const mockDocuments = [
  {
    id: "DOC-001",
    name: "Roof Installation Contract 2021.pdf",
    system: "roof",
    type: "contract",
    size: "2.4 MB",
    uploadedAt: "2024-01-15",
    uploadedBy: "Jordan Lee",
  },
  {
    id: "DOC-002",
    name: "Roof Repair Estimate - Spring 2024.pdf",
    system: "roof",
    type: "contract",
    size: "1.2 MB",
    uploadedAt: "2024-03-10",
    uploadedBy: "Sarah Chen",
  },
  {
    id: "DOC-003",
    name: "Roof Inspection Report - October 2023.pdf",
    system: "roof",
    type: "inspection",
    size: "3.1 MB",
    uploadedAt: "2023-10-28",
    uploadedBy: "Marcus Reed",
  },
  {
    id: "DOC-004",
    name: "Roof Warranty - 30 Year.pdf",
    system: "roof",
    type: "warranty",
    size: "1.8 MB",
    uploadedAt: "2024-01-15",
    uploadedBy: "Jordan Lee",
  },
  {
    id: "DOC-004B",
    name: "Roof Maintenance Receipt - July 2024.pdf",
    system: "roof",
    type: "receipt",
    size: "678 KB",
    uploadedAt: "2024-07-15",
    uploadedBy: "Lena Ortiz",
  },
  {
    id: "DOC-005",
    name: "HVAC Maintenance Receipt - March 2024.pdf",
    system: "heating",
    type: "receipt",
    size: "456 KB",
    uploadedAt: "2024-03-20",
    uploadedBy: "Lena Ortiz",
  },
  {
    id: "DOC-006",
    name: "Home Inspection Report - May 2024.pdf",
    system: "inspections",
    type: "inspection",
    size: "3.2 MB",
    uploadedAt: "2024-05-22",
    uploadedBy: "Marcus Reed",
  },
  {
    id: "DOC-007",
    name: "Electrical Permit - Panel Upgrade.pdf",
    system: "electrical",
    type: "permit",
    size: "892 KB",
    uploadedAt: "2023-11-10",
    uploadedBy: "Jordan Lee",
  },
  {
    id: "DOC-008",
    name: "Insurance Policy 2024.pdf",
    system: "general",
    type: "other",
    size: "1.2 MB",
    uploadedAt: "2024-01-08",
    uploadedBy: "Jordan Lee",
  },
  {
    id: "DOC-009",
    name: "Gutter Cleaning Receipt - Fall 2023.pdf",
    system: "gutters",
    type: "receipt",
    size: "234 KB",
    uploadedAt: "2023-10-15",
    uploadedBy: "Lena Ortiz",
  },
  {
    id: "DOC-010",
    name: "Plumbing Warranty - Water Heater.pdf",
    system: "waterHeating",
    type: "warranty",
    size: "1.5 MB",
    uploadedAt: "2022-06-12",
    uploadedBy: "Jordan Lee",
  },
];

function DocumentsTab({propertyData}) {
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Get available years and months from documents
  const availableYears = useMemo(() => {
    const years = new Set();
    documents.forEach((doc) => {
      const date = new Date(doc.uploadedAt);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [documents]);

  const months = [
    {value: "01", label: "January"},
    {value: "02", label: "February"},
    {value: "03", label: "March"},
    {value: "04", label: "April"},
    {value: "05", label: "May"},
    {value: "06", label: "June"},
    {value: "07", label: "July"},
    {value: "08", label: "August"},
    {value: "09", label: "September"},
    {value: "10", label: "October"},
    {value: "11", label: "November"},
    {value: "12", label: "December"},
  ];

  // Filter documents based on selected filters
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSystem =
        selectedSystem === "all" || doc.system === selectedSystem;
      const matchesType = selectedType === "all" || doc.type === selectedType;
      const matchesSearch =
        searchQuery === "" ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Date filtering
      let matchesDate = true;
      if (selectedYear !== "all" || selectedMonth !== "all") {
        const docDate = new Date(doc.uploadedAt);
        const docYear = docDate.getFullYear().toString();
        const docMonth = String(docDate.getMonth() + 1).padStart(2, "0");

        if (selectedYear !== "all" && docYear !== selectedYear) {
          matchesDate = false;
        }
        if (selectedMonth !== "all" && docMonth !== selectedMonth) {
          matchesDate = false;
        }
      }

      return matchesSystem && matchesType && matchesSearch && matchesDate;
    });
  }, [
    documents,
    selectedSystem,
    selectedType,
    searchQuery,
    selectedYear,
    selectedMonth,
  ]);

  // Clear selected document if it's no longer in filtered list
  useEffect(() => {
    if (
      selectedDocument &&
      !filteredDocuments.find((doc) => doc.id === selectedDocument.id)
    ) {
      setSelectedDocument(null);
    }
  }, [filteredDocuments, selectedDocument]);

  // Group documents by system
  const documentsBySystem = useMemo(() => {
    const grouped = {};
    filteredDocuments.forEach((doc) => {
      if (!grouped[doc.system]) {
        grouped[doc.system] = [];
      }
      grouped[doc.system].push(doc);
    });
    return grouped;
  }, [filteredDocuments]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleDelete = (docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    }
  };

  const getDocumentIcon = (type) => {
    const docType = documentTypes.find((dt) => dt.id === type);
    return docType ? docType.icon : File;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileTypeColor = (type) => {
    const colors = {
      contract:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      warranty:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      receipt:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      inspection:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      permit:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full pl-10 pr-4"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="btn border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200"
          >
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter:
          </span>
        </div>
        <select
          value={selectedSystem}
          onChange={(e) => setSelectedSystem(e.target.value)}
          className="form-select text-sm"
        >
          <option value="all">All Systems</option>
          {systemCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="form-select text-sm"
        >
          <option value="all">All Types</option>
          {documentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              // Reset month when year changes to "all"
              if (e.target.value === "all") {
                setSelectedMonth("all");
              }
            }}
            className="form-select text-sm"
          >
            <option value="all">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={selectedYear === "all"}
            className="form-select text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Months</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
        {(selectedSystem !== "all" ||
          selectedType !== "all" ||
          searchQuery ||
          selectedYear !== "all" ||
          selectedMonth !== "all") && (
          <button
            onClick={() => {
              setSelectedSystem("all");
              setSelectedType("all");
              setSearchQuery("");
              setSelectedYear("all");
              setSelectedMonth("all");
            }}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredDocuments.length} document
        {filteredDocuments.length !== 1 ? "s" : ""} found
      </div>

      {/* Documents by System with Preview Panel */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents Accordion - Left Side */}
          <div
            className={`space-y-4 ${
              selectedDocument ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            {systemCategories.map((category) => {
              const categoryDocs = documentsBySystem[category.id] || [];
              if (categoryDocs.length === 0 && selectedSystem !== "all")
                return null;

              const Icon = category.icon;
              const isExpanded = expandedCategories[category.id] ?? true;

              return (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${category.color}`} />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.label}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {categoryDocs.length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6">
                      {categoryDocs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {categoryDocs.map((doc) => {
                            const DocIcon = getDocumentIcon(doc.type);
                            const isSelected = selectedDocument?.id === doc.id;
                            return (
                              <div
                                key={doc.id}
                                onClick={() => setSelectedDocument(doc)}
                                className={`group relative bg-gray-50 dark:bg-gray-900/50 rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? "border-indigo-500 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                                    : "border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                      <DocIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                                      {doc.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${getFileTypeColor(
                                          doc.type
                                        )}`}
                                      >
                                        {
                                          documentTypes.find(
                                            (dt) => dt.id === doc.type
                                          )?.label
                                        }
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {doc.size}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(doc.uploadedAt)} ·{" "}
                                      {doc.uploadedBy}
                                    </p>
                                  </div>
                                </div>

                                {/* Action buttons - appear on hover */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDocument(doc);
                                    }}
                                    className="p-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                    title="View"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(doc.id);
                                    }}
                                    className="p-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">
                            No documents in this category
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Preview Panel - Right Side */}
          {selectedDocument && (
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                {/* Preview Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Document Preview
                  </h3>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview Content */}
                <div className="p-6 space-y-6">
                  {/* Document Icon and Name */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                        {(() => {
                          const DocIcon = getDocumentIcon(
                            selectedDocument.type
                          );
                          return (
                            <DocIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2 break-words">
                        {selectedDocument.name}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${getFileTypeColor(
                            selectedDocument.type
                          )}`}
                        >
                          {
                            documentTypes.find(
                              (dt) => dt.id === selectedDocument.type
                            )?.label
                          }
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedDocument.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Details */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
                        System
                      </label>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const SystemIcon =
                            systemCategories.find(
                              (sc) => sc.id === selectedDocument.system
                            )?.icon || Folder;
                          const systemColor =
                            systemCategories.find(
                              (sc) => sc.id === selectedDocument.system
                            )?.color || "text-gray-500";
                          return (
                            <>
                              <SystemIcon
                                className={`w-4 h-4 ${systemColor}`}
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {systemCategories.find(
                                  (sc) => sc.id === selectedDocument.system
                                )?.label || "General"}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
                        Uploaded
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedDocument.uploadedAt)}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
                        Uploaded By
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedDocument.uploadedBy}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    <button className="flex-1 btn bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex-1 btn border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>

                  {/* PDF Preview Placeholder */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Document preview
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Click "View" to open full document
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // List View with Preview Panel
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={`${
              selectedDocument ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDocuments.map((doc) => {
                  const DocIcon = getDocumentIcon(doc.type);
                  const SystemIcon =
                    systemCategories.find((sc) => sc.id === doc.system)?.icon ||
                    Folder;
                  const isSelected = selectedDocument?.id === doc.id;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                            <DocIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {doc.name}
                            </h4>
                            <SystemIcon
                              className={`w-4 h-4 flex-shrink-0 ${
                                systemCategories.find(
                                  (sc) => sc.id === doc.system
                                )?.color || "text-gray-500"
                              }`}
                            />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span
                              className={`px-2 py-0.5 rounded-full ${getFileTypeColor(
                                doc.type
                              )}`}
                            >
                              {
                                documentTypes.find((dt) => dt.id === doc.type)
                                  ?.label
                              }
                            </span>
                            <span>{doc.size}</span>
                            <span>·</span>
                            <span>{formatDate(doc.uploadedAt)}</span>
                            <span>·</span>
                            <span>{doc.uploadedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocument(doc);
                            }}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id);
                            }}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredDocuments.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No documents found</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel - Right Side (same as grid view) */}
          {selectedDocument && (
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                {/* Preview Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Document Preview
                  </h3>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview Content */}
                <div className="p-6 space-y-6">
                  {/* Document Icon and Name */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                        {(() => {
                          const DocIcon = getDocumentIcon(
                            selectedDocument.type
                          );
                          return (
                            <DocIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2 break-words">
                        {selectedDocument.name}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${getFileTypeColor(
                            selectedDocument.type
                          )}`}
                        >
                          {
                            documentTypes.find(
                              (dt) => dt.id === selectedDocument.type
                            )?.label
                          }
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedDocument.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Details */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
                        System
                      </label>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const SystemIcon =
                            systemCategories.find(
                              (sc) => sc.id === selectedDocument.system
                            )?.icon || Folder;
                          const systemColor =
                            systemCategories.find(
                              (sc) => sc.id === selectedDocument.system
                            )?.color || "text-gray-500";
                          return (
                            <>
                              <SystemIcon
                                className={`w-4 h-4 ${systemColor}`}
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {systemCategories.find(
                                  (sc) => sc.id === selectedDocument.system
                                )?.label || "General"}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
                        Uploaded
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedDocument.uploadedAt)}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
                        Uploaded By
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedDocument.uploadedBy}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    <button className="flex-1 btn bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex-1 btn border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>

                  {/* PDF Preview Placeholder */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Document preview
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Click "View" to open full document
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload Document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select System
                </label>
                <select className="form-select w-full">
                  {systemCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <select className="form-select w-full">
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button className="btn bg-indigo-600 hover:bg-indigo-700 text-white">
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentsTab;
