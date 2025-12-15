import { useState, useEffect } from "react";
import { X, Calendar, Upload } from "lucide-react";
import ClientService from "../../../services/ClientService";
import SuccessModal from "../../modals/SuccessModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from "prop-types";
import { useClient } from "../../../contexts/ClientContext";

const AddClientForm = ({ onNext, onClose }) => {
  // const { user } = useAuth(); // user is not used

  const { refreshClients } = useClient();

  const initialFormData = {
    first_name: localStorage.getItem("first_name") || "",
    last_name: localStorage.getItem("last_name") || "",
    email: localStorage.getItem("email") || "",
    phone_number: localStorage.getItem("phone_number") || "",
    birthdate: localStorage.getItem("birthdate") || "",
    gender: localStorage.getItem("gender") || "Female",
    house_number: localStorage.getItem("house_number") || "",
    street: localStorage.getItem("street") || "",
    city: localStorage.getItem("city") || "",
    state: localStorage.getItem("state") || "",
    country: localStorage.getItem("country") || "",
    postal_code: localStorage.getItem("postal_code") || "",
    client_image: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  // const [clientId, setClientId] = useState(localStorage.getItem("clientId") || ""); // clientId is not used
  const [preview, setPreview] = useState(
    localStorage.getItem("clientImagePreview") || null
  );
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    birthdate: "",
    gender: "",
    house_number: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
  });

  // Clear localStorage when component unmounts or page is reloaded
  useEffect(() => {
    const handleBeforeUnload = () => {
      Object.keys(initialFormData).forEach((key) => {
        localStorage.removeItem(key);
      });
      localStorage.removeItem("clientId");
      localStorage.removeItem("clientImagePreview");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload(); // Also clear on unmount
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const storedPreview = localStorage.getItem("clientImagePreview");
    if (storedPreview) {
      setPreview(storedPreview);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    localStorage.setItem(name, value);

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      birthdate: date ? date.toISOString().split("T")[0] : "",
    }));
    localStorage.setItem(
      "birthdate",
      date ? date.toISOString().split("T")[0] : ""
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, client_image: file }));
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      localStorage.setItem("clientImagePreview", imageUrl);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Required fields
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "birthdate",
      "gender",
      "house_number",
      "street",
      "city",
      "state",
      "country",
      "postal_code",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field
          .replace("_", " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())} is required`;
        isValid = false;
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Phone number validation
    if (formData.phone_number && !/^\d{10,}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      const createdClient = await ClientService.createClient(formDataToSend);

      if (createdClient?.id) {
        // setClientId(createdClient.id); // clientId is not used

        const addressData = {
          client: createdClient.id,
          house_number: formData.house_number,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code,
        };

        await ClientService.createClientAddress(addressData);

        // Clear all stored form data
        Object.keys(initialFormData).forEach((key) => {
          localStorage.removeItem(key);
        });
        localStorage.removeItem("clientId");
        localStorage.removeItem("clientImagePreview");

        // Reset form state
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          birthdate: "",
          gender: "Female",
          house_number: "",
          street: "",
          city: "",
          state: "",
          country: "",
          postal_code: "",
          client_image: null,
        });
        setPreview(null);

        onNext(createdClient.id);
      }

      refreshClients();
    } catch (err) {
      let message = "Failed to create client. Please try again.";
      if (err.response?.data) {
        message = Object.entries(err.response.data)
          .map(
            ([field, errors]) =>
              `${field.replace("_", " ")}: ${errors.join(", ")}`
          )
          .join(". ");
      }
      setModalData({ title: "Error!", message, buttonText: "Close" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {modalData && (
        <SuccessModal {...modalData} onClose={() => setModalData(null)} />
      )}

      <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg w-full max-w-3xl relative p-6">
          <button onClick={onClose} className="absolute top-4 right-4">
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold mb-4">Add Client</h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Personal Details</h3>

            <div className="flex items-center gap-4">
              <label className="relative border border-blue-500 text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center cursor-pointer">
                <Upload size={18} className="mr-2" />
                Upload Picture
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {preview && (
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-full object-cover border border-gray-300"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 mt-4">
              {["first_name", "last_name", "email", "phone_number"].map(
                (field) => (
                  <div key={field} className="relative">
                    <input
                      type={field === "email" ? "email" : "text"}
                      name={field}
                      placeholder={field
                        .replace("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                      value={formData[field]}
                      onChange={handleChange}
                      className={`border ${
                        errors[field] ? "border-red-500" : "border-gray-300"
                      } rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                        errors[field]
                          ? "focus:ring-red-200"
                          : "focus:ring-blue-200"
                      }`}
                    />
                    {errors[field] && (
                      <p className="absolute -bottom-6 left-0 text-red-500 text-sm">
                        {errors[field]}
                      </p>
                    )}
                  </div>
                )
              )}

              <div className="relative w-full">
                <DatePicker
                  selected={
                    formData.birthdate ? new Date(formData.birthdate) : null
                  }
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="w-full"
                  placeholderText="Select Birthdate"
                  maxDate={new Date()} // Prevents future dates
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={100} // Shows 100 years range
                  scrollableYearDropdown // Makes year dropdown scrollable
                  minDate={new Date("1940-01-01")} // Sets minimum date to 1940
                  customInput={
                    <div className="relative w-full">
                      <input
                        type="text"
                        className="border rounded-lg px-4 py-2 w-full cursor-pointer"
                        value={formData.birthdate || ""}
                        placeholder="Select Birthdate"
                        readOnly
                      />
                      <Calendar
                        size={18}
                        className="absolute top-3 right-4 text-gray-400"
                      />
                    </div>
                  }
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-gray-600">Gender:</label>
                {["Male", "Female", "Other"].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={handleChange}
                      className="mr-1"
                    />
                    {gender}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Billing Address</h3>

            <div className="grid grid-cols-2 gap-6">
              {[
                "house_number",
                "street",
                "city",
                "state",
                "country",
                "postal_code",
              ].map((field) => (
                <div key={field} className="relative">
                  <input
                    type="text"
                    name={field}
                    placeholder={field
                      .replace("_", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`border ${
                      errors[field] ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                      errors[field]
                        ? "focus:ring-red-200"
                        : "focus:ring-blue-200"
                    }`}
                  />
                  {errors[field] && (
                    <p className="absolute -bottom-6 left-0 text-red-500 text-sm">
                      {errors[field]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Next: Measurement"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

AddClientForm.propTypes = {
  onNext: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddClientForm;
