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

// Categories for the dropdown
const CATEGORIES = [
  {id: 1, name: "Inventory"},
  {id: 2, name: "Productivity"},
];

// Get category name from ID
const getCategoryName = (categoryId) => {
  const category = CATEGORIES.find((cat) => cat.id === Number(categoryId));
  return category ? category.name : "";
};

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

  // Add sorting logic for list view
  const customListComparators = {
    category: (a, b, direction) => {
      const categoryA = getCategoryName(a.category).toLowerCase();
      const categoryB = getCategoryName(b.category).toLowerCase();
      return direction === "asc"
        ? categoryA.localeCompare(categoryB)
        : categoryB.localeCompare(categoryA);
    },
  };

  // Add sorting logic for group view
  const customGroupComparators = {
    category: (a, b, direction) => {
      const categoryA = getCategoryName(a.category_id).toLowerCase();
      const categoryB = getCategoryName(b.category_id).toLowerCase();
      // First sort by category
      const categoryCompare =
        direction === "asc"
          ? categoryA.localeCompare(categoryB)
          : categoryB.localeCompare(categoryA);

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
  } = useTableSort(apps, "category", false, {
    storageKey: "apps-group-sort",
    customComparators: customGroupComparators,
  });

  // Memoize the grouped apps list
  const groupedAppsList = useMemo(() => {
    if (viewMode !== "group") return [];

    // Group apps by category name instead of category_id
    const groupedByCategory = groupSortedItems.reduce((acc, app) => {
      const categoryName = getCategoryName(app.category_id);
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(app);
      return acc;
    }, {});

    // Sort categories by name and flatten
    return Object.entries(groupedByCategory)
      .sort(([categoryNameA, appsA], [categoryNameB, appsB]) => {
        return categoryNameA
          .toLowerCase()
          .localeCompare(categoryNameB.toLowerCase());
      })
      .flatMap(([categoryName, apps]) => {
        if (expandedCategories.includes(categoryName)) {
          return apps;
        }
        return [];
      });
  }, [viewMode, groupSortedItems, expandedCategories]);

  // Get the current sorted items based on view mode
  const currentSortedItems = useMemo(() => {
    return viewMode === "list" ? listSortedItems : groupedAppsList;
  }, [viewMode, listSortedItems, groupedAppsList]);

  const currentSortConfig =
    viewMode === "list" ? listSortConfig : groupSortConfig;
  const currentHandleSort =
    viewMode === "list" ? handleListSort : handleGroupSort;

  // Function to get the current view's app list
  const getCurrentViewApps = useCallback(() => {
    return currentSortedItems;
  }, [currentSortedItems]);

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

  const {
    generateUniqueName: generateUniqueAppName,
    generateUniqueUrl: generateUniqueAppUrl,
  } = useUniqueIdentifiers({
    items: apps,
    nameKey: "name",
    urlKey: "url",
    itemType: "app",
  });

  const {
    generateUniqueName: generateUniqueCategoryName,
    generateUniqueUrl: generateUniqueCategoryUrl,
  } = useUniqueIdentifiers({
    items: categories,
    nameKey: "name",
    urlKey: "url",
    itemType: "category",
  });

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
        setApps((prevApps) =>
          [...prevApps, res].sort((a, b) => a.name.localeCompare(b.name))
        );
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
      // Clean the base URL by removing any existing copy suffixes
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
      return res;
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

  console.log("groupedAppsList: ", groupedAppsList);

  return (
    <AppContext.Provider
      value={{
        currentDb,
        setSelectedDb,
        databaseApps,
        apps,
        categories,
        createApp,
        createCategory,
        updateApp,
        updateCategory,
        deleteApp,
        deleteCategory,
        viewMode,
        setViewMode,
        expandedCategories,
        setExpandedCategories,
        selectedItems,
        selectedCategories,
        handleToggleSelection,
        handleCategoryToggleSelection,
        sortedItems: currentSortedItems,
        sortedCategories,
        sortConfig: currentSortConfig,
        categorySortConfig,
        handleSort: currentHandleSort,
        handleCategorySort,
        generateUniqueAppName,
        generateUniqueAppUrl,
        generateUniqueCategoryName,
        generateUniqueCategoryUrl,
        duplicateApp,
        bulkDuplicateApps,
        getCurrentViewApps,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
