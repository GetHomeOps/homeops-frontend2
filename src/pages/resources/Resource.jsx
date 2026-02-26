import React, {useState} from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import ResourceFormContainer from "./ResourceFormContainer";
import {PAGE_LAYOUT} from "../../constants/layout";

function Resource() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 sm:px-8 lg:px-10 py-8 w-full max-w-4xl mx-auto">
            <ResourceFormContainer />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Resource;
