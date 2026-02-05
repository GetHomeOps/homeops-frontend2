import React, {createContext, useState, useMemo, useEffect} from "react";
import AppApi from "../api/api";
import useLocalStorage from "../hooks/useLocalStorage";
import {useAuth} from "./AuthContext";
import useCurrentDb from "../hooks/useCurrentDb";

const PropertyContext = createContext();

/* Context for Properties */
export function PropertyProvider({children}) {
  const [properties, setProperties] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useLocalStorage(
    "properties-view-mode",
    "list"
  );
  const {currentUser, isLoading} = useAuth();
  const {currentDb} = useCurrentDb();

  /* Get properties from backend */
  async function fetchProperties() {
    if (isLoading || !currentUser) return;
    try {
      let fetchedProperties;
      if (currentUser.role === "super_admin") {
        fetchedProperties = await AppApi.getAllProperties();
      } else {
        if (currentDb?.id) {
          fetchedProperties = await AppApi.getPropertiesByUserId(
            currentUser.id
          );
        }
      }
      setProperties(fetchedProperties || []);
    } catch (err) {
      console.error("There was an error retrieving properties:", err);
      setProperties([]);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, [isLoading, currentDb]);

  /* Get all properties by user ID */
  async function getPropertiesByUserId(userId) {
    try {
      const res = await AppApi.getPropertiesByUserId(userId);
      return res;
    } catch (err) {
      console.error("There was an error getting properties by user ID:", err);
      throw err;
    }
  }

  /* Get a property by ID */
  async function getPropertyById(uid) {
    try {
      const res = await AppApi.getPropertyById(uid);
      return res;
    } catch (err) {
      console.error("There was an error getting property by UID:", err);
      throw err;
    }
  }

  /* Add users to property */
  async function addUsersToProperty(propertyId, users) {
    try {
      const res = await AppApi.addUsersToProperty(propertyId, users);
      return res;
    } catch (err) {
      console.error("There was an error adding users to property:", err);
      throw err;
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

  /* Create a new property */
  const createProperty = async (propertyData) => {
    try {
      const res = await AppApi.createProperty(propertyData);
      setProperties((prevProperties) => [...prevProperties, res]);
      return res;
    } catch (err) {
      console.error("There was an error creating property:", err);
      throw err;
    }
  };

  /* Update a property */
  async function updateProperty(propertyId, propertyData) {
    try {
      const res = await AppApi.updateProperty(propertyId, propertyData);
      setProperties((prevProperties) =>
        prevProperties.map((property) =>
          property.id === propertyId ? res : property
        )
      );
      return res;
    } catch (err) {
      console.error("There was an error updating property:", err);
      throw err;
    }
  }

  /* Update a property team */
  async function updateTeam(propertyId, team) {
    try {
      const res = await AppApi.updatePropertyTeam(propertyId, team);
      return res;
    } catch (err) {
      console.error("There was an error updating property team:", err);
      throw err;
    }
  }

  /* Create systems for a property (used after createProperty) */
  async function createSystemsForProperty(propertyId, systemsPayloads) {
    if (!systemsPayloads?.length) return;
    await Promise.all(
      systemsPayloads.map((payload) => AppApi.createSystem(payload))
    );
  }
  /* Update systems for a property */
  async function updateSystemsForProperty(propertyId, systems) {
    if (!systems?.length) return;
    try {
      const res = await Promise.all(
        systems.map((system) => AppApi.updateSystem(propertyId, system))
      );
      return res;
    } catch (err) {
      console.error("There was an error updating systems for property:", err);
      throw err;
    }
  }

  /* Get all systems by property ID */
  async function getSystemsByPropertyId(propertyId) {
    console.log("Getting systems by property ID: ", propertyId);
    try {
      const res = await AppApi.getSystemsByPropertyId(propertyId);
      console.log("Systems by property ID: ", res);
      return res;
    } catch (err) {
      console.error("There was an error getting systems by property ID:", err);
      throw err;
    }
  }

  /* Delete a property */
  const deleteProperty = async (propertyId) => {
    try {
      const res = await AppApi.deleteProperty(propertyId);
      setProperties((prevProperties) =>
        prevProperties.filter((property) => property.id !== propertyId)
      );
      return res;
    } catch (err) {
      console.error("There was an error deleting property:", err);
      throw err;
    }
  };

  /* Get property team */
  async function getPropertyTeam(propertyId) {
    try {
      const res = await AppApi.getPropertyTeam(propertyId);
      return res;
    } catch (err) {
      console.error("There was an error getting property team:", err);
      throw err;
    }
  }

  useEffect(() => {}, [isLoading, currentUser, currentDb]);

  const contextValue = useMemo(
    () => ({
      currentDb,
      properties,
      selectedItems,
      setSelectedItems,
      viewMode,
      setViewMode,
      createProperty,
      createSystemsForProperty,
      updateProperty,
      deleteProperty,
      getPropertyById,
      addUsersToProperty,
      getPropertyTeam,
      updateTeam,
      getSystemsByPropertyId,
      updateSystemsForProperty,
    }),
    [properties, currentDb]
  );

  return (
    <PropertyContext.Provider value={contextValue}>
      {children}
    </PropertyContext.Provider>
  );
}

export default PropertyContext;
