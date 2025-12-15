import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import AddOrderCategoryForm from "./AddOrderCategoryForm";
import OrderCategoryService from "../../../services/OrderCategoryService";
import ClientService from "../../../services/ClientService";
import OrderService from "../../../services/OrderService";
import SuccessModal from "../../modals/SuccessModal";

const AddOrderForm = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);

  // State for error modal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    created_by: user.id,
    client: "",
    client_email: "",
    order_title: "",
    order_description: "",
    start_date: "",
    end_date: "",
    order_price: "",
    order_category: "",
    order_type: "Single",
    initial_deposit: "",
    balance: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

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
    }

    // Handle other fields
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Recalculate balance only if order_price or initial_deposit changes
      if (name === "order_price" || name === "initial_deposit") {
        const orderPrice = parseFloat(updatedData.order_price) || 0;
        const initialDeposit = parseFloat(updatedData.initial_deposit) || 0;
        updatedData.balance = Math.max(orderPrice - initialDeposit, 0).toFixed(
          2
        ); // Ensure balance is non-negative and formatted
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
      initial_deposit,
    } = formData;

    if (
      !client ||
      !client_email ||
      !order_title ||
      !start_date ||
      !end_date ||
      !order_price ||
      !initial_deposit
    ) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please fill in all required fields.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client_email)) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please enter a valid email address.");
      return false;
    }

    if (isNaN(parseFloat(order_price)) || isNaN(parseFloat(initial_deposit))) {
      setErrorTitle("Validation Error");
      setErrorMessage("Price and deposit must be valid numbers.");
      return false;
    }

    if (new Date(end_date) < new Date(start_date)) {
      setErrorTitle("Validation Error");
      setErrorMessage("End date must be after the start date.");
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
      });

      // Reset form data and selected category
      setFormData({
        client: "",
        client_email: "",
        order_title: "",
        order_description: "",
        start_date: "",
        end_date: "",
        order_category: "",
        order_price: "",
        order_type: "Single",
        initial_deposit: "",
        balance: "",
      });
      setSelectedCategory(null); // Reset selected category

      // Close the form on successful creation
      if (onClose) {
        onClose();
      }
    } catch (error) {
      setErrorTitle("Error");
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to create order. Please try again."
      );
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    try {
      const response = await OrderCategoryService.getCategories();
      setCategories(response.data || []);
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

    fetchCategories();
    fetchClients();
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
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">Select Customer</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
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
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
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
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
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
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
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
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
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
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
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
                Initial Deposit *
              </label>
              <input
                type="text"
                name="initial_deposit"
                placeholder="₦ Enter Amount"
                value={formData.initial_deposit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
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

export default AddOrderForm;
