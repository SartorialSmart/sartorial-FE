import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../../contexts/AuthContext";
import AddOrderCategoryForm from "./AddOrderCategoryForm";
import OrderCategoryService from "../../../services/OrderCategoryService";
import ClientService from "../../../services/ClientService";
import OrderService from "../../../services/OrderService";
import LocationService from "../../../services/LocationService";
import SuccessModal from "../../modals/SuccessModal";
import { extractErrorMessage } from "../../../../utils/errorUtils";
import { isAdminRole } from "../../../utils/permissions";

const getTodayDateString = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];
};

const AddOrderForm = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);

  // State for error modal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);
  const todayDate = getTodayDateString();

  const [formData, setFormData] = useState({
    created_by: user.id,
    client: "",
    client_email: "",
    order_title: "",
    order_description: "",
    start_date: todayDate,
    end_date: todayDate,
    order_price: "",
    order_category: "",
    order_type: "Single",
    balance: "",
    location: isAdmin ? "" : user?.location || "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));

    // Handle client selection specifically
    if (name === "client") {
      const selectedClient = clients.find((c) => c.id === value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Auto-fill the email if client is found
        client_email: selectedClient ? selectedClient.email : "",
      }));
      return;
    }

    // Handle date fields separately
    if (name === "start_date" || name === "end_date") {
      const dateValue = value ? new Date(value) : null; // Convert to Date object if value exists
      if (name === "start_date") {
        setFormData((prev) => ({
          ...prev,
          start_date: dateValue ? dateValue.toISOString().split("T")[0] : "",
        }));
      } else if (name === "end_date") {
        setFormData((prev) => ({
          ...prev,
          end_date: dateValue ? dateValue.toISOString().split("T")[0] : "",
        }));
      }
      return;
    }

    // Handle other fields
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Recalculate balance only if order_price changes
      if (name === "order_price") {
        const orderPrice = parseFloat(updatedData.order_price) || 0;
        updatedData.balance = Math.max(orderPrice, 0).toFixed(2); // Ensure balance is non-negative and formatted
      }

      return updatedData;
    });
  };

  const validateForm = () => {
    const {
      client,
      client_email,
      order_title,
      start_date,
      end_date,
      order_price,
    } = formData;
    const newErrors = {};

    if (!client) newErrors.client = "Client name is required.";
    if (!client_email) newErrors.client_email = "Client email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client_email))
      newErrors.client_email = "Please enter a valid email address.";
    if (!order_title.trim()) newErrors.order_title = "Order name is required.";
    if (!start_date) newErrors.start_date = "Start date is required.";
    if (!end_date) newErrors.end_date = "End date is required.";
    if (!order_price) newErrors.order_price = "Price is required.";
    else if (isNaN(parseFloat(order_price)))
      newErrors.order_price = "Price must be a valid number.";
    if (start_date && end_date && new Date(end_date) < new Date(start_date))
      newErrors.end_date = "End date must be after the start date.";
    if (isAdmin && !formData.location) newErrors.location = "Please select a location.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please fix the highlighted required fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setIsErrorModalOpen(true);
      return;
    }

    setLoading(true);

    try {
      await OrderService.createOrder({
        ...formData,
        order_category: selectedCategory,
        initial_deposit: 0,
        ready_made: false,
      });

      // Reset form data and selected category
      setFormData({
        created_by: user.id,
        client: "",
        client_email: "",
        order_title: "",
        order_description: "",
        start_date: getTodayDateString(),
        end_date: getTodayDateString(),
        order_category: "",
        order_price: "",
        order_type: "Single",
        balance: "",
        location: isAdmin ? "" : user?.location || "",
      });
      setSelectedCategory(null); // Reset selected category

      // Close the form on successful creation
      if (onClose) {
        onClose();
      }
    } catch (error) {
      setErrorTitle("Error");
      setErrorMessage(extractErrorMessage(error, "Failed to create order. Please try again."));
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    try {
      const response = await OrderCategoryService.getCategories();
      setCategories(Array.isArray(response) ? response : []);
    } catch {
      setErrorTitle("Error");
      setErrorMessage("Failed to refresh categories.");
      setIsErrorModalOpen(true);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await OrderCategoryService.getCategories();
        setCategories(Array.isArray(response) ? response : []);
      } catch {
        setErrorTitle("Error");
        setErrorMessage("Failed to fetch categories.");
        setIsErrorModalOpen(true);
      }
    };
    const selectedClient = clients.find((c) => c.id === formData.client);
    if (selectedClient) {
      setFormData((prev) => ({ ...prev, client_email: selectedClient.email }));
    }

    const fetchClients = async () => {
      try {
        const response = await ClientService.getClients();
        setClients(Array.isArray(response) ? response : []);
      } catch {
        setErrorTitle("Error");
        setErrorMessage("Failed to fetch clients.");
        setIsErrorModalOpen(true);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await LocationService.listLocations();
        const list = Array.isArray(response) ? response : response?.results || [];
        setLocations(list);
      } catch {
        // Location fetch failure shouldn't block the form; staff still use their profile location.
      }
    };

    fetchCategories();
    fetchClients();
    fetchLocations();
  }, []);

  return (
    <div className="bg-gray-100 flex items-center justify-center rounded-lg">
      <div className="bg-white w-full rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-6">Create Order</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Client Name *
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.client ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Select Customer</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
              {errors.client && <p className="text-red-500 text-sm mt-1">{errors.client}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Client Email Address *
              </label>
              <input
                type="email"
                name="client_email"
                placeholder="Email here"
                value={formData.client_email}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.client_email ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.client_email && (
                <p className="text-red-500 text-sm mt-1">{errors.client_email}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Location *
            </label>
            {isAdmin ? (
              <>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full border rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </>
            ) : (
              <input
                type="text"
                value={locations.find((loc) => String(loc.id) === String(user?.location))?.name || user?.location || "Your location"}
                readOnly
                className="w-full border border-gray-300 rounded-md p-3 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Order Name *
            </label>
            <input
              type="text"
              name="order_title"
              value={formData.order_title}
              onChange={handleChange}
              className={`w-full border rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 ${
                errors.order_title ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.order_title && (
              <p className="text-red-500 text-sm mt-1">{errors.order_title}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Order Category *
            </label>
            <div className="flex flex-wrap gap-3">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white"
                        : "border-gray-300 text-gray-600"
                    }`}
                    disabled={loading}
                  >
                    {category.name}
                  </button>
                ))
              ) : (
                <p className="text-gray-500">No categories available.</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Order Description *
            </label>
            <textarea
              name="order_description"
              value={formData.order_description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.start_date ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.end_date ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Price *
              </label>
              <input
                type="text"
                name="order_price"
                placeholder="₦ Enter Amount"
                value={formData.order_price}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.order_price ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.order_price && (
                <p className="text-red-500 text-sm mt-1">{errors.order_price}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Order Type *
              </label>
              <select
                name="order_type"
                value={formData.order_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="Single">Single</option>
                <option value="Bulk">Bulk</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Balance *
              </label>
              <input
                type="text"
                name="balance"
                placeholder="₦ Enter Amount"
                value={formData.balance}
                readOnly
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 text-right">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition duration-300 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        <div className="my-16">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            <PlusCircle className="w-5 h-5" /> Add Order Category
          </button>

          <AddOrderCategoryForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCategoryAdded={refreshCategories}
          />
        </div>
      </div>

      {isErrorModalOpen && (
        <SuccessModal
          title={errorTitle}
          message={errorMessage}
          onClose={() => setIsErrorModalOpen(false)}
          isError={true}
        />
      )}
    </div>
  );
};

AddOrderForm.propTypes = {
  onClose: PropTypes.func,
};

export default AddOrderForm;
