import { useState, useEffect } from "react";
import AuthService from "../../services/AuthService";
import MessageModal from "../../components/modals/MessageModal";
import loginBg from "../../assets/images/bg-2.jpg";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { extractErrorMessage } from "../../../utils/errorUtils";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!uid || !token) {
      setTokenError(true);
    }
  }, [uid, token]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { new_password: "", confirm_password: "" };

    if (!formData.new_password) {
      newErrors.new_password = "Password is required";
      valid = false;
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
      valid = false;
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

      await AuthService.resetPassword({
        uid,
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      setSuccessMessage("Password reset successful! Redirecting to login...");
      setShowModal(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Password reset failed. The link may have expired."));
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

  if (tokenError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {showModal && (successMessage || errorMessage) && (
        <MessageModal
          isOpen={true}
          type={successMessage ? "success" : "error"}
          message={successMessage || errorMessage}
          onClose={handleModalClose}
        />
      )}

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

      <div className="flex w-full md:w-1/2 justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Set New Password</h2>
          <p className="text-gray-600 mb-6 text-[16px]">
            Enter your new password below.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Enter new password"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.new_password
                    ? "border-red-500 focus:ring-red-200"
                    : "focus:ring-blue-400 border-gray-300"
                }`}
                required
              />
              {errors.new_password && (
                <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm new password"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.confirm_password
                    ? "border-red-500 focus:ring-red-200"
                    : "focus:ring-blue-400 border-gray-300"
                }`}
                required
              />
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
