import React, {useReducer, useEffect, useContext} from "react";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {AlertCircle} from "lucide-react";
import appContext from "../../../context/AppContext";
import Banner from "../../../partials/containers/Banner";
import ModalBlank from "../../../components/ModalBlank";
import {useTranslation} from "react-i18next";
import DropdownFilter from "../../../components/DropdownFilter";

const initialFormData = {
  name: "",
};

/* Tabs */
const tabs = [{id: 1, label: "General"}];

const initialState = {
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  categoryToEdit: null,
  activeTab: 1,
  isEditing: false,
  bannerOpen: false,
  dangerModalOpen: false,
  currentCategoryIndex: 0,
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
    case "SET_CATEGORY_TO_EDIT":
      return {
        ...state,
        categoryToEdit: action.payload,
        isEditing: !!action.payload,
      };
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
    case "SET_CURRENT_CATEGORY_INDEX":
      return {...state, currentCategoryIndex: action.payload};
    default:
      return state;
  }
}

function CategoryFormContainer() {
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    categories,
    sortedCategories,
    generateUniqueCategoryName,
    generateUniqueCategoryUrl,
  } = useContext(appContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {id} = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {t} = useTranslation();

  // Fetch categoryToEdit based on URL's category id
  useEffect(() => {
    async function fetchCategory() {
      if (id && id !== "new") {
        try {
          const existingCategory = categories.find(
            (category) => Number(category.id) === Number(id)
          );
          if (existingCategory) {
            dispatch({type: "SET_CATEGORY_TO_EDIT", payload: existingCategory});
            if (
              state.bannerType !== "success" ||
              !state.bannerMessage.includes(
                t("categoryCreatedSuccessfullyMessage")
              )
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
            throw new Error(t("categoryNotFoundErrorMessage"));
          }
        } catch (err) {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "error",
              message: `Error finding category: ${err}`,
            },
          });
        }
      } else {
        dispatch({type: "SET_CATEGORY_TO_EDIT", payload: null});
      }
    }
    fetchCategory();
  }, [id, categories]);

  // Show banner and handle timeout
  useEffect(() => {
    if (state.bannerOpen && state.bannerMessage) {
      const timer = setTimeout(() => {
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: false,
            type: state.bannerType,
            message: state.bannerMessage,
          },
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.bannerOpen, state.bannerMessage]);

  // Populate form data when in edit mode
  useEffect(() => {
    if (state.isEditing && state.categoryToEdit) {
      dispatch({
        type: "SET_FORM_DATA",
        payload: {
          name: state.categoryToEdit.name,
        },
      });
    } else {
      dispatch({type: "SET_FORM_DATA", payload: initialFormData});
    }
  }, [state.isEditing, state.categoryToEdit]);

  // Update current category index when categoryToEdit changes
  useEffect(() => {
    if (state.categoryToEdit) {
      const index = sortedCategories.findIndex(
        (category) => Number(category.id) === Number(state.categoryToEdit.id)
      );
      dispatch({type: "SET_CURRENT_CATEGORY_INDEX", payload: index});
    }
  }, [state.categoryToEdit, sortedCategories]);

  /* Handles form change */
  const handleChange = (e) => {
    const {id, value} = e.target;
    dispatch({type: "SET_FORM_DATA", payload: {[id]: value}});

    // Clear error when field is being edited
    if (state.errors[id]) {
      dispatch({type: "SET_ERRORS", payload: {...state.errors, [id]: null}});
    }
  };

  /* Handles submit button */
  async function handleSubmit(evt) {
    evt.preventDefault();

    if (!validateForm()) return;

    const categoryData = {
      name: state.formData.name,
    };

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const res = await createCategory(categoryData);

      if (res && res.id) {
        // Navigate to the new category
        navigate(`/admin/categories/${res.id}`);

        // Show success banner
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "success",
            message: t("categoryCreatedSuccessfullyMessage"),
          },
        });
      }
    } catch (err) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error creating category: ${err}`,
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

    const categoryData = {
      name: state.formData.name,
    };

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const res = await updateCategory(id, categoryData);
      if (res) {
        dispatch({
          type: "SET_CATEGORY_TO_EDIT",
          payload: {...categoryData, id: Number(id)},
        });

        setTimeout(() => {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "success",
              message: t("categoryUpdatedSuccessfullyMessage"),
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
      newErrors.name = t("categoryNameValidationErrorMessage");
    }

    dispatch({type: "SET_ERRORS", payload: newErrors});
    return Object.keys(newErrors).length === 0;
  };

  /* Navigates to previous page */
  function handleBackClick() {
    navigate("/admin/categories");
  }

  /* If editing a category -> return the category's name
  If new -> return 'New Category' */
  function getPageTitle() {
    if (state.categoryToEdit) {
      return `${state.categoryToEdit.name}`;
    }
    return t("newCategory");
  }

  /* Resets categoryToEdit upon selecting new category button */
  function handleNewCategory() {
    dispatch({type: "SET_CATEGORY_TO_EDIT", payload: null});
    dispatch({type: "SET_FORM_DATA", payload: initialFormData});
    dispatch({type: "SET_ERRORS", payload: {}});
  }

  /* Changes active tab */
  function handleTabChange(tabId) {
    dispatch({type: "SET_ACTIVE_TAB", payload: tabId});
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

      // Find the current category index
      const categoryIndex = categories.findIndex(
        (category) => category.id === Number(id)
      );

      // Delete the category
      await deleteCategory(id);

      // Navigate based on remaining categories
      if (categories.length <= 1) {
        // If this was the last category, go to categories list
        navigate("/admin/categories");
      } else if (categoryIndex === categories.length - 1) {
        // If this was the last category in the list, go to previous category
        navigate(`/admin/categories/${categories[categoryIndex - 1].id}`);
      } else {
        // Otherwise go to next category
        navigate(`/admin/categories/${categories[categoryIndex + 1].id}`);
      }

      // Then show banner
      setTimeout(() => {
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "success",
            message: t("categoryDeletedSuccessfullyMessage"),
          },
        });
      }, 100);
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error deleting category: ${error}`,
        },
      });
    }
  }

  /* Handles category duplication */
  async function handleDuplicateCategory() {
    if (!state.categoryToEdit) return;

    // Close dropdown if it's open
    const dropdown = document.querySelector('[data-dropdown-open="true"]');
    if (dropdown) {
      dropdown.click();
    }

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const uniqueName = generateUniqueCategoryName(state.categoryToEdit.name);
      const uniqueUrl = state.categoryToEdit.url
        ? generateUniqueCategoryUrl(state.categoryToEdit.url)
        : undefined;

      const categoryData = {
        name: uniqueName,
        icon: state.categoryToEdit.icon,
        url: uniqueUrl,
        description: state.categoryToEdit.description,
      };

      const res = await createCategory(categoryData);

      if (res && res.id) {
        // Navigate first
        navigate(`/admin/categories/${res.id}`);

        // Then show banner
        setTimeout(() => {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "success",
              message: t("categoryCreatedSuccessfullyMessage"),
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
          message: `Error duplicating category: ${err}`,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  console.log("categories", categories);

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
                  {state.categoryToEdit
                    ? `Delete ${state.categoryToEdit.name}?`
                    : "Delete Category?"}
                </div>
              </div>
              {/* Modal content */}
              <div className="text-sm mb-10">
                <div className="space-y-2">
                  <p>{t("categoryDeleteConfirmationMessage")}</p>
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
                <span>{t("backToCategories")}</span>
              </button>
            </div>

            <div className="flex">
              {state.isEditing && (
                <div className="m-1.5">
                  {/* Filter button */}
                  <DropdownFilter
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicateCategory}
                    align="right"
                  />
                </div>
              )}

              <div className="m-1.5">
                <button
                  className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                  onClick={handleNewCategory}
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

            {/* Category Navigation */}
            <div className="flex items-center pr-1">
              {state.isEditing && sortedCategories.length > 1 && (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    {state.currentCategoryIndex + 1} / {sortedCategories.length}
                  </span>
                  <button
                    className={`btn shadow-none p-1`}
                    title="Previous"
                    onClick={() => {
                      const prevIndex = state.currentCategoryIndex - 1;
                      if (prevIndex >= 0) {
                        navigate(
                          `/admin/categories/${sortedCategories[prevIndex].id}`
                        );
                      }
                    }}
                    disabled={state.currentCategoryIndex <= 0}
                  >
                    <svg
                      className={`fill-current shrink-0 ${
                        state.currentCategoryIndex <= 0
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
                    onClick={() => {
                      const nextIndex = state.currentCategoryIndex + 1;
                      if (nextIndex < sortedCategories.length) {
                        navigate(
                          `/admin/categories/${sortedCategories[nextIndex].id}`
                        );
                      }
                    }}
                    disabled={
                      state.currentCategoryIndex >= sortedCategories.length - 1
                    }
                  >
                    <svg
                      className={`fill-current shrink-0 ${
                        state.currentCategoryIndex >=
                        sortedCategories.length - 1
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
                <div className="grid grid-cols-1 gap-6">
                  {/* Category Name */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      {t("name")} <span className="text-red-500">*</span>
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
                      placeholder={t("categoryNamePlaceholder")}
                    />
                    {state.errors.name && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{state.errors.name}</span>
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

export default CategoryFormContainer;
