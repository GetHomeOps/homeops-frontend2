import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useContext,
} from "react";
import {useTableSort} from "../hooks/useTableSort";
import AppApi from "../api/api";
import {useAuth} from "./AuthContext";
import {useTranslation} from "react-i18next";
import useUniqueIdentifiers from "../hooks/useUniqueIdentifiers";
import useLocalStorage from "../hooks/useLocalStorage";
import useCurrentDb from "../hooks/useCurrentDb";

const ContactContext = createContext();

/*
Context for Contacts

State:
- contacts: All contacts from backend
- selectedItems: Items selected from the list
- viewMode: View mode selected (e.g. list, group by, etc.)
- currentUser: Current logged-in user
*/
export function ContactProvider({children}) {
  const [contacts, setContacts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useLocalStorage("contacts-view-mode", "list");
  const {currentUser, isLoading} = useAuth();
  const {t} = useTranslation();
  const [paymentTerms, setPaymentTerms] = useState([]);

  const [testVariable, setTestVariable] = useState([]);

  const {generateUniqueName} = useUniqueIdentifiers({
    items: contacts,
    nameKey: "name",
    itemType: "contact",
  });

  const {generateUniqueName: generateUniquePaymentTermName} =
    useUniqueIdentifiers({
      items: paymentTerms,
      nameKey: "name",
      itemType: "paymentTerm",
    });

  const {currentDb} = useCurrentDb();

  const customListComparators = {
    // Generic comparator that works for any field
    default: (a, b, direction, key) => {
      const valueA = (a[key] || "").toString().toLowerCase();
      const valueB = (b[key] || "").toString().toLowerCase();
      return direction === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    },
  };

  /*  */
  const {
    sortedItems: listSortedItems,
    sortConfig: listSortConfig,
    handleSort: handleListSort,
  } = useTableSort(contacts, "name", false, {
    storageKey: "contacts-sort",
    customComparators: customListComparators,
  });

  // Get all contacts from Backend
  useEffect(() => {
    async function fetchContacts() {
      if (isLoading || !currentUser) return;

      try {
        let fetchedContacts = [];

        // Get contacts for the current database
        if (currentDb?.id) {
          fetchedContacts = await AppApi.getContactsByDbId(currentDb.id);
        }

        setContacts(fetchedContacts || []);
      } catch (err) {
        console.error("There was an error retrieving contacts:", err);
        setContacts([]);
      }
    }
    fetchContacts();
  }, [isLoading, currentUser, currentDb]);

  // Function to get the current view's contacts
  const getCurrentViewContacts = useCallback(() => {
    return contacts;
  }, [contacts]);

  // Function to get the list view contacts
  const getListViewContacts = useCallback(() => {
    return contacts;
  }, [contacts]);

  // Function to get the group view contacts
  const getGroupViewContacts = useCallback(() => {
    return contacts;
  }, [contacts]);

  // Add contact to database
  const addContactToDatabase = async (data) => {
    try {
      await AppApi.addContactToDatabase(data);
      console.log(
        `Contact ${data.contactId} successfully added to database ${data.databaseId}`
      );
    } catch (error) {
      console.error("Error adding contact to database:", error);
      // Don't throw error here - allow caller to handle it if needed
      throw error;
    }
  };

  // Create a new contact
  const createContact = async (contactData) => {
    try {
      // Include databaseId in the request so backend can handle both operations atomically
      const dataWithDatabase = currentDb?.id
        ? {...contactData, databaseId: currentDb.id}
        : contactData;

      const res = await AppApi.createContact(dataWithDatabase);
      if (res) {
        setContacts((prevContacts) => [...prevContacts, res]);
        return res;
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  };

  // Update an existing contact
  const updateContact = async (id, contactData) => {
    try {
      const res = await AppApi.updateContact(id, contactData);
      if (res) {
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.id === Number(id) ? res : contact
          )
        );
        return res;
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  };

  // Delete a contact
  const deleteContact = async (id) => {
    try {
      let res = await AppApi.deleteContact(id);

      if (res) {
        setContacts((prevContacts) =>
          prevContacts.filter((contact) => contact.id !== Number(id))
        );
        return res;
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  };

  /* Duplicate Contact */
  async function duplicateContact(contactToDuplicate) {
    if (!contactToDuplicate) return null;

    try {
      const uniqueName = generateUniqueName(contactToDuplicate.name);

      const contactData = {
        name: uniqueName,
        image: contactToDuplicate.image || "",
        street1: contactToDuplicate.street1 || "",
        street2: contactToDuplicate.street2 || "",
        city: contactToDuplicate.city || "",
        state: contactToDuplicate.state || "",
        zip: contactToDuplicate.zip || "",
        country: contactToDuplicate.country || "",
        job_position: contactToDuplicate.job_position || "",
        phone: contactToDuplicate.phone || "",
        email: contactToDuplicate.email || "",
        website: contactToDuplicate.website || "",
      };

      const res = await createContact(contactData);

      //Get the current view's contacts after sorting
      const currentViewContacts = getCurrentViewContacts();
      const newIndex = currentViewContacts.findIndex(
        (contact) => contact.id === res.id
      );

      return {...res, _index: newIndex + 1};
    } catch (error) {
      throw error;
    }
  }

  /* Handles bulk duplication of selected contacts */
  async function bulkDuplicateContacts(selectedContactsIds) {
    if (!selectedContactsIds || selectedContactsIds.length === 0) return [];

    const results = [];

    try {
      // Duplicate each selected contact
      for (const contactId of selectedContactsIds) {
        const contactToDuplicate = contacts.find(
          (contact) => contact.id === contactId
        );
        if (contactToDuplicate) {
          const result = await duplicateContact(contactToDuplicate);
          if (result) {
            results.push(result);
          }
        }
      }
      return results;
    } catch (error) {
      throw error;
    }
  }

  /* Handle selection state */
  const handleToggleSelection = (ids, isSelected) => {
    if (Array.isArray(ids)) {
      if (typeof isSelected === "boolean") {
        setSelectedItems((prev) => {
          if (isSelected) {
            return [...new Set([...prev, ...ids])];
          } else {
            return prev.filter((id) => !ids.includes(id));
          }
        });
      } else {
        setSelectedItems(ids);
      }
    } else {
      setSelectedItems((prev) => {
        if (prev.includes(ids)) {
          return prev.filter((id) => id !== ids);
        } else {
          return [...prev, ids];
        }
      });
    }
  };

  /* Handle payment term selection state */
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState([]);

  const handlePaymentTermToggleSelection = (ids, isSelected) => {
    if (Array.isArray(ids)) {
      if (typeof isSelected === "boolean") {
        setSelectedPaymentTerms((prev) => {
          if (isSelected) {
            return [...new Set([...prev, ...ids])];
          } else {
            return prev.filter((id) => !ids.includes(id));
          }
        });
      } else {
        setSelectedPaymentTerms(ids);
      }
    } else {
      setSelectedPaymentTerms((prev) => {
        if (prev.includes(ids)) {
          return prev.filter((id) => id !== ids);
        } else {
          return [...prev, ids];
        }
      });
    }
  };

  /* Payment term sorting */
  const customPaymentTermComparators = {
    default: (a, b, direction, key) => {
      const valueA = (a[key] || "").toString().toLowerCase();
      const valueB = (b[key] || "").toString().toLowerCase();
      return direction === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    },
  };

  const {
    sortedItems: sortedPaymentTerms,
    sortConfig: paymentTermSortConfig,
    handleSort: handlePaymentTermSort,
  } = useTableSort(paymentTerms, "name", false, {
    storageKey: "payment-terms-sort",
    customComparators: customPaymentTermComparators,
  });

  /* Payment Terms */
  async function createPaymentTerm(paymentTermData) {
    try {
      const res = await AppApi.createPaymentTerm(
        currentDb,
        paymentTermData,
        currentUser.id
      );
      if (res) {
        console.log("res: ", res);
        setPaymentTerms((prevPaymentTerms) => {
          return [...prevPaymentTerms, res];
        });
        console.log("Payment created!");
        return res;
      } else {
        console.log("ContactContext: API returned falsy response");
        return null;
      }
    } catch (error) {
      console.error("ContactContext: Error creating payment term:", error);
      throw error;
    }
  }

  async function updatePaymentTerm(id, paymentTermData) {
    try {
      const res = await AppApi.updatePaymentTerm(
        id,
        paymentTermData,
        currentUser.id,
        currentDb
      );
      if (res) {
        setPaymentTerms((prevPaymentTerms) => {
          const safePrev = Array.isArray(prevPaymentTerms)
            ? prevPaymentTerms
            : [];
          return safePrev.map((paymentTerm) =>
            paymentTerm.id === Number(id) ? res : paymentTerm
          );
        });
        return res;
      }
    } catch (error) {
      console.error("Error updating payment term:", error);
      throw error;
    }
  }

  async function deletePaymentTerm(id) {
    try {
      const res = await AppApi.deletePaymentTerm(id, currentUser.id, currentDb);
      if (res) {
        setPaymentTerms((prevPaymentTerms) => {
          return prevPaymentTerms.filter(
            (paymentTerm) => paymentTerm.id !== Number(id)
          );
        });
        return res;
      }
    } catch (error) {
      console.error("Error deleting payment term:", error);
      throw error;
    }
  }

  /* Duplicate Payment Term */
  async function duplicatePaymentTerm(paymentTermToDuplicate) {
    if (!paymentTermToDuplicate) return null;

    try {
      const uniqueName = generateUniquePaymentTermName(
        paymentTermToDuplicate.name
      );

      const paymentTermData = {
        name: uniqueName,
      };

      const res = await createPaymentTerm(paymentTermData);

      // Get the current view's payment terms after sorting
      const newIndex = paymentTerms.findIndex(
        (paymentTerm) => paymentTerm.id === res.id
      );

      return {...res, _index: newIndex + 1};
    } catch (error) {
      throw error;
    }
  }

  function handleTestVariableChange(testVar) {
    setTestVariable((prev) => [...prev, testVar]);
  }
  console.log("paymentTerms from context: ", paymentTerms);

  const contextValue = useMemo(
    () => ({
      contacts,
      selectedItems,
      setSelectedItems,
      sortConfig: listSortConfig,
      handleSort: handleListSort,
      viewMode,
      setViewMode,
      createContact,
      updateContact,
      deleteContact,
      duplicateContact,
      bulkDuplicateContacts,
      getCurrentViewContacts,
      getListViewContacts,
      getGroupViewContacts,
      handleToggleSelection,
      listSortedItems: listSortedItems || [],
      /* Payment Terms */
      paymentTerms,
      createPaymentTerm,
      updatePaymentTerm,
      deletePaymentTerm,
      duplicatePaymentTerm,
      selectedPaymentTerms,
      handlePaymentTermToggleSelection,
      sortedPaymentTerms: sortedPaymentTerms || [],
      paymentTermSortConfig,
      handlePaymentTermSort,
      generateUniquePaymentTermName,
      currentDb,
      testVariable,
      handleTestVariableChange,
    }),
    [
      contacts,
      selectedItems,
      listSortConfig,
      listSortedItems,
      viewMode,
      paymentTerms,
      selectedPaymentTerms,
      sortedPaymentTerms,
      paymentTermSortConfig,
      currentDb,
      handleListSort,
      handlePaymentTermSort,
      testVariable,
      handleTestVariableChange,
    ]
  );

  return (
    <ContactContext.Provider value={contextValue}>
      {children}
    </ContactContext.Provider>
  );
}

export default ContactContext;
