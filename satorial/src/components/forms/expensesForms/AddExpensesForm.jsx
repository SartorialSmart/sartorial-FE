import React, { useState, useEffect } from "react";
import ExpensesService from "../../../services/expensesServices/ExpensesService";
import ExpensescategoryService from "../../../services/expensesServices/ExpensesCategoryService";
import VendorService from "../../../services/VendorService";

const AddExpensesForm = () => {
  const [form, setForm] = useState({
    category: "",
    amount: 150000, // Store as number instead of string
    createdBy: "",
    paidTo: "",
    receipt: null,
    description: "",
  });

  const [categories, setCategories] = useState([]); // Initialize as empty array
  const [vendors, setVendors] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false); // To track loading state
  const [error, setError] = useState(""); // To handle errors
  const [successMessage, setSuccessMessage] = useState(""); // To show success message

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await ExpensescategoryService.getExpenseCategoriesList();
        setCategories(response.data || []); // Ensure it's an array
      } catch (err) {
        setError("Error fetching categories. Please try again later.");
      }
    };

    fetchCategories();
  }, []);

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await VendorService.getVendorsList();
        setVendors(response.data || []); // Ensure it's an array
      } catch (err) {
        setError("Error fetching vendors. Please try again later.");
      }
    };

    fetchVendors();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : name === 'amount' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append("category", form.category);
    formData.append("amount", form.amount);
    formData.append("createdBy", form.createdBy);
    formData.append("paidTo", form.paidTo);
    formData.append("receipt", form.receipt); // File upload
    formData.append("description", form.description);

    try {
      // Call the createExpense service
      const response = await ExpensesService.createExpense(formData);
      setSuccessMessage("Expense created successfully!");
      setError(""); // Clear any previous errors
      setForm({
        category: "",
        amount: 150000, // Reset amount to initial value
        createdBy: "",
        paidTo: "",
        receipt: null,
        description: "",
      }); // Reset form
    } catch (err) {
      setError("Error creating expense. Please try again later.");
      setSuccessMessage(""); // Clear success message if error occurs
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="p-2 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Add Expense</h2>

      {/* Display success or error messages */}
      {successMessage && <div className="text-green-600">{successMessage}</div>}
      {error && <div className="text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category<span className="text-red-500"> *</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select category</option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              name="amount"
              value={form.amount.toLocaleString()} // Display with comma separator
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created by<span className="text-red-500"> *</span>
            </label>
            <select
              name="createdBy"
              value={form.createdBy}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select</option>
              <option value="staff1">Staff 1</option>
              <option value="staff2">Staff 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid to<span className="text-red-500"> *</span>
            </label>
            <select
              name="paidTo"
              value={form.paidTo}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select</option>
              {vendors && vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))
              ) : (
                <option disabled>No vendors available</option>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attach Receipt<span className="text-red-500"> *</span>
          </label>
          <input
            type="file"
            name="receipt"
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description<span className="text-red-500"> *</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Type here"
          ></textarea>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            disabled={loading} // Disable button while loading
          >
            {loading ? "Creating..." : "Create Expense"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpensesForm;
