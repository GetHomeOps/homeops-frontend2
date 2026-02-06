import {
  Building,
  Droplet,
  Home,
  Zap,
  Shield,
  FileCheck,
} from "lucide-react";

/** Predefined property systems used by Systems tab, Maintenance tab, and SystemsSetupModal. */
export const PROPERTY_SYSTEMS = [
  { id: "roof", name: "Roof", icon: Building },
  { id: "gutters", name: "Gutters", icon: Droplet },
  { id: "foundation", name: "Foundation & Structure", icon: Building },
  { id: "exterior", name: "Exterior", icon: Building },
  { id: "windows", name: "Windows", icon: Home },
  { id: "heating", name: "Heating", icon: Zap },
  { id: "ac", name: "Air Conditioning", icon: Zap },
  { id: "waterHeating", name: "Water Heating", icon: Droplet },
  { id: "electrical", name: "Electrical", icon: Zap },
  { id: "plumbing", name: "Plumbing", icon: Droplet },
  { id: "safety", name: "Safety", icon: Shield },
  { id: "inspections", name: "Inspections", icon: FileCheck },
];

/** Default systems shown when user has not selected any from the modal. */
export const DEFAULT_SYSTEM_IDS = [
  "roof",
  "gutters",
  "heating",
  "ac",
  "electrical",
  "plumbing",
];

/**
 * Standard fields for custom systems added by the user.
 * Each custom system (e.g. Solar, Pool) gets a section with these fields in the Systems tab.
 *
 * Field types:
 * - text: Regular text input
 * - date: Full date picker (day/month/year)
 * - select: Dropdown with options
 * - installer: Installer dropdown (uses InstallerSelect component)
 * - computed-age: Read-only field calculated from installDate
 * - warranty-select: Yes/No dropdown
 */
export const STANDARD_CUSTOM_SYSTEM_FIELDS = [
  { key: "material", label: "Material", type: "text" },
  { key: "installDate", label: "Install Date", type: "date" },
  { key: "installer", label: "Installer", type: "installer" },
  { key: "age", label: "Age", type: "computed-age" },
  { key: "condition", label: "Condition", type: "select", options: ["Excellent", "Good", "Fair", "Poor"] },
  { key: "lastInspection", label: "Last Inspection", type: "date" },
  { key: "warranty", label: "Warranty", type: "warranty-select" },
  { key: "nextInspection", label: "Next Inspection", type: "date" },
  { key: "issues", label: "Known Issues", type: "textarea" },
];
