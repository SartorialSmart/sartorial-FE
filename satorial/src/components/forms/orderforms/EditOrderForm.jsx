import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import OrderService from "../../../services/OrderService";
import ClientService from "../../../services/ClientService";
import OrderCategoryService from "../../../services/OrderCategoryService";
import SuccessModal from "../../modals/SuccessModal";
import AddPaymentModal from "../../modals/formModals/AddOrderPaymentFormModal";

const EditOrderForm = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [formData, setFormData] = useState({
    client: "",
    client_email: "",
    order_title: "",
    order_category: "",
    order_description: "",
    start_date: "",
    end_date: "",
    order_price: "",
    order_type: "",
    initial_deposit: "",
    balance: "",
    assigned_to: "",
    order_payment_receipt: "",
    fileName: "",
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await OrderService.getOrderById(orderId);
        if (!data) {
          throw new Error("Order not found");
        }
        setOrder(data);
        setFormData((prev) => ({
          ...prev,
          ...data,
          start_date: data.start_date ? formatDate(data.start_date) : "",
          end_date: data.end_date ? formatDate(data.end_date) : "",
          fileName: data.order_payment_receipt || "",
        }));
      } catch (error) {
        console.error("Error fetching order:", error);
        setError({ title: "Error", message: error.message || "Failed to fetch order details." });
      }
    };

    const fetchCategories = async () => {
      try {
        const categoryData = await OrderCategoryService.getCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError({ title: "Error", message: "Failed to fetch categories." });
      }
    };

    const fetchClients = async () => {
      try {
        const response = await ClientService.getClients();
        setClients(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError({ title: "Error", message: "Failed to fetch clients." });
      }
    };

    fetchOrder();
    fetchCategories();
    fetchClients();
  }, [orderId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: ["order_price", "initial_deposit"].includes(name)
          ? Number(value)
          : value,
      };

      // Recalculate balance if order_price or initial_deposit changes
      if (name === "order_price" || name === "initial_deposit") {
        const orderPrice = updatedData.order_price || 0;
        const initialDeposit = updatedData.initial_deposit || 0;
        updatedData.balance = Math.max(orderPrice - initialDeposit, 0).toFixed(2);
      }

      return updatedData;
    });
  };

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      order_category: categoryId,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        order_payment_receipt: file,
        fileName: file.name,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      await OrderService.updateOrder(orderId, formDataToSend);
      navigate(`/order/detail/` + orderId);
    } catch (error) {
      console.error("Failed to update order:", error);
      setError({
        title: "Error",
        message: "Failed to update order. Please try again.",
      });
    }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      await OrderService.addPayment(orderId, paymentData);
      setShowPaymentModal(false);
      const updatedOrder = await OrderService.getOrderById(orderId);
      setOrder(updatedOrder);
    } catch (error) {
      console.error("Failed to save payment:", error);
    }
  };

  if (!order || categories.length === 0 || clients.length === 0) {
    return <p>Loading order details...</p>;
  }

  return (
    <div className="p-6 bg-gray-50">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/order/order-dashboard" className="hover:underline text-blue-500">
          Dashboard
        </Link>{" "}
        &gt;
        <Link to="/order/orders-list" className="hover:underline ml-1 text-blue-500">
          Orders
        </Link>{" "}
        &gt;
        <span className="ml-1 text-gray-700">Order Details</span>
      </nav>

      {/* Header Section */}
      <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-2 gap-4 w-full">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold">Order Details</h2>
          <span className="px-3 mx-2 py-1 bg-green-200 text-green-700 text-sm font-thin rounded-full">
            {order.order_status}
          </span>
        </div>

        <div className="flex gap-4 mt-4 w-full justify-end">
          <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-100">
            Track Order
          </button>
          <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-100">
            Generate Invoice
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Payment
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Name & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600 text-sm font-medium">
                Client Name *
              </label>
              <select
                name="client"
                value={formData.client || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-600 text-sm font-medium">
                Client Email Address *
              </label>
              <input
                type="email"
                name="client_email"
                value={formData.client_email}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>
          </div>

          {/* Order Title */}
          <div>
            <label className="text-gray-600 text-sm font-medium">
              Order Title *
            </label>
            <input
              type="text"
              name="order_title"
              value={formData.order_title}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>

          {/* Order Category */}
          <div>
            <label className="text-gray-600 text-sm font-medium mb-2 block">
              Order Category *
            </label>
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center 
                    ${
                      formData.order_category === category.id
                        ? "border-blue-500 bg-blue-100 text-blue-600"
                        : "border-gray-300 text-gray-500"
                    } 
                    ${
                      category.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  onClick={() =>
                    !category.disabled && handleCategoryChange(category.id)
                  }
                  disabled={category.disabled}
                >
                  <span
                    className={`w-4 h-4 border rounded-full flex items-center justify-center mr-2 
                      ${
                        formData.order_category === category.id
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                  >
                    {formData.order_category === category.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Order Description */}
          <div>
            <label className="text-gray-600 text-sm font-medium">
              Order Description *
            </label>
            <textarea
              name="order_description"
              value={formData.order_description}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
              rows="4"
            />
          </div>

          {/* File Upload */}
          <div className="flex items-center">
            <div className="p-1 flex items-center gap-2 border border-gray-300 rounded-md">
              <input
                type="text"
                value={formData.fileName || "No file selected"}
                readOnly
                className="border-none outline-none text-gray-700"
              />
              <label className="bg-blue-100  text-gray-600 px-4 py-2 rounded-md cursor-pointer">
                Select File
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <span className="text-blue-500 ml-3 cursor-pointer">
              Open Image
            </span>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600 text-sm font-medium">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-medium">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>
          </div>

          {/* Order Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600 text-sm font-medium">
                Order Price *
              </label>
              <input
                type="number"
                name="order_price"
                value={formData.order_price}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>

            {/* Order Type */}
            <div>
              <label className="text-gray-600 text-sm font-medium">
                Order Type *
              </label>
              <select
                name="order_type"
                value={formData.order_type}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              >
                <option value="Bulk">Bulk</option>
                <option value="Single">Single</option>
              </select>
            </div>
          </div>

          {/* Initial Deposit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600 text-sm font-medium">
                Initial Deposit *
              </label>
              <input
                type="number"
                name="initial_deposit"
                value={formData.initial_deposit}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>

            {/* Balance */}
            <div>
              <label className="text-gray-600 text-sm font-medium">
                Balance *
              </label>
              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
                readOnly
              />
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="text-gray-600 text-sm font-medium">
              Assigned To *
            </label>
            <input
              type="text"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md"
          >
            Save
          </button>
        </form>
      </div>
      {/* Payment Modal */}
      {showPaymentModal && (
        <AddPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          order={order}
          onSave={handleSavePayment}
        />
      )}
      {/* SuccessModal for Error Handling */}
      {error && (
        <SuccessModal
          title={error.title}
          message={error.message}
          isError={true}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

export default EditOrderForm;