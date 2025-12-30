import React from "react";
import {Routes, Route, Navigate, useLocation} from "react-router-dom";

import "../../css/style.css";

// Import pages
import Signin from "../auth/Signin";
import Signup from "../auth/Signup";
import Account from "../accountSettings/Account";
import Databases from "../accountSettings/Databases";
import PageNotFound from "../utility/PageNotFound";
import Main from "../Main";
import {useAuth} from "../../context/AuthContext";
import useCurrentDb from "../../hooks/useCurrentDb";
import ContactList from "../contacts/ContactsList";
import UsersList from "../users/UsersList";
import User from "../users/User";
import Contact from "../contacts/Contact";
import PropertiesList from "../properties/PropertiesList";
import Property from "../properties/Property";

// Component to handle root path redirect
function RootRedirect() {
  const {currentUser} = useAuth();
  const {currentDb} = useCurrentDb();
  const location = useLocation();

  // If user is logged in and has a database, redirect to home
  if (currentUser && currentDb?.url) {
    return <Navigate to={`/${currentDb.url}/home`} replace />;
  }

  // If user is logged in but no database yet, stay on current route or go to signin
  if (currentUser) {
    // If already on a valid route, don't redirect
    if (location.pathname !== "/" && location.pathname !== "") {
      return null;
    }
    return <Navigate to="/signin" replace />;
  }

  // Not logged in, go to signin
  return <Navigate to="/signin" replace />;
}

function RoutesList() {
  const {currentUser, isLoading} = useAuth();

  // Show nothing while checking authentication
  if (isLoading) {
    return null; // Or return a loading spinner component
  }

  // Define all routes
  const publicRoutes = (
    <>
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
    </>
  );

  const privateRoutes = (
    <>
      <Route path="/settings/account" element={<Account />} />
      <Route path="/:dbUrl/home" element={<Main />} />
      <Route path="/:dbUrl/contacts" element={<ContactList />} />
      <Route path="/:dbUrl/contacts/new" element={<Contact />} />
      <Route path="/:dbUrl/contacts/:id" element={<Contact />} />
      <Route path="/:dbUrl/users" element={<UsersList />} />
      <Route path="/:dbUrl/users/new" element={<User />} />
      <Route path="/:dbUrl/users/:id" element={<User />} />
      <Route path="/:dbUrl/properties" element={<PropertiesList />} />
      <Route path="/:dbUrl/properties/new" element={<Property />} />
      <Route path="/:dbUrl/properties/:id" element={<Property />} />
    </>
  );

  return (
    <Routes>
      {/* Root path redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Always include both sets of routes */}
      {publicRoutes}
      {privateRoutes}

      {/* Fallback for unknown routes */}
      <Route
        path="*"
        element={
          currentUser ? (
            <Navigate to={currentUser?.databases?.[0]?.url ? `/${currentUser.databases[0].url}/home` : "/signin"} replace />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
    </Routes>
  );
}

export default RoutesList;
