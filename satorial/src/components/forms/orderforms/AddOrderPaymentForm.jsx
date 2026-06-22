import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import PaymentService from "../../../services/PaymentService";
import { extractErrorMessage } from "../../../../utils/errorUtils";

const VAT_RATE = 0.075;

const AddPaymentForm = ({ order, onClose, onSave }) => {
  const totalAmountPayable = Number(order.order_price || 0) * (1 + VAT_RATE);
  const totalPaid = Number(order.total_paid) || 0;
  const maxAdditionalPayment = Math.max(0, totalAmountPayable - totalPaid);

  const [formData, setFormData] = useState({
    order: order.id,
    price: order.order_price || 0,
    initialDeposit: order.initial_deposit || 0,
    balance: order.balance_amount || order.balance || 0,
    amountPaid: "",
    payment_type: "",
    payment_method: "",
    payment_reference: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatCurrency = (value) => `₦ ${Number(value).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;

  useEffect(() => {
    const newBalance = Math.max(
      formData.price - totalPaid - (Number(formData.amountPaid) || 0),
      0
    );
    setFormData((prev) => ({ ...prev, balance: newBalance }));
  }, [formData.amountPaid, formData.price, totalPaid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSave = async () => {
    if (!formData.amountPaid || Number(formData.amountPaid) <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    if (!formData.payment_type) {
      setError("Please select a payment type.");
      return;
    }

    const currentPayment = Number(formData.amountPaid) || 0;
    if (totalPaid + currentPayment > totalAmountPayable) {
      setError(
        `Overpayment not allowed. Total amount payable is ${formatCurrency(totalAmountPayable)}. ` +
        `Already paid: ${formatCurrency(totalPaid)}. ` +
        `Maximum additional payment: ${formatCurrency(maxAdditionalPayment)}.`
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentData = {
        order: formData.order,
        amount_paid: currentPayment,
        payment_type: formData.payment_type,
        payment_method: formData.payment_method || undefined,
        payment_reference: formData.payment_reference || undefined,
      };

      await PaymentService.createPayment(paymentData);
      onSave(paymentData);
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to process payment. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-sm font-medium">Total Price</label>
              <input
                type="text"
                value={formatCurrency(formData.price)}
                className="w-full border p-2.5 rounded-md bg-gray-100 text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-medium">Total Amount Payable (incl. VAT)</label>
              <input
                type="text"
                value={formatCurrency(totalAmountPayable)}
                className="w-full border p-2.5 rounded-md bg-blue-50 text-sm font-semibold"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-sm font-medium">Initial Deposit</label>
              <input
                type="text"
                value={formatCurrency(formData.initialDeposit)}
                className="w-full border p-2.5 rounded-md bg-gray-100 text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-medium">Total Paid</label>
              <input
                type="text"
                value={formatCurrency(totalPaid)}
                className="w-full border p-2.5 rounded-md bg-gray-100 text-sm"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-sm font-medium">Balance (w/o VAT)</label>
              <input
                type="text"
                value={formatCurrency(formData.balance)}
                className="w-full border p-2.5 rounded-md bg-gray-100 text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-medium">Max Additional Payment</label>
              <input
                type="text"
                value={formatCurrency(maxAdditionalPayment)}
                className={`w-full border p-2.5 rounded-md text-sm font-semibold ${
                  maxAdditionalPayment <= 0
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-100"
                }`}
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="text-gray-600 text-sm font-medium">
              Payment Type <span className="text-red-500">*</span>
            </label>
            <select
              name="payment_type"
              value={formData.payment_type}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            >
              <option value="">Select payment type</option>
              <option value="Initial Deposit">Initial Deposit</option>
              <option value="Partial Payment">Partial Payment</option>
              <option value="Final Payment">Final Payment</option>
              <option value="Full Payment">Full Payment</option>
            </select>
          </div>

          <div>
            <label className="text-gray-600 text-sm font-medium">Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            >
              <option value="">Select method</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="POS">POS</option>
            </select>
          </div>

          <div>
            <label className="text-gray-600 text-sm font-medium">Payment Reference</label>
            <input
              type="text"
              name="payment_reference"
              value={formData.payment_reference}
              onChange={handleChange}
              placeholder="e.g. Transaction ID"
              className="w-full border p-3 rounded-md"
            />
          </div>

          <div>
            <label className="text-gray-600 text-sm font-medium">
              Amount Paid <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                name="amountPaid"
                value={formData.amountPaid}
                onChange={handleChange}
                placeholder="0.00"
                max={maxAdditionalPayment}
                className="w-full border p-3 pl-8 rounded-md"
              />
            </div>
            {maxAdditionalPayment <= 0 && (
              <p className="text-red-500 text-xs mt-1">This order is fully paid.</p>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          onClick={handleSave}
          className="w-full mt-4 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Payment"}
        </button>
      </div>
    </div>
  );
};

AddPaymentForm.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    order_price: PropTypes.number,
    initial_deposit: PropTypes.number,
    balance_amount: PropTypes.number,
    balance: PropTypes.number,
    total_paid: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AddPaymentForm;
