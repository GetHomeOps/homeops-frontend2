import React, {useReducer, useEffect, useContext} from "react";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {AlertCircle} from "lucide-react";
import Banner from "../../partials/containers/Banner";
import ModalBlank from "../../components/ModalBlank";
import {useTranslation} from "react-i18next";
import DropdownFilter from "../../components/DropdownFilter";
import contactContext from "../../context/ContactContext";
import {useAutoCloseBanner} from "../../hooks/useAutoCloseBanner";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  website: "",
};

/* Tabs */
const tabs = [
  {id: 1, label: "General"},
  {id: 2, label: "Sales & Purchase"},
  {id: 3, label: "Invoicing"},
];

const initialState = {
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  contactToEdit: null,
  activeTab: 1,
  isEditing: false,
  bannerOpen: false,
  dangerModalOpen: false,
  currentContactIndex: 0,
  bannerType: "success",
  bannerAction: "",
  bannerMessage: "",
  imageMenuOpen: false,
  imageUrlModalOpen: false,
  showUrlInput: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {...state, formData: {...state.formData, ...action.payload}};
    case "SET_ERRORS":
      return {...state, errors: action.payload};
    case "SET_SUBMITTING":
      return {...state, isSubmitting: action.payload};
    case "SET_CONTACT_TO_EDIT":
      return {
        ...state,
        contactToEdit: action.payload,
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
    case "SET_CURRENT_CONTACT_INDEX":
      return {...state, currentContactIndex: action.payload};
    case "SET_IMAGE_MENU_OPEN":
      return {...state, imageMenuOpen: action.payload};
    case "SET_IMAGE_URL_MODAL_OPEN":
      return {...state, imageUrlModalOpen: action.payload};
    case "SET_SHOW_URL_INPUT":
      return {...state, showUrlInput: action.payload};
    default:
      return state;
  }
}

