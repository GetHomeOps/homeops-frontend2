import React from "react";
import {Routes, Route, Navigate} from "react-router-dom";

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
import UsersImport from "../users/usersImport";
import Contact from "../contacts/Contact";
import PropertiesList from "../properties/PropertiesList";
import Property from "../properties/Property";
import PropertiesImport from "../properties/propertiesImport";
import UserConfirmationEmail from "../users/UserConfirmationEmail";
import MaintenanceRecordPage from "../properties/MaintenanceRecordPage";
import PdfFileExample from "../pdfFileExample";
import ContactsImport from "../contacts/contactsImport";

function RoutesList() {
  const {currentUser, isLoading} = useAuth();
  const {currentDb} = useCurrentDb();

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
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
      <Route path="/:dbUrl/contacts/import" element={<ContactsImport />} />
      <Route path="/:dbUrl/contacts/new" element={<Contact />} />
      <Route path="/:dbUrl/contacts/:id" element={<Contact />} />
      <Route path="/:dbUrl/users" element={<UsersList />} />
      <Route path="/:dbUrl/users/import" element={<UsersImport />} />
      <Route path="/:dbUrl/users/:id" element={<User />} />
      <Route path="/:dbUrl/properties" element={<PropertiesList />} />
      <Route path="/:dbUrl/properties/import" element={<PropertiesImport />} />
      <Route path="/:dbUrl/properties/:uid" element={<Property />} />
      <Route
        path="/:dbUrl/properties/:uid/maintenance/:systemId/:recordId"
        element={<MaintenanceRecordPage />}
      />

      <Route
        path="/:dbUrl/invite/:invitation"
        element={<UserConfirmationEmail />}
      />
      <Route path="/:dbUrl/pdfexample" element={<PdfFileExample />} />
    </>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          currentUser ? (
            currentDb?.url ? (
              <Navigate to={`/${currentDb.url}/home`} replace />
            ) : (
              // Handle no DB: show picker or error instead of loop/blank
              <div>
                <h1>No database selected!</h1>
                <p>
                  Choose one from <a href="/settings/databases">Databases</a> or
                  create new.
                </p>
              </div>
            )
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      {/* Always include both sets of routes */}
      {publicRoutes}
      {privateRoutes}

      {/* Dynamic fallback based on auth state */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default RoutesList;
