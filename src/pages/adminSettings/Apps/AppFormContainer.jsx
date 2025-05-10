import React, {useReducer, useEffect, useContext} from "react";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {AlertCircle} from "lucide-react";
import {icons} from "../../../assets/icons";
import appContext from "../../../context/AppContext";
import Banner from "../../../partials/containers/Banner";
import ModalBlank from "../../../components/ModalBlank";
import {useTranslation} from "react-i18next";
import DropdownFilter from "../../../components/DropdownFilter";
import {useAutoCloseBanner} from "../../../hooks/useAutoCloseBanner";

const initialFormData = {
  name: "",
  category: "",
  url: "",
  description: "",
  icon: "",
};

/* Tabs */
const tabs = [{id: 1, label: "General"}];

// Categories for the dropdown
// const categories = [
//   {id: 1, name: "Inventory"},
//   {id: 2, name: "Productivity"},
// ];

const initialState = {
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  appToEdit: null,
  activeTab: 1,
  isEditing: false,
  bannerOpen: false,
  dangerModalOpen: false,
  currentAppIndex: 0,
  bannerType: "success",
  bannerAction: "",
  bannerMessage: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {...state, formData: {...state.formData, ...action.payload}};
    case "SET_ERRORS":
      return {...state, errors: action.payload};
    case "SET_SUBMITTING":
      return {...state, isSubmitting: action.payload};
    case "SET_APP_TO_EDIT":
      return {...state, appToEdit: action.payload, isEditing: !!action.payload};
    case "SET_ACTIVE_TAB":
      return {...state, activeTab: action.payload};
    case "SET_BANNER":
      return {
        ...state,
        bannerOpen: action.payload.open,
        bannerType: action.payload.type,
        bannerMessage: action.payload.message,
      };
    case "SET_DANGER_MODAL":
      return {...state, dangerModalOpen: action.payload};
    case "SET_CURRENT_APP_INDEX":
      return {...state, currentAppIndex: action.payload};
    default:
      return state;
  }
}

/** Form for Creating/Editing an app
 *
 * Props: None
 *
 * State:
 * - formData: Object {}
 * - errors: {}
 * - isSubmitting: true/false
 * - appToEdit: null/{}
 * - activeTab: Number
 * - isEditing: true/false
 *
 * App -> AppFormContainer
 **/
