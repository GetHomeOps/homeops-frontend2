import React, {useReducer, useEffect, useContext, useMemo} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import useUniqueIdentifiers from "../../../hooks/useUniqueIdentifiers.jsx";

import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import CategoriesTable from "../../../partials/categories/CategoriesTable";
import DropdownButton from "../../../partials/buttons/ListDropdown";
import PaginationClassic from "../../../components/PaginationClassic";
import appContext from "../../../context/AppContext";
import ModalBlank from "../../../components/ModalBlank";
import Banner from "../../../partials/containers/Banner";
import ViewModeDropdown from "../../../components/ViewModeDropdown";

import {useTranslation} from "react-i18next";

const PAGE_STORAGE_KEY = "categories_list_page";

const initialState = {
  currentPage: 1,
  itemsPerPage: 10,
  searchTerm: "",
  isSubmitting: false,
  dangerModalOpen: false,
  bannerOpen: false,
  bannerType: "success",
  bannerMessage: "",
  filteredCategories: [],
  sidebarOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_CURRENT_PAGE":
      localStorage.setItem(PAGE_STORAGE_KEY, action.payload);
      return {...state, currentPage: action.payload};
    case "SET_ITEMS_PER_PAGE":
      return {...state, itemsPerPage: action.payload};
    case "SET_SEARCH_TERM":
      return {...state, searchTerm: action.payload};
    case "SET_SUBMITTING":
      return {...state, isSubmitting: action.payload};
    case "SET_DANGER_MODAL":
      return {...state, dangerModalOpen: action.payload};
    case "SET_BANNER":
      return {
        ...state,
        bannerOpen: action.payload.open,
        bannerType: action.payload.type,
        bannerMessage: action.payload.message,
      };
    case "SET_FILTERED_CATEGORIES":
      return {
        ...state,
        filteredCategories: action.payload,
      };
    case "SET_SIDEBAR_OPEN":
      return {...state, sidebarOpen: action.payload};
    default:
      return state;
  }
}

// Categories for the dropdown
/* const CATEGORIES = [
  {id: 1, name: "Inventory"},
  {id: 2, name: "Productivity"},
]; */

