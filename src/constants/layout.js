/**
 * Standard page layout padding for consistent spacing across the app.
 * - Lists: smaller spacing (compact)
 * - Form containers: larger spacing (moderate)
 * - Settings: generous padding and narrower max-width for readability
 * Values are between ProfessionalDirectory (compact) and ContactFormContainer (generous).
 */
export const PAGE_LAYOUT = {
  /** List pages: px-4 sm:px-5 - compact horizontal padding */
  list: "px-4 sm:px-5 py-8 w-full max-w-[96rem] mx-auto",
  /** List horizontal padding only (for custom layouts like Kanban) */
  listPaddingX: "px-4 sm:px-5",
  /** Form container pages: px-5 sm:px-6 - moderate horizontal padding */
  form: "px-5 sm:px-6 py-8 w-full max-w-6xl mx-auto",
  /** Form horizontal padding only (for custom layouts like PropertyFormContainer) */
  formPaddingX: "px-5 sm:px-6",
  /** Settings pages: generous padding, narrower max-width for breathing room */
  settings: "px-6 sm:px-8 lg:px-12 py-10 w-full max-w-4xl mx-auto",
};

/** Shared card styling for Settings pages (Configuration, Support, etc.) */
export const SETTINGS_CARD = {
  card: "rounded-xl bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden",
  header: "px-6 py-5 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/60",
  body: "p-6",
};
