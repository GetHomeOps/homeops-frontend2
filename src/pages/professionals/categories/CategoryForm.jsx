import React from "react";
import {useNavigate} from "react-router-dom";
import {Layers, Tag, Users, ArrowRight} from "lucide-react";
import useCurrentDb from "../../../hooks/useCurrentDb";

const ICON_OPTIONS = [
  {value: "leaf", label: "Leaf"},
  {value: "zap", label: "Zap"},
  {value: "droplets", label: "Droplets"},
  {value: "droplet", label: "Droplet"},
  {value: "palette", label: "Palette"},
  {value: "shield", label: "Shield"},
  {value: "sparkles", label: "Sparkles"},
  {value: "wrench", label: "Wrench"},
  {value: "hammer", label: "Hammer"},
  {value: "home", label: "Home"},
];

function CategoryForm({
  formData,
  errors,
  isNew,
  parentCategories,
  childCategories,
  existingCategory,
  onChange,
}) {
  const navigate = useNavigate();
  const {currentDb} = useCurrentDb();
  const dbUrl = currentDb?.url || currentDb?.name || "";

  const isParent = formData.type === "parent";

  return (
    <div className="space-y-6">
      {/* ─── Category Type Selection ─────────────────────────── */}
      {isNew && (
        <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 border border-gray-200 dark:border-gray-700/60">
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Category Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange("type", "parent")}
              className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                isParent
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                  : "border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isParent
                    ? "bg-violet-100 dark:bg-violet-500/20"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <Layers
                  className={`w-4.5 h-4.5 ${
                    isParent
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
              </div>
              <div className="text-left">
                <div
                  className={`text-sm font-semibold ${
                    isParent
                      ? "text-violet-700 dark:text-violet-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Parent Category
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Top-level group containing subcategories
                </div>
              </div>
              {isParent && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => onChange("type", "child")}
              className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                !isParent
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                  : "border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  !isParent
                    ? "bg-emerald-100 dark:bg-emerald-500/20"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <Tag
                  className={`w-4.5 h-4.5 ${
                    !isParent
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
              </div>
              <div className="text-left">
                <div
                  className={`text-sm font-semibold ${
                    !isParent
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Subcategory
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Child category within a parent group
                </div>
              </div>
              {!isParent && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Basic Info ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 border border-gray-200 dark:border-gray-700/60">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
          General Information
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="category-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              className={`form-input w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 focus:border-gray-300 dark:focus:border-gray-600 rounded-lg shadow-sm text-sm ${
                errors.name ? "!border-red-500" : ""
              }`}
              placeholder={
                isParent
                  ? "e.g. Outdoor & Garden"
                  : "e.g. Landscapers"
              }
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="category-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="category-description"
              className="form-textarea w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 focus:border-gray-300 dark:focus:border-gray-600 rounded-lg shadow-sm text-sm"
              rows={3}
              placeholder="Brief description of this category..."
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </div>

          {/* Image URL (subcategories display images in the directory) */}
          <div>
            <label
              htmlFor="category-imageUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Image
            </label>
            <input
              id="category-imageUrl"
              type="url"
              className="form-input w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 focus:border-gray-300 dark:focus:border-gray-600 rounded-lg shadow-sm text-sm"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl || ""}
              onChange={(e) => onChange("imageUrl", e.target.value)}
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Category preview"
                  className="w-full max-w-[200px] h-[140px] object-cover rounded-lg border border-gray-200 dark:border-gray-700/60"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Parent selector (only for subcategories) */}
          {!isParent && (
            <div>
              <label
                htmlFor="category-parent"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Parent Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category-parent"
                className={`form-select w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 focus:border-gray-300 dark:focus:border-gray-600 rounded-lg shadow-sm text-sm ${
                  errors.parentId ? "!border-red-500" : ""
                }`}
                value={formData.parentId}
                onChange={(e) => onChange("parentId", e.target.value)}
              >
                <option value="">Select a parent category...</option>
                {parentCategories.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.parentId && (
                <p className="mt-1 text-xs text-red-500">{errors.parentId}</p>
              )}
            </div>
          )}

          {/* Icon selector (only for parent categories) */}
          {isParent && (
            <div>
              <label
                htmlFor="category-icon"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Icon
              </label>
              <select
                id="category-icon"
                className="form-select w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 focus:border-gray-300 dark:focus:border-gray-600 rounded-lg shadow-sm text-sm"
                value={formData.icon}
                onChange={(e) => onChange("icon", e.target.value)}
              >
                <option value="">Select an icon...</option>
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ─── Subcategories Panel (when editing a parent) ─────── */}
      {!isNew && isParent && childCategories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl border border-gray-200 dark:border-gray-700/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Subcategories
              </h2>
              <span className="inline-flex items-center justify-center min-w-[1.5rem] px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {childCategories.length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {childCategories.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                onClick={() =>
                  navigate(`/${dbUrl}/professionals/categories/${child.id}`)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  navigate(`/${dbUrl}/professionals/categories/${child.id}`)
                }
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {child.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {child.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="w-3 h-3" />
                    {child.proCount ?? 0}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Stats Panel (when editing) ──────────────────────── */}
      {!isNew && existingCategory && (
        <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 border border-gray-200 dark:border-gray-700/60">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Statistics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isParent
                  ? existingCategory.totalPros?.toLocaleString() ??
                    existingCategory.proCount?.toLocaleString() ??
                    "0"
                  : existingCategory.proCount?.toLocaleString() ?? "0"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Professionals
              </div>
            </div>
            {isParent && (
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {existingCategory.childCount ?? childCategories.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Subcategories
                </div>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Active
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Status
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryForm;
