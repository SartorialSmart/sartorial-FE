import { useState } from "react";

const AddBillForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    vendorName: "",
    vendorCategory: "",
    itemName: "",
    quantity: "",
    amount: "",
    amountPaid: "",
    balance: "0",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      balance:
        name === "amount" || name === "amountPaid"
          ? (prev.amount - prev.amountPaid).toFixed(2)
          : prev.balance,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Bill Created Successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg w-[600px] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Bill</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Vendor Name</label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                placeholder="Enter name"
                className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Vendor Category</label>
              <select
                name="vendorCategory"
                value={formData.vendorCategory}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                required
              >
                <option value="">Select category</option>
                <option value="Sewing Machines">Sewing Machines</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Item Name</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="Enter item name"
                className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Amount Paid</label>
              <input
                type="number"
                name="amountPaid"
                value={formData.amountPaid}
                onChange={handleChange}
                placeholder="Enter amount paid"
                className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-600">Balance</label>
              <input
                type="text"
                name="balance"
                value={formData.balance}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring focus:ring-blue-300"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBillForm;
