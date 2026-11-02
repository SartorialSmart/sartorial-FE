import React, { useState } from "react";
import AuthService from "../../services/AuthService";
import { useNavigate, Link } from "react-router-dom";
import MessageModal from "../../components/modals/MessageModal";
import registerBg from "../../assets/images/bg-2.jpg";
import Logo from "../../assets/images/Logo-2.png";
import { extractErrorMessage } from "../../../utils/errorUtils";
import SuccessModal from "../../components/modals/SuccessModal";

const OrganizationRegister = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone_number: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
      };

      const response = await AuthService.registerOrganization(payload);

      const message = response?.message || "Registration successful!";
      setSuccessMessage(message);
      setShowModal(true);

      // After first login, route the new organization to pick a plan.
      localStorage.setItem("pendingPlanSelection", "1");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Registration failed. Please try again."));
      setShowModal(true);
      console.error("Registration error:", error.response?.data);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {showModal && successMessage && (
        <SuccessModal
          title="Registration Successful"
          message={successMessage}
          buttonText="Done"
          onClose={() => setShowModal(false)}
        />
      )}
      {showModal && errorMessage && (
        <MessageModal
          type="error"
          message={errorMessage}
          onClose={() => setShowModal(false)}
        />
      )}

      <div
        className="hidden md:flex w-1/2 bg-cover bg-center border-[20px] border-white rounded-lg"
        style={{ backgroundImage: `url(${registerBg})` }}
      >
        <div className="bg-black bg-opacity-40 w-full h-full flex flex-col justify-between pt-0 px-6 pb-16 relative">
          <img
            src={Logo}
            alt="Sartorial"
            className="absolute left-0 top-2 h-40 lg:h-48 w-auto mb-6"
            style={{ transform: 'translate(-36px,-28px) scale(0.85)', zIndex: 10 }}
          />

          <div className="mt-auto pb-12 px-6" style={{ transform: 'translateY(-100px)' }}>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome to Sartorial Smart!
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter Phone Number eg +23408012345678"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                minLength={8}
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Your password must have at least 8 characters.
              </p>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" required />
              <p className="text-sm text-gray-600">
                By creating an account you agree to the{" "}
                <a href="#" className="text-blue-600">
                  Terms & Conditions
                </a>{" "}
                and our{" "}
                <a href="#" className="text-blue-600">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Signup
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-500">Or</p>
            <div className="mt-4 space-y-2">
              <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition">
                <img
                  src="https://img.icons8.com/color/24/google-logo.png"
                  alt="Google"
                  className="mr-2"
                />
                Continue with Google
              </button>
              <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition">
                <img
                  src="https://img.icons8.com/color/24/twitter.png"
                  alt="Twitter"
                  className="mr-2"
                />
                Continue with Twitter
              </button>
            </div>
          </div>
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationRegister;
