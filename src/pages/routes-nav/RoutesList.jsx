import React from "react";
import {Routes, Route, Navigate} from "react-router-dom";

import "../../css/style.css";

import {useAuth} from "../../context/AuthContext";
import useCurrentDb from "../../hooks/useCurrentDb";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// Public pages (no sidebar/navbar for unauthenticated users)
import Signin from "../auth/Signin";
import Signup from "../auth/Signup";

// Private pages (sidebar/navbar only when authenticated, guarded by ProtectedRoute)
import Account from "../accountSettings/Account";
import Databases from "../accountSettings/Databases";
import PageNotFound from "../utility/PageNotFound";
import Main from "../Main";
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
import SubscriptionsList from "../subscriptions/SubscriptionsList";
import Subscription from "../subscriptions/Subscription";
import SubscriptionProductsList from "../subscriptions/SubscriptionProductsList";
import SubscriptionProduct from "../subscriptions/SubscriptionProduct";
import ProfessionalDirectory from "../professionals/ProfessionalDirectory";
import CategoryDirectoryPage from "../professionals/CategoryDirectoryPage";
import MyProfessionals from "../professionals/MyProfessionals";
import ProfessionalProfile from "../professionals/ProfessionalProfile";
import ProfessionalFormContainer from "../professionals/ProfessionalFormContainer";
import CategoriesList from "../professionals/categories/CategoriesList";
import CategoryFormContainer from "../professionals/categories/CategoryFormContainer";

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

  // Public routes: no sidebar/navbar; redirect logged-in users to app
  const publicRoutes = (
    <>
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <Signin />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
    </>
  );

  // Private routes: require auth; redirect to /signin with return URL if not logged in
  const privateRoutes = (
    <>
      <Route
        path="/settings/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/databases"
        element={
          <ProtectedRoute>
            <Databases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/home"
        element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/contacts"
        element={
          <ProtectedRoute>
            <ContactList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/contacts/import"
        element={
          <ProtectedRoute>
            <ContactsImport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/contacts/new"
        element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/contacts/:id"
        element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/users"
        element={
          <ProtectedRoute>
            <UsersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/users/import"
        element={
          <ProtectedRoute>
            <UsersImport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/users/:id"
        element={
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/properties"
        element={
          <ProtectedRoute>
            <PropertiesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/properties/import"
        element={
          <ProtectedRoute>
            <PropertiesImport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/properties/:uid"
        element={
          <ProtectedRoute>
            <Property />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/properties/:uid/maintenance/:systemId/:recordId"
        element={
          <ProtectedRoute>
            <MaintenanceRecordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/professionals"
        element={
          <ProtectedRoute>
            <ProfessionalDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/professionals/search"
        element={
          <ProtectedRoute>
            <CategoryDirectoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/professionals/manage"
        element={
          <ProtectedRoute>
            <ProfessionalFormContainer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/professionals/categories"
        element={
          <ProtectedRoute>
            <CategoriesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/professionals/categories/:categoryId"
        element={
          <ProtectedRoute>
            <CategoryFormContainer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/professionals/:proId"
        element={
          <ProtectedRoute>
            <ProfessionalProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/my-professionals"
        element={
          <ProtectedRoute>
            <MyProfessionals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/subscriptions"
        element={
          <ProtectedRoute>
            <SubscriptionsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/subscriptions/new"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/subscriptions/:id"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/subscription-products"
        element={
          <ProtectedRoute>
            <SubscriptionProductsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/subscription-products/new"
        element={
          <ProtectedRoute>
            <SubscriptionProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/subscription-products/:id"
        element={
          <ProtectedRoute>
            <SubscriptionProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/invite/:invitation"
        element={
          <ProtectedRoute>
            <UserConfirmationEmail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:dbUrl/pdfexample"
        element={
          <ProtectedRoute>
            <PdfFileExample />
          </ProtectedRoute>
        }
      />
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
