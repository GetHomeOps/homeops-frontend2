import React, {useState, useEffect, useMemo, useContext} from "react";
import {useTranslation} from "react-i18next";
import AppContext from "../../context/AppContext";
import {useNavigate} from "react-router-dom";
import DataTable from "../../components/DataTable";
import DataTableItem from "../../components/DataTableItem";
import {icons} from "../../assets/icons";

// Categories for the dropdown - moved outside to prevent recreation
// const categories = [
//   {id: 1, name: "Inventory"},
//   {id: 2, name: "Productivity"},
// ];

/* AppsTable component */
function AppsTable({
  apps,
  onToggleSelect,
  selectedItems,
  totalApps,
  currentPage,
  itemsPerPage,
  categories,
}) {
  const {t} = useTranslation();
  const {listSortConfig, handleListSort, listSortedItems} =
    useContext(AppContext);
  const navigate = useNavigate();

  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === Number(categoryId));
    return category ? category.name : "";
  };

  // Get current page items
  const currentApps = useMemo(() => {
    const indexOfLastApp = currentPage * itemsPerPage;
    const indexOfFirstApp = indexOfLastApp - itemsPerPage;
    return apps.slice(indexOfFirstApp, indexOfLastApp);
  }, [currentPage, itemsPerPage, apps]);

  // Check if all current apps are selected
  const allSelected = useMemo(() => {
    return (
      currentApps.length > 0 &&
      currentApps.every((app) => selectedItems.includes(app.id))
    );
  }, [currentApps, selectedItems]);

  function handleSelect(e) {
    const id = Number(e.target.id);
    onToggleSelect(id);
  }

  function handleSelectAll() {
    const currentIds = currentApps.map((app) => app.id);
    onToggleSelect(currentIds, !allSelected);
  }

  // Handle navigation with index information
  const handleNavigateToApp = (app) => {
    // Find the index of the app in the full sorted list
    const currentIndex = listSortedItems.findIndex(
      (currentApp) => currentApp.id === app.id
    );

    navigate(`/admin/apps/${app.id}`, {
      state: {
        currentIndex: currentIndex + 1, // Convert to 1-based index
        totalItems: listSortedItems.length,
        viewMode: "list",
        visibleAppIds: listSortedItems.map((app) => app.id), // Pass the IDs of all apps in order
      },
    });
  };

  // Define columns configuration
  const columns = [
    {
      key: "name",
      label: "name",
      sortable: true,
      className: "font-medium text-gray-800 dark:text-gray-100",
    },
    {
      key: "icon",
      label: "icon",
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          {value ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
            >
              <path d={icons[value].svgPath} />
            </svg>
          ) : (
            <span className="text-gray-600 dark:text-gray-300 text-xs">
              {t("noIcon")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "url",
      label: "URL",
      sortable: true,
      className: "text-gray-600 dark:text-gray-300",
    },
    {
      key: "category_id",
      label: "category",
      sortable: true,
      render: (value) => getCategoryName(value),
      className: "text-gray-600 dark:text-gray-300",
    },
    {
      key: "description",
      label: "description",
      sortable: true,
      className: "text-gray-600 dark:text-gray-300",
    },
  ];

  // Custom item renderer
  const renderItem = (item, handleSelect, selectedItems, onItemClick) => (
    <DataTableItem
      item={item}
      columns={columns}
      onSelect={handleSelect}
      isSelected={selectedItems.includes(item.id)}
      onItemClick={onItemClick}
    />
  );

  return (
    <DataTable
      items={currentApps}
      columns={columns}
      onItemClick={(app) => {
        const currentIndex = listSortedItems.findIndex((a) => a.id === app.id);
        navigate(`/admin/apps/${app.id}`, {
          state: {
            currentIndex: currentIndex + 1,
            totalItems: listSortedItems.length,
            viewMode: "list",
            visibleAppIds: listSortedItems.map((app) => app.id),
          },
        });
      }}
      onSelect={onToggleSelect}
      selectedItems={selectedItems}
      totalItems={totalApps}
      title="allApplications"
      sortConfig={listSortConfig}
      onSort={handleListSort}
      emptyMessage="noAppsFound"
      renderItem={renderItem}
    />
  );
}

export default AppsTable;
