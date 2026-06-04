import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import MessageModal from "../../components/modals/MessageModal";
import loginBg from "../../assets/images/bg-2.jpg";
import Logo from "../../assets/images/Logo-2.png";
import { useNavigate, Link } from "react-router-dom";
import googleIcon from "../../assets/images/google-logo.svg";
import twitterIcon from "../../assets/images/twitter-logo.svg";
import { extractErrorMessage } from "../../../utils/errorUtils";
import SuccessModal from "../../components/modals/SuccessModal";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Initialize all state as false/empty to prevent leftover state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Aggressive state clearing on mount and unmount
  useEffect(() => {
    // Clear stale auth tokens so they don't interfere with login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setShowModal(false);
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(false);

    // Cleanup function for unmount
    return () => {
      setShowModal(false);
      setErrorMessage("");
      setSuccessMessage("");
      setIsLoading(false);
    };
  }, []);

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setShowModal(false);

      await login(formData);

      setSuccessMessage("Login successful! Redirecting...");
      setShowModal(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Login failed. Please check your credentials."));
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Message Modal - Only render when needed */}
      {showModal && successMessage && (
        <SuccessModal
          title="Login Successful"
          message={successMessage}
          buttonText="Continue"
          onClose={handleModalClose}
        />
      )}
      {showModal && errorMessage && (
        <MessageModal
          isOpen={true}
          type="error"
          message={errorMessage}
          onClose={handleModalClose}
        />
      )}

      {/* Left Side - Background */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center border-[20px] border-white rounded-lg"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="bg-black bg-opacity-40 w-full h-full flex flex-col justify-between pt-0 px-6 pb-16 relative">
          <img
            src={Logo}
            alt="Sartorial"
            className="absolute left-0 top-2 h-40 lg:h-48 w-auto mb-6"
            style={{ transform: 'translate(-56px,-28px) scale(0.85)', zIndex: 10 }}
          />
          <div className="mt-auto pb-12 px-6" style={{ transform: 'translateY(100px)' }}>
            <h2 className="text-5xl font-semibold text-white drop-shadow-lg">
              The Smarter Way to <br /> Manage Your Projects
            </h2>
            <p className="text-white text-sm leading-relaxed">
              All the resources you need to ensure collaboration and timely
              delivery of your fashion projects.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome Back!
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "focus:ring-blue-400 border-gray-300"
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "focus:ring-blue-400 border-gray-300"
                }`}
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Processing...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <img src={googleIcon} alt="Google" className="h-5 w-5 mr-2" />
                Google
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <img src={twitterIcon} alt="Twitter" className="h-5 w-5 mr-2" />
                Twitter
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
