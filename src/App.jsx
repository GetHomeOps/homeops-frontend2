import React from "react";
import {useLocation} from "react-router-dom";
import RoutesList from "./pages/routes-nav/RoutesList";
import {AuthProvider} from "./context/AuthContext";
import {AppProvider} from "./context/AppContext";
import {ContactProvider} from "./context/ContactContext";

import "./css/style.css";

function App() {
  const location = useLocation();

  React.useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({top: 0});
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]); // triggered on route change

  return (
    <AuthProvider>
      <AppProvider>
        <ContactProvider>
          <RoutesList />
        </ContactProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
