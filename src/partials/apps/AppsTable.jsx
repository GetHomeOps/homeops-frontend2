import React, {useState, useEffect, useMemo, useContext} from "react";
import AppsTableItem from "./AppsTableItem";
import {useTranslation} from "react-i18next";
import {useSortIndicator} from "../../hooks/useSortIndicator";
import AppContext from "../../context/AppContext";
import {useNavigate} from "react-router-dom";

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
  const renderSortIndicator = useSortIndicator();
  const {sortedItems, sortConfig, handleSort} = useContext(AppContext);
  const navigate = useNavigate();

  // Get category name from ID - moved outside since it doesn't depend on component state
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === Number(categoryId));
    return category ? category.name : "";
  };

  // Get current page items
  const currentApps = useMemo(() => {
    // First get the filtered apps
    const filteredAndSorted = [...apps].sort((a, b) => {
      if (!sortConfig) return 0;

      if (sortConfig.key === "category_id") {
        const categoryA = getCategoryName(a.category_id).toLowerCase();
        const categoryB = getCategoryName(b.category_id).toLowerCase();
        return sortConfig.direction === "asc"
          ? categoryA.localeCompare(categoryB)
          : categoryB.localeCompare(categoryA);
      }

      const aValue = a[sortConfig.key]?.toLowerCase() ?? "";
      const bValue = b[sortConfig.key]?.toLowerCase() ?? "";
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    // Then apply pagination
    const indexOfLastApp = currentPage * itemsPerPage;
    const indexOfFirstApp = indexOfLastApp - itemsPerPage;
    return filteredAndSorted.slice(indexOfFirstApp, indexOfLastApp);
  }, [currentPage, itemsPerPage, apps, sortConfig]);

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
    // Find the index of the app in the current page
    const currentIndex = currentApps.findIndex(
      (currentApp) => currentApp.id === app.id
    );

    navigate(`/admin/apps/${app.id}`, {
      state: {
        currentIndex: currentIndex + 1, // Convert to 1-based index
        totalItems: currentApps.length,
        viewMode: "list",
        visibleAppIds: currentApps.map((app) => app.id), // Pass the IDs of all visible apps in order
      },
    });
  };

  console.log("categories", categories);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl relative">
      <header className="px-5 py-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          {t("allApplications")}{" "}
          <span className="text-gray-400 dark:text-gray-500 font-medium">
            {totalApps}
          </span>
        </h2>
      </header>
      <div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full dark:text-gray-300">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60">
              <tr>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
                  <div className="flex items-center">
                    <label className="inline-flex">
                      <span className="sr-only">Select all</span>
                      <input
                        className="form-checkbox"
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        disabled={currentApps.length === 0}
                      />
                    </label>
                  </div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <button
                    className="font-semibold text-left flex items-center justify-between w-full"
                    onClick={() => handleSort("name")}
                  >
                    <div className="text-xs uppercase">{t("name")}</div>
                    {renderSortIndicator(sortConfig, "name")}
                  </button>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <button
                    className="font-semibold text-left flex items-center justify-between w-full"
                    onClick={() => handleSort("icon")}
                  >
                    <div className="text-xs uppercase">{t("icon")}</div>
                    {renderSortIndicator(sortConfig, "icon")}
                  </button>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <button
                    className="font-semibold text-left flex items-center justify-between w-full"
                    onClick={() => handleSort("url")}
                  >
                    <div className="text-xs uppercase">{t("URL")}</div>
                    {renderSortIndicator(sortConfig, "url")}
                  </button>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <button
                    className="font-semibold text-left flex items-center justify-between w-full"
                    onClick={() => handleSort("category_id")}
                  >
                    <div className="text-xs uppercase">{t("category")}</div>
                    {renderSortIndicator(sortConfig, "category_id")}
                  </button>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <button
                    className="font-semibold text-left flex items-center justify-between w-full"
                    onClick={() => handleSort("description")}
                  >
                    <div className="text-xs uppercase">{t("description")}</div>
                    {renderSortIndicator(sortConfig, "description")}
                  </button>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {currentApps.length > 0 ? (
                currentApps.map((app) => (
                  <AppsTableItem
                    key={app.id}
                    id={app.id}
                    name={app.name}
                    icon={app.icon}
                    url={app.url}
                    category={getCategoryName(app.category_id)}
                    description={app.description}
                    handleSelect={handleSelect}
                    isChecked={selectedItems.includes(app.id)}
                    isAlternate={currentApps.indexOf(app) % 2 !== 0}
                    onNavigate={() => handleNavigateToApp(app)}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400"
                  >
                    <div className="text-center w-full">{t("noAppsFound")}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AppsTable;
