import React, {useState, useEffect, useRef} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {AlertCircle, Loader2} from "lucide-react";
import {useAuth} from "../../context/AuthContext";
import "../../i18n";

import Logo from "../../images/logo-no-bg.png";

function Signin() {
  const navigate = useNavigate();
  const location = useLocation();
  const {login, currentUser} = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const justLoggedIn = useRef(false);

  const {t, i18n} = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  /** Normalize API error to a single display string */
  const errorMessage =
    formErrors.length === 0
      ? null
      : formErrors
          .map((e) => (typeof e === "string" ? e : e?.message || String(e)))
          .join(" ");

  // Navigate after successful login when currentUser is available (redirect-after-login from ProtectedRoute)
  useEffect(() => {
    if (justLoggedIn.current && currentUser) {
      const from = location.state?.from;
      const isInternalPath =
        typeof from === "string" &&
        from.startsWith("/") &&
        !from.startsWith("//");
      if (isInternalPath && from !== "/signin" && from !== "/signup") {
        navigate(from, {replace: true});
      } else if (currentUser.accounts && currentUser.accounts.length > 0) {
        const accountUrl =
          currentUser.accounts[0].url?.replace(/^\/+/, "") ||
          currentUser.accounts[0].name;
        navigate(`/${accountUrl}/home`, {replace: true});
      } else {
        navigate("/signin", {replace: true});
      }
      justLoggedIn.current = false;
    }
  }, [currentUser, navigate, location.state?.from]);

  /** Handle form submit:
   *
   * Calls login func prop and, if not successful, sets errors.
   */
  async function handleSubmit(evt) {
    evt.preventDefault();
    setFormErrors([]);
    setIsSubmitting(true);
    try {
      await login(formData);
      justLoggedIn.current = true;
    } catch (err) {
      const raw =
        err?.messages ??
        (Array.isArray(err)
          ? err
          : [err?.message || err?.toString?.() || String(err)]);
      const messages = raw.map((e) =>
        typeof e === "string" ? e : e?.message || String(e),
      );
      setFormErrors(messages);
      justLoggedIn.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }

  /** Update form data field */
  function handleChange(evt) {
    const {name, value} = evt.target;
    setFormData((data) => ({
      ...data,
      [name]: value,
    }));
    if (formErrors.length) setFormErrors([]);
  }

  return (
    <main className="min-h-[100dvh] bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Link className="block" to="/">
              <img src={Logo} alt="Logo" className="w-15 h-15" />
            </Link>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm px-6 py-8">
            <h1 className="text-2xl text-gray-800 dark:text-gray-100 font-semibold text-center mb-6">
              {t("welcome")}
            </h1>

            {errorMessage && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                <span className="text-red-800 dark:text-red-200 text-sm">
                  {errorMessage}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    htmlFor="email"
                  >
                    {t("emailAddress")}
                  </label>
                  <input
                    id="email"
                    className="form-input w-full"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    htmlFor="password"
                  >
                    {t("password")}
                  </label>
                  <input
                    id="password"
                    className="form-input w-full"
                    type="password"
                    autoComplete="on"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-6 gap-3">
                <Link
                  className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
                  to="/reset-password"
                >
                  {t("forgotPassword")}
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white shrink-0 flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2
                      className="w-4 h-4 animate-spin shrink-0"
                      aria-hidden
                    />
                  )}
                  {isSubmitting ? t("signingIn") : t("signIn")}
                </button>
              </div>
            </form>

            <div className="pt-5 mt-6 border-t border-gray-200 dark:border-gray-600 text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("noAccount")}{" "}
              </span>
              <Link
                className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                to="/signup"
              >
                {t("signUp")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Signin;
