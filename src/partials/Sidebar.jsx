import React, {useState, useEffect, useRef, useCallback} from "react";
import {createPortal} from "react-dom";
import {NavLink, useLocation} from "react-router-dom";
import {ChevronDown, ChevronLeft, ChevronRight} from "lucide-react";

import Logo from "../images/logo-no-bg.png";
import useCurrentAccount from "../hooks/useCurrentAccount";
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

  const {currentAccount} = useCurrentAccount();
  const {currentUser} = useAuth();
  const accountUrl = currentAccount?.url || "";
  const isSuperAdmin = currentUser?.role === "super_admin";
  const isAdmin = currentUser?.role === "admin";
  const canManageUsers = isSuperAdmin || isAdmin;

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
  const isSettingsPath =
    pathname.includes("settings/billing") ||
    pathname.includes("settings/configuration") ||
    (canManageUsers && pathname.includes("users"));
  const [settingsOpen, setSettingsOpen] = useState(isSettingsPath);
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
    if (
      (canManageUsers && pathname.includes("users")) ||
      pathname.includes("settings/billing") ||
      pathname.includes("settings/configuration")
    ) {
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
              to={accountUrl ? `/${accountUrl}/home` : "/home"}
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
                      to={accountUrl ? `/${accountUrl}/home` : "/home"}
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
                                  accountUrl
                                    ? `/${accountUrl}/professionals`
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
                                  accountUrl
                                    ? `/${accountUrl}/professionals/categories`
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
                                  accountUrl
                                    ? `/${accountUrl}/professionals/manage`
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
                                    accountUrl
                                      ? `/${accountUrl}/professionals`
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
                                    accountUrl
                                      ? `/${accountUrl}/professionals/categories`
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
                                    accountUrl
                                      ? `/${accountUrl}/professionals/manage`
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
                          accountUrl ? `/${accountUrl}/professionals` : "/professionals"
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
                      to={accountUrl ? `/${accountUrl}/properties` : "/properties"}
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
                      to={accountUrl ? `/${accountUrl}/contacts` : "/contacts"}
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
                                  accountUrl
                                    ? `/${accountUrl}/subscriptions`
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
                                  accountUrl
                                    ? `/${accountUrl}/subscription-products`
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
                                    accountUrl
                                      ? `/${accountUrl}/subscriptions`
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
                                    accountUrl
                                      ? `/${accountUrl}/subscription-products`
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
                  (canManageUsers && pathname.includes("users")) ||
                  pathname.includes("settings/billing") ||
                  pathname.includes("settings/configuration")
                    ? "bg-white/[0.08]"
                    : ""
                }`}
              >
                <SubmenuFlyout
                  show={showTooltip}
                  title="Settings"
                  flyoutContent={
                    <ul className="py-1">
                      {!isSuperAdmin && (
                        <li>
                          <NavLink
                            end
                            to={accountUrl ? `/${accountUrl}/settings/billing` : "/settings/billing"}
                            className={({isActive}) =>
                              `flex items-center px-2 py-1.5 rounded mx-1 text-xs transition-colors ${
                                isActive
                                  ? "text-emerald-400"
                                  : "text-gray-100 hover:bg-gray-700"
                              }`
                            }
                          >
                            Billing
                          </NavLink>
                        </li>
                      )}
                      <li>
                        <NavLink
                          end
                          to={accountUrl ? `/${accountUrl}/settings/configuration` : "/settings/configuration"}
                          className={({isActive}) =>
                            `flex items-center px-2 py-1.5 rounded mx-1 text-xs transition-colors ${
                              isActive
                                ? "text-emerald-400"
                                : "text-gray-100 hover:bg-gray-700"
                            }`
                          }
                        >
                          Configuration
                        </NavLink>
                      </li>
                      {canManageUsers && (
                        <li>
                          <NavLink
                            end
                            to={accountUrl ? `/${accountUrl}/users` : "/users"}
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
                      )}
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
                    <svg
                      className="shrink-0"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.224 17.529C20.3246 17.7717 20.376 18.0322 20.375 18.295C20.3742 18.5578 20.3234 18.818 20.224 19.061C20.1246 19.3042 19.978 19.5252 19.793 19.712C19.608 19.8987 19.3877 20.048 19.145 20.15C18.9023 20.252 18.6425 20.305 18.38 20.306C18.1175 20.307 17.8573 20.256 17.6135 20.156C17.3697 20.056 17.1477 19.909 16.96 19.724L16.9 19.664C16.6643 19.4335 16.365 19.2788 16.0406 19.22C15.7162 19.1612 15.3816 19.2009 15.08 19.334C14.7842 19.4595 14.5312 19.6664 14.35 19.931C14.1688 20.1956 14.067 20.5069 14.057 20.828L14.054 20.998C14.044 21.5491 13.8158 22.0741 13.4203 22.4628C13.0248 22.8515 12.496 23.0704 11.945 23.071C11.394 23.0716 10.8646 22.854 10.468 22.466C10.0714 22.078 9.84143 21.554 9.83 21.003L9.828 20.888C9.81032 20.5569 9.69711 20.238 9.50197 19.971C9.30683 19.704 9.03839 19.501 8.729 19.386C8.42737 19.2529 8.09275 19.2132 7.76837 19.272C7.44399 19.3308 7.14467 19.4855 6.909 19.716L6.849 19.776C6.47478 20.1491 5.97023 20.3588 5.444 20.36C4.91777 20.3612 4.41226 20.1537 4.03657 19.782C3.66089 19.4103 3.44776 18.9073 3.4435 18.381C3.43924 17.8548 3.64423 17.3485 4.014 16.969L4.074 16.909C4.30455 16.6733 4.45928 16.374 4.518 16.0496C4.57672 15.7252 4.53695 15.3906 4.404 15.089C4.27852 14.7932 4.07159 14.5402 3.807 14.359C3.54241 14.1778 3.23108 14.076 2.91 14.066L2.74 14.063C2.18909 14.053 1.66408 13.8248 1.27541 13.4293C0.886732 13.0338 0.667809 12.505 0.667197 11.954C0.666585 11.403 0.884175 10.8736 1.27215 10.477C1.66013 10.0804 2.18413 9.85043 2.735 9.839L2.85 9.837C3.18108 9.81932 3.50004 9.70611 3.76698 9.51097C4.03393 9.31583 4.23652 9.04739 4.352 8.738C4.48495 8.43637 4.52472 8.10175 4.466 7.77737C4.40728 7.45299 4.25255 7.15367 4.022 6.918L3.962 6.858C3.58889 6.48378 3.37916 5.97923 3.378 5.453C3.37684 4.92677 3.58433 4.42126 3.956 4.04557C4.32767 3.66989 4.83073 3.45676 5.357 3.4525C5.88327 3.44824 6.38954 3.65323 6.769 4.023L6.829 4.083C7.06467 4.31355 7.364 4.46828 7.6884 4.527C8.0128 4.58572 8.3474 4.54595 8.649 4.413H8.738C9.03376 4.28752 9.28682 4.08059 9.468 3.816C9.64918 3.55141 9.751 3.24008 9.761 2.919L9.764 2.749C9.77373 2.19809 10.0019 1.67308 10.3974 1.28441C10.7929 0.895732 11.3217 0.676809 11.8727 0.676197C12.4237 0.675585 12.9531 0.893175 13.3497 1.28115C13.7463 1.66913 13.9763 2.19313 13.988 2.744L13.99 2.859C14 3.19008 14.1132 3.50904 14.3083 3.77598C14.5035 4.04293 14.7719 4.24552 15.081 4.361C15.3826 4.49395 15.7173 4.53372 16.0416 4.475C16.366 4.41628 16.6653 4.26155 16.901 4.031L16.961 3.971C17.3352 3.59789 17.8398 3.38816 18.366 3.387C18.8922 3.38584 19.3977 3.59333 19.7734 3.965C20.1491 4.33667 20.3622 4.83973 20.3665 5.366C20.3708 5.89227 20.1658 6.39854 19.796 6.778L19.736 6.838C19.5055 7.07367 19.3508 7.373 19.292 7.6974C19.2332 8.0218 19.273 8.3564 19.406 8.658V8.747C19.5315 9.04276 19.7384 9.29582 20.003 9.477C20.2676 9.65818 20.5789 9.76 20.9 9.77L21.07 9.773C21.6209 9.78273 22.1459 10.0109 22.5346 10.4064C22.9233 10.8019 23.1422 11.3307 23.1428 11.8817C23.1434 12.4327 22.9258 12.9621 22.5378 13.3587C22.1499 13.7553 21.6259 13.9853 21.075 13.997L20.96 13.999C20.6289 14.0167 20.31 14.1299 20.043 14.325C19.776 14.5202 19.5735 14.7886 19.458 15.098"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm font-medium text-white ml-3 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Settings
                    </span>
                    <span
                      className={`ml-auto shrink-0 transition-transform duration-300 ease-out lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:opacity-100 ${
                        settingsOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 text-white/70" />
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
                      {!isSuperAdmin && (
                        <li>
                          <SidebarTooltip show={showTooltip} label="Billing">
                            <NavLink
                              end
                              to={accountUrl ? `/${accountUrl}/settings/billing` : "/settings/billing"}
                              aria-label="Billing"
                              className={({isActive}) =>
                                `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
                                  isActive
                                    ? "text-white [&_svg]:text-white"
                                    : "text-white/70 hover:text-white [&_svg]:text-white/50"
                                }`
                              }
                            >
                              <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 10H21M7 15H13M12 3L12 5M18 3L18 5M6 21H18C19.6569 21 21 19.6569 21 18V8C21 6.34315 19.6569 5 18 5H6C4.34315 5 3 6.34315 3 8V18C3 19.6569 4.34315 21 6 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                                Billing
                              </span>
                            </NavLink>
                          </SidebarTooltip>
                        </li>
                      )}
                      <li>
                        <SidebarTooltip show={showTooltip} label="Configuration">
                          <NavLink
                            end
                            to={accountUrl ? `/${accountUrl}/settings/configuration` : "/settings/configuration"}
                            aria-label="Configuration"
                            className={({isActive}) =>
                              `flex items-center pl-4 pr-3 py-2 rounded-lg transition-all duration-200 lg:justify-center lg:sidebar-expanded:justify-start ${
                                isActive
                                  ? "text-white [&_svg]:text-white"
                                  : "text-white/70 hover:text-white [&_svg]:text-white/50"
                              }`
                            }
                          >
                            <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M19.4 15C19.267 15.302 19.227 15.636 19.286 15.961C19.345 16.285 19.5 16.584 19.73 16.82L19.79 16.88C19.976 17.066 20.124 17.287 20.224 17.529C20.325 17.772 20.376 18.032 20.375 18.295C20.374 18.558 20.323 18.818 20.224 19.061C20.125 19.304 19.978 19.525 19.793 19.712C19.608 19.899 19.388 20.048 19.145 20.15C18.902 20.252 18.643 20.305 18.38 20.306C18.117 20.307 17.857 20.256 17.614 20.156C17.37 20.056 17.148 19.909 16.96 19.724L16.9 19.664C16.664 19.434 16.365 19.279 16.041 19.22C15.716 19.161 15.382 19.201 15.08 19.334C14.784 19.46 14.531 19.667 14.35 19.931C14.169 20.196 14.067 20.507 14.057 20.828L14.054 20.998C14.034 22.102 13.139 22.993 12.035 23.008H11.81C10.706 22.993 9.81 22.102 9.79 20.998L9.788 20.888C9.77 20.557 9.657 20.238 9.462 19.971C9.267 19.704 8.998 19.501 8.689 19.386C8.387 19.253 8.053 19.213 7.728 19.272C7.404 19.331 7.105 19.486 6.869 19.716L6.809 19.776C6.435 20.149 5.93 20.359 5.404 20.36C4.878 20.361 4.372 20.154 3.997 19.782C3.621 19.41 3.408 18.907 3.404 18.381C3.399 17.855 3.604 17.349 3.974 16.969L4.034 16.909C4.265 16.673 4.419 16.374 4.478 16.05C4.537 15.725 4.497 15.391 4.364 15.089C4.239 14.793 4.032 14.54 3.767 14.359C3.502 14.178 3.191 14.076 2.87 14.066L2.7 14.063C1.596 14.043 0.705 13.148 0.69 12.044V11.819C0.705 10.715 1.596 9.82 2.7 9.8L2.81 9.798C3.141 9.78 3.46 9.667 3.727 9.472C3.994 9.277 4.197 9.008 4.312 8.699C4.445 8.397 4.485 8.063 4.426 7.738C4.367 7.414 4.213 7.115 3.982 6.879L3.922 6.819C3.549 6.445 3.339 5.94 3.338 5.414C3.337 4.888 3.544 4.382 3.916 4.007C4.288 3.631 4.791 3.418 5.317 3.414C5.843 3.409 6.349 3.614 6.729 3.984L6.789 4.044C7.025 4.275 7.324 4.429 7.648 4.488C7.973 4.547 8.307 4.507 8.609 4.374H8.698C8.994 4.249 9.247 4.042 9.428 3.777C9.609 3.512 9.711 3.201 9.721 2.88L9.724 2.71C9.744 1.606 10.639 0.715 11.743 0.7H11.968C13.072 0.715 13.963 1.606 13.983 2.71L13.985 2.82C14.003 3.151 14.116 3.47 14.311 3.737C14.506 4.004 14.775 4.207 15.084 4.322C15.386 4.455 15.72 4.495 16.044 4.436C16.369 4.377 16.668 4.223 16.904 3.992L16.964 3.932C17.338 3.559 17.843 3.349 18.369 3.348C18.895 3.347 19.401 3.554 19.776 3.926C20.152 4.298 20.365 4.801 20.369 5.327C20.374 5.853 20.169 6.359 19.799 6.739L19.739 6.799C19.508 7.035 19.354 7.334 19.295 7.658C19.236 7.983 19.276 8.317 19.409 8.619V8.708C19.534 9.004 19.741 9.257 20.006 9.438C20.271 9.619 20.582 9.721 20.903 9.731L21.073 9.734C22.177 9.754 23.068 10.649 23.083 11.753V11.978C23.068 13.082 22.177 13.973 21.073 13.993L20.963 13.995C20.632 14.013 20.313 14.126 20.046 14.321C19.779 14.516 19.576 14.785 19.461 15.094"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-sm font-medium ml-4 min-w-0 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:sidebar-expanded:ml-4 lg:sidebar-expanded:max-w-none lg:sidebar-expanded:overflow-visible lg:sidebar-expanded:opacity-100 2xl:ml-4 2xl:opacity-100 duration-200">
                              Configuration
                            </span>
                          </NavLink>
                        </SidebarTooltip>
                      </li>
                      {canManageUsers && (
                        <li>
                          <SidebarTooltip show={showTooltip} label="Users">
                            <NavLink
                              end
                              to={accountUrl ? `/${accountUrl}/users` : "/users"}
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
                      )}
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