function AppFormContainer() {
  const {
    createApp,
    updateApp,
    deleteApp,
    apps,
    viewMode,
    sortedItems,
    duplicateApp,
    categories,
    getCurrentViewApps,
  } = useContext(appContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {id} = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {t, i18n} = useTranslation();

  // Fetch appToEdit based on URL's app id
  useEffect(() => {
    async function fetchApp() {
      if (id && id !== "new") {
        try {
          const currentViewApps = getCurrentViewApps();
          const existingApp = currentViewApps.find(
            (app) => Number(app.id) === Number(id)
          );
          if (existingApp) {
            dispatch({type: "SET_APP_TO_EDIT", payload: existingApp});
            // Only clear banner if it's not a success message from app creation
            if (
              state.bannerType !== "success" ||
              !state.bannerMessage.includes(t("appCreatedSuccessfullyMessage"))
            ) {
              dispatch({
                type: "SET_BANNER",
                payload: {
                  open: false,
                  type: state.bannerType,
                  message: state.bannerMessage,
                },
              });
            }
          } else {
            // navigate("/admin/apps");
            throw new Error(t("appNotFoundErrorMessage"));
          }
        } catch (err) {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "error",
              message: `Error finding app: ${err}`,
            },
          });
          // navigate("/admin/apps");
        }
      } else {
        dispatch({type: "SET_APP_TO_EDIT", payload: null});
      }
    }
    fetchApp();
  }, [id, apps, viewMode]);

  // Replace the banner timeout useEffect with the custom hook
  useAutoCloseBanner(state.bannerOpen, state.bannerMessage, () =>
    dispatch({
      type: "SET_BANNER",
      payload: {
        open: false,
        type: state.bannerType,
        message: state.bannerMessage,
      },
    })
  );

  // Populate form data when in edit mode
  useEffect(() => {
    if (state.isEditing && state.appToEdit) {
      dispatch({
        type: "SET_FORM_DATA",
        payload: {
          name: state.appToEdit.name,
          category: state.appToEdit.category_id,
          url: state.appToEdit.url,
          description: state.appToEdit.description,
          icon: state.appToEdit.icon,
        },
      });
    } else {
      dispatch({type: "SET_FORM_DATA", payload: initialFormData});
    }
  }, [state.isEditing, state.appToEdit]);

  // Update current app index when appToEdit changes or location state changes
  useEffect(() => {
    if (state.appToEdit) {
      // If we have location state with index information, use that
      if (location.state?.currentIndex !== undefined) {
        dispatch({
          type: "SET_CURRENT_APP_INDEX",
          payload: location.state.currentIndex - 1, // Convert back to 0-based index
        });
      } else {
        // Otherwise fall back to finding index in the current view's app list
        const currentViewApps = getCurrentViewApps();
        const index = currentViewApps.findIndex(
          (app) => Number(app.id) === Number(state.appToEdit.id)
        );
        dispatch({type: "SET_CURRENT_APP_INDEX", payload: index});
      }
    }
  }, [state.appToEdit, viewMode, location.state]);

  /* Handles form change (except icon) */
  const handleChange = (e) => {
    const {id, value} = e.target;
    dispatch({type: "SET_FORM_DATA", payload: {[id]: value}});

    // Clear error when field is being edited
    if (state.errors[id]) {
      dispatch({type: "SET_ERRORS", payload: {...state.errors, [id]: null}});
    }
  };

  /* Handles Icon change */
  function handleIconSelection(evt) {
    const selectedIcon = evt.target.value;
    dispatch({type: "SET_FORM_DATA", payload: {icon: selectedIcon}});

    if (state.errors.icon) {
      dispatch({type: "SET_ERRORS", payload: {...state.errors, icon: null}});
    }
  }

  /* Handles submit button */
  async function handleSubmit(evt) {
    evt.preventDefault();

    if (!validateForm()) return;

    const appData = {
      name: state.formData.name,
      icon: state.formData.icon,
      url: state.formData.url,
      category_id: Number(state.formData.category),
      description: state.formData.description,
    };

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const res = await createApp(appData);

      if (res && res.id) {
        // Update state with new app
        onCreate(res);

        // Navigate to the new app
        navigate(`/admin/apps/${res.id}`);

        // Show success banner
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "success",
            message: t("appCreatedSuccessfullyMessage"),
          },
        });
      }
    } catch (err) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error creating app: ${err}`,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  /* Handles update button */
  async function handleUpdate(evt) {
    evt.preventDefault();

    if (!validateForm()) return;

    const appData = {
      name: state.formData.name,
      icon: state.formData.icon,
      url: state.formData.url,
      category_id: Number(state.formData.category),
      description: state.formData.description,
    };

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const res = await updateApp(id, appData);
      if (res) {
        // Update the appToEdit with the new data while maintaining the id
        dispatch({
          type: "SET_APP_TO_EDIT",
          payload: {...appData, id: Number(id)},
        });

        // Show success banner with a slight delay to ensure it's visible
        setTimeout(() => {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "success",
              message: t("appUpdatedSuccessfullyMessage"),
            },
          });
        }, 100);
      }
    } catch (err) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `${t("updateErrorMessage")} ${err}`,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  /* Validation Errors */
  const validateForm = () => {
    const newErrors = {};

    if (!state.formData.name.trim()) {
      newErrors.name = t("appNameValidationErrorMessage");
    }

    if (!state.formData.category) {
      newErrors.category = t("categoryValidationErrorMessage");
    }

    if (!state.formData.url) {
      newErrors.url = t("urlValidationErrorMessage");
    }

    if (!state.formData.description.trim()) {
      newErrors.description = t("descriptionValidationErrorMessage");
    }

    // Only require icon if creating a new app
    if (state.formData.icon === "") {
      newErrors.icon = t("iconValidationErrorMessage");
    }

    dispatch({type: "SET_ERRORS", payload: newErrors});
    return Object.keys(newErrors).length === 0;
  };

  /* Navigates to previous page */
  function handleBackClick() {
    navigate(`/admin/apps`);
  }

  /* If editing an app -> return the app's name
  If new -> return 'New App' */
  function getPageTitle() {
    if (state.appToEdit) {
      return `${state.appToEdit.name}`;
    }
    return t("newApp");
  }

  /* Resets appToEdit upon selecting new app button */
  function onCreate(newApp) {
    dispatch({type: "SET_APP_TO_EDIT", payload: newApp});
  }

  /* Changes active tab */
  function handleTabChange(tabId) {
    dispatch({type: "SET_ACTIVE_TAB", payload: tabId});
  }

  /* Handles New App button click */
  function handleNewApp() {
    dispatch({type: "SET_APP_TO_EDIT", payload: null});
    dispatch({type: "SET_FORM_DATA", payload: initialFormData});
    dispatch({type: "SET_ERRORS", payload: {}});
  }

  /* Handles delete button */
  function handleDelete() {
    dispatch({type: "SET_DANGER_MODAL", payload: true});
  }

  /* Handles delete confirmation on modal */
  async function confirmDelete() {
    try {
      // Close modal immediately when Accept is clicked
      dispatch({type: "SET_DANGER_MODAL", payload: false});

      // Find the current app index in the apps list
      const appIndex = apps.findIndex((app) => app.id === Number(id));

      // Delete the app
      await deleteApp(id);

      // Navigate based on remaining apps
      if (apps.length <= 1) {
        // If this was the last app, go to apps list
        navigate(`/admin/apps`);
      } else if (appIndex === apps.length - 1) {
        // If this was the last app in the list, go to previous app
        navigate(`/admin/apps/${apps[appIndex - 1].id}`);
      } else {
        // Otherwise go to next app
        navigate(`/admin/apps/${apps[appIndex + 1].id}`);
      }

      // Then show banner
      setTimeout(() => {
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "success",
            message: t("appDeletedSuccessfullyMessage"),
          },
        });
      }, 100);
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error deleting app: ${error}`,
        },
      });
    }
  }

  /* Handles app duplication */
  async function handleDuplicateApp() {
    if (!state.appToEdit) return;

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const res = await duplicateApp(state.appToEdit);

      if (res && res.id) {
        // Navigate first
        navigate(`/admin/apps/${res.id}`);

        // Then show banner
        setTimeout(() => {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "success",
              message: t("appDuplicatedSuccessfullyMessage"),
            },
          });
        }, 100);
      }
    } catch (err) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `${t("appDuplicationErrorMessage")} ${err} `,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  // Navigation handlers
  const handlePrevApp = () => {
    if (location.state?.visibleAppIds && location.state.currentIndex > 1) {
      // Use the visible apps order from location state
      const prevIndex = location.state.currentIndex - 2; // Convert to 0-based index
      const prevAppId = location.state.visibleAppIds[prevIndex];
      navigate(`/admin/apps/${prevAppId}`, {
        state: {
          ...location.state,
          currentIndex: location.state.currentIndex - 1,
        },
      });
    } else if (state.currentAppIndex > 0) {
      // Fall back to current view's app list
      const currentViewApps = getCurrentViewApps();
      const prevApp = currentViewApps[state.currentAppIndex - 1];
      navigate(`/admin/apps/${prevApp.id}`);
    }
  };

  /*  */
  const handleNextApp = () => {
    if (
      location.state?.visibleAppIds &&
      location.state.currentIndex < location.state.totalItems
    ) {
      // Use the visible apps order from location state
      const nextIndex = location.state.currentIndex; // Already 0-based index for next item
      const nextAppId = location.state.visibleAppIds[nextIndex];
      navigate(`/admin/apps/${nextAppId}`, {
        state: {
          ...location.state,
          currentIndex: location.state.currentIndex + 1,
        },
      });
    } else if (state.currentAppIndex < getCurrentViewApps().length - 1) {
      // Fall back to current view's app list
      const currentViewApps = getCurrentViewApps();
      const nextApp = currentViewApps[state.currentAppIndex + 1];
      navigate(`/admin/apps/${nextApp.id}`);
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-18 right-0 w-auto sm:w-full z-50">
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
          className="transition-opacity duration-300"
        >
          {state.bannerMessage}
        </Banner>
      </div>

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
                  {state.appToEdit
                    ? `Delete ${state.appToEdit.name}?`
                    : "Delete App?"}
                </div>
              </div>
              {/* Modal content */}
              <div className="text-sm mb-10">
                <div className="space-y-2">
                  <p>{t("deleteBannerMessage")}</p>
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
                  {t("cancel")}
                </button>
                <button
                  className="btn-sm bg-red-500 hover:bg-red-600 text-white"
                  onClick={confirmDelete}
                >
                  {t("accept")}
                </button>
              </div>
            </div>
          </div>
        </ModalBlank>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl relative">
        <div className="px-4 sm:px-6 lg:px-8 pt-8 w-full max-w-[96rem] mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <button
                className="btn text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-600 mb-2 pl-0 focus:outline-none shadow-none"
                onClick={handleBackClick}
              >
                <svg
                  className="fill-current shrink-0 mr-1"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                >
                  <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z"></path>
                </svg>
                <span>{t("backToApps")}</span>
              </button>
            </div>

            <div className="flex">
              {state.isEditing && (
                <div className="m-1.5">
                  {/* Filter button */}
                  <DropdownFilter
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicateApp}
                    align="right"
                  />
                </div>
              )}

              <div className="m-1.5">
                <button
                  className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                  onClick={handleNewApp}
                >
                  {t("new")}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
              {getPageTitle()}
            </h1>

            {/* App Navigation */}
            <div className="flex items-center pr-1">
              {state.isEditing && location.state?.totalItems > 1 && (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    {location.state.currentIndex} / {location.state.totalItems}
                  </span>
                  <button
                    className={`btn shadow-none p-1`}
                    title="Previous"
                    onClick={handlePrevApp}
                    disabled={location.state.currentIndex <= 1}
                  >
                    <svg
                      className={`fill-current shrink-0 ${
                        location.state.currentIndex <= 1
                          ? "text-gray-200 dark:text-gray-700"
                          : "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-600"
                      }`}
                      width="24"
                      height="24"
                      viewBox="0 0 18 18"
                    >
                      <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z"></path>
                    </svg>
                  </button>

                  <button
                    className={`btn shadow-none p-1`}
                    title="Next"
                    onClick={handleNextApp}
                    disabled={
                      location.state.currentIndex >= location.state.totalItems
                    }
                  >
                    <svg
                      className={`fill-current shrink-0 ${
                        location.state.currentIndex >= location.state.totalItems
                          ? "text-gray-200 dark:text-gray-700"
                          : "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-600"
                      }`}
                      width="24"
                      height="24"
                      viewBox="0 0 18 18"
                    >
                      <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"></path>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="relative mt-4 mb-8">
              <div
                className="absolute bottom-0 w-full h-px bg-gray-200 dark:bg-gray-700/60"
                aria-hidden="true"
              ></div>
              <ul className="relative text-sm font-medium flex flex-nowrap -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-scroll no-scrollbar">
                {tabs.map((tab) => (
                  <li
                    key={tab.id}
                    className="mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8"
                  >
                    <button
                      className={`pb-3 whitespace-nowrap border-b-2 ${
                        state.activeTab === tab.id
                          ? "text-violet-500 border-violet-500"
                          : "text-gray-500 border-transparent"
                      }`}
                      onClick={() => handleTabChange(tab.id)}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-8 w-full max-w-[96rem] mx-auto">
          <form onSubmit={state.isEditing ? handleUpdate : handleSubmit}>
            {state.activeTab === 1 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* App Name */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      {t("appName")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      className={`form-input w-full ${
                        state.errors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      type="text"
                      value={state.formData.name}
                      onChange={handleChange}
                      placeholder={t("appNamePlaceholder")}
                    />
                    {state.errors.name && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{state.errors.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Icon Selection (Replacing Category) */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="selectedIcon"
                    >
                      {t("icon")} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      {/* Icon Dropdown */}
                      <select
                        id="icon"
                        className={`form-select flex-1 ${
                          state.errors.icon
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                        value={state.formData.icon}
                        onChange={handleIconSelection}
                      >
                        <option value="">{t("selectAnIcon")}</option>
                        {icons.map((icon, index) => (
                          <option key={index} value={index}>
                            {icon.label}
                          </option>
                        ))}
                      </select>

                      {/* Icon Preview */}
                      <div className="h-10 w-10 min-w-10 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                        {state.formData.icon ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-6 h-6 text-gray-600 dark:text-gray-300"
                          >
                            <path d={icons[state.formData.icon].svgPath} />
                          </svg>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs text-center">
                            {t("noIcon")}
                          </span>
                        )}
                      </div>
                    </div>
                    {state.errors.icon && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{state.errors.icon}</span>
                      </div>
                    )}
                  </div>

                  {/* URL */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="url"
                    >
                      {t("appURL")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="url"
                      className={`form-input w-full ${
                        state.errors.url
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      type="text"
                      value={state.formData.url}
                      onChange={handleChange}
                      placeholder="/url"
                    />
                    {state.errors.url && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{state.errors.url}</span>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="category"
                    >
                      {t("category")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      className={`form-select w-full ${
                        state.errors.category
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      value={state.formData.category}
                      onChange={handleChange}
                    >
                      <option value="">{t("selectACategory")}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {state.errors.category && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{state.errors.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Description - Full width */}
                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="description"
                    >
                      {t("description")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      className={`form-textarea w-full h-24 ${
                        state.errors.description
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      value={state.formData.description}
                      onChange={handleChange}
                      placeholder={t("appDescriptionPlaceholder")}
                    />
                    {state.errors.description && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{state.errors.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="btn border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                    onClick={handleBackClick}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                    disabled={state.isSubmitting}
                  >
                    {state.isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-gray-800"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t("saving")}
                      </>
                    ) : state.isEditing ? (
                      t("update")
                    ) : (
                      t("save")
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AppFormContainer;
