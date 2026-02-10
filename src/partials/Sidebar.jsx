import React, {useState, useEffect, useRef, useCallback} from "react";
import {createPortal} from "react-dom";
import {NavLink, useLocation} from "react-router-dom";
import {ChevronDown, ChevronLeft, ChevronRight} from "lucide-react";

import Logo from "../images/logo-no-bg.png";
import useCurrentDb from "../hooks/useCurrentDb";
import Transition from "../utils/Transition";

/**
 * Sidebar tooltip — matches the style from TooltipExamples.jsx.
 * Portals the tooltip to document.body so it is never clipped by the sidebar overflow.
 * Positions itself to the right of the trigger element using getBoundingClientRect.
 */
function SidebarTooltip({show, label, children}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({top: 0, left: 0});
  const triggerRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  }, []);

  const handleEnter = () => {
    updatePosition();
    setOpen(true);
  };

  if (!show) return children;

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setOpen(false)}
      onFocus={handleEnter}
      onBlur={() => setOpen(false)}
    >
      {children}
      {createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{top: coords.top, left: coords.left, transform: "translateY(-50%)"}}
        >
          <Transition
            show={open}
            tag="div"
            className="rounded-lg border border-gray-700/60 overflow-hidden shadow-lg bg-gray-800 text-gray-100 px-3 py-2 text-sm whitespace-nowrap"
            enter="transition ease-out duration-200 transform"
            enterStart="opacity-0 -translate-x-2"
            enterEnd="opacity-100 translate-x-0"
            leave="transition ease-out duration-200"
            leaveStart="opacity-100"
            leaveEnd="opacity-0"
          >
            {label}
          </Transition>
        </div>,
        document.body,
      )}
    </div>
  );
}

