import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import PaymentService from "../../../services/PaymentService";
import SettingsService from "../../../services/settings";
import { extractErrorMessage } from "../../../../utils/errorUtils";
import { getLocalInvoiceSettings } from "../../../utils/localImageService";

const AddPaymentForm = ({ order, onClose, onSave }) => {
  const [vatSettings, setVatSettings] = useState({ vatEnabled: false, vatRate: 7.5 });
  const totalPaid = Number(order.total_paid) || 0;

  const [formData, setFormData] = useState({
    order: order.id,
    price: order.order_price || 0,
    initialDeposit: order.initial_deposit || 0,
    amountPaid: "",
    payment_type: "",
    payment_method: "",
    payment_reference: "",
    vatExempt: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const vatRate = vatSettings.vatEnabled && !formData.vatExempt ? vatSettings.vatRate / 100 : 0;
  const vatPayable = Number(formData.price) * vatRate;
  const totalAmountPayable = Number(formData.price) + vatPayable;
  const hasInitialDeposit =
    Number(order.initial_deposit) > 0 ||
    (order.payments || []).some((p) => p.payment_type === "Initial Deposit");

  const formatCurrency = (value) => `₦ ${Number(value).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;

  useEffect(() => {
    const local = getLocalInvoiceSettings();
    if (local) {
      setVatSettings({
        vatEnabled: local.vatEnabled ?? false,
        vatRate: local.vatRate ?? 7.5,
      });
    } else {
      SettingsService.Invoice.getSettings()
        .then((data) => {
          setVatSettings({
            vatEnabled: data.vat_enabled ?? false,
            vatRate: data.vat_rate ?? 7.5,
          });
        })
        .catch(() => {});
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
    if (!formData.payment_method) {
      setError("Please select a payment method.");
      return;
    }

    const currentPayment = Number(formData.amountPaid) || 0;
    if (totalPaid + currentPayment > totalAmountPayable) {
      setError(
        `Overpayment not allowed. Total amount payable is ${formatCurrency(totalAmountPayable)}. ` +
        `Already paid: ${formatCurrency(totalPaid)}.`
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notes = formData.vatExempt
        ? "Customer was exempted from VAT payment"
        : undefined;

      const paymentData = {
        order: formData.order,
        amount_paid: currentPayment,
        payment_type: formData.payment_type,
        payment_method: formData.payment_method || undefined,
        payment_reference: formData.payment_reference || undefined,
        ...(notes && { notes }),
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
          <label className="text-gray-600 text-sm font-medium">VAT Payable</label>
          <input
            type="text"
            value={formatCurrency(vatPayable)}
            className={`w-full border p-2.5 rounded-md text-sm ${
              !vatSettings.vatEnabled ? "bg-gray-100 text-gray-400" : "bg-blue-50 font-semibold"
            }`}
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

      <div>
        <label className="text-gray-600 text-sm font-medium">Total Amount Payable</label>
        <input
          type="text"
          value={formatCurrency(totalAmountPayable)}
          className="w-full border p-2.5 rounded-md bg-blue-50 text-sm font-semibold"
          readOnly
        />
      </div>

      {vatSettings.vatEnabled && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="vatExempt"
            checked={formData.vatExempt}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-600">Exempt this customer from VAT</span>
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
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
            {!hasInitialDeposit && (
              <option value="Initial Deposit">Initial Deposit</option>
            )}
            <option value="Partial Payment">Partial Payment</option>
            <option value="Final Payment">Final Payment</option>
            <option value="Full Payment">Full Payment</option>
          </select>
        </div>
        <div>
          <label className="text-gray-600 text-sm font-medium">
            Payment Method <span className="text-red-500">*</span>
          </label>
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
            className="w-full border p-3 pl-8 rounded-md"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Payment"}
      </button>
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
