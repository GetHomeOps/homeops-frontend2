import React, {useReducer, useMemo, useCallback, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Layers, Tag} from "lucide-react";

import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import Banner from "../../../partials/containers/Banner";
import useCurrentDb from "../../../hooks/useCurrentDb";

import {CATEGORY_HIERARCHY, CATEGORIES_FLAT} from "./categoryData";
import CategoryForm from "./CategoryForm";

const initialState = {
  formData: {
    name: "",
    description: "",
    type: "child",
    parentId: "",
    icon: "",
    imageUrl: "",
  },
  errors: {},
  isSubmitting: false,
  isNew: true,
  sidebarOpen: false,
  bannerOpen: false,
  bannerType: "success",
  bannerMessage: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: {...state.formData, ...action.payload},
      };
    case "SET_ERRORS":
      return {...state, errors: action.payload};
    case "SET_SUBMITTING":
      return {...state, isSubmitting: action.payload};
    case "SET_IS_NEW":
      return {...state, isNew: action.payload};
    case "SET_SIDEBAR_OPEN":
      return {...state, sidebarOpen: action.payload};
    case "SET_BANNER":
      return {
        ...state,
        bannerOpen: action.payload.open,
        bannerType: action.payload.type,
        bannerMessage: action.payload.message,
      };
    case "RESET_FORM":
      return {...initialState, sidebarOpen: state.sidebarOpen};
    default:
      return state;
  }
}

function CategoryFormContainer() {
  const navigate = useNavigate();
  const {categoryId} = useParams();
  const {t} = useTranslation();
  const {currentDb} = useCurrentDb();
  const dbUrl = currentDb?.url || currentDb?.name || "";

  const [state, dispatch] = useReducer(reducer, initialState);

  const isNew = categoryId === "new" || !categoryId;

  const parentCategories = useMemo(
    () => CATEGORY_HIERARCHY.map((p) => ({id: p.id, name: p.name})),
    [],
  );

  /* ─── Load existing category data ──────────────────────────── */

  useEffect(() => {
    if (isNew) {
      dispatch({type: "SET_IS_NEW", payload: true});
      return;
    }
    dispatch({type: "SET_IS_NEW", payload: false});

    const parent = CATEGORY_HIERARCHY.find((p) => p.id === categoryId);
    if (parent) {
      dispatch({
        type: "SET_FORM_DATA",
        payload: {
          name: parent.name,
          description: parent.description,
          type: "parent",
          parentId: "",
          icon: parent.icon || "",
          imageUrl: parent.imageUrl || "",
        },
      });
      return;
    }

    const flat = CATEGORIES_FLAT.find((c) => c.id === categoryId);
    if (flat) {
      dispatch({
        type: "SET_FORM_DATA",
        payload: {
          name: flat.name,
          description: flat.description,
          type: flat.type,
          parentId: flat.parentId || "",
          icon: "",
          imageUrl: flat.imageUrl || "",
        },
      });
    }
  }, [categoryId, isNew]);

  /* ─── Banner auto-close ────────────────────────────────────── */

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

  /* ─── Handlers ─────────────────────────────────────────────── */

  const handleFieldChange = useCallback((field, value) => {
    dispatch({type: "SET_FORM_DATA", payload: {[field]: value}});
    dispatch({
      type: "SET_ERRORS",
      payload: {},
    });
  }, []);

  const validate = useCallback(() => {
    const errors = {};
    if (!state.formData.name.trim()) {
      errors.name = "Category name is required";
    }
    if (state.formData.type === "child" && !state.formData.parentId) {
      errors.parentId = "Parent category is required for subcategories";
    }
    return errors;
  }, [state.formData]);

  const handleSave = useCallback(() => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      dispatch({type: "SET_ERRORS", payload: errors});
      return;
    }

    dispatch({type: "SET_SUBMITTING", payload: true});

    // Simulate API call
    setTimeout(() => {
      dispatch({type: "SET_SUBMITTING", payload: false});
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "success",
          message: isNew
            ? "Category created successfully"
            : "Category updated successfully",
        },
      });
    }, 500);
  }, [validate, isNew]);

  const handleBack = useCallback(() => {
    navigate(`/${dbUrl}/professionals/categories`);
  }, [navigate, dbUrl]);

  /* ─── Derive context for the form ──────────────────────────── */

  const existingCategory = useMemo(() => {
    if (isNew) return null;
    const parent = CATEGORY_HIERARCHY.find((p) => p.id === categoryId);
    if (parent) {
      return {
        ...parent,
        type: "parent",
        childCount: parent.children?.length ?? 0,
        totalPros: (parent.children ?? []).reduce(
          (sum, c) => sum + (c.proCount ?? 0),
          0,
        ),
      };
    }
    return CATEGORIES_FLAT.find((c) => c.id === categoryId) || null;
  }, [categoryId, isNew]);

  const childCategories = useMemo(() => {
    if (!existingCategory || existingCategory.type !== "parent") return [];
    const parent = CATEGORY_HIERARCHY.find(
      (p) => p.id === existingCategory.id,
    );
    return parent?.children ?? [];
  }, [existingCategory]);

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

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
            {/* ─── Navigation and Actions (Contact-style) ───── */}
            <div className="flex justify-between items-center mb-2">
              <button
                type="button"
                className="btn text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-600 mb-2 pl-0 focus:outline-none shadow-none"
                onClick={handleBack}
              >
                <svg
                  className="fill-current shrink-0 mr-1"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                >
                  <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z" />
                </svg>
                <span className="text-lg">{t("categories")}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn bg-[#456564] hover:bg-[#34514f] text-white transition-colors duration-200 shadow-sm"
                  onClick={() =>
                    navigate(`/${dbUrl}/professionals/categories/new`)
                  }
                >
                  {t("new")}
                </button>
              </div>
            </div>

            {/* ─── Form Card (Contact-style) ────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              {/* Header with icon and title */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      state.formData.type === "parent"
                        ? "bg-violet-100 dark:bg-violet-500/20"
                        : "bg-emerald-100 dark:bg-emerald-500/20"
                    }`}
                  >
                    {state.formData.type === "parent" ? (
                      <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    ) : (
                      <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {isNew ? "New Category" : state.formData.name}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {isNew
                        ? "Create a new parent or subcategory"
                        : state.formData.type === "parent"
                          ? "Parent category"
                          : "Subcategory"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form content */}
              <div className="p-6">
                <CategoryForm
                  formData={state.formData}
                  errors={state.errors}
                  isNew={isNew}
                  parentCategories={parentCategories}
                  childCategories={childCategories}
                  existingCategory={existingCategory}
                  onChange={handleFieldChange}
                />
              </div>

              {/* Sticky footer with Save/Update buttons (Contact-style) */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-lg transition-all duration-200">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 transition-colors duration-200 shadow-sm"
                    onClick={handleBack}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="button"
                    className="btn text-white transition-colors duration-200 shadow-sm min-w-[100px] bg-[#456564] hover:bg-[#34514f]"
                    onClick={handleSave}
                    disabled={state.isSubmitting}
                  >
                    {state.isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {t("saving")}
                      </div>
                    ) : isNew ? (
                      t("save")
                    ) : (
                      t("update")
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CategoryFormContainer;
