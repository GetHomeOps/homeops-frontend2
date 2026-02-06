import React, {useState, useCallback, useEffect, useMemo} from "react";
import {Settings, PanelLeftClose, ChevronRight, Menu} from "lucide-react";
import {useParams} from "react-router-dom";
import {PROPERTY_SYSTEMS} from "./constants/propertySystems";
import {
  MaintenanceTreeView,
  MaintenanceFormPanel,
} from "./partials/maintenance";

/**
 * MaintenanceTab - Split-view layout for maintenance record management.
 *
 * Features:
 * - Left panel: Tree view of systems with nested maintenance records
 * - Right panel: Full form for viewing/editing selected record
 * - Filtering and search by status, date, text
 * - "Open in New Tab" functionality for working with external references
 */
function MaintenanceTab({
  propertyData,
  maintenanceRecords: maintenanceRecordsArray = [],
  onMaintenanceRecordsChange,
  onMaintenanceRecordAdded,
  contacts = [],
}) {
  const {uid: propertyId, dbUrl} = useParams();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedSystemId, setSelectedSystemId] = useState(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile overlay

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [sidebarOpen]);

  // Determine visible systems: only those with included=true (from modal selection)
  const visibleSystemIds = propertyData.selectedSystemIds ?? [];
  const customSystemNames = propertyData.customSystemNames ?? [];

  const systemsToShow = [
    ...PROPERTY_SYSTEMS.filter((s) => visibleSystemIds.includes(s.id)),
    ...customSystemNames.map((name, index) => ({
      id: `custom-${name}-${index}`,
      name,
      icon: Settings,
    })),
  ];

  // Convert array (from parent state) to object keyed by systemId for tree view
  const maintenanceRecords = useMemo(() => {
    const records = {};
    (maintenanceRecordsArray || []).forEach((item) => {
      const systemId = item.systemId || "roof";
      if (!records[systemId]) records[systemId] = [];
      records[systemId].push({...item, systemId});
    });
    return records;
  }, [maintenanceRecordsArray]);

  const recordsToArray = useCallback((recordsObj) => {
    return Object.values(recordsObj || {}).flat();
  }, []);

  // Handle selecting a record from the tree
  const handleSelectRecord = useCallback((record) => {
    setSelectedRecord(record);
    setSelectedSystemId(record.systemId);
    setIsNewRecord(false);
  }, []);

  // Handle selecting a system (shows empty form for that system)
  const handleSelectSystem = useCallback((systemId) => {
    setSelectedRecord(null);
    setSelectedSystemId(systemId);
    setIsNewRecord(false);
  }, []);

  // Handle adding a new record for a system
  const handleAddRecord = useCallback((systemId) => {
    setSelectedRecord(null);
    setSelectedSystemId(systemId);
    setIsNewRecord(true);
  }, []);

  // Handle saving a record
  const handleSaveRecord = useCallback(
    (recordData) => {
      const systemRecords = [
        ...(maintenanceRecords[recordData.systemId] || []),
      ];
      const existingIndex = systemRecords.findIndex(
        (r) => r.id === recordData.id,
      );

      if (existingIndex >= 0) {
        systemRecords[existingIndex] = recordData;
      } else {
        systemRecords.push(recordData);
      }

      // Sort by date descending
      systemRecords.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });

      const updated = {
        ...maintenanceRecords,
        [recordData.systemId]: systemRecords,
      };
      onMaintenanceRecordsChange?.(recordsToArray(updated));

      // Update the selected record to the saved version
      setSelectedRecord(recordData);
      setIsNewRecord(false);

      // Trigger save bar visibility and scroll to it
      onMaintenanceRecordAdded?.();
    },
    [
      maintenanceRecords,
      onMaintenanceRecordsChange,
      onMaintenanceRecordAdded,
      recordsToArray,
    ],
  );

  // Handle deleting a record
  const handleDeleteRecord = useCallback(
    (recordId) => {
      if (
        window.confirm(
          "Are you sure you want to delete this maintenance record?",
        )
      ) {
        const updated = {...maintenanceRecords};
        Object.keys(updated).forEach((systemId) => {
          updated[systemId] = updated[systemId].filter(
            (r) => r.id !== recordId,
          );
        });
        onMaintenanceRecordsChange?.(recordsToArray(updated));

        // Clear selection if deleted record was selected
        if (selectedRecord?.id === recordId) {
          setSelectedRecord(null);
          setIsNewRecord(false);
        }
      }
    },
    [
      maintenanceRecords,
      onMaintenanceRecordsChange,
      recordsToArray,
      selectedRecord,
    ],
  );

  // Handle "Open in New Tab" - opens maintenance record at /:dbUrl/properties/:uid/maintenance/:systemId/:recordId
  const handleOpenInNewTab = useCallback(
    (data) => {
      const dbUrlPath = dbUrl || propertyData.dbUrl || "";
      const uid = data?.propertyId ?? propertyId;
      const sysId = data?.systemId ?? selectedSystemId;
      const recId =
        data?.record?.id ?? data?.record?.recordId ?? selectedRecord?.id;
      if (sysId && recId) {
        const path = `/${dbUrlPath}/properties/${uid}/maintenance/${encodeURIComponent(sysId)}/${encodeURIComponent(recId)}`;
        const url = `${window.location.origin}/#${path}`;
        window.open(url, "_blank");
      } else {
        const path = `/${dbUrlPath}/properties/${uid}`;
        const url = `${window.location.origin}/#${path}`;
        window.open(url, "_blank");
      }
    },
    [
      dbUrl,
      propertyData.dbUrl,
      propertyId,
      selectedSystemId,
      selectedRecord?.id,
    ],
  );

  // Get the system name for the selected system
  const getSystemName = (sysId) => {
    return systemsToShow.find((s) => s.id === sysId)?.name || "System";
  };

  // Handle record/system selection and close mobile sidebar
  const handleRecordSelect = useCallback(
    (record) => {
      handleSelectRecord(record);
      setSidebarOpen(false);
    },
    [handleSelectRecord],
  );

  const handleSystemSelect = useCallback(
    (systemId) => {
      handleSelectSystem(systemId);
      setSidebarOpen(false);
    },
    [handleSelectSystem],
  );

  const handleAddRecordMobile = useCallback(
    (systemId) => {
      handleAddRecord(systemId);
      setSidebarOpen(false);
    },
    [handleAddRecord],
  );

  return (
    <div className="relative flex h-[calc(100vh-300px)] min-h-[500px] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Mobile sidebar backdrop - scoped to tab */}
      {sidebarOpen && (
        <div
          className="lg:hidden absolute inset-0 bg-gray-900/50 z-40 rounded-lg"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Panel - Tree View */}
      {/* Desktop: inline collapsible | Mobile: overlay drawer within tab */}
      <div
        className={`
          flex-shrink-0 transition-all duration-200 ease-in-out
          lg:relative lg:z-auto
          ${sidebarCollapsed ? "lg:w-0 lg:overflow-hidden" : "lg:w-72"}
          absolute inset-y-0 left-0 z-50 lg:static
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="w-72 h-full rounded-l-lg overflow-hidden">
          <MaintenanceTreeView
            systems={systemsToShow}
            maintenanceRecords={maintenanceRecords}
            selectedRecordId={selectedRecord?.id}
            selectedSystemId={isNewRecord ? selectedSystemId : null}
            onSelectRecord={handleRecordSelect}
            onSelectSystem={handleSystemSelect}
            onAddRecord={handleAddRecordMobile}
            onCollapse={() => {
              setSidebarCollapsed(true);
              setSidebarOpen(false);
            }}
            contacts={contacts}
          />
        </div>
      </div>

      {/* Expand button when collapsed (desktop only) */}
      {sidebarCollapsed && (
        <div className="hidden lg:flex flex-shrink-0 w-7 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="p-1.5 mt-2 mx-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Right Panel - Form */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Open records menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Records
          </span>
        </div>

        <div className="flex-1 min-h-0">
          <MaintenanceFormPanel
            record={selectedRecord}
            systemId={selectedSystemId}
            systemName={getSystemName(selectedSystemId)}
            propertyId={propertyId}
            onSave={handleSaveRecord}
            onDelete={handleDeleteRecord}
            onOpenInNewTab={handleOpenInNewTab}
            contacts={contacts}
            isNewRecord={isNewRecord}
          />
        </div>
      </div>
    </div>
  );
}

export default MaintenanceTab;
