import React, {useState, useEffect} from "react";
import {
  Wrench,
  ChevronDown,
  ChevronRight,
  Building,
  Droplet,
  Home,
  Zap,
  Shield,
  FileCheck,
  Plus,
  Calendar,
  User,
  FileText,
  Upload,
  X,
  File,
  AlertCircle,
  DollarSign,
  Clock,
  Mail,
  Phone,
  Send,
  CheckCircle,
} from "lucide-react";
import ModalBlank from "../../components/ModalBlank";

// System configuration matching SystemsTab
const systems = [
  {id: "roof", name: "Roof", icon: Building},
  {id: "gutters", name: "Gutters", icon: Droplet},
  {id: "foundation", name: "Foundation & Structure", icon: Building},
  {id: "exterior", name: "Exterior", icon: Building},
  {id: "windows", name: "Windows", icon: Home},
  {id: "heating", name: "Heating", icon: Zap},
  {id: "ac", name: "Air Conditioning", icon: Zap},
  {id: "waterHeating", name: "Water Heating", icon: Droplet},
  {id: "electrical", name: "Electrical", icon: Zap},
  {id: "plumbing", name: "Plumbing", icon: Droplet},
  {id: "safety", name: "Safety", icon: Shield},
  {id: "inspections", name: "Inspections", icon: FileCheck},
];

// Collapsible Section Component
function CollapsibleSection({title, icon: Icon, isOpen, onToggle, children}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm">
      <button
        onClick={onToggle}
        className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <Icon
              className="h-4 w-4 flex-shrink-0"
              style={{color: "#456654"}}
            />
          )}
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
            {title}
          </h3>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
        )}
      </button>
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

