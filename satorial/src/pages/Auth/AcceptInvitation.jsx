import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import PlatformAccessService from "../../services/staffServices/PlatformAccessService";
import MessageModal from "../../components/modals/MessageModal";
import SuccessModal from "../../components/modals/SuccessModal";
import loginBg from "../../assets/images/bg-2.jpg";
import { extractErrorMessage } from "../../../utils/errorUtils";

/**
 * Where an invited staff member lands from the emailed link. The token is
 * validated up front so a cancelled or expired invite says so before the person
 * fills in a password.
 */
const AcceptInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState(null);
  const [checking, setChecking] = useState(true);
  const [invitationError, setInvitationError] = useState("");
  const [formData, setFormData] = useState({ password: "", confirm_password: "" });
  const [errors, setErrors] = useState({ password: "", confirm_password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvitationError("This invitation link is missing its token.");
      setChecking(false);
      return;
    }

    let active = true;
    PlatformAccessService.getInvitation(token)
      .then((data) => {
        if (active) setInvitation(data);
      })
      .catch((error) => {
        if (active) {
          setInvitationError(
            extractErrorMessage(error, "This invitation link is invalid or has expired.")
          );
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { password: "", confirm_password: "" };

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
      valid = false;
    } else if (formData.password !== formData.confirm_password) {
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

      await PlatformAccessService.acceptInvitation({
        token,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      setSuccessMessage("Your account is active! Redirecting to login...");
      setShowModal(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(error, "Could not activate your account. The link may have expired.")
      );
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

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Checking your invitation...</p>
      </div>
    );
  }

  if (invitationError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invitation Unavailable</h2>
          <p className="text-gray-600 mb-6">{invitationError}</p>
          <p className="text-gray-500 text-sm mb-6">
            Ask your organization to send you a new invitation.
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {showModal && successMessage && (
        <SuccessModal
          title="Account Activated"
          message={successMessage}
          buttonText="Done"
          onClose={handleModalClose}
        />
      )}
      {showModal && errorMessage && (
        <MessageModal isOpen={true} type="error" message={errorMessage} onClose={handleModalClose} />
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
              All the resources you need to ensure collaboration and timely delivery of your fashion
              projects.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Activate Your Account</h2>
          <p className="text-gray-600 mb-6 text-[16px]">
            {invitation?.organization_name} invited{" "}
            <span className="font-medium text-gray-800">{invitation?.email}</span> to their workspace.
            Set a password to finish setting up.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "focus:ring-blue-400 border-gray-300"
                }`}
                required
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm your password"
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
              {isLoading ? "Activating..." : "Activate Account"}
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

export default AcceptInvitation;
