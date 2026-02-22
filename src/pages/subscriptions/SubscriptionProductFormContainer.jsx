import React, {useReducer, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {AlertCircle, Package, DollarSign} from "lucide-react";
import Banner from "../../partials/containers/Banner";
import ModalBlank from "../../components/ModalBlank";
import {useTranslation} from "react-i18next";
import useCurrentAccount from "../../hooks/useCurrentAccount";
import {useAutoCloseBanner} from "../../hooks/useAutoCloseBanner";
import AppApi from "../../api/api";

const initialFormData = {
  name: "",
  description: "",
  price: "",
};

const initialState = {
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  product: null,
  isNew: false,
  isLoading: true,
  bannerOpen: false,
  dangerModalOpen: false,
  bannerType: "success",
  bannerMessage: "",
  formDataChanged: false,
  isInitialLoad: true,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: {...state.formData, ...action.payload},
        formDataChanged: !state.isInitialLoad,
      };
    case "SET_ERRORS":
      return {...state, errors: action.payload};
    case "SET_SUBMITTING":
      return {...state, isSubmitting: action.payload};
    case "SET_LOADING":
      return {...state, isLoading: action.payload};
    case "SET_PRODUCT":
      return {
        ...state,
        product: action.payload,
        isNew: !action.payload,
        formData: action.payload
          ? mapProductToForm(action.payload)
          : initialFormData,
        formDataChanged: false,
        isInitialLoad: true,
      };
    case "SET_BANNER":
      return {
        ...state,
        bannerOpen: action.payload.open,
        bannerType: action.payload.type,
        bannerMessage: action.payload.message,
      };
    case "SET_DANGER_MODAL":
      return {...state, dangerModalOpen: action.payload};
    case "SET_FORM_CHANGED":
      return {
        ...state,
        formDataChanged: action.payload,
        isInitialLoad: false,
      };
    default:
      return state;
  }
}

/** Maps backend product object to form fields */
function mapProductToForm(product) {
  return {
    name: product.name || "",
    description: product.description || "",
    price: product.price !== undefined && product.price !== null ? String(product.price) : "",
  };
}

