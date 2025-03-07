import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import MessageModal from "../../components/modals/MessageModal";
import loginBg from "../../assets/images/bg-2.jpg";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage("");
      setSuccessMessage("");

      await login(formData);

      setSuccessMessage("Login successful! Redirecting...");
      setShowModal(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      let message = "Login failed. Please check your credentials.";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          message = error.response.data;
        } else {
          message = Object.entries(error.response.data)
            .map(([field, errors]) => `${field.replace("_", " ")}: ${errors.join(", ")}`)
            .join(". ");
        }
      }

      setErrorMessage(message);
      setShowModal(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Message Modal */}
      {showModal && (
        <MessageModal
          type={successMessage ? "success" : "error"}
          message={successMessage || errorMessage}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Left Side - Background */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center border-[20px] border-white rounded-lg"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="bg-black bg-opacity-40 w-full h-full flex flex-col justify-between p-16">
          <h1 className="text-white text-5xl font-bold mb-6">Satorial</h1>
          <div>
            <h2 className="text-5xl md:text-5xl font-semibold text-white drop-shadow-lg">
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
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome Back!</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700">Email or Phone Number</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email or phone number"
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
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Login
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


          <div className="mt-6 text-center">
            <p className="text-gray-500">Forgot Password?</p>
            <p className="text-gray-500 mt-4">
              Don't have an account?{" "}
              <a href="/register" className="text-blue-600">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
