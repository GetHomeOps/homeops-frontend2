/**
 * Standard page layout padding for consistent spacing across the app.
 * - Lists: smaller spacing (compact)
 * - Form containers: larger spacing (moderate)
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
};
