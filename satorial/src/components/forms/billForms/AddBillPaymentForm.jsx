import { useState } from "react";
import PropTypes from "prop-types";
import { BillPaymentService } from "../../../services/BillPaymentService";
import { extractErrorMessage } from "../../../../utils/errorUtils";

const AddBillPaymentForm = ({ bill, onClose, onSuccess }) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState(null);

  const balance = (bill.amount || 0) - (bill.amount_paid || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amountPaid || Number(amountPaid) <= 0) {
      setFieldError("Please enter a valid payment amount.");
      return;
    }

    if (Number(amountPaid) > balance) {
      setError("Payment amount cannot exceed the balance.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await BillPaymentService.createBillPayment({
        bill: bill.id,
        amount_paid: Number(amountPaid),
      });

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to process payment. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Update Bill Payment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bill Amount */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Bill Amount</label>
          <input
            type="text"
            value={`₦${Number(bill.amount || 0).toLocaleString()}`}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Already Paid */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Already Paid</label>
          <input
            type="text"
            value={`₦${Number(bill.amount_paid || 0).toLocaleString()}`}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Balance */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Balance</label>
          <input
            type="text"
            value={`₦${balance.toLocaleString()}`}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* New Payment Amount */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Payment Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
            <input
              type="number"
              placeholder="Enter amount"
              value={amountPaid}
              onChange={(e) => {
                setAmountPaid(e.target.value);
                if (fieldError) setFieldError(null);
                if (error) setError(null);
              }}
              className={`w-full p-3 pl-8 border rounded-md ${
                fieldError ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Buttons */}
        <div className="flex gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </form>
    </div>
  );
};

AddBillPaymentForm.propTypes = {
  bill: PropTypes.shape({
    id: PropTypes.number.isRequired,
    amount: PropTypes.number,
    amount_paid: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

export default AddBillPaymentForm;
