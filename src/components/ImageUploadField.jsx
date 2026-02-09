import React, {useRef, useState, useEffect} from "react";
import {createPortal} from "react-dom";
import {User, ImagePlus, Link2, X, Loader2, AlertCircle} from "lucide-react";

const PLACEHOLDER_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'%3E%3C/path%3E%3C/svg%3E";

const SIZES = {
  sm: "w-24 h-24",
  md: "w-36 h-36",
  lg: "w-52 h-52",
  xl: "w-full h-full min-h-[208px] lg:min-h-[288px]",
};

/**
 * Reusable image upload field with preview, upload menu, and S3 upload support.
 *
 * @param {Object} props
 * @param {string|null} props.imageSrc - URL to display (from preview, uploaded, or API)
 * @param {boolean} props.hasImage - Whether an image is set (for styling)
 * @param {boolean} props.imageUploading - Upload in progress
 * @param {Function} props.onUpload - (file: File) => void
 * @param {Function} props.onRemove - () => void
 * @param {Function} [props.onPasteUrl] - () => void, shows Paste URL option when provided
 * @param {boolean} [props.showRemove=true] - Show remove button when image exists
 * @param {string|null} props.imageUploadError - Error message to display
 * @param {Function} props.onDismissError - () => void
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg' | 'xl'
 * @param {'avatar'|'generic'} [props.placeholder='generic'] - Placeholder icon when empty
 * @param {string} [props.alt='Image'] - Alt text for img
 * @param {string} [props.uploadLabel='Upload photo'] - Label for upload action
 * @param {string} [props.removeLabel='Remove photo'] - Label for remove action
 * @param {string} [props.pasteUrlLabel='Paste URL'] - Label for paste URL action
 * @param {React.RefObject} [props.fileInputRef] - Ref for the hidden file input
 * @param {boolean} [props.menuOpen] - Whether menu is open (controlled)
 * @param {Function} [props.onMenuToggle] - (open: boolean) => void
 * @param {string} [props.emptyLabel] - Label shown below icon when empty (e.g. "Add image")
 */
function ImageUploadField({
  imageSrc,
  hasImage,
  imageUploading,
  onUpload,
  onRemove,
  onPasteUrl,
  showRemove = true,
  imageUploadError,
  onDismissError,
  size = "md",
  placeholder = "generic",
  alt = "Image",
  uploadLabel = "Upload photo",
  removeLabel = "Remove photo",
  pasteUrlLabel = "Paste URL",
  emptyLabel,
  fileInputRef,
  menuOpen = false,
  onMenuToggle,
}) {
  const sizeClass = SIZES[size] || SIZES.md;
  const PlaceholderIcon = placeholder === "avatar" ? User : ImagePlus;
  const menuButtonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({top: 0, right: 0});

  const isEmpty = !imageSrc && !imageUploading;
  const isXl = size === "xl";

  /* Position dropdown via portal when menu opens */
  useEffect(() => {
    if (menuOpen && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [menuOpen]);

  return (
    <div
      className={`relative flex flex-col items-start gap-2 ${isXl ? "w-full h-full min-h-0" : "shrink-0"}`}
    >
      <div
        className={`${sizeClass} rounded-xl overflow-hidden transition-all duration-200 flex flex-col items-center justify-center ${
          hasImage
            ? "ring-2 ring-gray-200 dark:ring-gray-600 ring-offset-2 dark:ring-offset-gray-800 shadow-sm"
            : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 border-2 border-dashed border-gray-300 dark:border-gray-600"
        } ${isEmpty ? "cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-650 dark:hover:to-gray-700" : ""}`}
        onClick={isEmpty ? () => onMenuToggle?.(true) : undefined}
        role={isEmpty ? "button" : undefined}
        tabIndex={isEmpty ? 0 : undefined}
        onKeyDown={isEmpty ? (e) => e.key === "Enter" && onMenuToggle?.(true) : undefined}
      >
        {imageUploading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-xs font-medium">Uploading…</span>
          </div>
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_FALLBACK;
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <PlaceholderIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            {emptyLabel && (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {emptyLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action menu - corner button (when image exists) or dropdown */}
      {!imageUploading && (
        <div className="absolute -bottom-1 -right-1 flex items-center gap-1 z-[100]">
          <div className="relative">
            <button
              ref={menuButtonRef}
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle?.(!menuOpen);
              }}
              aria-label={uploadLabel}
            >
              <ImagePlus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>

            {menuOpen &&
              createPortal(
                <>
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => onMenuToggle?.(false)}
                  />
                  <div
                    className="fixed w-52 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999]"
                    style={{
                      top: menuPosition.top,
                      right: menuPosition.right,
                      left: "auto",
                    }}
                  >
                    <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <ImagePlus className="w-4 h-4 text-gray-500 shrink-0" />
                      <span>{uploadLabel}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onUpload(file);
                            onMenuToggle?.(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                    {onPasteUrl && (
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        onClick={() => {
                          onMenuToggle?.(false);
                          onPasteUrl();
                        }}
                      >
                        <Link2 className="w-4 h-4 text-gray-500 shrink-0" />
                        {pasteUrlLabel}
                      </button>
                    )}
                    {showRemove && hasImage && (
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                          onMenuToggle?.(false);
                          onRemove();
                        }}
                      >
                        <X className="w-4 h-4 shrink-0" />
                        {removeLabel}
                      </button>
                    )}
                  </div>
                </>,
                document.body,
              )}
          </div>
        </div>
      )}

      {imageUploadError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm max-w-[200px]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1 min-w-0 truncate">{imageUploadError}</span>
          <button
            type="button"
            onClick={onDismissError}
            className="shrink-0 p-0.5 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUploadField;
