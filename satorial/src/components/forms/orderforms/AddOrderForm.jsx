import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import AddOrderCategoryForm from "./AddOrderCategoryForm";
import OrderCategoryService from "../../../services/OrderCategoryService";
import ClientService from "../../../services/ClientService";
import OrderService from "../../../services/OrderService";
import SuccessModal from "../../modals/SuccessModal";

const AddOrderForm = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);

  // State for error modal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    client: "",
    client_email: "",
    order_title: "Priscilla’s Wedding Dress",
    order_description: "Binta's Wedding Dress",
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const refreshCategories = async () => {
    try {
      const response = await OrderCategoryService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      setErrorTitle("Error");
      setErrorMessage("Failed to refresh categories.");
      setIsErrorModalOpen(true); // Show error modal
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await OrderCategoryService.getCategories();
        console.log("Categories API Response:", response);
        setCategories(Array.isArray(response) ? response : []);
      } catch (error) {
        setErrorTitle("Error");
        setErrorMessage("Failed to fetch categories.");
        setIsErrorModalOpen(true); // Show error modal
      }
    };

    const fetchClients = async () => {
      try {
        const response = await ClientService.getClients();
        console.log("Clients API Response:", response);
        setClients(Array.isArray(response) ? response : []);
      } catch (error) {
        setErrorTitle("Error");
        setErrorMessage("Failed to fetch clients.");
        setIsErrorModalOpen(true); // Show error modal
      }
    };

    fetchCategories();
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.client ||
      !formData.client_email ||
      !formData.order_title ||
      !formData.start_date ||
      !formData.end_date ||
      !formData.order_price ||
      !selectedCategory // Ensure a category is selected
    ) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please fill in all required fields.");
      setIsErrorModalOpen(true); // Show error modal
      return;
    }

    setLoading(true);

    try {
      await OrderService.createOrder({
        ...formData,
        order_category: selectedCategory, // Include selected category ID
      });

      // Reset form data on success
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
    } catch (error) {
      setErrorTitle("Error");
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to create order. Please try again."
      );
      setIsErrorModalOpen(true); // Show error modal
    } finally {
      setLoading(false);
    }
  };

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
                onChange={handleChange}
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
