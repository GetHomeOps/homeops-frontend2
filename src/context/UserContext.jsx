import React, {createContext, useState, useContext, useEffect} from "react";
import {useTableSort} from "../hooks/useTableSort";
import AppApi from "../api/api";
import {useAuth} from "./AuthContext";
import useCurrentDb from "../hooks/useCurrentDb";

const UserContext = createContext();

/* Context for Users */
export function UserProvider({children}) {
  const [users, setUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const {currentUser, isLoading} = useAuth();
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

  const {
    sortedItems: listSortedItems,
    sortConfig: listSortConfig,
    handleSort: handleListSort,
  } = useTableSort(users, "fullName", false, {
    storageKey: "users-sort",
    customComparators: customListComparators,
  });

  const fetchUsers = async () => {
    if (isLoading || !currentUser) return;

    try {
      let fetchedUsers;

      // If user is superAdmin, get all users
      if (currentUser.role === "super_admin") {
        fetchedUsers = await AppApi.getAllUsers();
      }
      // Otherwise, only get users for the current database (requires database ID)
      else if (currentDb?.id) {
        fetchedUsers = await AppApi.getUsersByDatabaseId(currentDb.id);
      }
      // If no database is available, don't fetch users
      else {
        fetchedUsers = [];
      }

      setUsers(fetchedUsers);
    } catch (err) {
      console.error("There was an error retrieving users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isLoading, currentUser, currentDb]);

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

  // Create a new user
  const createUser = async (userData) => {
    try {
      const res = await AppApi.signup(userData);
      if (res && res.user) {
        // Add user to context immediately (like ContactContext does)
        setUsers((prevUsers) => [...prevUsers, res.user]);
        return res.user;
      }
      // If user not in response, refresh users list and find by email
      if (res) {
        await fetchUsers();
        // Wait a moment for state to update, then get fresh users
        let freshUsers;
        if (currentUser?.role === "super_admin") {
          freshUsers = await AppApi.getAllUsers();
        } else if (currentDb?.id) {
          freshUsers = await AppApi.getUsersByDatabaseId(currentDb.id);
        } else {
          freshUsers = [];
        }
        setUsers(freshUsers);
        const newUser = freshUsers.find((u) => u.email === userData.email);
        if (newUser) {
          return newUser;
        }
      }
      throw new Error("User creation failed");
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  // Create a new user confirmation token and add it to the user object
  // The backend returns the token which should be stored on the user
  const createUserConfirmationToken = async (userId) => {
    try {
      // Request backend to create invitation token for the user
      const res = await AppApi.createUserConfirmationToken({
        userId,
      });

      // Extract token from response (backend should return it)
      const token = res?.token || res?.result?.token || res?.result;

      // Update the user in context with the confirmation token
      if (token) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? {...user, confirmationToken: token} : user
          )
        );
        return token;
      }

      throw new Error("Token not returned from backend");
    } catch (error) {
      console.error("Error creating user confirmation token:", error);
      throw error;
    }
  };

  // Validate a user invitation token and confirm user
  const validateUserInvitationToken = async (data) => {
    try {
      const res = await AppApi.validateUserInvitationToken(data);
      return res;
    } catch (error) {
      console.error("Error validating user invitation token:", error);
      throw error;
    }
  };

  // Delete a user
  const deleteUser = async (id) => {
    try {
      let res = await AppApi.deleteUser(id);

      if (res) {
        // Remove user from context immediately (like ContactContext does)
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== Number(id))
        );
        return res;
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  // Generate unique email for duplicate users
  const generateUniqueEmail = (originalEmail) => {
    if (!originalEmail) return "";
    const [localPart, domain] = originalEmail.split("@");
    if (!domain) return originalEmail;

    let counter = 1;
    let newEmail = `${localPart}_copy${counter}@${domain}`;

    // Check if email already exists, increment counter if needed
    while (users.some((user) => user.email === newEmail)) {
      counter++;
      newEmail = `${localPart}_copy${counter}@${domain}`;
    }

    return newEmail;
  };

  // Generate unique name for duplicate users
  const generateUniqueName = (originalName) => {
    if (!originalName) return "";

    let counter = 1;
    let newName = `${originalName} (Copy ${counter})`;

    // Check if name already exists, increment counter if needed
    while (users.some((user) => (user.name || user.fullName) === newName)) {
      counter++;
      newName = `${originalName} (Copy ${counter})`;
    }

    return newName;
  };

  // Duplicate a user
  const duplicateUser = async (userToDuplicate) => {
    if (!userToDuplicate) return null;

    try {
      const uniqueEmail = generateUniqueEmail(userToDuplicate.email);
      const uniqueName = generateUniqueName(
        userToDuplicate.name || userToDuplicate.fullName
      );

      // Generate a random password for the duplicate
      const generateRandomPassword = () => {
        const length = 16;
        const charset =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < length; i++) {
          password += charset.charAt(
            Math.floor(Math.random() * charset.length)
          );
        }
        return password;
      };

      const userData = {
        name: uniqueName,
        email: uniqueEmail,
        phone: userToDuplicate.phone || "",
        role: userToDuplicate.role || "",
        contact: userToDuplicate.contact || 0,
        password: generateRandomPassword(),
        is_active: false,
      };

      const res = await createUser(userData);
      return res;
    } catch (error) {
      console.error("Error duplicating user:", error);
      throw error;
    }
  };

  // Handles bulk duplication of selected users
  const bulkDuplicateUsers = async (selectedUserIds) => {
    if (!selectedUserIds || selectedUserIds.length === 0) return [];

    const results = [];

    try {
      // Duplicate each selected user
      for (const userId of selectedUserIds) {
        const userToDuplicate = users.find((user) => user.id === userId);
        if (userToDuplicate) {
          const result = await duplicateUser(userToDuplicate);
          if (result) {
            results.push(result);
          }
        }
      }
      return results;
    } catch (error) {
      throw error;
    }
  };

  // Validate a user invitation token

  return (
    <UserContext.Provider
      value={{
        users,
        selectedItems,
        setSelectedItems,
        handleToggleSelection,
        setUsers,
        createUser,
        deleteUser,
        duplicateUser,
        bulkDuplicateUsers,
        createUserConfirmationToken,
        validateUserInvitationToken,
        sortedUsers: listSortedItems,
        sortConfig: listSortConfig,
        handleSort: handleListSort,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
