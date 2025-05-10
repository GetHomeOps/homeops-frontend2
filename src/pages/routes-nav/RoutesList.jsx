import React, {useContext} from "react";
import {Routes, Route, Navigate} from "react-router-dom";

import "../../css/style.css";

// Import pages
import Signin from "../auth/Signin";
import Signup from "../auth/Signup";
import Account from "../accountSettings/Account";
import Databases from "../accountSettings/Databases";
import PageNotFound from "../utility/PageNotFound";
import Main from "../Main";
import AppList from "../adminSettings/Apps/AppsList";
import App from "../adminSettings/Apps/App";
import CategoriesList from "../adminSettings/Categories/CategoriesList";
import Category from "../adminSettings/Categories/Category";
import AuthContext from "../../context/AuthContext";
import ContactList from "../contacts/contactsList";
import Contact from "../contacts/Contact";

function RoutesList() {
  const {currentUser, isLoading} = useContext(AuthContext);

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
      <Route path="/settings/databases" element={<Databases />} />
      <Route path="/:dbName" element={<Main />} />
      <Route path="/admin/apps" element={<AppList />} />
      <Route path="/admin/apps/new" element={<App />} />
      <Route path="/admin/apps/:id" element={<App />} />
      <Route path="/admin/categories" element={<CategoriesList />} />
      <Route path="/admin/categories/new" element={<Category />} />
      <Route path="/admin/categories/:id" element={<Category />} />
      <Route path="/contacts" element={<ContactList />} />
      <Route path="/contacts/new" element={<Contact />} />
      <Route path="/contacts/:id" element={<Contact />} />
    </>
  );

  return (
    <Routes>
      {/* Always include both sets of routes */}
      {publicRoutes}
      {privateRoutes}

      {/* Dynamic fallback based on auth state */}
      <Route
        path="*"
        element={
          <Navigate
            to={currentUser ? "/settings/databases" : "/signin"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default RoutesList;

// <Routes>
//   <Route path="/signin" element={<Signin />} />
//   <Route path="/signup" element={<Signup />} />

/* <Route exact path="/" element={<Dashboard />} />
        <Route path="/dashboard/analytics" element={<Analytics />} />
        <Route path="/dashboard/fintech" element={<Fintech />} />
        <Route path="/ecommerce/customers" element={<Customers />} />
        <Route path="/ecommerce/orders" element={<Orders />} />
        <Route path="/ecommerce/invoices" element={<Invoices />} />
        <Route path="/ecommerce/shop" element={<Shop />} />
        <Route path="/ecommerce/shop-2" element={<Shop2 />} />
        <Route path="/ecommerce/product" element={<Product />} />
        <Route path="/ecommerce/cart" element={<Cart />} />
        <Route path="/ecommerce/cart-2" element={<Cart2 />} />
        <Route path="/ecommerce/cart-3" element={<Cart3 />} />
        <Route path="/ecommerce/pay" element={<Pay />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/community/users-tabs" element={<UsersTabs />} />
        <Route path="/community/users-tiles" element={<UsersTiles />} />
        <Route path="/community/profile" element={<Profile />} />
        <Route path="/community/feed" element={<Feed />} />
        <Route path="/community/forum" element={<Forum />} />
        <Route path="/community/forum-post" element={<ForumPost />} />
        <Route path="/community/meetups" element={<Meetups />} />
        <Route path="/community/meetups-post" element={<MeetupsPost />} />
        <Route path="/finance/cards" element={<CreditCards />} />
        <Route path="/finance/transactions" element={<Transactions />} />
        <Route path="/finance/transaction-details" element={<TransactionDetails />} />
        <Route path="/job/job-listing" element={<JobListing />} />
        <Route path="/job/job-post" element={<JobPost />} />
        <Route path="/job/company-profile" element={<CompanyProfile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/tasks/kanban" element={<TasksKanban />} />
        <Route path="/tasks/list" element={<TasksList />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings/account" element={<Account />} />
        <Route path="/settings/notifications" element={<Notifications />} />
        <Route path="/settings/apps" element={<Apps />} />
        <Route path="/settings/plans" element={<Plans />} />
        <Route path="/settings/billing" element={<Billing />} />
        <Route path="/settings/feedback" element={<Feedback />} />
        <Route path="/utility/changelog" element={<Changelog />} />
        <Route path="/utility/roadmap" element={<Roadmap />} />
        <Route path="/utility/faqs" element={<Faqs />} />
        <Route path="/utility/empty-state" element={<EmptyState />} />
        <Route path="/utility/404" element={<PageNotFound />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding-01" element={<Onboarding01 />} />
        <Route path="/onboarding-02" element={<Onboarding02 />} />
        <Route path="/onboarding-03" element={<Onboarding03 />} />
        <Route path="/onboarding-04" element={<Onboarding04 />} />
        <Route path="/component/button" element={<ButtonPage />} />
        <Route path="/component/form" element={<FormPage />} />
        <Route path="/component/dropdown" element={<DropdownPage />} />
        <Route path="/component/alert" element={<AlertPage />} />
        <Route path="/component/modal" element={<ModalPage />} />
        <Route path="/component/pagination" element={<PaginationPage />} />
        <Route path="/component/tabs" element={<TabsPage />} />
        <Route path="/component/breadcrumb" element={<BreadcrumbPage />} />
        <Route path="/component/badge" element={<BadgePage />} />
        <Route path="/component/avatar" element={<AvatarPage />} />
        <Route path="/component/tooltip" element={<TooltipPage />} />
        <Route path="/component/accordion" element={<AccordionPage />} />
        <Route path="/component/icons" element={<IconsPage />} />
        <Route path="*" element={<PageNotFound />} /> */
