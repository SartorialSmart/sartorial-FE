import { useState } from "react";

const AddBillPaymentForm = ({ bill }) => {
  const [amountPaid, setAmountPaid] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Payment Submitted:", amountPaid);
    // Call API to submit payment
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Update Payment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Field */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Amount</label>
          <input
            type="text"
            value={`₦${bill.amount.toLocaleString()}`}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Amount Paid Field */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Amount Paid</label>
          <input
            type="text"
            value={`₦${bill.amount_paid.toLocaleString()}`}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Balance Field */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Balance</label>
          <input
            type="text"
            value={`₦${(bill.amount - bill.amount_paid).toLocaleString()}`}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Amount Paid Input */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Amount Paid</label>
          <input
            type="number"
            placeholder="Type"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default AddBillPaymentForm;
