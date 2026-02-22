import React, {useCallback, useMemo, useReducer, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {ChevronRight, ChevronDown, Layers, Tag} from "lucide-react";

import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import PaginationClassic from "../../../components/PaginationClassic";
import DataTable from "../../../components/DataTable";
import ModalBlank from "../../../components/ModalBlank";
import Banner from "../../../partials/containers/Banner";
import useCurrentDb from "../../../hooks/useCurrentDb";

import {CATEGORY_HIERARCHY, CATEGORIES_FLAT} from "./categoryData";

const PAGE_STORAGE_KEY = "categories_list_page";

const initialState = {
  currentPage: 1,
  itemsPerPage: 10,
  searchTerm: "",
  sidebarOpen: false,
  isSubmitting: false,
  dangerModalOpen: false,
  bannerOpen: false,
  bannerType: "success",
  bannerMessage: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_CURRENT_PAGE":
      return {...state, currentPage: action.payload};
    case "SET_ITEMS_PER_PAGE":
      return {...state, itemsPerPage: action.payload};
    case "SET_SEARCH_TERM":
      return {...state, searchTerm: action.payload};
    case "SET_SIDEBAR_OPEN":
      return {...state, sidebarOpen: action.payload};
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
    default:
      return state;
  }
}

/* ─── Tiny badge component ────────────────────────────────────── */