function CategoriesList() {
  const {
    categories,
    deleteCategory,
    updateCategory,
    createCategory,
    viewMode,
    setViewMode,
    selectedCategories,
    handleCategoryToggleSelection,
    sortedCategories,
    categorySortConfig,
    handleCategorySort,
    generateUniqueCategoryName,
    generateUniqueCategoryUrl,
  } = useContext(appContext);

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    currentPage: localStorage.getItem(PAGE_STORAGE_KEY)
      ? Number(localStorage.getItem(PAGE_STORAGE_KEY))
      : 1,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const {t, i18n} = useTranslation();

  // Initialize categoriesList when categories change
  useEffect(() => {
    if (categories) {
      dispatch({type: "SET_FILTERED_CATEGORIES", payload: categories});
    }
  }, [categories]);

  // Handle navigation to category details
  const handleCategoryClick = (categoryId) => {
    navigate(`/admin/categories/${categoryId}`);
  };

  // Handle navigation to new category form
  const handleNewCategory = () => {
    navigate(`/admin/categories/new`);
  };

  // Memoize filtered categories based on search term
  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    return categories.filter((category) => {
      const searchLower = state.searchTerm.toLowerCase();
      return category.name.toLowerCase().includes(searchLower);
    });
  }, [state.searchTerm, categories]);

  // Update filtered categories in state
  useEffect(() => {
    dispatch({type: "SET_FILTERED_CATEGORIES", payload: filteredCategories});
  }, [filteredCategories]);

  // Memoize allVisibleSelected
  const allVisibleSelected = useMemo(() => {
    return (
      state.filteredCategories?.length > 0 &&
      state.filteredCategories.every((category) =>
        selectedCategories.includes(category.id)
      )
    );
  }, [selectedCategories, state.filteredCategories]);

  // Handle items per page change
  function handleItemsPerPageChange(value) {
    dispatch({type: "SET_ITEMS_PER_PAGE", payload: Number(value)});
  }

  // Handle banner timeout
  useEffect(() => {
    if (state.bannerOpen) {
      const timer = setTimeout(() => {
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: false,
            type: state.bannerType,
            message: state.bannerMessage,
          },
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.bannerOpen, state.bannerType, state.bannerMessage]);

  /* Handles delete button click */
  function handleDeleteClick() {
    if (selectedCategories.length === 0) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: "Please select at least one category to delete",
        },
      });
      return;
    }
    dispatch({type: "SET_DANGER_MODAL", payload: true});
  }

  /* Handles bulk duplication of selected categories */
  async function handleDuplicate() {
    if (selectedCategories.length === 0) return;

    dispatch({type: "SET_SUBMITTING", payload: true});
    let duplicatedCount = 0;
    try {
      // Duplicate each selected category
      for (const categoryId of selectedCategories) {
        const categoryToDuplicate = categories.find(
          (category) => category.id === categoryId
        );
        if (categoryToDuplicate) {
          const uniqueName = generateUniqueCategoryName(
            categoryToDuplicate.name
          );
          const uniqueUrl = categoryToDuplicate.url
            ? generateUniqueCategoryUrl(categoryToDuplicate.url)
            : undefined;

          const categoryData = {
            name: uniqueName,
            icon: categoryToDuplicate.icon,
            url: uniqueUrl,
            description: categoryToDuplicate.description,
          };
          await createCategory(categoryData);
          duplicatedCount++;
        }
      }

      // Show success message
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "success",
          message: t("categoryDuplicatedSuccessfullyMessage", {
            count: duplicatedCount,
            plural: duplicatedCount !== 1 ? "ies" : "y",
          }),
        },
      });
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: t("categoryDuplicationErrorMessage", {error}),
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  /* Handles bulk deletion of selected categories */
  async function handleDelete() {
    if (selectedCategories.length === 0) return;

    // Close modal immediately when Accept is clicked
    dispatch({type: "SET_DANGER_MODAL", payload: false});

    dispatch({type: "SET_SUBMITTING", payload: true});
    try {
      // Store the IDs of successfully deleted categories
      const deletedIds = [];

      // Delete each selected category
      for (const categoryId of selectedCategories) {
        const res = await deleteCategory(categoryId);
        if (res) {
          deletedIds.push(categoryId);
        }
      }

      // Clear all successfully deleted items from selection at once
      handleCategoryToggleSelection(deletedIds, false);

      // If we're on a page that might be empty after deletion, go back one page
      const remainingItems =
        state.filteredCategories.length - deletedIds.length;
      const currentPageItems = state.itemsPerPage;
      if (
        state.currentPage > 1 &&
        remainingItems <= (state.currentPage - 1) * currentPageItems
      ) {
        dispatch({type: "SET_CURRENT_PAGE", payload: state.currentPage - 1});
      }

      // Show success message
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "success",
          message: t("categoryDeletedSuccessfullyMessage", {
            count: deletedIds.length,
            plural: deletedIds.length !== 1 ? "ies" : "y",
          }),
        },
      });
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: t("categoryDeleteErrorMessage", {error}),
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={state.sidebarOpen}
        setSidebarOpen={(open) =>
          dispatch({type: "SET_SIDEBAR_OPEN", payload: open})
        }
      />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header
          sidebarOpen={state.sidebarOpen}
          setSidebarOpen={(open) =>
            dispatch({type: "SET_SIDEBAR_OPEN", payload: open})
          }
        />

        {/* Banner */}
        <div className="fixed right-0 w-auto sm:w-full z-50">
          <Banner
            type={state.bannerType}
            open={state.bannerOpen}
            setOpen={(open) =>
              dispatch({
                type: "SET_BANNER",
                payload: {
                  open,
                  type: state.bannerType,
                  message: state.bannerMessage,
                },
              })
            }
            className={`transition-opacity duration-600 ${
              state.bannerOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {state.bannerMessage}
          </Banner>
        </div>

        {/* Danger Modal */}
        <div className="m-1.5">
          <ModalBlank
            id="danger-modal"
            modalOpen={state.dangerModalOpen}
            setModalOpen={(open) =>
              dispatch({type: "SET_DANGER_MODAL", payload: open})
            }
          >
            <div className="p-5 flex space-x-4">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-700">
                <svg
                  className="shrink-0 fill-current text-red-500"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
                </svg>
              </div>
              {/* Content */}
              <div>
                {/* Modal header */}
                <div className="mb-2">
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Delete {selectedCategories.length} categor
                    {selectedCategories.length !== 1 ? "ies" : "y"}?
                  </div>
                </div>
                {/* Modal content */}
                <div className="text-sm mb-10">
                  <div className="space-y-2">
                    <p>
                      {t("categoryDeleteConfirmationMessage", {
                        count: selectedCategories.length,
                        plural: selectedCategories.length !== 1 ? "ies" : "y",
                      })}{" "}
                      {t("actionCantBeUndone")}
                    </p>
                  </div>
                </div>
                {/* Modal footer */}
                <div className="flex flex-wrap justify-end space-x-2">
                  <button
                    className="btn-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({type: "SET_DANGER_MODAL", payload: false});
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-sm bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleDelete}
                    disabled={state.isSubmitting}
                  >
                    {state.isSubmitting ? "Deleting..." : "Accept"}
                  </button>
                </div>
              </div>
            </div>
          </ModalBlank>
        </div>

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {t("categories")}
                </h1>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Filter button */}
                {selectedCategories.length > 0 && (
                  <DropdownButton
                    align="right"
                    onDelete={handleDeleteClick}
                    onDuplicate={handleDuplicate}
                  />
                )}

                {/* Add Category button */}
                <button
                  className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                  onClick={handleNewCategory}
                >
                  <svg
                    className="fill-current shrink-0 xs:hidden"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="max-xs:sr-only">{t("addCategory")}</span>
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  className="form-input w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 focus:border-gray-300 dark:focus:border-gray-600 rounded-lg shadow-sm"
                  placeholder={t("searchCategoriesPlaceholder")}
                  value={state.searchTerm}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SEARCH_TERM",
                      payload: e.target.value,
                    })
                  }
                />
                <div className="absolute inset-0 flex items-center pointer-events-none pl-3">
                  <svg
                    className="shrink-0 fill-current text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 ml-1 mr-2"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                    <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <CategoriesTable
              categories={state.filteredCategories}
              onToggleSelect={handleCategoryToggleSelection}
              selectedItems={selectedCategories}
              totalCategories={state.filteredCategories?.length || 0}
              currentPage={state.currentPage}
              itemsPerPage={state.itemsPerPage}
              onCategoryClick={handleCategoryClick}
              sortConfig={categorySortConfig}
              onSort={handleCategorySort}
            />

            {/* Pagination */}
            {state.filteredCategories?.length > 0 && (
              <div className="mt-8">
                <PaginationClassic
                  currentPage={state.currentPage}
                  totalItems={state.filteredCategories.length}
                  itemsPerPage={state.itemsPerPage}
                  onPageChange={(page) =>
                    dispatch({type: "SET_CURRENT_PAGE", payload: page})
                  }
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CategoriesList;
