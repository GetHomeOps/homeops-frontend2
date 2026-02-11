import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import { useAuth } from "../context/AuthContext";
import AppApi from "../api/api";

import HomeownerHome from "./home/HomeownerHome";
import AgentHome from "./home/AgentHome";
import SuperAdminHome from "./home/SuperAdminHome";

/**
 * Main — layout shell for the authenticated home page.
 *
 * Role-based routing:
 *   • homeowner   → HomeownerHome
 *   • super_admin → SuperAdminHome
 *   • agent / admin → AgentHome
 *
 * Each home component is responsible for its own data-fetching,
 * scoped to the logged-in user via PropertyContext + AuthContext.
 */
function Main() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();
  const role = (currentUser?.role ?? "").toLowerCase();

  useEffect(() => {
    if (currentUser?.id && location?.pathname) {
      AppApi.logEngagementEvent("page_view", { path: location.pathname }).catch(() => {});
    }
  }, [location.pathname, currentUser?.id]);

  const HomeComponent =
    role === "homeowner"
      ? HomeownerHome
      : role === "super_admin"
        ? SuperAdminHome
        : AgentHome;

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
            <HomeComponent />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Main;
