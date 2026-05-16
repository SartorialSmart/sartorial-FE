import { useState, useEffect } from "react";
import AuthService from "../../services/AuthService";
import MessageModal from "../../components/modals/MessageModal";
import loginBg from "../../assets/images/bg-2.jpg";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../../components/modals/SuccessModal";

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
      let message = "Password reset failed. Please try again.";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          message = error.response.data;
        } else if (error.response.data.detail) {
          message = error.response.data.detail;
        } else {
          message = Object.entries(error.response.data)
            .map(
              ([field, errors]) =>
                `${field}: ${
                  Array.isArray(errors) ? errors.join(", ") : errors
                }`
            )
            .join(". ");
        }
      } else if (error.message) {
        message = error.message;
      }

      setErrorMessage(message);
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
            Reset your password
          </h2>

          <p className="text-gray-600 mb-6 text-[16px]">
            Enter your email address and we’ll send you password reset
            instructions.
          </p>
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
                "Send Password Reset Link"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
