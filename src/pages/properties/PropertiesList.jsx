import React, {
  useEffect,
  useMemo,
  useReducer,
  useState,
  useContext,
} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import PaginationClassic from "../../components/PaginationClassic";
import DataTable from "../../components/DataTable";
import DataTableItem from "../../components/DataTableItem";
import ModalBlank from "../../components/ModalBlank";
import Banner from "../../partials/containers/Banner";
import ListDropdown from "../../partials/buttons/ListDropdown";
import useCurrentDb from "../../hooks/useCurrentDb";
import propertyContext from "../../context/PropertyContext";

const PAGE_STORAGE_KEY = "properties_list_page";

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

const getHealthColor = (value) => {
  if (value >= 75) return "#22c55e";
  if (value >= 40) return "#eab308";
  if (value >= 25) return "red";
  return "#ef4444";
};

const HealthBar = ({value}) => (
  <div className="flex items-center gap-3">
    <div className="w-32 h-2 rounded-full bg-gray-200 dark:bg-gray-700/60">
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{width: `${value}%`, backgroundColor: getHealthColor(value)}}
      ></div>
    </div>
    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
      {value}%
    </span>
  </div>
);

function PropertiesList() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {currentDb} = useCurrentDb();
  const dbUrl = currentDb?.url || currentDb?.name || "";
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "passport_id",
    direction: "asc",
  });

  const [state, dispatch] = useReducer(reducer, initialState, (baseState) => ({
    ...baseState,
    currentPage:
      Number(localStorage.getItem(PAGE_STORAGE_KEY)) || baseState.currentPage,
  }));

  const {properties, setProperties} = useContext(propertyContext);

  useEffect(() => {
    localStorage.setItem(PAGE_STORAGE_KEY, state.currentPage);
  }, [state.currentPage]);

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

  const filteredProperties = useMemo(() => {
    if (!state.searchTerm) return properties;
    const term = state.searchTerm.toLowerCase();
    return properties.filter((property) => {
      return (
        property.passport_id.toLowerCase().includes(term) ||
        property.address.toLowerCase().includes(term) ||
        property.city.toLowerCase().includes(term) ||
        property.state.toLowerCase().includes(term)
      );
    });
  }, [properties, state.searchTerm]);

  const sortedProperties = useMemo(() => {
    const sortable = [...filteredProperties];
    sortable.sort((a, b) => {
      const {key, direction} = sortConfig;
      const dirMultiplier = direction === "asc" ? 1 : -1;

      const valueA = a[key];
      const valueB = b[key];

      if (valueA === valueB) return 0;

      if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB) * dirMultiplier;
      }
      return (valueA > valueB ? 1 : -1) * dirMultiplier;
    });
    return sortable;
  }, [filteredProperties, sortConfig]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    return sortedProperties.slice(startIndex, startIndex + state.itemsPerPage);
  }, [sortedProperties, state.currentPage, state.itemsPerPage]);

  const handleSearchChange = (event) => {
    dispatch({type: "SET_SEARCH_TERM", payload: event.target.value});
    dispatch({type: "SET_CURRENT_PAGE", payload: 1});
  };

  const handleItemsPerPageChange = (value) => {
    dispatch({type: "SET_ITEMS_PER_PAGE", payload: Number(value)});
    dispatch({type: "SET_CURRENT_PAGE", payload: 1});
  };

  const handlePageChange = (page) => {
    dispatch({type: "SET_CURRENT_PAGE", payload: page});
  };

  const handleNewProperty = () => navigate(`/${dbUrl}/properties/new`);
  const handlePropertyClick = (property) => {
    const propertyIndex = sortedProperties.findIndex(
      (p) => (p.property_uid ?? p.id) === property.property_uid,
    );
    navigate(`/${dbUrl}/properties/${property.property_uid}`, {
      state: {
        currentIndex: propertyIndex + 1,
        totalItems: sortedProperties.length,
        visiblePropertyIds: sortedProperties.map((p) => p.property_uid ?? p.id),
      },
    });
  };

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
        const merged = new Set(selectedProperties);
        ids.forEach((id) => merged.add(id));
        setSelectedProperties(Array.from(merged));
      } else {
        setSelectedProperties((prev) => prev.filter((id) => !ids.includes(id)));
      }
      return;
    }

    setSelectedProperties((prev) =>
      prev.includes(ids) ? prev.filter((id) => id !== ids) : [...prev, ids],
    );
  };

  const columns = [
    {key: "passport_id", label: "Passport ID", sortable: true},
    {key: "address", label: "address", sortable: true},
    {key: "city", label: "city", sortable: true},
    {key: "state", label: "state", sortable: true},
    {
      key: "health",
      label: "healthStatus",
      sortable: true,
      render: (value) => <HealthBar value={value} />,
    },
  ];

  const renderPropertyRow = (
    item,
    handleSelect,
    selectedItems,
    onItemClick,
  ) => (
    <DataTableItem
      item={item}
      columns={columns}
      onSelect={handleSelect}
      isSelected={selectedItems.includes(item.id)}
      onItemClick={() => onItemClick(item)}
    />
  );

  const allSelected =
    paginatedProperties.length > 0 &&
    paginatedProperties.every((property) =>
      selectedProperties.includes(property.id),
    );

  function handleDeleteClick() {
    if (selectedProperties.length === 0) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: t("selectItemsToDelete", {
            defaultValue: "Please select at least one property to delete",
          }),
        },
      });
      return;
    }
    dispatch({type: "SET_DANGER_MODAL", payload: true});
  }

  async function handleDuplicate() {
    if (selectedProperties.length === 0) return;

    dispatch({type: "SET_SUBMITTING", payload: true});
    try {
      const timestamp = Date.now();
      const duplicatedProperties = selectedProperties
        .map((id, index) => {
          const original = properties.find((property) => property.id === id);
          if (!original) return null;
          return {
            ...original,
            id: `${original.id}-COPY-${timestamp + index}`,
          };
        })
        .filter(Boolean);

      if (duplicatedProperties.length === 0) {
        throw new Error("No properties duplicated");
      }

      setProperties((prev) => [...duplicatedProperties, ...prev]);
      const duplicateCount = duplicatedProperties.length;
      const pluralized = duplicateCount === 1 ? "property" : "properties";
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "success",
          message: `${duplicateCount} ${pluralized} duplicated successfully`,
        },
      });
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message:
            error?.message || "Error duplicating properties. Please try again.",
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  async function handleDelete() {
    if (selectedProperties.length === 0) return;

    dispatch({type: "SET_DANGER_MODAL", payload: false});
    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const deletedIds = [...selectedProperties];
      setProperties((prev) =>
        prev.filter((property) => !deletedIds.includes(property.id)),
      );
      setSelectedProperties((prev) =>
        prev.filter((id) => !deletedIds.includes(id)),
      );

      const remainingItems = sortedProperties.length - deletedIds.length;
      if (
        state.currentPage > 1 &&
        remainingItems <= (state.currentPage - 1) * state.itemsPerPage
      ) {
        dispatch({type: "SET_CURRENT_PAGE", payload: state.currentPage - 1});
      }

      const deletedCount = deletedIds.length;
      const pluralized = deletedCount === 1 ? "property" : "properties";
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "success",
          message: `${deletedCount} ${pluralized} deleted successfully`,
        },
      });
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: "Error deleting properties. Please try again.",
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

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
            id="property-danger-modal"
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
                    Delete {selectedProperties.length}{" "}
                    {selectedProperties.length === 1
                      ? "property"
                      : "properties"}
                    ?
                  </div>
                </div>
                <div className="text-sm mb-10">
                  <div className="space-y-2">
                    <p>
                      {t("propertyDeleteConfirmationMessage", {
                        count: selectedProperties.length,
                        defaultValue:
                          selectedProperties.length === 1
                            ? "Are you sure you want to delete the selected property?"
                            : "Are you sure you want to delete the selected properties?",
                      })}{" "}
                      {t("actionCantBeUndone")}
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
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {t("properties")}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max gap-2">
                {selectedProperties.length > 0 && (
                  <ListDropdown
                    align="right"
                    onDelete={handleDeleteClick}
                    onDuplicate={handleDuplicate}
                  />
                )}
                <button
                  className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                  onClick={handleNewProperty}
                >
                  <svg
                    className="fill-current shrink-0 xs:hidden"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="max-xs:sr-only">{t("addProperty")}</span>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  className="form-input w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 focus:border-gray-300 dark:focus:border-gray-600 rounded-lg shadow-sm"
                  placeholder={t("searchPropertiesPlaceholder")}
                  value={state.searchTerm}
                  onChange={handleSearchChange}
                />
                <div className="absolute inset-0 flex items-center pointer-events-none pl-3">
                  <svg
                    className="shrink-0 fill-current text-gray-400 dark:text-gray-500 ml-1 mr-2"
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

            <DataTable
              items={paginatedProperties}
              columns={columns}
              onItemClick={handlePropertyClick}
              onSelect={handleToggleSelect}
              selectedItems={selectedProperties}
              totalItems={sortedProperties.length}
              title="properties"
              sortConfig={sortConfig}
              onSort={handleSort}
              renderItem={renderPropertyRow}
              allSelected={allSelected}
            />

            {sortedProperties.length > 0 && (
              <div className="mt-8">
                <PaginationClassic
                  currentPage={state.currentPage}
                  totalItems={sortedProperties.length}
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

export default PropertiesList;
