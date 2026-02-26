import React from "react";
import {Routes, Route, Navigate} from "react-router-dom";

import "../../css/style.css";

import {useAuth} from "../../context/AuthContext";
import useCurrentAccount from "../../hooks/useCurrentAccount";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PublicRoute from "./PublicRoute";
import OnboardingRoute from "./OnboardingRoute";
import OnboardingWizard from "../onboarding/OnboardingWizard";

// Public pages (no sidebar/navbar for unauthenticated users)
import Signin from "../auth/Signin";
import Signup from "../auth/Signup";
import AuthCallback from "../auth/AuthCallback";

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
import ProfessionalsDirectorySample from "../professionals/ProfessionalsDirectorySample";
import CategoryDirectoryPage from "../professionals/CategoryDirectoryPage";
import CategoryDirectoryPageSample from "../professionals/CategoryDirectoryPageSample";
import MyProfessionals from "../professionals/MyProfessionals";
import ProfessionalProfile from "../professionals/ProfessionalProfile";
import ProfessionalFormContainer from "../professionals/ProfessionalFormContainer";
import ProfessionalsList from "../professionals/ProfessionalsList";
import CategoriesList from "../professionals/categories/CategoriesList";
import CategoryFormContainer from "../professionals/categories/CategoryFormContainer";
import DashboardOverview from "../dashboard/DashboardOverview";
import AccountAnalytics from "../dashboard/AccountAnalytics";
import CostAnalytics from "../dashboard/CostAnalytics";
import EngagementDashboard from "../dashboard/EngagementDashboard";
import GrowthDashboard from "../dashboard/GrowthDashboard";
import InvitationsList from "../invitations/InvitationsList";
import BillingPage from "../settings/BillingPage";
import ConfigurationPage from "../settings/ConfigurationPage";
import SupportList from "../support/SupportList";
import SupportNew from "../support/SupportNew";
import SupportTicket from "../support/SupportTicket";
import SupportManagement from "../support/SupportManagement";
import FeedbackManagement from "../support/FeedbackManagement";
import TicketDetailPage from "../support/TicketDetailPage";
import ResourcesManagement from "../resources/ResourcesManagement";
import Resource from "../resources/Resource";
import ResourceViewerPage from "../resources/ResourceViewerPage";
import ResourcePreviewPage from "../resources/ResourcePreviewPage";
import Calendar from "../calendar/Calendar";


function RoutesList() {
  const {currentUser, isLoading} = useAuth();
  const {currentAccount} = useCurrentAccount();

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
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingWizard />
          </OnboardingRoute>
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
        path="/settings/accounts"
        element={
          <ProtectedRoute>
            <Databases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/home"
        element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/dashboard"
        element={
          <ProtectedRoute>
            <DashboardOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/dashboard/accounts"
        element={
          <ProtectedRoute>
            <AccountAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/dashboard/costs"
        element={
          <ProtectedRoute>
            <CostAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/dashboard/engagement"
        element={
          <ProtectedRoute>
            <EngagementDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/dashboard/growth"
        element={
          <ProtectedRoute>
            <GrowthDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/invitations"
        element={
          <ProtectedRoute>
            <InvitationsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/settings/billing"
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/settings/configuration"
        element={
          <ProtectedRoute>
            <ConfigurationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/settings/support/new"
        element={
          <ProtectedRoute>
            <SupportNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/settings/support/:ticketId"
        element={
          <ProtectedRoute>
            <SupportTicket />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/settings/support"
        element={
          <ProtectedRoute>
            <SupportList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/contacts"
        element={
          <ProtectedRoute>
            <ContactList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/contacts/import"
        element={
          <ProtectedRoute>
            <ContactsImport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/contacts/new"
        element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/contacts/:id"
        element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/users"
        element={
          <AdminRoute>
            <UsersList />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/users/import"
        element={
          <AdminRoute>
            <UsersImport />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/users/:id"
        element={
          <AdminRoute>
            <User />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/properties"
        element={
          <ProtectedRoute>
            <PropertiesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/properties/import"
        element={
          <ProtectedRoute>
            <PropertiesImport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/properties/:uid"
        element={
          <ProtectedRoute>
            <Property />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/properties/:uid/maintenance/:systemId/:recordId"
        element={
          <ProtectedRoute>
            <MaintenanceRecordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/professionals"
        element={
          <ProtectedRoute>
            <ProfessionalDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/professionals-sample"
        element={
          <ProtectedRoute>
            <ProfessionalsDirectorySample />
          </ProtectedRoute>
        }
      />
      <Route
        path="/professionals-sample/search"
        element={
          <ProtectedRoute>
            <CategoryDirectoryPageSample />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/professionals-sample"
        element={
          <ProtectedRoute>
            <ProfessionalsDirectorySample />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/professionals-sample/search"
        element={
          <ProtectedRoute>
            <CategoryDirectoryPageSample />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/professionals/search"
        element={
          <ProtectedRoute>
            <CategoryDirectoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/professionals/manage"
        element={
          <ProtectedRoute>
            <ProfessionalsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/professionals/manage/new"
        element={
          <ProtectedRoute>
            <ProfessionalFormContainer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/professionals/manage/:professionalId"
        element={
          <ProtectedRoute>
            <ProfessionalFormContainer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/professionals/categories"
        element={
          <ProtectedRoute>
            <CategoriesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/professionals/categories/:categoryId"
        element={
          <ProtectedRoute>
            <CategoryFormContainer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/professionals/:proId"
        element={
          <ProtectedRoute>
            <ProfessionalProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/my-professionals"
        element={
          <ProtectedRoute>
            <MyProfessionals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/subscriptions"
        element={
          <ProtectedRoute>
            <SubscriptionsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/subscriptions/new"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/subscriptions/:id"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/subscription-products"
        element={
          <ProtectedRoute>
            <SubscriptionProductsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/subscription-products/new"
        element={
          <ProtectedRoute>
            <SubscriptionProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/subscription-products/:id"
        element={
          <ProtectedRoute>
            <SubscriptionProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/support-management/:ticketId"
        element={
          <AdminRoute>
            <TicketDetailPage variant="support" />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/support-management"
        element={
          <AdminRoute>
            <SupportManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/resources/new"
        element={
          <AdminRoute allowedRoles={["super_admin", "admin", "agent"]}>
            <Resource />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/resources/:id/preview"
        element={
          <AdminRoute allowedRoles={["super_admin", "admin", "agent"]}>
            <ResourcePreviewPage />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/resources/:id/view"
        element={
          <ProtectedRoute>
            <ResourceViewerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/resources/:id"
        element={
          <AdminRoute allowedRoles={["super_admin", "admin", "agent"]}>
            <Resource />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/resources"
        element={
          <AdminRoute allowedRoles={["super_admin", "admin", "agent"]}>
            <ResourcesManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/feedback-management/:ticketId"
        element={
          <AdminRoute>
            <TicketDetailPage variant="feedback" />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/feedback-management"
        element={
          <AdminRoute>
            <FeedbackManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/:accountUrl/invite/:invitation"
        element={
          <ProtectedRoute>
            <UserConfirmationEmail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:accountUrl/pdfexample"
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
            currentUser.onboardingCompleted === false ? (
              <Navigate to="/onboarding" replace />
            ) : currentAccount?.url ? (
              <Navigate to={`/${currentAccount.url}/home`} replace />
            ) : (
              <div>
                <h1>No account selected!</h1>
                <p>
                  Choose one from <a href="/settings/accounts">Accounts</a> or
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
