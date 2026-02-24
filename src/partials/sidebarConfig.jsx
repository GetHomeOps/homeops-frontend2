/**
 * Sidebar navigation config — Stripe-style grouped layout.
 * Only ONE submenu level; collapsible groups have no nested depth.
 *
 * Role rules:
 * - adminOnly: visible to admin + super_admin
 * - all: visible to all authenticated users
 */

import React from "react";
import {
  Home,
  Building2,
  Calendar,
  FolderOpen,
  Users,
  LayoutGrid,
  Settings2,
  Contact,
  ClipboardList,
  MessageSquare,
  MessageCircle,
  CreditCard,
} from "lucide-react";

const ICON_SIZE = 18;

const icon = (Component) => (props) => (
  <Component {...props} size={ICON_SIZE} strokeWidth={1.75} />
);

export const SIDEBAR_CONFIG = [
  // --- Home (standalone) ---
  {
    id: "home",
    type: "link",
    label: "Home",
    path: "home",
    icon: icon(Home),
    roles: "all",
  },

  // --- PROPERTY ---
  {
    id: "property",
    type: "section",
    label: "PROPERTY",
    items: [
      { id: "properties", label: "Properties", path: "properties", icon: icon(Building2), roles: "all" },
      { id: "calendar", label: "Calendar", path: "calendar", icon: icon(Calendar), roles: "all" },
    ],
  },

  // --- NETWORK ---
  {
    id: "network",
    type: "section",
    label: "NETWORK",
    items: [
      {
        id: "directory",
        type: "collapsible",
        label: "Directory",
        icon: icon(FolderOpen),
        defaultExpanded: true,
        children: [
          { id: "professionals", label: "Professionals", path: "professionals", activePaths: ["professionals", "my-professionals"], icon: icon(Users), roles: "all" },
          { id: "categories", label: "Categories", path: "professionals/categories", icon: icon(LayoutGrid), roles: "adminOnly" },
          { id: "manage", label: "Manage", path: "professionals/manage", icon: icon(Settings2), roles: "adminOnly" },
        ],
      },
      { id: "contacts", label: "My Contacts", path: "contacts", icon: icon(Contact), roles: "all" },
    ],
  },

  // --- ADMIN (admin + super_admin only) ---
  {
    id: "admin",
    type: "section",
    label: "ADMIN",
    roles: "adminOnly",
    items: [
      {
        id: "operations",
        type: "collapsible",
        label: "Operations",
        icon: icon(ClipboardList),
        defaultExpanded: true,
        children: [
          { id: "support-management", label: "Support Management", path: "support-management", icon: icon(MessageSquare), roles: "adminOnly" },
          { id: "feedback-management", label: "Feedback Management", path: "feedback-management", icon: icon(MessageCircle), roles: "adminOnly" },
        ],
      },
      { id: "subscriptions", label: "Subscriptions", path: "subscriptions", activePaths: ["subscriptions", "subscription-products"], icon: icon(CreditCard), roles: "adminOnly" },
    ],
  },
];
