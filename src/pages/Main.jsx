import React, {useState} from "react";

import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import {useAuth} from "../context/AuthContext";

import CampaignsCard from "../partials/campaigns/CampaignsCard";

import styles from "./style/Main.module.css";
import HomeownerHome from "./home/HomeownerHome";

function Main() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {currentUser} = useAuth();
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
            <HomeownerHome />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Main;
