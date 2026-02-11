import React from "react";
import {Navigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import useCurrentDb from "../../hooks/useCurrentDb";

/**
 * Wraps public-only routes (e.g. signin, signup).
 * - When user is already logged in, redirects to app home (no sidebar/navbar on auth pages).
 * - Renders children only when not authenticated.
 */
function PublicRoute({children}) {
  const {currentUser, isLoading} = useAuth();
  const {currentDb} = useCurrentDb();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (currentUser) {
    const target =
      currentDb?.url ? `/${currentDb.url}/home` : "/settings/account";
    return <Navigate to={target} replace />;
  }

  return children;
}

export default PublicRoute;