function Sidebar({sidebarOpen, setSidebarOpen, variant = "default"}) {
  const location = useLocation();
  const {pathname} = location;

  const {currentDb} = useCurrentDb();
  const dbUrl = currentDb?.url || "";

  // Home is active only when path has a segment exactly "home", not when a segment contains "home" (e.g. /home-ops/properties)
  const isHomeActive = pathname === "/home" || /\/home(\/|$)/.test(pathname);

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true",
  );
  const [settingsOpen, setSettingsOpen] = useState(pathname.includes("users"));
  const isCollapsed = !sidebarExpanded;

  useEffect(() => {
    if (pathname.includes("users")) setSettingsOpen(true);
  }, [pathname]);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({target}) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({keyCode}) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Wrapper: positioning context for edge-mounted handle (handle is NOT inside sidebar body) */}
      <div className="relative">
        {/* Sidebar */}
        <div
          id="sidebar"
          ref={sidebar}
          className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-[#456564] p-4 transition-all duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-64"
          } ${variant === "v2" ? "border-r border-white/10" : "shadow-xs"}`}
        >
        {/* Sidebar header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-white hover:text-white/80"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink
            end
            to={dbUrl ? `/${dbUrl}/home` : "/home"}
            className="block"
          >
            <img
              src={Logo}
              alt="Logo"
              className="w-12 h-12 rounded-full object-contain flex-shrink-0"
            />
          </NavLink>
        </div>

        {/* Links */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1">
            <ul className="mt-3 space-y-0">
              {/* Home */}
              <li className="mb-0.5 last:mb-0">
                <SidebarTooltip show={isCollapsed} label="Home">
                  <NavLink
                    end
                    to={dbUrl ? `/${dbUrl}/home` : "/home"}
                    aria-label="Home"
                    className={({isActive}) =>
                      `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white/15 text-white [&_svg]:text-white"
                          : "text-white/90 hover:bg-white/[0.08] hover:text-white [&_svg]:text-white/70"
                      }`
                    }
                  >
                    <svg
                      className="shrink-0 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 0L0 8h2v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8h2L8 0z" />
                    </svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Home
                    </span>
                  </NavLink>
                </SidebarTooltip>
              </li>

              {/* Contacts */}
              <li className="mb-0.5 last:mb-0">
                <SidebarTooltip show={isCollapsed} label="Contacts">
                  <NavLink
                    end
                    to={dbUrl ? `/${dbUrl}/contacts` : "/contacts"}
                    aria-label="Contacts"
                    className={({isActive}) =>
                      `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white/15 text-white [&_svg]:text-white"
                          : "text-white/90 hover:bg-white/[0.08] hover:text-white [&_svg]:text-white/70"
                      }`
                    }
                  >
                    <svg
                      className="shrink-0 fill-current"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 21V19C22 17.1362 20.7252 15.5701 19 15.126M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7C18 8.67869 16.9659 10.1159 15.5 10.7092M17 21C17 19.1362 17 18.2044 16.6955 17.4693C16.2895 16.4892 15.5108 15.7105 14.5307 15.3045C13.7956 15 12.8638 15 11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Contacts
                    </span>
                  </NavLink>
                </SidebarTooltip>
              </li>

              {/* Properties */}
              <li className="mb-0.5 last:mb-0">
                <SidebarTooltip show={isCollapsed} label="Properties">
                  <NavLink
                    to={dbUrl ? `/${dbUrl}/properties` : "/properties"}
                    aria-label="Properties"
                    className={({isActive}) =>
                      `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white/15 text-white [&_svg]:text-white"
                          : "text-white/90 hover:bg-white/[0.08] hover:text-white [&_svg]:text-white/70"
                      }`
                    }
                  >
                    <svg
                      className="shrink-0 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="18px"
                      height="18px"
                      viewBox="0 0 18 18"
                    >
                      <path
                        d="M9 6.75C9 5.78379 9.78379 5 10.75 5H15.25C16.2162 5 17 5.78379 17 6.75V14.75C17 15.7162 16.2162 16.5 15.25 16.5H9.75C9.33579 16.5 9 16.1642 9 15.75V6.75Z"
                        fill="currentColor"
                        fillOpacity="0.25"
                      ></path>
                      <path
                        d="M2.75 8C1.78379 8 1 8.78379 1 9.75V14.75C1 15.7162 1.78379 16.5 2.75 16.5H6.75C7.16421 16.5 7.5 16.1642 7.5 15.75V9.75C7.5 8.78379 6.71621 8 5.75 8H2.75Z"
                        fill="currentColor"
                        fillOpacity="0.25"
                      ></path>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.5 8.75C11.5 8.33579 11.8358 8 12.25 8H13.75C14.1642 8 14.5 8.33579 14.5 8.75C14.5 9.16421 14.1642 9.5 13.75 9.5H12.25C11.8358 9.5 11.5 9.16421 11.5 8.75Z"
                        fill="currentColor"
                      ></path>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.5 11.25C11.5 10.8358 11.8358 10.5 12.25 10.5H13.75C14.1642 10.5 14.5 10.8358 14.5 11.25C14.5 11.6642 14.1642 12 13.75 12H12.25C11.8358 12 11.5 11.6642 11.5 11.25Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M13 2.43201C13 1.21576 11.7905 0.370625 10.6482 0.788703L5.14789 2.80482C4.46015 3.05792 4 3.71236 4 4.448V8H5.75C6.71621 8 7.5 8.78379 7.5 9.75V15.75C7.5 16.1642 7.16421 16.5 6.75 16.5H9.75C9.33579 16.5 9 16.1642 9 15.75V6.75C9 5.78379 9.78379 5 10.75 5H13V2.43201Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Properties
                    </span>
                  </NavLink>
                </SidebarTooltip>
              </li>
            </ul>
          </div>

          {/* Settings (expandable) */}
          <div className="pt-4 mt-auto border-t border-white/10">
            <SidebarTooltip show={isCollapsed} label="Settings">
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                aria-label="Settings"
                className="flex items-center w-full pl-4 pr-3 py-2 rounded-lg hover:bg-white/[0.08] transition-colors duration-200 text-left"
              >
                <span
                  className={`shrink-0 transition-transform duration-300 ease-out ${
                    settingsOpen ? "rotate-0" : "-rotate-90"
                  }`}
                >
                  <ChevronDown className="w-4 h-4 text-white/70" />
                </span>
                <span className="text-sm font-medium text-white ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                  Settings
                </span>
              </button>
            </SidebarTooltip>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                settingsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <ul className="mt-1 ml-4">
                  <li className="mb-0.5">
                    <SidebarTooltip show={isCollapsed} label="Users">
                      <NavLink
                        end
                        to={dbUrl ? `/${dbUrl}/users` : "/users"}
                        aria-label="Users"
                        className={({isActive}) =>
                          `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-white/15 text-white [&_svg]:text-white"
                              : "text-white/90 hover:bg-white/[0.08] hover:text-white [&_svg]:text-white/70"
                          }`
                        }
                      >
                        <svg
                          className="shrink-0 fill-current"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 8.5C9.93293 8.5 11.5 6.93191 11.5 5C11.5 3.06809 9.93293 1.5 8 1.5C6.06707 1.5 4.5 3.06809 4.5 5C4.5 6.93191 6.06707 8.5 8 8.5Z"
                            fill="currentColor"
                          ></path>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11.075 10.5C10.5898 10.5 10.1223 10.7926 9.92867 11.2543L8.26274 15H5.75C5.33579 15 5 15.3358 5 15.75C5 16.1642 5.33579 16.5 5.75 16.5H8.75H14.925C15.429 16.5 15.8711 16.1954 16.0675 15.7539L17.6226 12.2622C17.9877 11.4425 17.393 10.5 16.481 10.5H11.075Z"
                            fill="currentColor"
                          ></path>
                          <path
                            d="M3.86331 14.5236L2.10449 14.5236C1.82831 14.5236 1.57447 14.3718 1.44378 14.1285C1.31309 13.8852 1.32669 13.5897 1.47918 13.3595C3.04625 11.1877 5.45082 9.99768 8.0103 10C8.31321 10.0003 8.61609 10.0147 8.91729 10.0439C8.77216 10.2273 8.64882 10.4322 8.5529 10.6565L7.28821 13.5H5.75C4.95977 13.5 4.26469 13.9074 3.86331 14.5236Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                        <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          Users
                        </span>
                      </NavLink>
                    </SidebarTooltip>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Stripe-style edge handle: dark vertical line → bare chevron on hover */}
        <button
          type="button"
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className="group/handle absolute right-0 top-0 h-full w-7 translate-x-[80%] z-20 hidden lg:flex 2xl:hidden items-center justify-center cursor-col-resize focus:outline-none"
        >
          {/* Idle state: dark vertical line */}
          <span className="block h-8 w-[3.5px] rounded-full bg-gray-400/60 transition-all duration-150 group-hover/handle:opacity-0 group-focus-visible/handle:opacity-0" />
          {/* Hover/focus state: bare chevron icon */}
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover/handle:opacity-100 group-focus-visible/handle:opacity-100">
            {sidebarExpanded ? (
              <ChevronLeft className="h-5 w-5 text-gray-500 group-hover/handle:text-gray-700 transition-colors" strokeWidth={2.5} />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500 group-hover/handle:text-gray-700 transition-colors" strokeWidth={2.5} />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
