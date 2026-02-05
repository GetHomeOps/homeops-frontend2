import React, {useState} from "react";
import {X, Upload} from "lucide-react";
import ModalBlank from "../../../components/ModalBlank";
import DatePickerInput from "../../../components/DatePickerInput";

const documentTypes = [
  {id: "contract", label: "Contract"},
  {id: "warranty", label: "Warranty"},
  {id: "receipt", label: "Receipt"},
  {id: "inspection", label: "Inspection Report"},
  {id: "permit", label: "Permit"},
  {id: "manual", label: "Manual"},
  {id: "other", label: "Other"},
];

function UploadDocumentModal({isOpen, onClose, systemType, systemLabel}) {
  const [selectedDocType, setSelectedDocType] = useState("receipt");
  const [documentDate, setDocumentDate] = useState("");
  const [otherDocType, setOtherDocType] = useState("");

  return (
    <ModalBlank
      id="upload-document-modal"
      modalOpen={isOpen}
      setModalOpen={onClose}
      contentClassName="max-w-md"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Upload Document
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {systemLabel} System
            </p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Document Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {documentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedDocType(type.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDocType === type.id
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          {selectedDocType === "other" && (
            <div className="mt-2">
              <input
                type="text"
                value={otherDocType}
                onChange={(e) => setOtherDocType(e.target.value)}
                placeholder="Specify document type"
                className="form-input w-full"
              />
            </div>
          )}
        </div>

        {/* Document Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Document Date
          </label>
          <DatePickerInput
            name="documentDate"
            value={documentDate}
            onChange={(e) => setDocumentDate(e.target.value)}
          />
        </div>

        {/* Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            File
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto mb-3 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
              <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              PDF, JPG, PNG up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
        <button
          onClick={() => onClose(false)}
          className="btn border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button className="btn bg-emerald-600 hover:bg-emerald-700 text-white">
          Upload
        </button>
      </div>
    </ModalBlank>
  );
}

export default UploadDocumentModal;