// Maintenance Record Card Component
function MaintenanceRecordCard({record, onEdit, onDelete}) {
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(record.date)}
            </span>
            {record.status && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  record.status === "Completed"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : record.status === "Scheduled"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                }`}
              >
                {record.status}
              </span>
            )}
          </div>

          {record.contractor && (
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {record.contractor}
              </span>
            </div>
          )}

          {record.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
              {record.description}
            </p>
          )}

          {record.files && record.files.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              {record.files.map((file, idx) => (
                <span
                  key={idx}
                  className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                >
                  {file.name || file}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(record)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit record"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(record.id)}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Delete record"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Maintenance Record Form Modal
function MaintenanceRecordForm({isOpen, onClose, record, systemId, onSave}) {
  const [formData, setFormData] = useState({
    date: "",
    contractor: "",
    contractorEmail: "",
    contractorPhone: "",
    description: "",
    status: "Completed",
    priority: "Medium",
    cost: "",
    workOrderNumber: "",
    nextServiceDate: "",
    materialsUsed: "",
    notes: "",
    files: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [requestStatus, setRequestStatus] = useState(null); // null, 'pending', 'submitted'

  // Reset form when modal opens/closes or record changes
  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({
          date: record.date || "",
          contractor: record.contractor || "",
          contractorEmail: record.contractorEmail || "",
          contractorPhone: record.contractorPhone || "",
          description: record.description || "",
          status: record.status || "Completed",
          priority: record.priority || "Medium",
          cost: record.cost || "",
          workOrderNumber: record.workOrderNumber || "",
          nextServiceDate: record.nextServiceDate || "",
          materialsUsed: record.materialsUsed || "",
          notes: record.notes || "",
          files: record.files || [],
        });
        setUploadedFiles(record.files || []);
        setRequestStatus(record.requestStatus || null);
      } else {
        setFormData({
          date: "",
          contractor: "",
          contractorEmail: "",
          contractorPhone: "",
          description: "",
          status: "Completed",
          priority: "Medium",
          cost: "",
          workOrderNumber: "",
          nextServiceDate: "",
          materialsUsed: "",
          notes: "",
          files: [],
        });
        setUploadedFiles([]);
        setRequestStatus(null);
      }
    }
  }, [isOpen, record]);

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      })),
    ]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const recordData = {
      ...formData,
      files: uploadedFiles,
      systemId: systemId,
      id: record?.id || `MT-${Date.now()}`,
      requestStatus: requestStatus,
    };
    onSave(recordData);
    // Reset form
    setFormData({
      date: "",
      contractor: "",
      contractorEmail: "",
      contractorPhone: "",
      description: "",
      status: "Completed",
      priority: "Medium",
      cost: "",
      workOrderNumber: "",
      nextServiceDate: "",
      materialsUsed: "",
      notes: "",
      files: [],
    });
    setUploadedFiles([]);
    setRequestStatus(null);
    onClose();
  };

  const handleSubmitRequest = () => {
    // Validate contractor info before submitting request
    if (!formData.contractor || (!formData.contractorEmail && !formData.contractorPhone)) {
      alert("Please provide contractor name and at least one contact method (email or phone) before submitting a request.");
      return;
    }
    setRequestStatus("pending");
    // In a real app, this would send a notification/email to the contractor
    alert("Request submitted to contractor. They will be notified to fill out the maintenance report.");
  };

  const systemName = systemId
    ? systems.find((s) => s.id === systemId)?.name || "System"
    : "System";

  console.log(
    "MaintenanceRecordForm render - isOpen:",
    isOpen,
    "systemId:",
    systemId,
    "systemName:",
    systemName
  );

  return (
    <ModalBlank
      id="maintenance-record-form"
      modalOpen={isOpen}
      setModalOpen={(open) => {
        if (!open) {
          // Reset form when closing
          setFormData({
            date: "",
            contractor: "",
            contractorEmail: "",
            contractorPhone: "",
            description: "",
            status: "Completed",
            priority: "Medium",
            cost: "",
            workOrderNumber: "",
            nextServiceDate: "",
            materialsUsed: "",
            notes: "",
            files: [],
          });
          setUploadedFiles([]);
          setRequestStatus(null);
          onClose();
        }
      }}
    >
      <div className="p-6 max-h-[90vh] overflow-y-auto">
        {/* Request Status Banner */}
        {requestStatus === "pending" && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Maintenance Report Pending
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    A request has been sent to the contractor to fill out this maintenance form. You'll be notified once they complete it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Request Banner - Only show when no request has been submitted */}
        {!record && requestStatus === null && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Submit Request for Filling
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Need the contractor to fill out this form? Fill in the contractor details below and click "Submit Request" to notify them.
                  </p>
                  <button
                    type="button"
                    onClick={handleSubmitRequest}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {record ? "Edit" : "Add"} Maintenance Record
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {systemName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Work Order Number & Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Work Order Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileCheck className="w-4 h-4 inline mr-2" />
                Work Order #
              </label>
              <input
                type="text"
                name="workOrderNumber"
                value={formData.workOrderNumber}
                onChange={handleInputChange}
                placeholder="Optional work order reference"
                className="form-input w-full"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-select w-full"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          {/* Date & Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="form-input w-full"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select w-full"
              >
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Contractor">Pending Contractor Fill-out</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Next Service Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Next Service Date
            </label>
            <input
              type="date"
              name="nextServiceDate"
              value={formData.nextServiceDate}
              onChange={handleInputChange}
              className="form-input w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              When is the next maintenance service scheduled?
            </p>
          </div>

          {/* Contractor Information Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Contractor Information
            </h3>

            <div className="space-y-4">
              {/* Contractor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Contractor Name
                </label>
                <input
                  type="text"
                  name="contractor"
                  value={formData.contractor}
                  onChange={handleInputChange}
                  placeholder="Enter contractor or company name"
                  className="form-input w-full"
                />
              </div>

              {/* Contractor Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="contractorEmail"
                    value={formData.contractorEmail}
                    onChange={handleInputChange}
                    placeholder="contractor@email.com"
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="contractorPhone"
                    value={formData.contractorPhone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="form-input w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Work Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe the maintenance work performed, issues found, and actions taken..."
              className="form-input w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Provide a detailed description of the work completed
            </p>
          </div>

          {/* Materials Used */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Wrench className="w-4 h-4 inline mr-2" />
              Materials Used
            </label>
            <textarea
              name="materialsUsed"
              value={formData.materialsUsed}
              onChange={handleInputChange}
              rows={3}
              placeholder="List materials, parts, or supplies used (e.g., HVAC filter, pipe fittings, paint)"
              className="form-input w-full"
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Total Cost
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="form-input w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Total amount charged for this maintenance service
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional notes, recommendations, or follow-up actions needed..."
              className="form-input w-full"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              Attachments
            </label>
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          {file.size && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn text-white"
                style={{backgroundColor: "#456654"}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#3a5548";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#456654";
                }}
              >
                {record ? "Update" : "Save"} Record
              </button>
            </div>
          </div>
        </form>
      </div>
    </ModalBlank>
  );
}

function MaintenanceTab({propertyData, handleInputChange}) {
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Debug: Log state changes
  useEffect(() => {
    console.log(
      "MaintenanceTab state - isFormOpen:",
      isFormOpen,
      "selectedSystem:",
      selectedSystem
    );
  }, [isFormOpen, selectedSystem]);

  const [maintenanceRecords, setMaintenanceRecords] = useState(() => {
    // Initialize with existing maintenance history grouped by system
    const records = {};
    systems.forEach((system) => {
      records[system.id] = [];
    });

    // Map existing maintenance history to systems (you can enhance this logic)
    if (propertyData.maintenanceHistory) {
      propertyData.maintenanceHistory.forEach((item) => {
        const systemId = item.systemId || "roof"; // Default to roof if not specified
        if (!records[systemId]) {
          records[systemId] = [];
        }
        records[systemId].push({
          ...item,
          systemId: systemId,
        });
      });
    }

    return records;
  });

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleAddRecord = (systemId) => {
    console.log("handleAddRecord called with systemId:", systemId);
    setSelectedRecord(null);
    setSelectedSystem(systemId);
    setIsFormOpen(true);
    console.log("State updated - isFormOpen: true, systemId:", systemId);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setSelectedSystem(record.systemId);
    setIsFormOpen(true);
  };

  const handleSaveRecord = (recordData) => {
    setMaintenanceRecords((prev) => {
      const systemRecords = [...(prev[recordData.systemId] || [])];
      const existingIndex = systemRecords.findIndex(
        (r) => r.id === recordData.id
      );

      if (existingIndex >= 0) {
        systemRecords[existingIndex] = recordData;
      } else {
        systemRecords.push(recordData);
      }

      // Sort by date (newest first)
      systemRecords.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });

      return {
        ...prev,
        [recordData.systemId]: systemRecords,
      };
    });

    // Update propertyData if handleInputChange is available
    if (handleInputChange) {
      // You can update the propertyData here if needed
    }
  };

  const handleDeleteRecord = (recordId) => {
    if (
      window.confirm("Are you sure you want to delete this maintenance record?")
    ) {
      setMaintenanceRecords((prev) => {
        const updated = {...prev};
        Object.keys(updated).forEach((systemId) => {
          updated[systemId] = updated[systemId].filter(
            (r) => r.id !== recordId
          );
        });
        return updated;
      });
    }
  };

  return (
    <div className="space-y-4">
      {systems.map((system) => {
        const systemRecords = maintenanceRecords[system.id] || [];
        const sectionId = `system-${system.id}`;
        const isOpen = expandedSections[sectionId] || false;
        const Icon = system.icon;

        return (
          <CollapsibleSection
            key={system.id}
            title={system.name}
            icon={Icon}
            isOpen={isOpen}
            onToggle={() => toggleSection(sectionId)}
          >
            <div className="space-y-4">
              {/* Add Record Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddRecord(system.id);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-[#456654] hover:text-[#456654] dark:hover:border-[#456654] dark:hover:text-[#456654] transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Maintenance Record</span>
              </button>

              {/* Records List */}
              {systemRecords.length > 0 ? (
                <div className="space-y-3">
                  {systemRecords.map((record) => (
                    <MaintenanceRecordCard
                      key={record.id}
                      record={record}
                      onEdit={handleEditRecord}
                      onDelete={handleDeleteRecord}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No maintenance records yet</p>
                  <p className="text-xs mt-1">
                    Click "Add Maintenance Record" to get started
                  </p>
                </div>
              )}
            </div>
          </CollapsibleSection>
        );
      })}

      {/* Maintenance Record Form Modal */}
      <MaintenanceRecordForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedRecord(null);
          setSelectedSystem(null);
        }}
        record={selectedRecord}
        systemId={selectedSystem}
        onSave={handleSaveRecord}
      />
    </div>
  );
}

export default MaintenanceTab;
