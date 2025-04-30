import React, {useMemo, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {icons} from "../../assets/icons";
import {useTranslation} from "react-i18next";
import {useSortIndicator} from "../../hooks/useSortIndicator";
import AppContext from "../../context/AppContext";

// Get category name from ID
const getCategoryName = (categoryId, categories) => {
  const category = categories.find((cat) => cat.id === Number(categoryId));
  return category ? category.name : "";
};

function CollapsibleAppsTable({
  filteredApps,
  selectedItems,
  onToggleSelect,
  expandedCategories,
  setExpandedCategories,
  categories,
}) {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const renderSortIndicator = useSortIndicator();
  const {sortedItems, sortConfig, handleSort, getCurrentViewApps} =
    useContext(AppContext);

  // Group sorted items by category
  const groupedItems = useMemo(() => {
    // First sort the filtered apps based on the current sort config
    const sortedApps = [...filteredApps].sort((a, b) => {
      if (!sortConfig) return 0;

      if (sortConfig.key === "name") {
        const categoryA = getCategoryName(
          a.category_id,
          categories
        ).toLowerCase();
        const categoryB = getCategoryName(
          b.category_id,
          categories
        ).toLowerCase();
        const categoryCompare =
          sortConfig.direction === "asc"
            ? categoryA.localeCompare(categoryB)
            : categoryB.localeCompare(categoryA);

        // If same category, sort by name
        if (categoryCompare === 0) {
          return sortConfig.direction === "asc"
            ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            : b.name.toLowerCase().localeCompare(a.name.toLowerCase());
        }
        return categoryCompare;
      }

      const aValue = a[sortConfig.key]?.toLowerCase() ?? "";
      const bValue = b[sortConfig.key]?.toLowerCase() ?? "";
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    // Then group the sorted apps by category
    return sortedApps.reduce((acc, app) => {
      const categoryId = app.category_id;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(app);
      return acc;
    }, {});
  }, [filteredApps, sortConfig, categories]);

  // Get visible apps from expanded categories
  const visibleApps = useMemo(() => {
    return Object.entries(groupedItems).reduce((acc, [categoryId, apps]) => {
      if (
        expandedCategories.includes(getCategoryName(categoryId, categories))
      ) {
        return [...acc, ...apps];
      }
      return acc;
    }, []);
  }, [groupedItems, expandedCategories, categories]);

  // Check if all visible apps are selected
  const allVisibleSelected = useMemo(() => {
    return (
      visibleApps.length > 0 &&
      visibleApps.every((app) => selectedItems.includes(app.id))
    );
  }, [visibleApps, selectedItems]);

  /* Handle category expansion */
  function handleCategoryExpand(category) {
    setExpandedCategories((prev) => {
      // Convert string to array if needed
      const currentExpanded =
        typeof prev === "string"
          ? prev.split(",").filter(Boolean)
          : Array.isArray(prev)
          ? prev
          : [];

      if (currentExpanded.includes(category)) {
        const newState = currentExpanded.filter((cat) => cat !== category);
        return newState;
      } else {
        const newState = [...currentExpanded, category];
        return newState;
      }
    });
  }

  /* Handle select all visible apps */
  const handleSelectAllVisible = () => {
    const visibleIds = visibleApps.map((app) => app.id);
    onToggleSelect(visibleIds, !allVisibleSelected);
  };

  // Handle navigation with index information
  const handleNavigateToApp = (app) => {
    // Get all visible apps in the correct order (sorted by category and then by app name)
    const allVisibleApps = Object.entries(groupedItems)
      .sort(([categoryIdA], [categoryIdB]) => {
        const categoryNameA = getCategoryName(
          categoryIdA,
          categories
        ).toLowerCase();
        const categoryNameB = getCategoryName(
          categoryIdB,
          categories
        ).toLowerCase();
        return categoryNameA.localeCompare(categoryNameB);
      })
      .flatMap(([_, apps]) => apps);

    // Find the index of the app in the sorted list
    const currentIndex = allVisibleApps.findIndex(
      (visibleApp) => visibleApp.id === app.id
    );

    navigate(`/admin/apps/${app.id}`, {
      state: {
        currentIndex: currentIndex + 1, // Convert to 1-based index
        totalItems: allVisibleApps.length,
        viewMode: "group",
        visibleAppIds: allVisibleApps.map((app) => app.id),
      },
    });
  };

  console.log("groupedItems:", groupedItems);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl relative">
      <header className="px-5 py-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          {t("allApplications")}{" "}
          <span className="text-gray-400 dark:text-gray-500 font-medium">
            {filteredApps.length}
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
                        checked={allVisibleSelected}
                        onChange={handleSelectAllVisible}
                        disabled={visibleApps.length === 0}
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
                  <div className="font-semibold text-left flex items-center justify-between w-full">
                    <div className="text-xs uppercase">{t("category")}</div>
                  </div>
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
              {Object.entries(groupedItems)
                .sort(([categoryIdA, appsA], [categoryIdB, appsB]) => {
                  const categoryNameA = getCategoryName(
                    categoryIdA,
                    categories
                  ).toLowerCase();
                  const categoryNameB = getCategoryName(
                    categoryIdB,
                    categories
                  ).toLowerCase();
                  return categoryNameA.localeCompare(categoryNameB);
                })
                .map(([categoryId, apps]) => {
                  const categoryName = getCategoryName(categoryId, categories);
                  const isExpanded = expandedCategories.includes(categoryName);
                  return (
                    <React.Fragment key={categoryId}>
                      <tr className="bg-gray-200/90 dark:bg-gray-900/50">
                        <td
                          colSpan="6"
                          className="px-2 first:pl-5 last:pr-5 py-3"
                        >
                          <button
                            className="flex items-center text-gray-600 dark:text-gray-300"
                            onClick={() => handleCategoryExpand(categoryName)}
                          >
                            <svg
                              className={`w-4 h-4 mr-2 fill-current ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                              viewBox="0 0 16 16"
                            >
                              <path d="M9.4 6.6L5.8 3 4.4 4.4 6.8 7l-2.4 2.6L5.8 11l3.6-3.6-1.4-1.4z" />
                            </svg>
                            <span className="font-medium">{categoryName}</span>
                            <span className="ml-2 text-gray-500 dark:text-gray-400">
                              ({apps.length})
                            </span>
                          </button>
                        </td>
                      </tr>
                      {isExpanded &&
                        apps.map((app) => (
                          <tr
                            key={app.id}
                            className={`${
                              apps.indexOf(app) % 2 === 0
                                ? "bg-white dark:bg-gray-700/10"
                                : "bg-gray-50 dark:bg-gray-700/20"
                            } hover:bg-gray-200/60 dark:hover:bg-gray-700/90`}
                          >
                            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <label className="inline-flex">
                                  <span className="sr-only">Select</span>
                                  <input
                                    id={app.id}
                                    className="form-checkbox"
                                    type="checkbox"
                                    checked={selectedItems.includes(app.id)}
                                    onChange={() => onToggleSelect(app.id)}
                                  />
                                </label>
                              </div>
                            </td>
                            <td
                              className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
                              onClick={() => handleNavigateToApp(app)}
                            >
                              <div className="font-medium text-gray-800 dark:text-gray-100">
                                {app.name}
                              </div>
                            </td>
                            <td
                              className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
                              onClick={() => handleNavigateToApp(app)}
                            >
                              <div className="flex items-center">
                                {app.icon ? (
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
                                    <path d={icons[app.icon].svgPath} />
                                  </svg>
                                ) : (
                                  <span className="text-gray-600 dark:text-gray-300 text-xs">
                                    {t("noIcon")}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
                              onClick={() => handleNavigateToApp(app)}
                            >
                              <div className="text-left text-gray-600 dark:text-gray-300">
                                {app.url}
                              </div>
                            </td>
                            <td
                              className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
                              onClick={() => handleNavigateToApp(app)}
                            >
                              <div className="text-left text-gray-600 dark:text-gray-300">
                                {categoryName}
                              </div>
                            </td>
                            <td
                              className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
                              onClick={() => handleNavigateToApp(app)}
                            >
                              <div className="text-left text-gray-600 dark:text-gray-300">
                                {app.description}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              {Object.keys(groupedItems).length === 0 && (
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

export default CollapsibleAppsTable;
