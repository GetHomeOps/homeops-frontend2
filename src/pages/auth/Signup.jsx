import React, {useState, useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import {useNavigate} from "react-router-dom";
import {Loader2} from "lucide-react";
import {useAuth} from "../../context/AuthContext";
import {useTranslation} from "react-i18next";

import AuthImage from "../../images/signup-house.png";
import Logo from "../../images/logo-no-bg.png";

const ROLE_OPTIONS = [
  {value: "agent", label: "Agent"},
  {value: "user", label: "User"},
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const justSignedUp = useRef(false);

  const {t, i18n} = useTranslation();

  // Navigate after successful signup when currentUser is available
  useEffect(() => {
    if (justSignedUp.current && currentUser) {
      if (currentUser.databases && currentUser.databases.length > 0) {
        const dbUrl =
          currentUser.databases[0].url?.replace(/^\/+/, "") ||
          currentUser.databases[0].name;
        navigate(`/${dbUrl}/home`, {replace: true});
      } else {
        navigate("/signup", {replace: true});
      }
      justSignedUp.current = false;
    }
  }, [currentUser, navigate]);

  /* Handle form submit */
  async function handleSubmit(evt) {
    evt.preventDefault();
    console.log("formData", formData);
    setIsSubmitting(true);
    try {
      await signup(formData);
      justSignedUp.current = true;
    } catch (err) {
      setFormErrors(err);
      justSignedUp.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }

  /* Update form data field */
  async function handleChange(evt) {
    const {name, value} = evt.target;
    setFormData((data) => ({
      ...data,
      [name]: value,
    }));
  }

  return (
    <main className="bg-white dark:bg-gray-900">
      <div className="relative md:flex">
        {/* Content */}
        <div className="md:w-1/2">
          <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">
            {/* Header */}
            <div className="flex-1">
              <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link className="block" to="/">
                  <img src={Logo} alt="Logo" className="w-15 h-15" />
                </Link>
              </div>
            </div>

            <div className="max-w-sm mx-auto w-full px-4 py-8">
              <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6">
                Create your Account
              </h1>
              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      className="form-input w-full"
                      type="email"
                      name="email"
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      className="form-input w-full"
                      type="text"
                      name="name"
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="role"
                    >
                      Your Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      className="form-select w-full"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="">Select a role</option>
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      className="form-input w-full"
                      type="password"
                      autoComplete="on"
                      name="password"
                      onChange={handleChange}
                    />
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
              {/* Footer */}
              <div className="pt-5 mt-6 border-t border-gray-100 dark:border-gray-700/60">
                <div className="text-sm">
                  Have an account?{" "}
                  <Link
                    className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                    to="/signin"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
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
