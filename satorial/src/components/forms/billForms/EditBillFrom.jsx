import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import BillsService from "../../../services/BillsService";
import VendorCategoryService from "../../../services/VendorCategoryService";

const EditBillForm = ({ billId, onClose }) => {
  const [formData, setFormData] = useState({
    vendorName: "",
    vendorCategory: "",
    itemName: "",
    quantity: "",
    amount: "",
    amountPaid: "",
    balance: "0",
  });

  const [vendorCategories, setVendorCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch vendor categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await VendorCategoryService.getCategoriesList();
        setVendorCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load vendor categories.");
      }
    };

    fetchCategories();
  }, []);

  // Fetch the bill details when the component mounts
  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        const bill = await BillsService.getBillDetails(billId);
        setFormData({
          vendorName: bill.vendor_name,
          vendorCategory: bill.vendor_category, // This should match category ID
          itemName: bill.item_name,
          quantity: bill.quantity.toString(),
          amount: bill.amount.toString(),
          amountPaid: bill.amount_paid.toString(),
          balance: bill.balance.toString(),
        });
      } catch (err) {
        console.error("Failed to fetch bill details:", err);
        setError("Failed to load bill details.");
      }
    };

    if (billId) {
      fetchBillDetails();
    }
  }, [billId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };

      // Recalculate balance when amount or amountPaid changes
      if (name === "amount" || name === "amountPaid") {
        const amount = parseFloat(newFormData.amount) || 0;
        const amountPaid = parseFloat(newFormData.amountPaid) || 0;
        newFormData.balance = (amount - amountPaid).toFixed(2);
      }

      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedBillData = {
        vendor_name: formData.vendorName,
        vendor_category: formData.vendorCategory, // Should be category ID
        item_name: formData.itemName,
        quantity: parseInt(formData.quantity, 10),
        amount: parseFloat(formData.amount),
        amount_paid: parseFloat(formData.amountPaid),
        balance: parseFloat(formData.balance),
      };

      await BillsService.updateBillDetails(billId, updatedBillData);
      alert("Bill Updated Successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to update bill:", err);
      setError("Failed to update bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg w-[600px] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Bill</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✖</button>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

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
                {vendorCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Bill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditBillForm.propTypes = {
  billId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditBillForm;
