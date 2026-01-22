import {createContext, useContext, useState, useEffect} from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import AppApi from "../api/api";
import {jwtDecode as decode} from "jwt-decode";

// Key name for storing token in localStorage for "remember me" re-login
export const TOKEN_STORAGE_ID = "app-token";

/* Context for Authentication */
const AuthContext = createContext();

/* Custom hook to use the AuthContext */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/* Provider for the AuthContext */
export function AuthProvider({children}) {
  const [currentUser, setCurrentUser] = useState({
    data: null,
    isLoading: true,
  });
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);
  const [isSigningUp, setIsSigningUp] = useState(false);

  /* Get the current user */
  useEffect(() => {
    async function getCurrentUser() {
      // Skip if we're in the middle of signup - signup() will handle user state
      if (isSigningUp) {
        return;
      }

      if (token) {
        try {
          let {email} = decode(token);
          // put the token on the Api class so it can use it to call the API.
          AppApi.token = token;

          let currentUser = await AppApi.getCurrentUser(email);

          if (!currentUser || !currentUser.id) {
            console.error("Current user or user ID is undefined");
            setCurrentUser({
              isLoading: false,
              data: null,
            });
            return;
          }

          // Use safe method that handles 404 for new users without databases
          let userDatabases = await getUserDatabases(currentUser.id);

          setCurrentUser({
            isLoading: false,
            data: {...currentUser, databases: userDatabases || []},
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
  }, [token, isSigningUp]);

  /** Handles site-wide login */
  async function login(loginData) {
    try {
      let token = await AppApi.login(loginData);
      setToken(token);

      // Wait for user data to be loaded
      const {email} = decode(token);
      AppApi.token = token;
      const currentUser = await AppApi.getCurrentUser(email);

      // Use safe method that handles 404 for new users without databases
      const userDatabases = await getUserDatabases(currentUser.id);

      setCurrentUser({
        isLoading: false,
        data: {...currentUser, databases: userDatabases || []},
      });

      // Clear previous database selection - useCurrentDb hook will set the first database
      localStorage.removeItem("current-db");

      return token;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Helper: Extract token and user from signup response
  function extractTokenFromSignupResponse(signupResponse) {
    if (signupResponse?.token) {
      return {
        token: signupResponse.token,
        user: signupResponse.user || null,
      };
    } else if (typeof signupResponse === "string") {
      // Fallback: if response is just a string token (backward compatibility)
      return {token: signupResponse, user: null};
    } else {
      throw new Error(
        `Invalid signup response format. Expected object with 'token' property or a string, but received: ${typeof signupResponse}`
      );
    }
  }

  // Helper: Get user from signup response or fetch from API
  async function fetchUser(signupUser, token) {
    if (signupUser) {
      return signupUser;
    }

    const decodedToken = decode(token);
    const {email} = decodedToken;
    const currentUser = await AppApi.getCurrentUser(email);

    if (!currentUser) {
      throw new Error("Failed to retrieve user after signup: user is null");
    }

    return currentUser;
  }

  // Helper: Extract and validate user ID from user object or token
  function extractUserId(currentUser, decodedToken) {
    const tokenUserId =
      decodedToken.user_id || decodedToken.userId || decodedToken.id;
    const userId = currentUser.id || currentUser.userId || tokenUserId;

    if (!userId) {
      console.error("User object missing ID:", currentUser);
      console.error("Token payload:", decodedToken);
      throw new Error(
        `Failed to retrieve user ID after signup. User object: ${JSON.stringify(
          currentUser
        )}, Token: ${JSON.stringify(decodedToken)}`
      );
    }

    return userId;
  }

  // Helper: Get user databases with error handling for new users
  async function getUserDatabases(userId) {
    try {
      return await AppApi.getUserDatabases(userId);
    } catch (error) {
      // Return empty array for 404s (new users don't have databases yet)
      const errorMessage = Array.isArray(error)
        ? error.join(" ")
        : error.message || error.toString() || "";
      if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        return [];
      }
      throw error;
    }
  }

  // Helper: Create default database for new user
  async function createDatabase({currentUser, userId}) {
    console.log("createDatabase", currentUser);
    let newDatabase = null;

    try {
      console.log("Creating database for new user:", {
        name: currentUser.name,
        userId: userId,
      });
      console.log("currentUser", currentUser);

      // Backend handles database naming based on user's name
      newDatabase = await AppApi.createDatabase({
        name: currentUser.name,
      });
    } catch (error) {
      // If URL conflict, try once with sequential number
      const errorMessage = Array.isArray(error)
        ? error.join(" ")
        : error.message || error.toString() || "";

      const isConflictError =
        errorMessage.includes("already exists") ||
        errorMessage.includes("duplicate") ||
        errorMessage.includes("409") ||
        errorMessage.includes("Conflict");

      if (isConflictError) {
        console.log("URL conflict, trying with sequential number");
        // Backend will handle conflict resolution with sequential numbers
        newDatabase = await AppApi.createDatabase({
          name: currentUser.name,
        });
      } else {
        // Re-throw if it's a different error
        throw error;
      }
    }

    if (!newDatabase?.id) {
      throw new Error(
        `Database creation failed: database ID is missing. Database object: ${JSON.stringify(
          newDatabase
        )}`
      );
    }

    console.log("Database created successfully:", newDatabase);

    // Create user_database record to link user to database
    console.log("Creating user-database link with:", {
      userId: userId,
      databaseId: newDatabase.id,
      role: "admin",
    });

    await AppApi.addUserToDatabase({
      userId: userId,
      databaseId: newDatabase.id,
      role: "admin",
    });

    console.log("User-database link created successfully");

    // Return the newly created database directly (no need to fetch again)
    return [newDatabase];
  }

  // Helper: Initialize authentication (set token and decode)
  function initializeAuthentication(token) {
    setToken(token);
    AppApi.token = token;
    return decode(token);
  }

  // Helper: Ensure user has at least one database (create if needed)
  async function ensureUserHasDatabase(userId, currentUser, email) {
    let userDatabases = await getUserDatabases(userId);

    if (!userDatabases || userDatabases.length === 0) {
      try {
        userDatabases = await createDefaultDatabase(userId, currentUser, email);
        console.log("User databases after creation:", userDatabases);
      } catch (createError) {
        console.error(
          "Error creating database or user-database link:",
          createError
        );
        const errorMessage = Array.isArray(createError)
          ? createError.join(" ")
          : createError.message || createError.toString() || "Unknown error";
        throw new Error(`Failed to create database: ${errorMessage}`);
      }
    }

    return userDatabases;
  }

  // Helper: Update user state and clear previous database selection
  function finalizeUserSignup(currentUser, userId, userDatabases) {
    const userWithId = {
      ...currentUser,
      id: userId,
      databases: userDatabases,
    };

    setCurrentUser({
      isLoading: false,
      data: userWithId,
    });

    // Clear previous user's database selection to ensure fresh start
    // The useCurrentDb hook will automatically set the first database from userDatabases
    localStorage.removeItem("current-db");

    return userWithId;
  }

  /** Handles site-wide signup */
  async function signup(signupData) {
    setIsSigningUp(true);
    try {
      // Step 1: Sign up and extract token/user from response
      const signupResponse = await AppApi.signup(signupData);
      const {token, user: signupUser} =
        extractTokenFromSignupResponse(signupResponse);

      // Step 2: Initialize authentication
      const decodedToken = initializeAuthentication(token);
      const {email} = decodedToken;

      // Step 3: Get or fetch user
      const currentUser = await fetchUser(signupUser, token);

      // Step 4: Extract and validate user ID
      const userId = extractUserId(currentUser, decodedToken);

      // Step 5: Create database for user
      const userDatabases = await createDatabase({currentUser, userId});

      // Step 6: Activate user
      await AppApi.activateUser({userId});

      // Step 7: Finalize signup (update state and clear previous database selection)
      const userWithId = finalizeUserSignup(currentUser, userId, userDatabases);

      setIsSigningUp(false);
      return {
        user: userWithId,
        token,
      };
    } catch (error) {
      console.error("Signup error:", error);
      setIsSigningUp(false);
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
      "current-db", // Current database selection
      "contacts_list_page", // Contacts list page state
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));

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
