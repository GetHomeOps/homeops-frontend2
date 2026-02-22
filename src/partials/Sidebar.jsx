import React, {useState, useEffect, useRef, useCallback} from "react";
import {createPortal} from "react-dom";
import {NavLink, useLocation} from "react-router-dom";
import {ChevronDown, ChevronLeft, ChevronRight} from "lucide-react";

import Logo from "../images/logo-no-bg.png";
import useCurrentDb from "../hooks/useCurrentDb";
import {useAuth} from "../context/AuthContext";
import Transition from "../utils/Transition";

/**
 * Stripe-style submenu flyout — when sidebar is collapsed, hovering over an expandable
 * menu item shows this flyout panel to the right with submenu links. Interactive (not
 * pointer-events-none) so users can click the links.
 */
function SubmenuFlyout({
  show,
  title,
  flyoutContent,
  children,
  alignTop = false,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({top: 0, left: 0});
  const triggerRef = useRef(null);
  const flyoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    if (!show) setOpen(false);
  }, [show]);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, [clearCloseTimeout]);

  const [centered, setCentered] = useState(!alignTop);
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const flyoutGap = 8;
    const left = rect.right + flyoutGap;
    const top = alignTop ? rect.top : rect.top + rect.height / 2;
    setCoords({top, left});
    setCentered(!alignTop);
  }, [alignTop]);

  // Re-position when flyout opens so we can clamp to viewport (flyoutRef is now available)
  useEffect(() => {
    if (!open || !triggerRef.current || !flyoutRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const flyoutHeight = flyoutRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const minTop = 8;
    const maxTop = viewportHeight - flyoutHeight - 8;
    let top;
    if (alignTop) {
      top = rect.top;
      top = Math.max(minTop, Math.min(maxTop, top));
    } else {
      top = rect.top + rect.height / 2 - flyoutHeight / 2;
      if (top < minTop || top > maxTop) {
        top = Math.max(minTop, Math.min(maxTop, top));
        setCentered(false);
      }
    }
    setCoords((prev) => ({...prev, top}));
  }, [open, alignTop]);

  const handleTriggerEnter = () => {
    clearCloseTimeout();
    updatePosition();
    setOpen(true);
  };

  const handleFlyoutEnter = () => {
    clearCloseTimeout();
    setOpen(true);
  };

  if (!show) return children;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleTriggerEnter}
        onMouseLeave={scheduleClose}
        onFocus={handleTriggerEnter}
        onBlur={scheduleClose}
      >
        {children}
      </div>
      {createPortal(
        <div
          className="fixed z-[9999] min-w-[180px]"
          style={{
            top: coords.top,
            left: coords.left,
            transform: !alignTop && centered ? "translateY(-50%)" : "none",
          }}
        >
          <Transition
            show={open}
            tag="div"
            enter="transition ease-out duration-150"
            enterStart="opacity-0"
            enterEnd="opacity-100"
            leave="transition ease-out duration-100"
            leaveStart="opacity-100"
            leaveEnd="opacity-0"
          >
            <div
              ref={flyoutRef}
              onMouseEnter={handleFlyoutEnter}
              onMouseLeave={scheduleClose}
              className="rounded-lg border border-gray-700/60 shadow-xl bg-gray-800 py-2 overflow-hidden"
            >
              {title && (
                <div className="px-2 py-1.5 text-xs font-bold text-gray-100">
                  {title}
                </div>
              )}
              {flyoutContent}
            </div>
          </Transition>
        </div>,
        document.body,
      )}
    </>
  );
}

/**
 * Sidebar tooltip — matches the style from TooltipExamples.jsx.
 * Portals the tooltip to document.body so it is never clipped by the sidebar overflow.
 * Positions itself to the right of the trigger element using getBoundingClientRect.
 */
