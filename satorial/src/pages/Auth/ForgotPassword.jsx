import { useState, useEffect } from "react";
import AuthService from "../../services/AuthService";
import MessageModal from "../../components/modals/MessageModal";
import loginBg from "../../assets/images/bg-2.jpg";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../../components/modals/SuccessModal";
import { extractErrorMessage } from "../../../utils/errorUtils";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Initialize all state as false/empty to prevent leftover state
  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Aggressive state clearing on mount and unmount
  useEffect(() => {
    // Clear everything on mount
    setShowModal(false);
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(false);

    return () => {
      setShowModal(false);
      setErrorMessage("");
      setSuccessMessage("");
      setIsLoading(false);
    };
  }, []);

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
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

      await AuthService.forgotPassword({ email: formData.email });

      setSuccessMessage("Reset password link sent successfully!");
      setShowModal(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Password reset failed. Please try again."));
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
          title="Reset Link Sent"
          message={successMessage}
          buttonText="Done"
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
        <div className="bg-black bg-opacity-40 w-full h-full flex flex-col justify-between p-16">
          <h1 className="text-white text-5xl font-bold mb-6">Sartorial</h1>
          <div>
            <p className="text-gray-300 text-lg font-light">
              Enter your email to receive a password reset link.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-600">
              No worries! Enter your registered email address and we will send
              you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="enter email address"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-200`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Sending Link...</span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-gray-600 hover:text-black font-medium transition duration-200"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
