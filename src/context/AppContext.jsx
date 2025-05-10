import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import AppApi from "../api/api";
import {useTableSort} from "../hooks/useTableSort";
import {useAuth} from "./AuthContext";
import useUniqueIdentifiers from "../hooks/useUniqueIdentifiers.jsx";

const AppContext = createContext();

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export function AppProvider({children}) {
  const {currentUser} = useAuth();
  const [currentDb, setCurrentDb] = useLocalStorage("current-db", null);
  const [databaseApps, setDatabaseApps] = useState([]);
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [viewMode, setViewMode] = useLocalStorage("apps-view-mode", "list");
  const [expandedCategories, setExpandedCategories] = useLocalStorage(
    "expanded-categories",
    []
  );

  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === Number(categoryId));
    return category ? category.name : "";
  };

  // Add sorting logic for list view
  const customListComparators = {
    name: (a, b, direction) => {
      return direction === "asc"
        ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        : b.name.toLowerCase().localeCompare(a.name.toLowerCase());
    },
    category: (a, b, direction) => {
      const categoryA = getCategoryName(a.category_id).toLowerCase();
      const categoryB = getCategoryName(b.category_id).toLowerCase();
      return direction === "asc"
        ? categoryA.localeCompare(categoryB)
        : categoryB.localeCompare(categoryA);
    },
  };

  // Add sorting logic for group view
  const customGroupComparators = {
    name: (a, b, direction) => {
      // First sort by category name
      const categoryA = getCategoryName(a.category_id).toLowerCase();
      const categoryB = getCategoryName(b.category_id).toLowerCase();
      const categoryCompare = categoryA.localeCompare(categoryB);

      // If same category, sort by name
      if (categoryCompare === 0) {
        return direction === "asc"
          ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          : b.name.toLowerCase().localeCompare(a.name.toLowerCase());
      }
      return categoryCompare;
    },
  };

  const {
    sortedItems: listSortedItems,
    sortConfig: listSortConfig,
    handleSort: handleListSort,
  } = useTableSort(apps, "name", false, {
    storageKey: "apps-list-sort",
    customComparators: customListComparators,
  });

  const {
    sortedItems: groupSortedItems,
    sortConfig: groupSortConfig,
    handleSort: handleGroupSort,
  } = useTableSort(apps, "name", false, {
    storageKey: "apps-group-sort",
    customComparators: customGroupComparators,
  });

  // Memoize the grouped apps list with proper ordering
  const groupedAppsList = useMemo(() => {
    // Always return an array, even if empty
    if (!groupSortedItems || groupSortedItems.length === 0) return [];

    // First sort categories alphabetically
    const sortedCategories = [
      ...new Set(
        groupSortedItems.map((app) => getCategoryName(app.category_id))
      ),
    ].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    // Group apps by category name
    const groupedByCategory = groupSortedItems.reduce((acc, app) => {
      const categoryName = getCategoryName(app.category_id);
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(app);
      return acc;
    }, {});

    // Sort apps within each category by name
    Object.keys(groupedByCategory).forEach((categoryName) => {
      groupedByCategory[categoryName].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    });

    // Return apps in the correct order based on sorted categories
    return sortedCategories
      .filter((categoryName) => expandedCategories.includes(categoryName))
      .flatMap((categoryName) => groupedByCategory[categoryName] || []);
  }, [groupSortedItems, expandedCategories]);

  // Get the current view's apps based on view mode
  const currentViewApps = useMemo(() => {
    return viewMode === "list" ? listSortedItems : groupedAppsList;
  }, [viewMode, listSortedItems, groupedAppsList]);

  // Function to get the current view's app list
  const getCurrentViewApps = useCallback(() => {
    return currentViewApps;
  }, [currentViewApps]);

  // Function to get the list view apps
  const getListViewApps = useCallback(() => {
    return listSortedItems;
  }, [listSortedItems]);

  // Function to get the group view apps
  const getGroupViewApps = useCallback(() => {
    return groupedAppsList;
  }, [groupedAppsList]);

  // Add sorting logic for categories
  const customCategoryComparators = {
    name: (a, b, direction) => {
      return direction === "asc"
        ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        : b.name.toLowerCase().localeCompare(a.name.toLowerCase());
    },
  };

  const {
    sortedItems: sortedCategories,
    sortConfig: categorySortConfig,
    handleSort: handleCategorySort,
  } = useTableSort(categories, "name", false, {
    storageKey: "categories-sort",
    customComparators: customCategoryComparators,
  });

  const useUniqueIdentifiersForType = (items, type) => {
    return useUniqueIdentifiers({
      items,
      nameKey: "name",
      urlKey: "url",
      itemType: type,
    });
  };

  const {
    generateUniqueName: generateUniqueAppName,
    generateUniqueUrl: generateUniqueAppUrl,
  } = useUniqueIdentifiersForType(apps, "app");

  const {
    generateUniqueName: generateUniqueCategoryName,
    generateUniqueUrl: generateUniqueCategoryUrl,
  } = useUniqueIdentifiersForType(categories, "category");

  /* Helper function to check if a URL is unique considering both existing and new URLs */
  const isUrlUnique = (url, existingAndNewUrls = []) => {
    return (
      !apps.some((app) => app.url === url) && !existingAndNewUrls.includes(url)
    );
  };

  /* Helper function to generate a unique URL considering both existing and new URLs */
  const generateUniqueAppUrlWithNew = (
    baseUrl,
    existingAndNewUrls = [],
    index = 1
  ) => {
    const urlToTry =
      index === 1 ? `${baseUrl}-copy` : `${baseUrl}-copy-${index}`;

    if (isUrlUnique(urlToTry, existingAndNewUrls)) {
      return urlToTry;
    }
    return generateUniqueAppUrlWithNew(baseUrl, existingAndNewUrls, index + 1);
  };

  /* Get apps linked to current Database and stores them on state */
  useEffect(() => {
    async function loadApps() {
      if (!currentDb || !currentUser) return;
      try {
        let dbApps = await AppApi.getAppsByDb(currentDb);
        setDatabaseApps(dbApps);
      } catch (err) {
        console.error("Error loading database apps:", err);
        setDatabaseApps([]);
      }
    }
    loadApps();
  }, [currentDb, currentUser]);

  /* Get All Apps (Only for Super_Admin) */
  useEffect(() => {
    async function getAllApps() {
      if (!currentUser) return;
      try {
        let apps = await AppApi.getAllApps();
        setApps(apps);
      } catch (err) {
        console.error("There was an error retrieving all apps:", err);
        setApps([]);
      }
    }
    getAllApps();
  }, [currentUser]);

  /* Get All Categories */
  useEffect(() => {
    async function getAllCategories() {
      if (!currentUser) return;
      try {
        let fetchedCategories = await AppApi.getAllCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("There was an error retrieving all categories:", err);
        setCategories([]);
      }
    }
    getAllCategories();
  }, [currentUser]);

  /* Handles site-wide database id */
  function setSelectedDb(dbId) {
    setCurrentDb(dbId);
  }

  /* Creates app on database */
  async function createApp(appData) {
    try {
      let res = await AppApi.addApp({
        name: appData.name,
        icon: appData.icon,
        url: appData.url,
        category_id: appData.category_id,
        description: appData.description,
      });

      if (res) {
        // Update apps list with a single state update
        setApps((prevApps) => {
          const newApps = [...prevApps, res];
          return newApps.sort((a, b) => a.name.localeCompare(b.name));
        });
        return res;
      }
      return res;
    } catch (error) {
      console.error("Error creating new app:", error);
      throw error;
    }
  }

  /* Updates app in database */
  async function updateApp(id, appData) {
    try {
      let res = await AppApi.updateApp(id, {
        name: appData.name,
        icon: appData.icon,
        url: appData.url,
        category_id: appData.category_id,
        description: appData.description,
      });

      if (res) {
        setApps((prevApps) => {
          const updatedApps = prevApps.map((app) =>
            app.id === Number(id) ? res : app
          );
          return updatedApps;
        });
        return res;
      }
    } catch (error) {
      console.error("Error updating app:", error);
      throw error;
    }
  }

  /* Deletes app from database */
  async function deleteApp(id) {
    try {
      let res = await AppApi.deleteApp(id);

      if (res) {
        setApps((prevApps) => prevApps.filter((app) => app.id !== Number(id)));
        return res;
      }
    } catch (error) {
      console.error("Error deleting app:", error);
      throw error;
    }
  }

  /* Creates category */
  async function createCategory(categoryData) {
    try {
      let res = await AppApi.addCategory({
        name: categoryData.name,
        icon: categoryData.icon,
        url: categoryData.url,
        description: categoryData.description,
      });

      if (res) {
        setCategories((prevCategories) =>
          [...prevCategories, res].sort((a, b) => a.name.localeCompare(b.name))
        );
        return res;
      }
      return res;
    } catch (error) {
      console.error("Error creating new category:", error);
      throw error;
    }
  }

  /* Updates category in database */
  async function updateCategory(id, categoryData) {
    try {
      let res = await AppApi.updateCategory(id, {
        name: categoryData.name,
        icon: categoryData.icon,
        url: categoryData.url,
        description: categoryData.description,
      });

      if (res) {
        setCategories((prevCategories) => {
          const updatedCategories = prevCategories.map((category) =>
            category.id === Number(id) ? res : category
          );
          return updatedCategories;
        });
        return res;
      }
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  /* Deletes category from database */
  async function deleteCategory(id) {
    try {
      let res = await AppApi.deleteCategory(id);

      if (res) {
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== Number(id))
        );
        return res;
      }
    } catch (error) {
      console.error("Error deleting category:", error);
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

  /* Handle category selection state */
  const handleCategoryToggleSelection = (ids, isSelected) => {
    if (Array.isArray(ids)) {
      if (typeof isSelected === "boolean") {
        setSelectedCategories((prev) => {
          if (isSelected) {
            return [...new Set([...prev, ...ids])];
          } else {
            return prev.filter((id) => !ids.includes(id));
          }
        });
      } else {
        setSelectedCategories(ids);
      }
    } else {
      setSelectedCategories((prev) => {
        if (prev.includes(ids)) {
          return prev.filter((id) => id !== ids);
        } else {
          return [...prev, ids];
        }
      });
    }
  };

  /* Unified app duplication function */
  const duplicateApp = async (appToDuplicate, existingAndNewUrls = []) => {
    if (!appToDuplicate) return null;

    try {
      const uniqueName = generateUniqueAppName(appToDuplicate.name);
      const baseUrl = appToDuplicate.url.replace(/-copy(-\d+)?$/, "");
      const uniqueUrl = generateUniqueAppUrlWithNew(
        baseUrl,
        existingAndNewUrls
      );

      const appData = {
        name: uniqueName,
        icon: appToDuplicate.icon,
        url: uniqueUrl,
        category_id: appToDuplicate.category_id,
        description: appToDuplicate.description,
      };

      const res = await createApp(appData);

      // Get the current view's apps after sorting
      const currentViewApps = getCurrentViewApps();
      const newIndex = currentViewApps.findIndex((app) => app.id === res.id);

      return {
        ...res,
        _index: newIndex + 1, // Add 1-based index to the response
      };
    } catch (error) {
      console.error("Error duplicating app:", error);
      throw error;
    }
  };

  /* Handles bulk duplication of selected apps */
  const bulkDuplicateApps = async (selectedAppIds) => {
    if (!selectedAppIds || selectedAppIds.length === 0) return [];

    const createdUrls = [];
    const results = [];

    try {
      // Duplicate each selected app
      for (const appId of selectedAppIds) {
        const appToDuplicate = apps.find((app) => app.id === appId);
        if (appToDuplicate) {
          const result = await duplicateApp(appToDuplicate, createdUrls);
          if (result) {
            createdUrls.push(result.url);
            results.push(result);
          }
        }
      }
      return results;
    } catch (error) {
      console.error("Error in bulk app duplication:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        apps,
        bulkDuplicateApps,
        categories,
        categorySortConfig,
        createApp,
        createCategory,
        currentDb,
        currentViewApps,
        databaseApps,
        deleteApp,
        deleteCategory,
        duplicateApp,
        expandedCategories,
        generateUniqueAppName,
        generateUniqueAppUrl,
        generateUniqueCategoryName,
        generateUniqueCategoryUrl,
        getCurrentViewApps,
        getGroupViewApps,
        getListViewApps,
        groupSortConfig,
        groupedAppsList: groupedAppsList || [],
        handleCategorySort,
        handleCategoryToggleSelection,
        handleGroupSort,
        handleListSort,
        handleSort: handleListSort,
        handleToggleSelection,
        listSortConfig,
        listSortedItems: listSortedItems || [],
        selectedCategories,
        selectedItems,
        setExpandedCategories,
        setSelectedDb,
        setViewMode,
        sortConfig: listSortConfig,
        sortedCategories,
        sortedItems: currentViewApps,
        updateApp,
        updateCategory,
        viewMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
