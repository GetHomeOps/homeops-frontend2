import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { useAuth } from "../../context/AuthContext";
import AppApi from "../../api/api";

/**
 * Configuration page — profile settings: name, password, phone.
 * Email is read-only (changing requires verification).
 * Industry standard: clear sections, secure password flow.
 */
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

function ConfigurationPage() {
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
    }
  }, [currentUser]);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    if (!currentUser?.id) return;
    setProfileError(null);
    setProfileSuccess(false);
    setProfileSaving(true);
    try {
      await AppApi.updateUser(currentUser.id, { name, phone });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message || err.messages?.[0] || "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError(t("settings.passwordsDoNotMatch") || "Passwords do not match");
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError(t("settings.passwordTooShort") || "Password must be at least 4 characters");
      return;
    }
    setPasswordSaving(true);
    try {
      await AppApi.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.message || err.messages?.[0] || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {t("settings.configuration") || "Configuration"}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("settings.configurationDescription") ||
                  "Manage your profile and account security settings."}
              </p>
            </div>

            <div className="space-y-8">
              {/* Language */}
              <section className="rounded-xl bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/60">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {t("settings.language") || "Language"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("settings.languageDescription") ||
                      "Choose your preferred language for the interface."}
                  </p>
                </div>
                <div className="p-6">
                  <label htmlFor="config-language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("settings.language") || "Language"}
                  </label>
                  <select
                    id="config-language"
                    value={i18n.language?.split("-")[0] || "en"}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="form-select w-full max-w-xs"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              {/* Profile — name, phone (email read-only) */}
              <section className="rounded-xl bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/60">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {t("profile") || "Profile"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("settings.profileDescription") ||
                      "Update your name and contact information. Email cannot be changed here."}
                  </p>
                </div>
                <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                  {profileError && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                      {profileError}
                    </div>
                  )}
                  {profileSuccess && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                      {t("settings.profileSaved") || "Profile saved successfully."}
                    </div>
                  )}
                  <div>
                    <label htmlFor="config-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("name") || "Name"}
                    </label>
                    <input
                      id="config-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input w-full"
                      placeholder={t("name") || "Your name"}
                    />
                  </div>
                  <div>
                    <label htmlFor="config-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("email") || "Email"}
                    </label>
                    <input
                      id="config-email"
                      type="email"
                      value={currentUser?.email || ""}
                      readOnly
                      disabled
                      className="form-input w-full bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t("settings.emailReadOnly") || "Email cannot be changed. Contact support if needed."}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="config-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("phone") || "Phone"}
                    </label>
                    <input
                      id="config-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input w-full"
                      placeholder={t("phonePlaceholder") || "Enter phone number"}
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white disabled:opacity-50"
                    >
                      {profileSaving ? (t("saving") || "Saving...") : (t("save") || "Save Changes")}
                    </button>
                  </div>
                </form>
              </section>

              {/* Password */}
              <section className="rounded-xl bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/60">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {t("password") || "Password"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("settings.passwordDescription") ||
                      "Set a permanent password. You'll need your current password to change it."}
                  </p>
                </div>
                <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                  {passwordError && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                      {t("settings.passwordChanged") || "Password changed successfully."}
                    </div>
                  )}
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("settings.currentPassword") || "Current Password"}
                    </label>
                    <input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="form-input w-full"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("settings.newPassword") || "New Password"}
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="form-input w-full"
                      placeholder="••••••••"
                      minLength={4}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("settings.confirmPassword") || "Confirm New Password"}
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input w-full"
                      placeholder="••••••••"
                      minLength={4}
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white disabled:opacity-50"
                    >
                      {passwordSaving
                        ? (t("saving") || "Saving...")
                        : (t("settings.changePassword") || "Change Password")}
                    </button>
                  </div>
                </form>
              </section>

              {/* Future: Notifications, 2FA, Sessions */}
              <section className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("settings.moreOptionsComingSoon") ||
                    "Notification preferences, two-factor authentication, and session management coming soon."}
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ConfigurationPage;
