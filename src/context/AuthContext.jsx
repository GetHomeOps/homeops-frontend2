import {createContext, useContext, useState, useEffect} from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import AppApi from "../api/api";
import {jwtDecode as decode} from "jwt-decode";

// Key name for storing token in localStorage for "remember me" re-login
export const TOKEN_STORAGE_ID = "app-token";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({children}) {
  const [currentUser, setCurrentUser] = useState({
    data: null,
    isLoading: true,
  });
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);

  useEffect(() => {
    async function getCurrentUser() {
      if (token) {
        try {
          let {email} = decode(token);
          // put the token on the Api class so it can use it to call the API.
          AppApi.token = token;

          let currentUser = await AppApi.getCurrentUser(email);

          // Debug check
          console.log("Retrieved user:", currentUser);

          if (!currentUser || !currentUser.id) {
            console.error("Current user or user ID is undefined");
            setCurrentUser({
              isLoading: false,
              data: null,
            });
            return;
          }

          let userDatabases = await AppApi.getUserDatabases(currentUser.id);

          setCurrentUser({
            isLoading: false,
            data: {...currentUser, databases: userDatabases},
          });
        } catch (err) {
          console.error("App loadUserInfo: problem loading", err);
          setCurrentUser({
            isLoading: false,
            data: null,
          });
        }
      } else {
        setCurrentUser({
          isLoading: false,
          data: null,
        });
      }
    }
    getCurrentUser();
  }, [token]);

  /** Handles site-wide login */
  async function login(loginData) {
    try {
      let token = await AppApi.login(loginData);
      setToken(token);

      // Wait for user data to be loaded
      const {email} = decode(token);
      AppApi.token = token;
      const currentUser = await AppApi.getCurrentUser(email);
      const userDatabases = await AppApi.getUserDatabases(currentUser.id);

      setCurrentUser({
        isLoading: false,
        data: {...currentUser, databases: userDatabases},
      });

      return token;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /** Handles site-wide signup */
  async function signup(signupData) {
    try {
      let token = await AppApi.signup(signupData);
      setToken(token);
      return token;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  /** Handle user logout */
  function logout() {
    // Clear the token from storage and API
    localStorage.removeItem(TOKEN_STORAGE_ID);
    AppApi.token = null;

    // Clear all app-related localStorage items
    const keysToRemove = [
      TOKEN_STORAGE_ID,
      "apps_list_page", // Current page state
      "apps-view-mode", // View mode preference
      "expanded-categories", // Expanded categories state
      "apps-list-sort", // List view sorting
      "apps-group-sort", // Group view sorting
      "contacts_list_page", // Contacts list page state
      "categories_list_page", // Categories list page state
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Set default sort configurations
    const defaultListSort = {
      key: "name",
      direction: "asc",
    };
    const defaultGroupSort = {
      key: "category",
      direction: "asc",
    };

    localStorage.setItem("apps-list-sort", JSON.stringify(defaultListSort));
    localStorage.setItem("apps-group-sort", JSON.stringify(defaultGroupSort));

    // Reset user state
    setCurrentUser({
      isLoading: false,
      data: null,
    });
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser: currentUser.data,
        isLoading: currentUser.isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
