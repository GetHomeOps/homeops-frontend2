/**
 * Standard page layout padding for consistent spacing across the app.
 * - Mobile: no lateral padding (edge-to-edge) for maximum content area
 * - sm–lg (640–1400px): reduced padding for tighter layout
 * - xxl (1400px+): increased padding for breathing room on large screens
 */
export const PAGE_LAYOUT = {
  /** List pages: px-0 mobile, sm:px-4 lg:px-5 ≤1400px, xxl:px-12 >1400px */
  list: "px-0 sm:px-4 lg:px-5 xxl:px-12 py-8 w-full max-w-[96rem] mx-auto",
  /** List horizontal padding only (for custom layouts like Kanban) */
  listPaddingX: "px-0 sm:px-4 lg:px-5 xxl:px-12",
  /** Form container pages */
  form: "px-0 sm:px-4 lg:px-5 xxl:px-12 py-8 w-full max-w-6xl mx-auto",
  /** Form horizontal padding only (for custom layouts like PropertyFormContainer) */
  formPaddingX: "px-0 sm:px-4 lg:px-5 xxl:px-12",
  /** Settings pages: reduced ≤1400px, generous >1400px */
  settings: "px-0 sm:px-4 lg:px-6 xxl:px-16 py-10 w-full max-w-4xl mx-auto",
};

/** Shared card styling for Settings pages (Configuration, Support, etc.) */
export const SETTINGS_CARD = {
  card: "rounded-xl bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden",
  header: "px-6 py-5 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/60",
  body: "p-6",
};