function SidebarTooltip({show, label, children}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({top: 0, left: 0});
  const triggerRef = useRef(null);

  // Force-close tooltip when show becomes false (e.g. sidebar expanded)
  useEffect(() => {
    if (!show) setOpen(false);
  }, [show]);

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
      className="flex w-full items-center"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setOpen(false)}
      onFocus={handleEnter}
      onBlur={() => setOpen(false)}
    >
      {children}
      {createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: coords.top,
            left: coords.left,
            transform: "translateY(-50%)",
          }}
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
  const {currentUser} = useAuth();
  const dbUrl = currentDb?.url || "";
  const isSuperAdmin = currentUser?.role === "super_admin";

  // Home is active only when path has a segment exactly "home", not when a segment contains "home" (e.g. /home-ops/properties)
  const isHomeActive = pathname === "/home" || /\/home(\/|$)/.test(pathname);

  // Subscriptions section is active when on /subscriptions or /subscription-products (any segment)
  const isSubscriptionsActive =
    /\/subscriptions(\/|$)/.test(pathname) ||
    /\/subscription-products(\/|$)/.test(pathname);

  const isProfessionalsActive =
    /\/professionals(\/|$)/.test(pathname) ||
    /\/my-professionals(\/|$)/.test(pathname);

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true",
  );
  const [settingsOpen, setSettingsOpen] = useState(pathname.includes("users"));
  const [subscriptionsOpen, setSubscriptionsOpen] = useState(
    isSubscriptionsActive,
  );
  const [professionalsOpen, setProfessionalsOpen] = useState(
    isProfessionalsActive,
  );
  const isCollapsed = !sidebarExpanded;

  // Tooltips only when sidebar can be collapsed: lg/xl viewport (1024–1535px).
  // On mobile it's a drawer; on 2xl the sidebar is always full width.
  const [isExpandableViewport, setIsExpandableViewport] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (max-width: 1535px)");
    const handler = () => setIsExpandableViewport(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const showTooltip = isCollapsed && isExpandableViewport;

  useEffect(() => {
    if (pathname.includes("users")) {
      setProfessionalsOpen(false);
      setSubscriptionsOpen(false);
      setSettingsOpen(true);
    } else if (
      /\/subscriptions(\/|$)/.test(pathname) ||
      /\/subscription-products(\/|$)/.test(pathname)
    ) {
      setProfessionalsOpen(false);
      setSettingsOpen(false);
      setSubscriptionsOpen(true);
    } else if (
      /\/professionals(\/|$)/.test(pathname) ||
      /\/my-professionals(\/|$)/.test(pathname)
    ) {
      setSubscriptionsOpen(false);
      setSettingsOpen(false);
      setProfessionalsOpen(true);
    }
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
              <ul className="mt-3 flex flex-col">
                {/* Home */}
                <li className="mb-0.5 last:mb-0">
                  <SidebarTooltip show={showTooltip} label="Home">
                    <NavLink
                      end
                      to={dbUrl ? `/${dbUrl}/home` : "/home"}
                      aria-label="Home"
                      className={({isActive}) =>
                        `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
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
                      <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                        Home
                      </span>
                    </NavLink>
                  </SidebarTooltip>
                </li>

                {/* Professionals: dropdown for Super Admin, single link for others */}
                {isSuperAdmin ? (
                  <li className="mb-0.5 last:mb-0">
                    <div
                      className={`rounded-lg ${
                        isProfessionalsActive ? "bg-white/15" : ""
                      }`}
                    >
                      <SubmenuFlyout
                        show={showTooltip}
                        title="Professionals"
                        alignTop
                        flyoutContent={
                          <ul className="py-1">
                            <li>
                              <NavLink
                                end
                                to={
                                  dbUrl
                                    ? `/${dbUrl}/professionals`
                                    : "/professionals"
                                }
                                className={({isActive}) =>
                                  `flex items-center px-2 py-1.5 rounded mx-1 text-xs transition-colors ${
                                    isActive
                                      ? "text-emerald-400"
                                      : "text-gray-100 hover:bg-gray-700"
                                  }`
                                }
                              >
                                Professionals
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                end
                                to={
                                  dbUrl
                                    ? `/${dbUrl}/professionals/categories`
                                    : "/professionals/categories"
                                }
                                className={({isActive}) =>
                                  `flex items-center px-2 py-1.5 rounded mx-1 text-xs transition-colors ${
                                    isActive
                                      ? "text-emerald-400"
                                      : "text-gray-100 hover:bg-gray-700"
                                  }`
                                }
                              >
                                Categories
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                end
                                to={
                                  dbUrl
                                    ? `/${dbUrl}/professionals/manage`
                                    : "/professionals/manage"
                                }
                                className={({isActive}) =>
                                  `flex items-center px-2 py-1.5 rounded mx-1 text-xs transition-colors ${
                                    isActive
                                      ? "text-emerald-400"
                                      : "text-gray-100 hover:bg-gray-700"
                                  }`
                                }
                              >
                                Manage
                              </NavLink>
                            </li>
                          </ul>
                        }
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSubscriptionsOpen(false);
                            setSettingsOpen(false);
                            setProfessionalsOpen(!professionalsOpen);
                          }}
                          aria-label="Professionals"
                          className={`flex items-center w-full pl-4 pr-3 py-2 rounded-lg transition-all duration-200 ${
                            isProfessionalsActive
                              ? "text-white [&_svg]:text-white"
                              : "text-white/90 hover:text-white [&_svg]:text-white/70"
                          }`}
                        >
                          <svg
                            className="shrink-0"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.5 2C11.433 2 13 3.567 13 5.5C13 7.433 11.433 9 9.5 9C7.567 9 6 7.433 6 5.5C6 3.567 7.567 2 9.5 2Z"
                              fill="currentColor"
                              fillOpacity="0.25"
                            />
                            <path
                              d="M9.5 11C5.91 11 3 13.462 3 16.5V18C3 18.552 3.448 19 4 19H15C15.552 19 16 18.552 16 18V16.5C16 13.462 13.09 11 9.5 11Z"
                              fill="currentColor"
                              fillOpacity="0.25"
                            />
                            <path
                              d="M19.5 6C20.881 6 22 7.119 22 8.5C22 9.881 20.881 11 19.5 11C18.119 11 17 9.881 17 8.5C17 7.119 18.119 6 19.5 6Z"
                              fill="currentColor"
                            />
                            <path
                              d="M19.5 13C17.57 13 16 14.343 16 16V16.5C16.73 16.5 17.41 16.71 18 17.07V16C18 15.448 18.672 15 19.5 15C20.328 15 21 15.448 21 16V17H22C22.552 17 23 16.552 23 16C23 14.343 21.43 13 19.5 13Z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                            Professionals
                          </span>
                          <span
                            className={`ml-auto shrink-0 transition-transform duration-300 ease-out lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 ${
                              professionalsOpen ? "rotate-0" : "-rotate-90"
                            }`}
                          >
                            <ChevronDown className="w-4 h-4 text-white/70" />
                          </span>
                        </button>
                      </SubmenuFlyout>
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                          professionalsOpen && !isCollapsed
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <ul className={`py-1 ${isCollapsed ? "" : "ml-4"}`}>
                            <li>
                              <SidebarTooltip
                                show={showTooltip}
                                label="Professionals"
                              >
                                <NavLink
                                  end
                                  to={
                                    dbUrl
                                      ? `/${dbUrl}/professionals`
                                      : "/professionals"
                                  }
                                  aria-label="Professionals"
                                  className={({isActive}) =>
                                    `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
                                      isActive
                                        ? "text-white [&_svg]:text-white"
                                        : "text-white/70 hover:text-white [&_svg]:text-white/50"
                                    }`
                                  }
                                >
                                  <svg
                                    className="shrink-0"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M9.5 2C11.433 2 13 3.567 13 5.5C13 7.433 11.433 9 9.5 9C7.567 9 6 7.433 6 5.5C6 3.567 7.567 2 9.5 2Z"
                                      fill="currentColor"
                                      fillOpacity="0.25"
                                    />
                                    <path
                                      d="M9.5 11C5.91 11 3 13.462 3 16.5V18C3 18.552 3.448 19 4 19H15C15.552 19 16 18.552 16 18V16.5C16 13.462 13.09 11 9.5 11Z"
                                      fill="currentColor"
                                      fillOpacity="0.25"
                                    />
                                    <path
                                      d="M19.5 6C20.881 6 22 7.119 22 8.5C22 9.881 20.881 11 19.5 11C18.119 11 17 9.881 17 8.5C17 7.119 18.119 6 19.5 6Z"
                                      fill="currentColor"
                                    />
                                    <path
                                      d="M19.5 13C17.57 13 16 14.343 16 16V16.5C16.73 16.5 17.41 16.71 18 17.07V16C18 15.448 18.672 15 19.5 15C20.328 15 21 15.448 21 16V17H22C22.552 17 23 16.552 23 16C23 14.343 21.43 13 19.5 13Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                                    Professionals
                                  </span>
                                </NavLink>
                              </SidebarTooltip>
                            </li>
                            <li>
                              <SidebarTooltip show={showTooltip} label="Categories">
                                <NavLink
                                  end
                                  to={
                                    dbUrl
                                      ? `/${dbUrl}/professionals/categories`
                                      : "/professionals/categories"
                                  }
                                  aria-label="Professional Categories"
                                  className={({isActive}) =>
                                    `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
                                      isActive
                                        ? "text-white [&_svg]:text-white"
                                        : "text-white/70 hover:text-white [&_svg]:text-white/50"
                                    }`
                                  }
                                >
                                  <svg
                                    className="shrink-0"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M4 4h6v6H4V4z"
                                      fill="currentColor"
                                      fillOpacity="0.25"
                                    />
                                    <path
                                      d="M14 4h6v6h-6V4z"
                                      fill="currentColor"
                                    />
                                    <path
                                      d="M4 14h6v6H4v-6z"
                                      fill="currentColor"
                                    />
                                    <path
                                      d="M14 14h6v6h-6v-6z"
                                      fill="currentColor"
                                      fillOpacity="0.25"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                                    Categories
                                  </span>
                                </NavLink>
                              </SidebarTooltip>
                            </li>
                            <li>
                              <SidebarTooltip show={showTooltip} label="Manage">
                                <NavLink
                                  end
                                  to={
                                    dbUrl
                                      ? `/${dbUrl}/professionals/manage`
                                      : "/professionals/manage"
                                  }
                                  aria-label="Manage Professionals"
                                  className={({isActive}) =>
                                    `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
                                      isActive
                                        ? "text-white [&_svg]:text-white"
                                        : "text-white/70 hover:text-white [&_svg]:text-white/50"
                                    }`
                                  }
                                >
                                  <svg
                                    className="shrink-0"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M9.5 2C11.433 2 13 3.567 13 5.5C13 7.433 11.433 9 9.5 9C7.567 9 6 7.433 6 5.5C6 3.567 7.567 2 9.5 2Z"
                                      fill="currentColor"
                                      fillOpacity="0.25"
                                    />
                                    <path
                                      d="M9.5 11C5.91 11 3 13.462 3 16.5V18C3 18.552 3.448 19 4 19H15C15.552 19 16 18.552 16 18V16.5C16 13.462 13.09 11 9.5 11Z"
                                      fill="currentColor"
                                      fillOpacity="0.25"
                                    />
                                    <path
                                      d="M19.5 6C20.881 6 22 7.119 22 8.5C22 9.881 20.881 11 19.5 11C18.119 11 17 9.881 17 8.5C17 7.119 18.119 6 19.5 6Z"
                                      fill="currentColor"
                                    />
                                    <path
                                      d="M19.5 13C17.57 13 16 14.343 16 16V16.5C16.73 16.5 17.41 16.71 18 17.07V16C18 15.448 18.672 15 19.5 15C20.328 15 21 15.448 21 16V17H22C22.552 17 23 16.552 23 16C23 14.343 21.43 13 19.5 13Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                                    Manage
                                  </span>
                                </NavLink>
                              </SidebarTooltip>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li className="mb-0.5 last:mb-0">
                    <SidebarTooltip show={showTooltip} label="Professionals">
                      <NavLink
                        to={
                          dbUrl ? `/${dbUrl}/professionals` : "/professionals"
                        }
                        aria-label="Professionals"
                        className={({isActive}) =>
                          `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
                            isActive ||
                            pathname.includes("professionals") ||
                            pathname.includes("my-professionals")
                              ? "bg-white/15 text-white [&_svg]:text-white"
                              : "text-white/90 hover:bg-white/[0.08] hover:text-white [&_svg]:text-white/70"
                          }`
                        }
                      >
                        <svg
                          className="shrink-0"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.5 2C11.433 2 13 3.567 13 5.5C13 7.433 11.433 9 9.5 9C7.567 9 6 7.433 6 5.5C6 3.567 7.567 2 9.5 2Z"
                            fill="currentColor"
                            fillOpacity="0.25"
                          />
                          <path
                            d="M9.5 11C5.91 11 3 13.462 3 16.5V18C3 18.552 3.448 19 4 19H15C15.552 19 16 18.552 16 18V16.5C16 13.462 13.09 11 9.5 11Z"
                            fill="currentColor"
                            fillOpacity="0.25"
                          />
                          <path
                            d="M19.5 6C20.881 6 22 7.119 22 8.5C22 9.881 20.881 11 19.5 11C18.119 11 17 9.881 17 8.5C17 7.119 18.119 6 19.5 6Z"
                            fill="currentColor"
                          />
                          <path
                            d="M19.5 13C17.57 13 16 14.343 16 16V16.5C16.73 16.5 17.41 16.71 18 17.07V16C18 15.448 18.672 15 19.5 15C20.328 15 21 15.448 21 16V17H22C22.552 17 23 16.552 23 16C23 14.343 21.43 13 19.5 13Z"
                            fill="currentColor"
                          />
                        </svg>
                        <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                          Professionals
                        </span>
                      </NavLink>
                    </SidebarTooltip>
                  </li>
                )}

                {/* Properties */}
                <li className="mb-0.5 last:mb-0">
                  <SidebarTooltip show={showTooltip} label="Properties">
                    <NavLink
                      to={dbUrl ? `/${dbUrl}/properties` : "/properties"}
                      aria-label="Properties"
                      className={({isActive}) =>
                        `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
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
                      <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                        Properties
                      </span>
                    </NavLink>
                  </SidebarTooltip>
                </li>

                {/* My Contacts */}
                <li className="mb-0.5 last:mb-0">
                  <SidebarTooltip show={showTooltip} label="My Contacts">
                    <NavLink
                      to={dbUrl ? `/${dbUrl}/contacts` : "/contacts"}
                      aria-label="My Contacts"
                      className={({isActive}) =>
                        `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
                          isActive
                            ? "bg-white/15 text-white [&_svg]:text-white"
                            : "text-white/90 hover:bg-white/[0.08] hover:text-white [&_svg]:text-white/70"
                        }`
                      }
                    >
                      <svg
                        className="shrink-0"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="9"
                          cy="7"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 21v-2a4 4 0 0 0-3-3.87"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 3.13a4 4 0 0 1 0 7.75"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                        My Contacts
                      </span>
                    </NavLink>
                  </SidebarTooltip>
                </li>

                {/* Subscriptions dropdown (super_admin only) */}
                {isSuperAdmin && (
                  <li className="mb-0.5 last:mb-0">
                    <div
                      className={`rounded-lg ${
                        isSubscriptionsActive ? "bg-white/15" : ""
                      }`}
                    >
                      <SubmenuFlyout
                        show={showTooltip}
                        title="Subscriptions"
                        alignTop
                        flyoutContent={
                          <ul className="py-1">
                            <li>
                              <NavLink
                                end
                                to={
                                  dbUrl
                                    ? `/${dbUrl}/subscriptions`
                                    : "/subscriptions"
                                }
                                className={({isActive}) =>
                                  `flex items-center px-2 py-1.5 rounded mx-1 text-xs transition-colors ${
                                    isActive
                                      ? "text-emerald-400"
                                      : "text-gray-100 hover:bg-gray-700"
                                  }`
                                }
                              >
                                Subscriptions
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                end
                                to={
                                  dbUrl
                                    ? `/${dbUrl}/subscription-products`
                                    : "/subscription-products"
                                }
                                className={({isActive}) =>
                                  `flex items-center px-2 py-1.5 rounded mx-1 text-xs transition-colors ${
                                    isActive
                                      ? "text-emerald-400"
                                      : "text-gray-100 hover:bg-gray-700"
                                  }`
                                }
                              >
                                Products
                              </NavLink>
                            </li>
                          </ul>
                        }
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setProfessionalsOpen(false);
                            setSettingsOpen(false);
                            setSubscriptionsOpen(!subscriptionsOpen);
                          }}
                          aria-label="Subscriptions"
                          className={`flex items-center w-full pl-4 pr-3 py-2 rounded-lg transition-all duration-200 ${
                            isSubscriptionsActive
                              ? "text-white [&_svg]:text-white"
                              : "text-white/90 hover:text-white [&_svg]:text-white/70"
                          }`}
                        >
                          <svg
                            className="shrink-0"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 10V8C22 5.79086 20.2091 4 18 4H6C3.79086 4 2 5.79086 2 8V10M22 10V16C22 18.2091 20.2091 20 18 20H6C3.79086 20 2 18.2091 2 16V10M22 10H2M6 14.5H8"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                            Subscriptions
                          </span>
                          <span
                            className={`ml-auto shrink-0 transition-transform duration-300 ease-out lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 ${
                              subscriptionsOpen ? "rotate-0" : "-rotate-90"
                            }`}
                          >
                            <ChevronDown className="w-4 h-4 text-white/70" />
                          </span>
                        </button>
                      </SubmenuFlyout>
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                          subscriptionsOpen && !isCollapsed
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <ul className={`py-1 ${isCollapsed ? "" : "ml-4"}`}>
                            <li>
                              <SidebarTooltip
                                show={showTooltip}
                                label="Subscriptions"
                              >
                                <NavLink
                                  end
                                  to={
                                    dbUrl
                                      ? `/${dbUrl}/subscriptions`
                                      : "/subscriptions"
                                  }
                                  aria-label="Subscriptions"
                                  className={({isActive}) =>
                                    `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
                                      isActive
                                        ? "text-white [&_svg]:text-white"
                                        : "text-white/70 hover:text-white [&_svg]:text-white/50"
                                    }`
                                  }
                                >
                                  <svg
                                    className="shrink-0"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M22 10V8C22 5.79086 20.2091 4 18 4H6C3.79086 4 2 5.79086 2 8V10M22 10V16C22 18.2091 20.2091 20 18 20H6C3.79086 20 2 18.2091 2 16V10M22 10H2M6 14.5H8"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                                    Subscriptions
                                  </span>
                                </NavLink>
                              </SidebarTooltip>
                            </li>
                            <li>
                              <SidebarTooltip
                                show={showTooltip}
                                label="Products"
                              >
                                <NavLink
                                  end
                                  to={
                                    dbUrl
                                      ? `/${dbUrl}/subscription-products`
                                      : "/subscription-products"
                                  }
                                  aria-label="Subscription Products"
                                  className={({isActive}) =>
                                    `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
                                      isActive
                                        ? "text-white [&_svg]:text-white"
                                        : "text-white/70 hover:text-white [&_svg]:text-white/50"
                                    }`
                                  }
                                >
                                  <svg
                                    className="shrink-0"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M20.5 7.28V3.5C20.5 2.67 19.83 2 19 2H5C4.17 2 3.5 2.67 3.5 3.5V7.28C3.5 7.74 3.72 8.18 4.1 8.45L11 13.5V20.5L13 22V13.5L19.9 8.45C20.28 8.18 20.5 7.74 20.5 7.28Z"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                                    Products
                                  </span>
                                </NavLink>
                              </SidebarTooltip>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Settings (expandable) */}
            <div className="pt-4 mt-auto border-t border-white/10">
              <div
                className={`rounded-lg ${
                  pathname.includes("users") ? "bg-white/[0.08]" : ""
                }`}
              >
                <SubmenuFlyout
                  show={showTooltip}
                  title="Settings"
                  flyoutContent={
                    <ul className="py-1">
                      <li>
                        <NavLink
                          end
                          to={dbUrl ? `/${dbUrl}/users` : "/users"}
                          className={({isActive}) =>
                            `flex items-center px-2 py-1.5 rounded mx-1 text-xs transition-colors ${
                              isActive
                                ? "text-emerald-400"
                                : "text-gray-100 hover:bg-gray-700"
                            }`
                          }
                        >
                          Users
                        </NavLink>
                      </li>
                    </ul>
                  }
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProfessionalsOpen(false);
                      setSubscriptionsOpen(false);
                      setSettingsOpen(!settingsOpen);
                    }}
                    aria-label="Settings"
                    className="flex items-center w-full pl-4 pr-3 py-2 rounded-lg transition-colors duration-200 text-left text-white/90 hover:text-white [&_svg]:text-white/70"
                  >
                    <span
                      className={`shrink-0 transition-transform duration-300 ease-out ${
                        settingsOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 text-white/70" />
                    </span>
                    <span className="text-sm font-medium text-white ml-3 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Settings
                    </span>
                  </button>
                </SubmenuFlyout>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    settingsOpen && !isCollapsed
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className={`py-1 ${isCollapsed ? "" : "ml-4"}`}>
                      <li>
                        <SidebarTooltip show={showTooltip} label="Users">
                          <NavLink
                            end
                            to={dbUrl ? `/${dbUrl}/users` : "/users"}
                            aria-label="Users"
                            className={({isActive}) =>
                              `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
                                isActive
                                  ? "text-white [&_svg]:text-white"
                                  : "text-white/70 hover:text-white [&_svg]:text-white/50"
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
                            <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
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
              <ChevronLeft
                className="h-5 w-5 text-gray-500 group-hover/handle:text-gray-700 transition-colors"
                strokeWidth={2.5}
              />
            ) : (
              <ChevronRight
                className="h-5 w-5 text-gray-500 group-hover/handle:text-gray-700 transition-colors"
                strokeWidth={2.5}
              />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