function SubscriptionProductFormContainer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {id} = useParams();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {currentAccount} = useCurrentAccount();
  const accountUrl = currentAccount?.url || currentAccount?.name || "";

  const isNew = !id || id === "new";

  // Fetch product
  useEffect(() => {
    async function fetchData() {
      try {
        dispatch({type: "SET_LOADING", payload: true});

        if (!isNew) {
          const product = await AppApi.getSubscriptionProduct(Number(id));
          dispatch({type: "SET_PRODUCT", payload: product});
        } else {
          dispatch({type: "SET_PRODUCT", payload: null});
        }
      } catch (err) {
        console.error("Error fetching subscription product:", err);
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "error",
            message: `${t("subscriptionProducts.fetchError")}: ${err.message || err}`,
          },
        });
      } finally {
        dispatch({type: "SET_LOADING", payload: false});
      }
    }
    fetchData();
  }, [id, isNew, t]);

  // Banner auto-close
  useAutoCloseBanner(state.bannerOpen, state.bannerMessage, () =>
    dispatch({
      type: "SET_BANNER",
      payload: {
        open: false,
        type: state.bannerType,
        message: state.bannerMessage,
      },
    }),
  );

  /** Handle form field changes */
  function handleChange(e) {
    const {id: fieldId, value} = e.target;
    dispatch({type: "SET_FORM_DATA", payload: {[fieldId]: value}});

    // Clear error when field is being edited
    if (state.errors[fieldId]) {
      dispatch({
        type: "SET_ERRORS",
        payload: {...state.errors, [fieldId]: null},
      });
    }

    if (state.isInitialLoad) {
      dispatch({type: "SET_FORM_CHANGED", payload: true});
    }
  }

  /** Form validation */
  function validateForm() {
    const newErrors = {};

    if (!state.formData.name || !state.formData.name.trim()) {
      newErrors.name = t("subscriptionProducts.nameRequired");
    }
    if (
      state.formData.price === "" ||
      state.formData.price === undefined ||
      state.formData.price === null
    ) {
      newErrors.price = t("subscriptionProducts.priceRequired");
    } else if (isNaN(Number(state.formData.price)) || Number(state.formData.price) < 0) {
      newErrors.price = t("subscriptionProducts.priceInvalid");
    }

    dispatch({type: "SET_ERRORS", payload: newErrors});
    return Object.keys(newErrors).length === 0;
  }

  /** Create new product */
  async function handleSubmit(evt) {
    evt.preventDefault();
    if (!validateForm()) return;

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const data = {
        name: state.formData.name.trim(),
        description: state.formData.description.trim() || null,
        price: Number(state.formData.price),
      };

      const res = await AppApi.createSubscriptionProduct(data);

      if (res && res.id) {
        navigate(`/${accountUrl}/subscription-products/${res.id}`);
        setTimeout(() => {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "success",
              message: t("subscriptionProducts.createdSuccessfully"),
            },
          });
        }, 100);
      }
    } catch (err) {
      console.error("Error creating subscription product:", err);
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `${t("subscriptionProducts.createError")}: ${err.message || err}`,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  /** Update existing product */
  async function handleUpdate(evt) {
    evt.preventDefault();
    if (!validateForm()) return;

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const data = {
        name: state.formData.name.trim(),
        description: state.formData.description.trim() || null,
        price: Number(state.formData.price),
      };

      const res = await AppApi.updateSubscriptionProduct(Number(id), data);
      if (res) {
        const fullProduct = await AppApi.getSubscriptionProduct(Number(id));
        dispatch({type: "SET_PRODUCT", payload: fullProduct});
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "success",
            message: t("subscriptionProducts.updatedSuccessfully"),
          },
        });
      }
    } catch (err) {
      console.error("Error updating subscription product:", err);
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `${t("subscriptionProducts.updateError")}: ${err.message || err}`,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  /** Delete product */
  async function confirmDelete() {
    try {
      dispatch({type: "SET_DANGER_MODAL", payload: false});
      await AppApi.deleteSubscriptionProduct(Number(id));
      navigate(`/${accountUrl}/subscription-products`);
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `${t("subscriptionProducts.deleteError")}: ${error.message || error}`,
        },
      });
    }
  }

  /** Cancel / Reset */
  function handleCancel() {
    if (state.product) {
      dispatch({
        type: "SET_FORM_DATA",
        payload: mapProductToForm(state.product),
      });
      dispatch({type: "SET_FORM_CHANGED", payload: false});
      dispatch({type: "SET_ERRORS", payload: {}});
    } else {
      navigate(`/${accountUrl}/subscription-products`);
    }
  }

  function handleBackClick() {
    navigate(`/${accountUrl}/subscription-products`);
  }

  function getPageTitle() {
    if (state.product) {
      return state.product.name || "";
    }
    return t("subscriptionProducts.newProduct");
  }

  const getLabelClasses = () =>
    "block text-sm font-medium mb-1 text-gray-500 dark:text-gray-400";

  const getInputClasses = (fieldName) => {
    const baseClasses = "form-input w-full";
    const errorClasses = state.errors[fieldName]
      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
      : "";
    return `${baseClasses} ${errorClasses}`;
  };

  if (state.isLoading) {
    return (
      <div className="relative min-h-screen bg-[var(--color-gray-50)] dark:bg-gray-900">
        <div className="flex justify-center items-center py-32">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <svg
              className="animate-spin h-5 w-5"
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
            <span>{t("subscriptionProducts.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--color-gray-50)] dark:bg-gray-900">
      {/* Banner */}
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

      {/* Delete Modal */}
      <div className="m-1.5">
        <ModalBlank
          id="danger-modal"
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
                  {t("subscriptionProducts.deleteTitle", {count: 1})}
                </div>
              </div>
              <div className="text-sm mb-10">
                <p>
                  {t("subscriptionProducts.deleteConfirmation")}{" "}
                  {t("actionCantBeUndone")}
                </p>
              </div>
              <div className="flex flex-wrap justify-end space-x-2">
                <button
                  className="btn-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                  onClick={() =>
                    dispatch({type: "SET_DANGER_MODAL", payload: false})
                  }
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

      <div className="px-4 sm:px-6 lg:px-1">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-2">
          <button
            className="btn text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-600 mb-2 pl-0 focus:outline-none shadow-none"
            onClick={handleBackClick}
          >
            <svg
              className="fill-current shrink-0 mr-1"
              width="18"
              height="18"
              viewBox="0 0 18 18"
            >
              <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z" />
            </svg>
            <span className="text-lg">
              {t("subscriptionProducts.title")}
            </span>
          </button>

          <div className="flex items-center gap-3">
            {state.product && (
              <button
                className="btn border-gray-200 dark:border-gray-700/60 hover:border-red-300 dark:hover:border-red-600 text-red-500"
                onClick={() =>
                  dispatch({type: "SET_DANGER_MODAL", payload: true})
                }
              >
                {t("delete")}
              </button>
            )}
            <button
              className="btn bg-[#456564] hover:bg-[#34514f] text-white transition-colors duration-200 shadow-sm"
              onClick={() => navigate(`/${accountUrl}/subscription-products/new`)}
            >
              {t("new")}
            </button>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#456564]/10 dark:bg-[#456564]/20 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-[#456564]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 capitalize">
                  {getPageTitle()}
                </h1>
                {state.product && state.product.price !== undefined && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <DollarSign className="w-4 h-4 mr-2 text-[#6E8276] shrink-0" />
                      <span>{Number(state.product.price).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <form onSubmit={isNew ? handleSubmit : handleUpdate}>
            <div className="p-6">
              <div className="space-y-8">
                {/* Product Details Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#6E8276]" />
                    {t("subscriptionProducts.productDetails")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className={getLabelClasses()} htmlFor="name">
                        {t("name")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        className={getInputClasses("name")}
                        type="text"
                        value={state.formData.name}
                        onChange={handleChange}
                        placeholder={t("subscriptionProducts.namePlaceholder")}
                      />
                      {state.errors.name && (
                        <div className="mt-1 flex items-center text-sm text-red-500">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span>{state.errors.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className={getLabelClasses()} htmlFor="price">
                        {t("subscriptionProducts.price")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          $
                        </span>
                        <input
                          id="price"
                          className={`${getInputClasses("price")} pl-7`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={state.formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </div>
                      {state.errors.price && (
                        <div className="mt-1 flex items-center text-sm text-red-500">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span>{state.errors.price}</span>
                        </div>
                      )}
                    </div>

                    {/* Description (full width) */}
                    <div className="md:col-span-2">
                      <label
                        className={getLabelClasses()}
                        htmlFor="description"
                      >
                        {t("description")}
                      </label>
                      <textarea
                        id="description"
                        className="form-textarea w-full"
                        rows="3"
                        value={state.formData.description}
                        onChange={handleChange}
                        placeholder={t(
                          "subscriptionProducts.descriptionPlaceholder",
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Bar */}
            <div
              className={`${
                state.formDataChanged || isNew ? "sticky" : "hidden"
              } bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-lg transition-all duration-200`}
            >
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 transition-colors duration-200 shadow-sm"
                  onClick={handleCancel}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="btn bg-[#456564] hover:bg-[#34514f] text-white transition-colors duration-200 shadow-sm min-w-[100px]"
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
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionProductFormContainer;
