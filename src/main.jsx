/* import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter as Router} from "react-router-dom";
import ThemeProvider from "./utils/ThemeContext";
import App from "./App";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Router>
  </React.StrictMode>
); */

import React from "react";
import ReactDOM from "react-dom/client";
import {HashRouter} from "react-router-dom";
import ThemeProvider from "./utils/ThemeContext";
import App from "./App";
import "./i18n";

if (localStorage.getItem("sidebar-expanded") === "true") {
  document.body.classList.add("sidebar-expanded");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>,
);
