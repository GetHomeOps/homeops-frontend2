import React, {useState, useEffect, useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import {AlertCircle, Loader2} from "lucide-react";
import {useAuth} from "../../context/AuthContext";
import {useTranslation} from "react-i18next";

import AuthImage from "../../images/signup-house.png";
import Logo from "../../images/logo-no-bg.png";

const ROLE_OPTIONS = [
  {value: "agent", label: "Agent"},
  {value: "homeowner", label: "Homeowner"},
];

const MIN_PASSWORD_LENGTH = 4;

function Signup() {
  const navigate = useNavigate();
  const {signup, currentUser} = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "",
  });
  const [formErrors, setFormErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const justSignedUp = useRef(false);

  const {t} = useTranslation();

  useEffect(() => {
    if (justSignedUp.current && currentUser) {
      if (currentUser.accounts && currentUser.accounts.length > 0) {
        const accountUrl =
          currentUser.accounts[0].url?.replace(/^\/+/, "") ||
          currentUser.accounts[0].name;
        navigate(`/${accountUrl}/home`, {replace: true});
      } else {
        navigate("/signup", {replace: true});
      }
      justSignedUp.current = false;
    }
  }, [currentUser, navigate]);

  function validate() {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = t("signup.nameRequired");
    }
    if (!formData.email.trim()) {
      errors.email = t("signup.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t("signup.emailInvalid");
    }
    if (!formData.role) {
      errors.role = t("signup.roleRequired");
    }
    if (!formData.password) {
      errors.password = t("signup.passwordRequired");
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = t("signup.passwordMinLength", {min: MIN_PASSWORD_LENGTH});
    }
    return errors;
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    setFormErrors([]);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await signup(formData);
      justSignedUp.current = true;
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
      justSignedUp.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(evt) {
    const {name, value} = evt.target;
    setFormData((data) => ({...data, [name]: value}));
    if (formErrors.length) setFormErrors([]);
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = {...prev};
        delete next[name];
        return next;
      });
    }
  }

  const errorMessage =
    formErrors.length === 0
      ? null
      : formErrors
          .map((e) => (typeof e === "string" ? e : e?.message || String(e)))
          .join(" ");

  const inputClass = (field) =>
    `form-input w-full ${fieldErrors[field] ? "!border-red-400 dark:!border-red-500" : ""}`;

  return (
    <main className="bg-white dark:bg-gray-900">
      <div className="relative md:flex">
        <div className="md:w-1/2">
          <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">
            <div className="flex-1">
              <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                <Link className="block" to="/">
                  <img src={Logo} alt="Logo" className="w-15 h-15" />
                </Link>
              </div>
            </div>

            <div className="max-w-sm mx-auto w-full px-4 py-8">
              <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6">
                {t("signup.title")}
              </h1>

              {errorMessage && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-start gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span className="text-red-800 dark:text-red-200 text-sm">
                    {errorMessage}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      {t("name")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      className={inputClass("name")}
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      autoFocus
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      {t("emailAddress")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      className={inputClass("email")}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="role"
                    >
                      {t("signup.yourRole")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      className={`form-select w-full ${fieldErrors.role ? "!border-red-400 dark:!border-red-500" : ""}`}
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="">{t("signup.selectRole")}</option>
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.role && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.role}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="password"
                    >
                      {t("password")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password"
                      className={inputClass("password")}
                      type="password"
                      autoComplete="new-password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    {isSubmitting && (
                      <Loader2
                        className="w-4 h-4 animate-spin shrink-0"
                        aria-hidden
                      />
                    )}
                    {isSubmitting ? t("signingUp") : t("signUp")}
                  </button>
                </div>
              </form>

              <div className="pt-5 mt-6 border-t border-gray-100 dark:border-gray-700/60">
                <div className="text-sm">
                  {t("signup.haveAccount")}{" "}
                  <Link
                    className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                    to="/signin"
                  >
                    {t("signIn")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="hidden md:block absolute top-0 bottom-0 right-0 md:w-1/2"
          aria-hidden="true"
        >
          <img
            className="object-cover object-center w-full h-full"
            src={AuthImage}
            width="760"
            height="1024"
            alt="Authentication"
          />
        </div>
      </div>
    </main>
  );
}

export default Signup;
