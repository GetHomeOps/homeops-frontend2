import React, {useState, useEffect} from "react";
import {useSearchParams, useLocation} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../context/AuthContext";
import AppApi from "../../api/api";
import {
  Copy,
  Check,
  Mail,
  Lock,
  User,
  AlertCircle,
  Building2,
  Send,
  FileText,
} from "lucide-react";
import Logo from "../../images/logo-no-bg.png";

function UserConfirmationEmail() {
  const {t} = useTranslation();
  const {currentUser} = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Get user data from query params or location state
  const userEmail = searchParams.get("email")
    ? decodeURIComponent(searchParams.get("email"))
    : location.state?.email || "";
  const initialName = searchParams.get("name")
    ? decodeURIComponent(searchParams.get("name"))
    : location.state?.name || "";
  const token = searchParams.get("token") || "";

  // Check if current user is agent or superAdmin
  const isAdminOrAgent =
    currentUser?.role === "agent" ||
    currentUser?.role === "superAdmin" ||
    currentUser?.role === "super_admin";

  // Get current URL for copying
  const currentUrl = window.location.href;

  // Populate name field from URL params or location state
  useEffect(() => {
    if (initialName) {
      setFormData((prev) => ({...prev, name: initialName}));
    }
  }, [initialName]);

  // Fetch user data by email to populate name field (fallback if name not in URL)
  useEffect(() => {
    async function fetchUserByEmail() {
      if (userEmail && !initialName) {
        setIsLoadingUser(true);
        try {
          // Try to get user by email using the getCurrentUser endpoint
          // Note: This might require authentication, so we'll need to handle errors gracefully
          const user = await AppApi.getCurrentUser(userEmail);
          if (user && user.name) {
            setFormData((prev) => ({
              ...prev,
              name: user.name || user.fullName || "",
            }));
          }
        } catch (error) {
          // If we can't fetch user (e.g., no auth), that's okay - user can enter name manually
          console.log("Could not fetch user data:", error);
        } finally {
          setIsLoadingUser(false);
        }
      }
    }
    fetchUserByEmail();
  }, [userEmail, initialName]);

  const handleChange = (e) => {
    const {id, value} = e.target;
    setFormData((prev) => ({...prev, [id]: value}));
    // Clear error when field is being edited
    if (errors[id]) {
      setErrors((prev) => ({...prev, [id]: null}));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = t("nameValidationErrorMessage") || "Name is required";
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password =
        t("passwordValidationErrorMessage") ||
        "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword =
        t("passwordMatchErrorMessage") || "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

/* Handles the submission of the form */
  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      throw new Error("Invalid form data");
    }

    try {
      const res = await AppApi.confirmInvitation({
        token,
        password: formData.password,
        name: formData.name,
      });
      console.log("Confirm invitation response:", res);

      // Set success if the response indicates success
      if (res && res.success === true) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error confirming user invitation:", error);
      throw new Error(error.message);
    }
  };

  /* Handles the copying of the email content */
  async function handleCopyEmailContent() {
    try {
      const emailContent = document.querySelector(".email-template-content");
      if (emailContent) {
        const textContent = emailContent.innerText;
        await navigator.clipboard.writeText(textContent);
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      }
    } catch (error) {
      console.error("Error copying email content:", error);
      throw new Error(error.message);
    }
  };

  /* Handles the copying of the URL */
  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying URL:", error);
      throw new Error(error.message);
    }
  };

  /* If the user confirmation is successful, show the success message */
  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#456564]/5 via-gray-50 to-[#34514f]/5 dark:from-[#456564]/10 dark:via-gray-900 dark:to-[#34514f]/10">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(69, 101, 100, 0.15) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="max-w-xl w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t("confirmationSuccessTitle") || "Confirmation Successful!"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t("confirmationSuccessMessage") ||
                  "Your account has been confirmed and your password has been set. You can now log in to your account."}
              </p>
              <button
                onClick={() => (window.location.href = "/signin")}
                className="btn bg-[#456564] hover:bg-[#34514f] text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {t("goToSignIn") || "Go to Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* If the user confirmation is not successful, show the email confirmation page */
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#456564]/5 via-gray-50/80 to-[#34514f]/5 dark:from-[#456564]/10 dark:via-gray-900 dark:to-[#34514f]/10">
        {/* Geometric Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
            linear-gradient(45deg, rgba(69, 101, 100, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(69, 101, 100, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(69, 101, 100, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(69, 101, 100, 0.1) 75%)
          `,
            backgroundSize: "60px 60px",
            backgroundPosition: "0 0, 0 30px, 30px -30px, -30px 0px",
          }}
        ></div>
        {/* Dot Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(69, 101, 100, 0.2) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        ></div>
      </div>

      <div className="relative py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Action Buttons - Send and Copy */}
          {isAdminOrAgent && (
            <div className="mb-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200/50 dark:border-gray-700/50 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#456564]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("emailActions") || "Email Actions"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Send Email Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 shadow-sm hover:shadow ${
                      isSubmitting
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed"
                        : "bg-[#456564] hover:bg-[#34514f] text-white"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {t("confirming") || "Confirming..."}
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        {t("confirmInvitation") || "Confirm Invitation"}
                      </>
                    )}
                  </button>

                  {/* Copy Email Content Button */}
                  <button
                    onClick={handleCopyEmailContent}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 shadow-sm hover:shadow ${
                      emailCopied
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    {emailCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {t("copied") || "Copied!"}
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        {t("copyEmail") || "Copy"}
                      </>
                    )}
                  </button>

                  {/* Copy URL Button */}
                  <button
                    onClick={handleCopyUrl}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 shadow-sm hover:shadow ${
                      copied
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {t("copied") || "Copied!"}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        {t("copyUrl") || "URL"}
                      </>
                    )}
                  </button>
                </div>
              </div>
              {(copied || emailCopied) && (
                <div className="mt-3 p-2 bg-gray-50/80 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono">
                    {currentUrl}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Email Template Card */}
          <div className="email-template-content bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            {/* Header with Logo - Enhanced */}
            <div className="relative bg-gradient-to-r from-[#456564] via-[#3d5a59] to-[#34514f] px-6 py-5 overflow-hidden">
              {/* Decorative Pattern in Header */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>
              <div className="relative flex items-center gap-3">
                <div className="flex-shrink-0">
                  <img
                    src={Logo}
                    alt="HomeOps"
                    className="h-9 w-auto drop-shadow-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white mb-0.5 drop-shadow-md">
                    HomeOps
                  </h1>
                  <p className="text-xs text-white/90 font-medium">
                    {t("propertyManagementPlatform") ||
                      "Property Management Platform"}
                  </p>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="p-6 md:p-8">
              {/* Invitation Text - Enhanced */}
              <div className="mb-6 text-center md:text-left">
                <div className="inline-block mb-3">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-[#456564] to-[#34514f] rounded-full mx-auto md:mx-0"></div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                  {t("welcomeToHomeOps") || "Welcome to HomeOps!"}
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t("invitationMessage") ||
                    "You've been invited to join HomeOps. Please confirm your information and set up your password to get started."}
                </p>
              </div>

              {/* Confirmation Form - Enhanced */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field (Read-only) - Enhanced */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <label
                    className="flex items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                    htmlFor="email"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#456564]/10 dark:bg-[#456564]/20 mr-2">
                      <Mail className="w-3.5 h-3.5 text-[#456564]" />
                    </div>
                    {t("email") || "Email"}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={userEmail}
                    readOnly
                    className="form-input w-full bg-white dark:bg-gray-800 cursor-not-allowed border-gray-300 dark:border-gray-600 text-sm"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t("emailCannotBeChanged") || "Email cannot be changed"}
                  </p>
                </div>

                {/* Name Field */}
                <div>
                  <label
                    className="flex items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                    htmlFor="name"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#456564]/10 dark:bg-[#456564]/20 mr-2">
                      <User className="w-3.5 h-3.5 text-[#456564]" />
                    </div>
                    {t("name") || "Name"}{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("enterYourName") || "Enter your name"}
                    className={`form-input w-full text-sm transition-all duration-200 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:border-[#456564] focus:ring-[#456564]"
                    }`}
                  />
                  {errors.name && (
                    <div className="mt-1.5 flex items-center text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-md">
                      <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      <span>{errors.name}</span>
                    </div>
                  )}
                </div>

                {/* Password Field - Enhanced */}
                <div>
                  <label
                    className="flex items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                    htmlFor="password"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#456564]/10 dark:bg-[#456564]/20 mr-2">
                      <Lock className="w-3.5 h-3.5 text-[#456564]" />
                    </div>
                    {t("password") || "Password"}{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("enterPassword") || "Enter your password"}
                    className={`form-input w-full text-sm transition-all duration-200 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:border-[#456564] focus:ring-[#456564]"
                    }`}
                  />
                  {errors.password && (
                    <div className="mt-1.5 flex items-center text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-md">
                      <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t("passwordMinLength") ||
                      "Password must be at least 8 characters"}
                  </p>
                </div>

                {/* Confirm Password Field - Enhanced */}
                <div>
                  <label
                    className="flex items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                    htmlFor="confirmPassword"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#456564]/10 dark:bg-[#456564]/20 mr-2">
                      <Lock className="w-3.5 h-3.5 text-[#456564]" />
                    </div>
                    {t("confirmPassword") || "Confirm Password"}{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={
                      t("confirmPasswordPlaceholder") || "Confirm your password"
                    }
                    className={`form-input w-full text-sm transition-all duration-200 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:border-[#456564] focus:ring-[#456564]"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <div className="mt-1.5 flex items-center text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-md">
                      <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                {/* Submit Error - Enhanced */}
                {errors.submit && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{errors.submit}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button - Enhanced */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn bg-gradient-to-r from-[#456564] to-[#34514f] hover:from-[#34514f] hover:to-[#2a4241] text-white py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>{t("confirming") || "Confirming..."}</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        {t("confirmInvitation") || "Confirm Invitation"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer - Enhanced */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-800/30 px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Building2 className="w-3.5 h-3.5 text-[#456564]" />
                <span className="font-medium">
                  {t("homeOpsFooter") || "© HomeOps. All rights reserved."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserConfirmationEmail;