const TypeBadge = ({type}) => {
  const isParent = type === "parent";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isParent
          ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20"
          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
      }`}
    >
      {isParent ? (
        <Layers className="w-3 h-3" />
      ) : (
        <Tag className="w-3 h-3" />
      )}
      {isParent ? "Parent" : "Subcategory"}
    </span>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */

function CategoriesList() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {currentDb} = useCurrentDb();
  const dbUrl = currentDb?.url || currentDb?.name || "";
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState(
    () => CATEGORY_HIERARCHY.map((g) => g.id),
  );
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const [state, dispatch] = useReducer(reducer, initialState, (base) => ({
    ...base,
    currentPage:
      Number(localStorage.getItem(PAGE_STORAGE_KEY)) || base.currentPage,
  }));

  /* ─── Build grouped data (parent → children) ─────────────── */

  const {groupedData, flatFiltered} = useMemo(() => {
    const term = (state.searchTerm || "").toLowerCase();
    const groups = {};
    const flat = [];

    for (const parent of CATEGORY_HIERARCHY) {
      const matchingChildren = (parent.children ?? [])
        .filter((child) => {
          if (!term) return true;
          return (
            child.name.toLowerCase().includes(term) ||
            child.description.toLowerCase().includes(term)
          );
        })
        .map((child) => ({
          ...child,
          id: child.id,
          parentId: parent.id,
          parentName: parent.name,
          type: "child",
          childCount: 0,
        }));

      const parentMatches =
        !term ||
        parent.name.toLowerCase().includes(term) ||
        parent.description.toLowerCase().includes(term);

      if (parentMatches || matchingChildren.length > 0) {
        const children = parentMatches
          ? (parent.children ?? []).map((child) => ({
              ...child,
              id: child.id,
              parentId: parent.id,
              parentName: parent.name,
              type: "child",
              childCount: 0,
            }))
          : matchingChildren;

        const totalPros = children.reduce(
          (sum, c) => sum + (c.proCount ?? 0),
          0,
        );

        const parentRow = {
          id: parent.id,
          name: parent.name,
          description: parent.description,
          icon: parent.icon,
          parentId: null,
          parentName: null,
          type: "parent",
          proCount: totalPros,
          childCount: children.length,
        };

        groups[parent.id] = children;
        flat.push(parentRow);
        flat.push(...children);
      }
    }

    return {groupedData: groups, flatFiltered: flat};
  }, [state.searchTerm]);

  const totalItems = flatFiltered.length;

  /* ─── Handlers ─────────────────────────────────────────────── */

  const handleSearchChange = (e) => {
    dispatch({type: "SET_SEARCH_TERM", payload: e.target.value});
    dispatch({type: "SET_CURRENT_PAGE", payload: 1});
  };

  const handleItemsPerPageChange = (value) => {
    dispatch({type: "SET_ITEMS_PER_PAGE", payload: Number(value)});
    dispatch({type: "SET_CURRENT_PAGE", payload: 1});
  };

  const handlePageChange = (page) => {
    dispatch({type: "SET_CURRENT_PAGE", payload: page});
  };

  const handleNewCategory = () =>
    navigate(`/${dbUrl}/professionals/categories/new`);

  const handleCategoryClick = useCallback(
    (item) => {
      navigate(`/${dbUrl}/professionals/categories/${item.id}`);
    },
    [navigate, dbUrl],
  );

  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return {key: columnKey, direction: "asc"};
    });
  };

  const handleToggleSelect = (ids, shouldSelect = null) => {
    if (Array.isArray(ids)) {
      if (shouldSelect) {
        const merged = new Set(selectedItems);
        ids.forEach((id) => merged.add(id));
        setSelectedItems(Array.from(merged));
      } else {
        setSelectedItems((prev) => prev.filter((id) => !ids.includes(id)));
      }
      return;
    }
    setSelectedItems((prev) =>
      prev.includes(ids) ? prev.filter((id) => id !== ids) : [...prev, ids],
    );
  };

  const handleGroupExpand = useCallback((groupId) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  }, []);

  const handleDeleteClick = () => {
    if (selectedItems.length === 0) {
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
  };

  const handleDelete = () => {
    dispatch({type: "SET_DANGER_MODAL", payload: false});
    const n = selectedItems.length;
    setSelectedItems([]);
    dispatch({
      type: "SET_BANNER",
      payload: {
        open: true,
        type: "success",
        message: `${n} ${n === 1 ? "category" : "categories"} deleted successfully`,
      },
    });
  };

  /* ─── Table columns ────────────────────────────────────────── */

  const columns = [
    {
      key: "name",
      label: "name",
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          {item.type === "child" && (
            <span className="w-4 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 h-3 ml-2 rounded-bl-sm" />
          )}
          <span
            className={`font-medium ${
              item.type === "parent"
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      label: "type",
      sortable: true,
      render: (value) => <TypeBadge type={value} />,
    },
    {
      key: "parentName",
      label: "parentCategory",
      sortable: true,
      render: (value) =>
        value ? (
          <span className="text-gray-600 dark:text-gray-400">{value}</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">—</span>
        ),
    },
    {
      key: "childCount",
      label: "subcategories",
      sortable: true,
      render: (value, item) =>
        item.type === "parent" ? (
          <span className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {value}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">—</span>
        ),
    },
    {
      key: "proCount",
      label: "professionals",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value.toLocaleString()}
        </span>
      ),
    },
  ];

  /* ─── Collapsible group header renderer ────────────────────── */

  const renderGroupHeader = useCallback(
    (groupId, groupItems, isExpanded, onExpand) => {
      const parent = CATEGORY_HIERARCHY.find((g) => g.id === groupId);
      if (!parent) return null;
      const totalPros = groupItems.reduce(
        (sum, c) => sum + (c.proCount ?? 0),
        0,
      );

      return (
        <tr
          key={`group-${groupId}`}
          className="bg-gray-50 dark:bg-gray-700/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          onClick={() => onExpand(groupId)}
        >
          <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
            <div className="flex items-center">
              <label className="inline-flex">
                <span className="sr-only">Select</span>
                <input
                  className="form-checkbox"
                  type="checkbox"
                  checked={selectedItems.includes(groupId)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggleSelect(groupId);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </label>
            </div>
          </td>
          <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {parent.name}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({groupItems.length} subcategories)
              </span>
            </div>
          </td>
          <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
            <TypeBadge type="parent" />
          </td>
          <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
            <span className="text-gray-400 dark:text-gray-500">—</span>
          </td>
          <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
            <span className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {groupItems.length}
            </span>
          </td>
          <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalPros.toLocaleString()}
            </span>
          </td>
        </tr>
      );
    },
    [selectedItems],
  );

  /* ─── Child row renderer ───────────────────────────────────── */

  const renderItem = useCallback(
    (item, handleSelect, selectedItemsList, onItemClick) => (
      <>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
          <div className="flex items-center">
            <label className="inline-flex">
              <span className="sr-only">Select</span>
              <input
                className="form-checkbox"
                type="checkbox"
                checked={selectedItemsList.includes(item.id)}
                onChange={() => handleSelect(item.id)}
              />
            </label>
          </div>
        </td>
        <td
          className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
          onClick={() => onItemClick(item)}
        >
          <div className="flex items-center gap-2 pl-6">
            <span className="w-4 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 h-3 rounded-bl-sm" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {item.name}
            </span>
          </div>
        </td>
        <td
          className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
          onClick={() => onItemClick(item)}
        >
          <TypeBadge type="child" />
        </td>
        <td
          className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
          onClick={() => onItemClick(item)}
        >
          <span className="text-gray-600 dark:text-gray-400">
            {item.parentName}
          </span>
        </td>
        <td
          className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
          onClick={() => onItemClick(item)}
        >
          <span className="text-gray-400 dark:text-gray-500">—</span>
        </td>
        <td
          className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
          onClick={() => onItemClick(item)}
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {(item.proCount ?? 0).toLocaleString()}
          </span>
        </td>
      </>
    ),
    [],
  );

  /* ─── Compute allSelected for current page ─────────────────── */

  const allChildItems = useMemo(() => {
    const items = [];
    for (const groupId of Object.keys(groupedData)) {
      if (expandedGroups.includes(groupId)) {
        items.push(...groupedData[groupId]);
      }
    }
    return items;
  }, [groupedData, expandedGroups]);

  const allSelected =
    allChildItems.length > 0 &&
    allChildItems.every((item) => selectedItems.includes(item.id));

  /* ─── Render ───────────────────────────────────────────────── */

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar
        sidebarOpen={state.sidebarOpen}
        setSidebarOpen={(open) =>
          dispatch({type: "SET_SIDEBAR_OPEN", payload: open})
        }
      />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header
          sidebarOpen={state.sidebarOpen}
          setSidebarOpen={(open) =>
            dispatch({type: "SET_SIDEBAR_OPEN", payload: open})
          }
        />

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

        <div className="m-1.5">
          <ModalBlank
            id="category-danger-modal"
            modalOpen={state.dangerModalOpen}
            setModalOpen={(open) =>
              dispatch({type: "SET_DANGER_MODAL", payload: open})
            }
          >
            <div className="p-5 flex space-x-4">
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
              <div>
                <div className="mb-2">
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Delete {selectedItems.length}{" "}
                    {selectedItems.length === 1 ? "category" : "categories"}?
                  </div>
                </div>
                <div className="text-sm mb-10">
                  <div className="space-y-2">
                    <p>
                      Are you sure you want to delete the selected{" "}
                      {selectedItems.length === 1
                        ? "category"
                        : "categories"}
                      ? This action cannot be undone.
                    </p>
                  </div>
                </div>
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
            {/* ─── Header row ─────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-5">
              <div>
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  Professional Categories
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage parent and subcategories for the Professionals
                  Directory
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <button
                    className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-red-500"
                    onClick={handleDeleteClick}
                  >
                    <svg
                      className="shrink-0 fill-current mr-1"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                    >
                      <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zm-7 0v1h4V1H5zm6 4H3v9h8V5z" />
                    </svg>
                    <span>{t("delete")}</span>
                  </button>
                )}
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
                  <span className="max-xs:sr-only">Add Category</span>
                </button>
              </div>
            </div>

            {/* ─── Search ────────────────────────────────────── */}
            <div className="mb-5">
              <div className="relative flex-1 min-w-0 max-w-md">
                <input
                  type="text"
                  className="form-input w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 focus:border-gray-300 dark:focus:border-gray-600 rounded-lg shadow-sm text-sm"
                  placeholder="Search categories..."
                  value={state.searchTerm}
                  onChange={handleSearchChange}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                  <svg
                    className="shrink-0 fill-current text-gray-400 dark:text-gray-500 ml-1"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                    <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ─── Data Table ────────────────────────────────── */}
            <DataTable
              items={allChildItems}
              columns={columns}
              onItemClick={handleCategoryClick}
              onSelect={handleToggleSelect}
              selectedItems={selectedItems}
              totalItems={totalItems}
              title="categories"
              sortConfig={sortConfig}
              onSort={handleSort}
              isCollapsible
              groupBy={groupedData}
              expandedGroups={expandedGroups}
              onGroupExpand={handleGroupExpand}
              renderGroupHeader={renderGroupHeader}
              renderItem={renderItem}
              allSelected={allSelected}
            />

            {totalItems > 0 && (
              <div className="mt-8">
                <PaginationClassic
                  currentPage={state.currentPage}
                  totalItems={totalItems}
                  itemsPerPage={state.itemsPerPage}
                  onPageChange={handlePageChange}
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
