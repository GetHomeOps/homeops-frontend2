import React, {useState} from "react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import PropertyFormContainer from "./PropertyFormContainer";

function Property() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 py-8 w-full max-w-[96rem] mx-auto">
            <PropertyFormContainer />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Property;
