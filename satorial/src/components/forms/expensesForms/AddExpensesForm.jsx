import React, { useState, useEffect } from "react";
import ExpensesService from "../../../services/expensesServices/ExpensesService";
import ExpensescategoryService from "../../../services/expensesServices/ExpensesCategoryService";
import VendorService from "../../../services/VendorService";
import StaffService from "../../../services/staffServices/StaffService";
import { useAuth } from "../../../contexts/AuthContext";

const AddExpensesForm = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    category: "",
    amount: 150000, // Store as number instead of string
    createdBy: "",
    paidTo: "",
    receipt: null,
    description: "",
    organization: user?.organization,
  });

  const [categories, setCategories] = useState([]); // Initialize as empty array
  const [vendors, setVendors] = useState([]); // Initialize as empty array
  const [staff, setStaff] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false); // To track loading state
  const [error, setError] = useState(""); // To handle errors
  const [successMessage, setSuccessMessage] = useState(""); // To show success message

  // Add file preview state
  const [receiptPreview, setReceiptPreview] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response =
          await ExpensescategoryService.getExpenseCategoriesList();
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
        setVendors(response || []); // Ensure it's an array
      } catch (err) {
        setError("Error fetching vendors. Please try again later.");
      }
    };

    fetchVendors();
  }, []);

  // Fetch staff
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await StaffService.listStaff();
        // Access the results array from the response
        setStaff(response.results || []);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Error fetching staff list. Please try again later.");
      }
    };

    fetchStaff();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "receipt" && files?.[0]) {
      // Handle file upload
      const file = files[0];
      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);
      setForm((prev) => ({
        ...prev,
        [name]: file,
      }));
    } else if (name === "amount") {
      // Handle amount with number conversion
      setForm((prev) => ({
        ...prev,
        [name]: parseFloat(value.replace(/[^0-9.-]+/g, "")),
      }));
    } else {
      // Handle other inputs
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Log raw form data
    console.log("Raw form data:", {
      category: form.category,
      amount: form.amount,
      createdBy: form.createdBy,
      paidTo: form.paidTo,
      description: form.description,
      receipt: form.receipt
        ? {
            name: form.receipt.name,
            size: form.receipt.size,
            type: form.receipt.type,
          }
        : null,
      organization: form.organization,
    });

    try {
      const formData = new FormData();

      // Append basic fields
      formData.append("category", String(form.category));
      formData.append("amount", String(form.amount));
      formData.append("created_by", String(form.createdBy));
      formData.append("paid_to", String(form.paidTo));
      formData.append("description", String(form.description));

      // Handle receipt file
      if (form.receipt instanceof File) {
        formData.append("receipt", form.receipt);
      }

      // Log FormData entries
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(
          `${key}:`,
          value instanceof File
            ? {
                name: value.name,
                size: value.size,
                type: value.type,
              }
            : value
        );
      }

      const response = await ExpensesService.createExpense(formData);
      setSuccessMessage("Expense created successfully!");
      setError("");

      // Clean up preview URL
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }

      // Reset form
      setForm({
        category: "",
        amount: 150000,
        createdBy: "",
        paidTo: "",
        receipt: null,
        description: "",
        organization: user?.organization,
      });
      setReceiptPreview(null);
    } catch (err) {
      console.error("Error creating expense:", err);
      setError(
        err.response?.data?.message ||
          "Error creating expense. Please try again later."
      );
      setSuccessMessage("");
    } finally {
      setLoading(false);
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
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <option key={staffMember.id} value={staffMember.id}>
                    {`${staffMember.first_name} ${staffMember.last_name} - ${staffMember.department}`}
                  </option>
                ))
              ) : (
                <option disabled>No staff available</option>
              )}
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
                    {vendor.vendor_name}
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
            accept="image/*,.pdf"
            required
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
          {receiptPreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">File selected</p>
              {form.receipt && (
                <p className="text-xs text-gray-500">
                  {form.receipt.name} ({Math.round(form.receipt.size / 1024)}{" "}
                  KB)
                </p>
              )}
            </div>
          )}
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
