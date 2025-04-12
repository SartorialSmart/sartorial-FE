import React, { useState, useEffect } from "react";
import PaymentService from "../../../services/PaymentService";

const AddPaymentForm = ({ order, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    order: order.id, // Automatically set the order ID
    price: order.order_price || 0,
    initialDeposit: order.initial_deposit || 0,
    balance: order.balance || 0,
    amountPaid: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format number as currency with ₦ and comma separators
  const formatCurrency = (value) => `₦ ${value.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;

  useEffect(() => {
    // Recalculate balance when amountPaid changes
    setFormData((prev) => ({
      ...prev,
      balance: Math.max(
        prev.price - prev.initialDeposit - (Number(prev.amountPaid) || 0),
        0
      ),
    }));
  }, [formData.amountPaid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.amountPaid || Number(formData.amountPaid) <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentData = {
        order: formData.order, // Order ID
        amount_paid: Number(formData.amountPaid), // Amount paid
      };

      await PaymentService.createPayment(paymentData);
      onSave(paymentData); // Callback to update UI
      onClose(); // Close modal after saving
    } catch (err) {
      console.error("Failed to save payment:", err);
      setError("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Price */}
          <div>
            <label className="text-gray-600 text-sm font-medium">Price</label>
            <input
              type="text"
              value={formatCurrency(formData.price)}
              className="w-full border p-3 rounded-md bg-gray-100"
              readOnly
            />
          </div>

          {/* Initial Deposit */}
          <div>
            <label className="text-gray-600 text-sm font-medium">Initial Deposit</label>
            <input
              type="text"
              value={formatCurrency(formData.initialDeposit)}
              className="w-full border p-3 rounded-md bg-gray-100"
              readOnly
            />
          </div>

          {/* Balance */}
          <div>
            <label className="text-gray-600 text-sm font-medium">Balance</label>
            <input
              type="text"
              value={formatCurrency(formData.balance)}
              className="w-full border p-3 rounded-md bg-gray-100"
              readOnly
            />
          </div>

          {/* Amount Paid */}
          <div>
            <label className="text-gray-600 text-sm font-medium">Amount Paid</label>
            <input
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full mt-4 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AddPaymentForm;