function ContactsFormContainer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {id} = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    createContact,
    updateContact,
    duplicateContact,
    deleteContact,
    contacts,
    viewMode,
    getCurrentViewContacts,
  } = useContext(contactContext);

  const {t} = useTranslation();

  // Fetch contactToEdit based on URL's contact id
  useEffect(() => {
    async function fetchContact() {
      if (id && id !== "new") {
        try {
          const currentViewContacts = getCurrentViewContacts();
          const existingContact = currentViewContacts.find(
            (contact) => Number(contact.id) === Number(id)
          );
          if (existingContact) {
            dispatch({type: "SET_CONTACT_TO_EDIT", payload: existingContact});
            // Only clear banner if it's not a success message from app creation
            if (
              state.bannerType !== "success" ||
              !state.bannerMessage.includes(
                t("contactCreatedSuccessfullyMessage")
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
            throw new Error(t("contactNotFoundErrorMessage"));
          }
        } catch (err) {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "error",
              message: `Error finding contact: ${err}`,
            },
          });
        }
      } else {
        dispatch({type: "SET_CONTACT_TO_EDIT", payload: null});
      }
    }
    fetchContact();
  }, [id, contacts, viewMode]);

  // Banner timeout useEffect with the custom hook
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

  //Populate form data when in edit mode
  useEffect(() => {
    if (state.isEditing && state.contactToEdit) {
      dispatch({
        type: "SET_FORM_DATA",
        payload: {
          name: state.contactToEdit.name,
          email: state.contactToEdit.email,
          phone: state.contactToEdit.phone,
          website: state.contactToEdit.website,
        },
      });
    } else {
      dispatch({type: "SET_FORM_DATA", payload: initialFormData});
    }
  }, [state.isEditing, state.contactToEdit]);

  /* Handles form change */
  const handleChange = (e) => {
    const {id, value} = e.target;
    dispatch({type: "SET_FORM_DATA", payload: {[id]: value}});

    // Clear error when field is being edited
    if (state.errors[id]) {
      dispatch({type: "SET_ERRORS", payload: {...state.errors, [id]: null}});
    }
  };

  /* Resets appToEdit upon selecting new contact button */
  function onCreate(newContact) {
    dispatch({type: "SET_CONTACT_TO_EDIT", payload: newContact});
  }

  /* Handles submit button */
  async function handleSubmit(evt) {
    evt.preventDefault();

    if (!validateForm()) return;

    const contactData = {
      name: state.formData.name,
      email: state.formData.email,
      phone: state.formData.phone,
      website: state.formData.website,
    };

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const res = await createContact(contactData);

      if (res && res.id) {
        // Update state with new contact
        onCreate(res);

        // Get the current view's sorted contacts
        const currentViewContacts = getCurrentViewContacts();
        const updatedContacts = [...currentViewContacts, res];

        // Sort the updated contacts using the same sorting logic
        const sortedContacts = updatedContacts.sort((a, b) => {
          if (viewMode === "list") {
            return a.name.localeCompare(b.name);
          } else {
            // For group view, sort by type first, then name
            if (a.type_id !== b.type_id) {
              return a.type_id - b.type_id;
            }
            return a.name.localeCompare(b.name);
          }
        });

        // Find the index of the new contact in the sorted list
        const newContactIndex =
          sortedContacts.findIndex((contact) => contact.id === res.id) + 1;

        // Navigate to the new contact with navigation state
        navigate(`/contacts/${res.id}`, {
          state: {
            currentIndex: newContactIndex,
            totalItems: sortedContacts.length,
            visibleContactIds: sortedContacts.map((contact) => contact.id),
          },
        });

        // Show success banner
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "success",
            message: t("contactCreatedSuccessfullyMessage"),
          },
        });
      }
    } catch (err) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error creating contact: ${err}`,
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

    const contactData = {
      name: state.formData.name,
      email: state.formData.email,
      phone: state.formData.phone,
      website: state.formData.website,
    };

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const res = await updateContact(id, contactData);
      if (res) {
        // Update the contactToEdit with the new data while maintaining the id
        dispatch({
          type: "SET_CONTACT_TO_EDIT",
          payload: {...contactData, id: Number(id)},
        });

        // Show success banner
        setTimeout(() => {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "success",
              message: t("contactUpdatedSuccessfullyMessage"),
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

    if (!state.formData.name) {
      newErrors.name = t("nameValidationErrorMessage");
    }

    if (state.formData.email && !isValidEmail(state.formData.email)) {
      newErrors.email = t("emailValidationErrorMessage");
    }

    if (state.formData.website && !isValidUrl(state.formData.website)) {
      newErrors.website = t("websiteValidationErrorMessage");
    }

    dispatch({type: "SET_ERRORS", payload: newErrors});
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  /* Navigates to previous page */
  function handleBackClick() {
    navigate(`/contacts`);
  }

  /* If editing a contact -> return the contact's name
  If new -> return 'New Contact' */
  function getPageTitle() {
    if (state.contactToEdit) {
      return `${state.contactToEdit.name}`;
    }
    return t("newContact");
  }

  /* Changes active tab */
  function handleTabChange(tabId) {
    dispatch({type: "SET_ACTIVE_TAB", payload: tabId});
  }

  /* Handles New Contact button click */
  function handleNewContact() {
    dispatch({type: "SET_CONTACT_TO_EDIT", payload: null});
    dispatch({type: "SET_FORM_DATA", payload: initialFormData});
    dispatch({type: "SET_ERRORS", payload: {}});
  }

  /* Handles delete button */
  function handleDelete() {
    dispatch({type: "SET_DANGER_MODAL", payload: true});
  }

  /* Handles duplicate button */
  async function handleDuplicate() {
    if (!state.contactToEdit) return;

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      const res = await duplicateContact(state.contactToEdit);

      if (res && res.id) {
        //Navigate first
        navigate(`/contacts/${res.id}`);

        //Then show banner
        setTimeout(() => {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "success",
              message: t("contactDuplicatedSuccessfully"),
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
          message: `${t("contactDuplicationError: ")} ${err}`,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  /* Handles delete confirmation on modal */
  async function confirmDelete() {
    try {
      // Close modal immediately when Accept is clicked
      dispatch({type: "SET_DANGER_MODAL", payload: false});

      //Find the current contact index in the sorted items
      const contactIndex = contacts.findIndex(
        (contact) => contact.id === Number(id)
      );

      //Delete the app
      await deleteContact(id);

      // Show success banner first
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "success",
          message: t("contactDeletedSuccessfullyMessage"),
        },
      });

      // Then navigate based on remaining contacts
      if (contacts.length <= 1) {
        // If this was the last app, go to contacts list
        navigate(`/contacts/`);
      } else if (contactIndex === contacts.length - 1) {
        // If this was the last app in the list, go to previous app
        const prevId = contacts[contactIndex - 1].id;
        navigate(`/contacts/${prevId}`, {
          state: {
            currentIndex: contactIndex,
            totalItems: contacts.length - 1,
            visibleContactIds: contacts
              .filter((contact) => contact.id !== Number(id))
              .map((contact) => contact.id),
          },
        });
      } else {
        // Otherwise go to next contact
        const nextId = contacts[contactIndex + 1].id;
        navigate(`/contacts/${nextId}`, {
          state: {
            currentIndex: contactIndex + 1,
            totalItems: contacts.length - 1,
            visibleContactIds: contacts
              .filter((contact) => contact.id !== Number(id))
              .map((contact) => contact.id),
          },
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error deleting contact: ${error}`,
        },
      });
    }
  }

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
                  {state.contactToEdit
                    ? `Delete ${state.contactToEdit.name}?`
                    : "Delete Contact?"}
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
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <button
                className="btn text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-600 mb-4 pl-0 focus:outline-none shadow-none self-start"
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
                <span>{t("backToContacts")}</span>
              </button>

              <div className="flex items-center space-x-6">
                {/* Image Preview with Overlay Menu */}
                <div className="relative group">
                  <div className="w-28 h-28 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {state.formData.image ? (
                      <img
                        src={state.formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23E5E7EB'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'%3E%3C/path%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-10 h-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Two Dots Menu Button - Only visible on hover */}
                  <button
                    className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: "SET_IMAGE_MENU_OPEN",
                        payload: !state.imageMenuOpen,
                      });
                    }}
                  >
                    <div className="flex space-x-0.5">
                      <div className="w-0.5 h-0.5 rounded-full bg-gray-500"></div>
                      <div className="w-0.5 h-0.5 rounded-full bg-gray-500"></div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {state.imageMenuOpen && (
                    <div className="absolute left-full ml-2 top-0 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <div className="py-1">
                        <button
                          className="w-full px-3 py-1.5 text-left text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dispatch({
                              type: "SET_IMAGE_MENU_OPEN",
                              payload: false,
                            });
                            dispatch({
                              type: "SET_SHOW_URL_INPUT",
                              payload: true,
                            });
                          }}
                        >
                          {t("pasteUrl")}
                        </button>
                        <label
                          className="w-full px-3 py-1.5 text-left text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer block"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dispatch({
                              type: "SET_IMAGE_MENU_OPEN",
                              payload: false,
                            });
                          }}
                        >
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  dispatch({
                                    type: "SET_FORM_DATA",
                                    payload: {image: reader.result},
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {t("uploadImage")}
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {state.isEditing
                      ? t("editContactSubtitle")
                      : t("newContactSubtitle")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex">
                {/* Filter button */}
                {state.isEditing && (
                  <div className="m-1.5">
                    <DropdownFilter
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                      align="right"
                    />
                  </div>
                )}

                <div className="m-1.5">
                  <button
                    className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                    onClick={handleNewContact}
                  >
                    {t("new")}
                  </button>
                </div>
              </div>

              {/* Contact Navigation */}
              {state.isEditing && location.state?.totalItems > 1 && (
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    {location.state.currentIndex} / {location.state.totalItems}
                  </span>
                  <button
                    className={`btn shadow-none p-1`}
                    title="Previous"
                    onClick={() => {
                      const prevIndex = location.state.currentIndex - 1;
                      if (prevIndex >= 1) {
                        const prevId =
                          location.state.visibleContactIds[prevIndex - 1];
                        navigate(`/contacts/${prevId}`, {
                          state: {
                            ...location.state,
                            currentIndex: prevIndex,
                          },
                        });
                      }
                    }}
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
                    onClick={() => {
                      const nextIndex = location.state.currentIndex + 1;
                      if (nextIndex <= location.state.totalItems) {
                        const nextId =
                          location.state.visibleContactIds[nextIndex - 1];
                        navigate(`/contacts/${nextId}`, {
                          state: {
                            ...location.state,
                            currentIndex: nextIndex,
                          },
                        });
                      }
                    }}
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
                </div>
              )}
            </div>
          </div>

          {/* URL Input - Only shown when pasteUrl is selected */}
          {state.showUrlInput && (
            <div className="mt-4 max-w-md">
              <input
                type="text"
                id="image"
                className="form-input w-full"
                placeholder={t("imageUrlPlaceholder")}
                value={state.formData.image}
                onChange={handleChange}
                onBlur={() =>
                  dispatch({type: "SET_SHOW_URL_INPUT", payload: false})
                }
                autoFocus
              />
            </div>
          )}

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
                  {/* Contact Name */}
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
                      placeholder={t("contactNamePlaceholder")}
                    />
                    {state.errors.name && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{state.errors.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      {t("email")}
                    </label>
                    <input
                      id="email"
                      className={`form-input w-full ${
                        state.errors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      type="email"
                      value={state.formData.email}
                      onChange={handleChange}
                      placeholder={t("emailPlaceholder")}
                    />
                    {state.errors.email && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{state.errors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="phone"
                    >
                      {t("phone")}
                    </label>
                    <input
                      id="phone"
                      className="form-input w-full"
                      type="tel"
                      value={state.formData.phone}
                      onChange={handleChange}
                      placeholder={t("phonePlaceholder")}
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="website"
                    >
                      {t("website")}
                    </label>
                    <input
                      id="website"
                      className={`form-input w-full ${
                        state.errors.website
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      type="url"
                      value={state.formData.website}
                      onChange={handleChange}
                      placeholder={t("websitePlaceholder")}
                    />
                    {state.errors.website && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{state.errors.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {state.activeTab === 2 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Street 1 */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="street1"
                    >
                      {t("street1")}
                    </label>
                    <input
                      id="street1"
                      className="form-input w-full"
                      type="text"
                      value={state.formData.street1}
                      onChange={handleChange}
                      placeholder={t("street1Placeholder")}
                    />
                  </div>

                  {/* Street 2 */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="street2"
                    >
                      {t("street2")}
                    </label>
                    <input
                      id="street2"
                      className="form-input w-full"
                      type="text"
                      value={state.formData.street2}
                      onChange={handleChange}
                      placeholder={t("street2Placeholder")}
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="city"
                    >
                      {t("city")}
                    </label>
                    <input
                      id="city"
                      className="form-input w-full"
                      type="text"
                      value={state.formData.city}
                      onChange={handleChange}
                      placeholder={t("cityPlaceholder")}
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="state"
                    >
                      {t("state")}
                    </label>
                    <input
                      id="state"
                      className="form-input w-full"
                      type="text"
                      value={state.formData.state}
                      onChange={handleChange}
                      placeholder={t("statePlaceholder")}
                    />
                  </div>

                  {/* ZIP */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="zip"
                    >
                      {t("zip")}
                    </label>
                    <input
                      id="zip"
                      className="form-input w-full"
                      type="text"
                      value={state.formData.zip}
                      onChange={handleChange}
                      placeholder={t("zipPlaceholder")}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="country"
                    >
                      {t("country")}
                    </label>
                    <input
                      id="country"
                      className="form-input w-full"
                      type="text"
                      value={state.formData.country}
                      onChange={handleChange}
                      placeholder={t("countryPlaceholder")}
                    />
                  </div>
                </div>
              </div>
            )}

            {state.activeTab === 3 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Add your invoicing fields here */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="invoice_prefix"
                    >
                      Invoice Prefix
                    </label>
                    <input
                      id="invoice_prefix"
                      className="form-input w-full"
                      type="text"
                      value={state.formData.invoice_prefix || ""}
                      onChange={handleChange}
                      placeholder="Enter invoice prefix"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="payment_terms"
                    >
                      Payment Terms
                    </label>
                    <input
                      id="payment_terms"
                      className="form-input w-full"
                      type="text"
                      value={state.formData.payment_terms || ""}
                      onChange={handleChange}
                      placeholder="Enter payment terms"
                    />
                  </div>
                </div>
              </div>
            )}

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
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactsFormContainer;
