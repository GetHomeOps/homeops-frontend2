import React, {useState, useEffect, useMemo, useContext} from "react";
import CategoriesTableItem from "./CategoriesTableItem";
import {useTranslation} from "react-i18next";
import {useSortIndicator} from "../../hooks/useSortIndicator";
import AppContext from "../../context/AppContext";
import {useNavigate} from "react-router-dom";

// Categories for the dropdown - moved outside to prevent recreation
/* const categories = [
  {id: 1, name: "Inventory"},
  {id: 2, name: "Productivity"},
]; */

// Get category name from ID - moved outside since it doesn't depend on component state
/* const getCategoryName = (categoryId) => {
  const category = categories.find((cat) => cat.id === Number(categoryId));
  return category ? category.name : "";
}; */

/* CategoriesTable component */
function CategoriesTable({
  categories,
  onToggleSelect,
  selectedItems,
  totalCategories,
  currentPage,
  itemsPerPage,
  sortConfig,
  onSort,
}) {
  const {t} = useTranslation();
  const renderSortIndicator = useSortIndicator();
  const navigate = useNavigate();

  // Get current page items
  const currentCategories = useMemo(() => {
    // First get the filtered and sorted categories
    const filteredAndSorted = [...categories].sort((a, b) => {
      if (!sortConfig) return 0;

      const aValue = a[sortConfig.key]?.toLowerCase() ?? "";
      const bValue = b[sortConfig.key]?.toLowerCase() ?? "";
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    // Then apply pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredAndSorted.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, itemsPerPage, categories, sortConfig]);

  // Check if all current categories are selected
  const allSelected = useMemo(() => {
    return (
      currentCategories.length > 0 &&
      currentCategories.every((category) => selectedItems.includes(category.id))
    );
  }, [currentCategories, selectedItems]);

  function handleSelect(e) {
    const id = Number(e.target.id);
    onToggleSelect(id);
  }

  function handleSelectAll() {
    const currentIds = currentCategories.map((category) => category.id);
    onToggleSelect(currentIds, !allSelected);
  }

  // Handle navigation with index information
  const handleNavigateToCategory = (category) => {
    // Find the index of the category in the current page
    const currentIndex = currentCategories.findIndex(
      (currentCategory) => currentCategory.id === category.id
    );

    navigate(`/admin/categories/${category.id}`, {
      state: {
        currentIndex: currentIndex + 1, // Convert to 1-based index
        totalItems: currentCategories.length,
        visibleCategoryIds: currentCategories.map((category) => category.id), // Pass the IDs of all visible categories in order
      },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl relative">
      <header className="px-5 py-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          {t("allCategories")}{" "}
          <span className="text-gray-400 dark:text-gray-500 font-medium">
            {totalCategories}
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
                        disabled={currentCategories.length === 0}
                      />
                    </label>
                  </div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <button
                    className="font-semibold text-left flex items-center justify-between w-full"
                    onClick={() => onSort("name")}
                  >
                    <div className="text-xs uppercase">{t("name")}</div>
                    {renderSortIndicator(sortConfig, "name")}
                  </button>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {currentCategories.length > 0 ? (
                currentCategories.map((category) => (
                  <CategoriesTableItem
                    key={category.id}
                    id={category.id}
                    name={category.name}
                    icon={category.icon}
                    url={category.url}
                    description={category.description}
                    handleSelect={handleSelect}
                    isChecked={selectedItems.includes(category.id)}
                    isAlternate={currentCategories.indexOf(category) % 2 !== 0}
                    onNavigate={() => handleNavigateToCategory(category)}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400"
                  >
                    <div className="text-center w-full">
                      {t("noCategoriesFound")}
                    </div>
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

export default CategoriesTable;
