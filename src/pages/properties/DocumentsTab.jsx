import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  FileText,
  Upload,
  Search,
  Filter,
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
  Calendar,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import AppApi from "../../api/api";
import DatePickerInput from "../../components/DatePickerInput";
import useDocumentUpload from "../../hooks/useDocumentUpload";
import usePresignedPreview from "../../hooks/usePresignedPreview";

// System categories with icons – matches API system_key values
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

// Document types – matches API document_type values
const documentTypes = [
  {id: "contract", label: "Contract", icon: FileText},
  {id: "warranty", label: "Warranty", icon: Shield},
  {id: "receipt", label: "Receipt", icon: Receipt},
  {id: "inspection", label: "Inspection Report", icon: FileCheck},
  {id: "permit", label: "Permit", icon: ClipboardList},
  {id: "manual", label: "Manual", icon: FileText},
  {id: "insurance", label: "Insurance", icon: Shield},
  {id: "mortgage", label: "Mortgage", icon: FileText},
  {id: "other", label: "Other", icon: File},
];

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

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const PDF_EXTENSION = ".pdf";

function getPreviewType(url) {
  if (!url) return "other";
  const lower = url.toLowerCase();
  if (lower.includes(".pdf") || lower.endsWith("pdf")) return "pdf";
  if (IMAGE_EXTENSIONS.some((ext) => lower.includes(ext))) return "image";
  return "other";
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function InlineDocumentPreview({url, fileName, onClose}) {
  const [error, setError] = useState(false);
  const fileType = getPreviewType(url ?? fileName);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 dark:text-amber-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          No preview URL available. Use "Open in new tab" to view.
        </p>
      </div>
    );
  }

  if (error || fileType === "other") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Preview not available for this file type.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open in new tab
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 min-h-[200px]">
      {fileType === "pdf" && (
        <object
          data={url}
          type="application/pdf"
          className="w-full h-[480px]"
          title={fileName || "PDF preview"}
          onError={() => setError(true)}
        >
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Embedded preview unavailable. Use the button below.
            </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in new tab
                    </a>
          </div>
        </object>
      )}
      {fileType === "image" && (
        <img
          src={url}
          alt={fileName || "Document preview"}
          className="w-full max-h-[600px] object-contain"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

function DocumentsTab({propertyData}) {
  const propertyId = propertyData?.id ?? propertyData?.identity?.id;
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadDocumentName, setUploadDocumentName] = useState("");
  const [uploadDocumentDate, setUploadDocumentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [uploadDocumentType, setUploadDocumentType] = useState("receipt");
  const [uploadSystemKey, setUploadSystemKey] = useState("general");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadSuccessCount, setUploadSuccessCount] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const {
    uploadDocument,
    progress,
    isUploading,
    error: uploadHookError,
    clearError: clearUploadHookError,
  } = useDocumentUpload();

  const {
    url: presignedPreviewUrl,
    isLoading: presignedLoading,
    error: presignedError,
    fetchPreview: fetchPresignedPreview,
  } = usePresignedPreview();

  useEffect(() => {
    if (selectedDocument?.document_key) {
      fetchPresignedPreview(selectedDocument.document_key);
    }
  }, [selectedDocument?.document_key, fetchPresignedPreview]);

  const fetchDocuments = useCallback(async () => {
    if (!propertyId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const docs = await AppApi.getPropertyDocuments(propertyId);
      setDocuments(docs ?? []);
    } catch (err) {
      const msg =
        Array.isArray(err) ? err.join(", ") : err?.message || "Failed to load documents";
      setFetchError(msg);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Map API document to UI shape. Backend stores document_key (S3 path) like contacts/users.
  const toUIDoc = (doc) => ({
    id: doc.id,
    name: doc.document_name,
    system: doc.system_key || "general",
    type: doc.document_type || "other",
    document_key: doc.document_key,
    document_url: doc.document_url,
    document_date: doc.document_date,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  });

  const availableYears = useMemo(() => {
    const years = new Set();
    documents.forEach((doc) => {
      const d = doc.document_date || doc.created_at;
      if (d) years.add(new Date(d).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const uiDocs = documents.map(toUIDoc);
    return uiDocs.filter((doc) => {
      const matchesSystem =
        selectedSystem === "all" || doc.system === selectedSystem;
      const matchesType = selectedType === "all" || doc.type === selectedType;
      const matchesSearch =
        searchQuery === "" ||
        (doc.name || "").toLowerCase().includes(searchQuery.toLowerCase());

      let matchesDate = true;
      if (selectedYear !== "all" || selectedMonth !== "all") {
        const d = doc.document_date || doc.created_at;
        if (!d) matchesDate = false;
        else {
          const docDate = new Date(d);
          const docYear = docDate.getFullYear().toString();
          const docMonth = String(docDate.getMonth() + 1).padStart(2, "0");
          if (selectedYear !== "all" && docYear !== selectedYear)
            matchesDate = false;
          if (selectedMonth !== "all" && docMonth !== selectedMonth)
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

  useEffect(() => {
    if (
      selectedDocument &&
      !filteredDocuments.find((d) => d.id === selectedDocument.id)
    ) {
      setSelectedDocument(null);
    }
  }, [filteredDocuments, selectedDocument]);

  const documentsBySystem = useMemo(() => {
    const grouped = {};
    filteredDocuments.forEach((doc) => {
      const sys = doc.system || "general";
      if (!grouped[sys]) grouped[sys] = [];
      grouped[sys].push(doc);
    });
    return grouped;
  }, [filteredDocuments]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      await AppApi.deletePropertyDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDocument?.id === docId) setSelectedDocument(null);
    } catch (err) {
      const msg =
        Array.isArray(err) ? err.join(", ") : err?.message || "Delete failed";
      alert(msg);
    }
  };

  const handleOpenInNewTab = async (doc) => {
    const key = doc.document_key;
    const url = doc.document_url || doc.url;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (key) {
      try {
        const presignedUrl = await AppApi.getPresignedPreviewUrl(key);
        window.open(presignedUrl, "_blank", "noopener,noreferrer");
      } catch (err) {
        const msg =
          Array.isArray(err) ? err.join(", ") : err?.message || "Failed to open";
        alert(msg);
      }
    }
  };

  const handleUpload = async () => {
    if (!propertyId) {
      setUploadError("Save the property first to upload documents.");
      return;
    }
    if (uploadFiles.length === 0) {
      setUploadError("Please select at least one file.");
      return;
    }
    if (!uploadDocumentName.trim()) {
      setUploadError("Please enter a document name.");
      return;
    }
    if (!uploadDocumentDate) {
      setUploadError("Please select a document date.");
      return;
    }

    setUploadError(null);
    setUploadSuccessCount(0);
    clearUploadHookError();

    let successCount = 0;
    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      const name =
        uploadFiles.length > 1
          ? `${uploadDocumentName} (${i + 1})`
          : uploadDocumentName;
      const result = await uploadDocument(file);
      const s3Key = result?.key;
      if (!s3Key) continue;
      try {
        await AppApi.createPropertyDocument({
          property_id: propertyId,
          document_name: name,
          document_date: uploadDocumentDate,
          document_key: s3Key,
          document_type: uploadDocumentType,
          system_key: uploadSystemKey,
        });
        successCount++;
        setUploadSuccessCount(successCount);
        await fetchDocuments();
      } catch (err) {
        const msg =
          Array.isArray(err)
            ? err.join(", ")
            : err?.message || "Failed to save document";
        setUploadError(`File ${i + 1}: ${msg}`);
      }
    }

    if (successCount === uploadFiles.length && successCount > 0) {
      setUploadFiles([]);
      setUploadDocumentName("");
      setShowUploadModal(false);
    }
  };

  const getDocumentIcon = (type) => {
    const dt = documentTypes.find((t) => t.id === type);
    return dt ? dt.icon : File;
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
      manual:
        "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
      insurance:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      mortgage:
        "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
      other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };
    return colors[type] || colors.other;
  };

  const clearFilters = () => {
    setSelectedSystem("all");
    setSelectedType("all");
    setSearchQuery("");
    setSelectedYear("all");
    setSelectedMonth("all");
  };

  const hasActiveFilters =
    selectedSystem !== "all" ||
    selectedType !== "all" ||
    searchQuery ||
    selectedYear !== "all" ||
    selectedMonth !== "all";

  if (!propertyId) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
        <p className="text-gray-600 dark:text-gray-400">
          Save the property to manage documents.
        </p>
      </div>
    );
  }

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
              className="form-input w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="btn-sm border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 text-xs"
          >
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
        </div>
      </div>

      {/* Filters – preserved from original */}
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
          className="form-select text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <option value="all">All Systems</option>
          {systemCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="form-select text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <option value="all">All Types</option>
          {documentTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              if (e.target.value === "all") setSelectedMonth("all");
            }}
            className="form-select text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <option value="all">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={selectedYear === "all"}
            className="form-select text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Months</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredDocuments.length} document
        {filteredDocuments.length !== 1 ? "s" : ""} found
      </div>

      {/* Fetch Error */}
      {fetchError && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-amber-800 dark:text-amber-200">{fetchError}</span>
          <button
            onClick={fetchDocuments}
            className="ml-auto text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading documents…</p>
        </div>
      )}

      {/* Documents by System with Preview Panel */}
      {!loading && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div
                className={`space-y-4 ${
                  selectedDocument ? "lg:col-span-2" : "lg:col-span-3"
                }`}
              >
                {systemCategories.map((category) => {
                  const categoryDocs = documentsBySystem[category.id] || [];
                  if (
                    categoryDocs.length === 0 &&
                    selectedSystem !== "all"
                  )
                    return null;

                  const Icon = category.icon;
                  const isExpanded =
                    expandedCategories[category.id] ?? true;

                  return (
                    <div
                      key={category.id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
                    >
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${category.color}`} />
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
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
                                const isSelected =
                                  selectedDocument?.id === doc.id;
                                const docRow = documents.find(
                                  (d) => d.id === doc.id,
                                );
                                const docKey =
                                  docRow?.document_key ?? doc.document_key;
                                const docUrl =
                                  docRow?.document_url ?? doc.document_url;
                                return (
                                  <div
                                    key={doc.id}
                                    onClick={() =>
                                      setSelectedDocument({
                                        ...doc,
                                        document_key: docKey,
                                        document_url: docUrl,
                                      })
                                    }
                                    className={`group relative bg-gray-50 dark:bg-gray-900/50 rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                                      isSelected
                                        ? "border-indigo-500 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                                        : "border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600"
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                          <DocIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {formatDate(
                                            doc.document_date ||
                                              doc.created_at
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedDocument({
                                            ...doc,
                                            document_key: docKey,
                                            document_url: docUrl,
                                          });
                                        }}
                                        className="p-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                        title="Preview"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenInNewTab({
                                            ...doc,
                                            document_key: docKey,
                                            document_url: docUrl,
                                          });
                                        }}
                                        className="p-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                        title="Open in new tab"
                                      >
                                        <ExternalLink className="w-4 h-4" />
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

              {/* Preview Panel */}
              {selectedDocument && (
                <div className="lg:col-span-1">
                  <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Document Preview
                      </h3>
                      <button
                        onClick={() => setSelectedDocument(null)}
                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                            {(() => {
                              const DocIcon = getDocumentIcon(
                                selectedDocument.type
                              );
                              return (
                                <DocIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                              );
                            })()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 break-words">
                            {selectedDocument.name}
                          </h4>
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
                        </div>
                      </div>

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
                                      (sc) =>
                                        sc.id === selectedDocument.system
                                    )?.label || "General"}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
                            Document Date
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDate(
                              selectedDocument.document_date ||
                                selectedDocument.created_at
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <button
                          onClick={() =>
                            handleOpenInNewTab(selectedDocument)
                          }
                          className="flex-1 btn-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open in new tab
                        </button>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        {selectedDocument.document_key &&
                        presignedLoading ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Loading preview…
                            </p>
                          </div>
                        ) : presignedError ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {presignedError}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                fetchPresignedPreview(selectedDocument.document_key)
                              }
                              className="btn-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              Retry
                            </button>
                          </div>
                        ) : (
                          <InlineDocumentPreview
                            url={
                              selectedDocument.document_key
                                ? presignedPreviewUrl
                                : selectedDocument.document_url
                            }
                            fileName={selectedDocument.name}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div
                className={
                  selectedDocument ? "lg:col-span-2" : "lg:col-span-3"
                }
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDocuments.map((doc) => {
                      const DocIcon = getDocumentIcon(doc.type);
                      const SystemIcon =
                        systemCategories.find(
                          (sc) => sc.id === doc.system
                        )?.icon || Folder;
                      const isSelected =
                        selectedDocument?.id === doc.id;
                      const docRow = documents.find((d) => d.id === doc.id);
                      const docKey =
                        docRow?.document_key ?? doc.document_key;
                      const docUrl = docRow?.document_url ?? doc.document_url;
                      return (
                        <div
                          key={doc.id}
                          onClick={() =>
                            setSelectedDocument({
                              ...doc,
                              document_key: docKey,
                              document_url: docUrl,
                            })
                          }
                          className={`p-3 cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                <DocIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
                                    documentTypes.find(
                                      (dt) => dt.id === doc.type
                                    )?.label
                                  }
                                </span>
                                <span>
                                  {formatDate(
                                    doc.document_date || doc.created_at
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDocument({
                                    ...doc,
                                    document_key: docKey,
                                    document_url: docUrl,
                                  });
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenInNewTab({
                                    ...doc,
                                    document_key: docKey,
                                    document_url: docUrl,
                                  });
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                title="Open in new tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc.id);
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
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

              {selectedDocument && (
                <div className="lg:col-span-1">
                  <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Document Preview
                      </h3>
                      <button
                        onClick={() => setSelectedDocument(null)}
                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                            {(() => {
                              const DocIcon = getDocumentIcon(
                                selectedDocument.type
                              );
                              return (
                                <DocIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                              );
                            })()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 break-words">
                            {selectedDocument.name}
                          </h4>
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
                        </div>
                      </div>

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
                                      (sc) =>
                                        sc.id === selectedDocument.system
                                    )?.label || "General"}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
                            Document Date
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDate(
                              selectedDocument.document_date ||
                                selectedDocument.created_at
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <button
                          onClick={() =>
                            handleOpenInNewTab(selectedDocument)
                          }
                          className="flex-1 btn-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open in new tab
                        </button>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        {selectedDocument.document_key &&
                        presignedLoading ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Loading preview…
                            </p>
                          </div>
                        ) : presignedError ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {presignedError}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                fetchPresignedPreview(selectedDocument.document_key)
                              }
                              className="btn-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              Retry
                            </button>
                          </div>
                        ) : (
                          <InlineDocumentPreview
                            url={
                              selectedDocument.document_key
                                ? presignedPreviewUrl
                                : selectedDocument.document_url
                            }
                            fileName={selectedDocument.name}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Upload Document
              </h3>
              <button
                onClick={() => {
                  if (!isUploading) {
                    setShowUploadModal(false);
                    setUploadFiles([]);
                    setUploadError(null);
                    clearUploadHookError();
                  }
                }}
                disabled={isUploading}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {uploadError && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="text-red-800 dark:text-red-200 text-sm">
                    {uploadError}
                  </span>
                </div>
              )}

              {uploadHookError && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="text-red-800 dark:text-red-200 text-sm">
                    {uploadHookError}
                  </span>
                </div>
              )}

              {uploadSuccessCount > 0 && (
                <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-indigo-800 dark:text-indigo-200 text-xs">
                    {uploadSuccessCount} file
                    {uploadSuccessCount !== 1 ? "s" : ""} uploaded successfully
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  value={uploadDocumentName}
                  onChange={(e) => setUploadDocumentName(e.target.value)}
                  placeholder="e.g. AC Maintenance Receipt 2024"
                  className="form-input w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Date
                </label>
                <DatePickerInput
                  name="documentDate"
                  value={uploadDocumentDate}
                  onChange={(e) => setUploadDocumentDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <select
                  value={uploadDocumentType}
                  onChange={(e) => setUploadDocumentType(e.target.value)}
                  className="form-select w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  {documentTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System
                </label>
                <select
                  value={uploadSystemKey}
                  onChange={(e) => setUploadSystemKey(e.target.value)}
                  className="form-select w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  {systemCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File(s)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadFiles(files);
                    setUploadError(null);
                    e.target.value = "";
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-5 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer group"
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PDF, JPG, PNG up to 10MB
                  </p>
                  {uploadFiles.length > 0 && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                      {uploadFiles.length} file
                      {uploadFiles.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      Uploading
                      {uploadFiles.length > 1
                        ? ` (${uploadSuccessCount + 1} of ${uploadFiles.length})`
                        : ""}
                      …
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 dark:bg-indigo-500 transition-all duration-300"
                      style={{width: `${progress}%`}}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => {
                  if (!isUploading) {
                    setShowUploadModal(false);
                    setUploadFiles([]);
                    setUploadError(null);
                    clearUploadHookError();
                  }
                }}
                disabled={isUploading}
                className="btn-sm border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  uploadFiles.length === 0 ||
                  !uploadDocumentName.trim() ||
                  !uploadDocumentDate
                }
                className="btn-sm bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentsTab;
