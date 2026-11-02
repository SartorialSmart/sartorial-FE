import React, { useState, useEffect } from "react";
import { Upload, X, FileText, Image, AlertCircle, Loader2, Repeat } from "lucide-react";
import PropTypes from "prop-types";
import ExpensesService from "../../../services/expensesServices/ExpensesService";
import ExpensescategoryService from "../../../services/expensesServices/ExpensesCategoryService";
import VendorService from "../../../services/VendorService";
import StaffService from "../../../services/staffServices/StaffService";
import { useAuth } from "../../../contexts/AuthContext";
import SuccessModal from "../../modals/SuccessModal";
import { extractErrorMessage } from "../../../../utils/errorUtils";

const RECURRENCE_TYPES = [
  { value: "", label: "One-off" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "biennially", label: "Biennially" },
  { value: "annually", label: "Annually" },
];

const AddExpensesForm = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    category: "",
    amount: "",
    createdBy: "",
    paidTo: "",
    receipt: null,
    description: "",
    recurrenceType: "",
    recurrenceStartDate: "",
    recurrenceEndDate: "",
  });

  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setDataLoading(true);
      try {
        const [categoriesRes, vendorsRes, staffRes] = await Promise.all([
          ExpensescategoryService.getExpenseCategoriesList(),
          VendorService.getVendorsList(),
          StaffService.listStaff(),
        ]);

        const categoriesData = Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.results || [];
        setCategories(categoriesData);
        setVendors(vendorsRes || []);
        setStaff(staffRes.results || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrorMessage("Failed to load form data. Please refresh the page.");
        setShowError(true);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!form.category) newErrors.category = "Category is required";
    if (!form.amount || form.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!form.createdBy) newErrors.createdBy = "Created by is required";
    if (!form.paidTo) newErrors.paidTo = "Paid to is required";
    if (!form.description?.trim()) newErrors.description = "Description is required";

    // Recurrence validation
    if (form.recurrenceType) {
      if (!form.recurrenceStartDate) newErrors.recurrenceStartDate = "Start date required";
      if (!form.recurrenceEndDate) newErrors.recurrenceEndDate = "End date required";
      if (form.recurrenceStartDate && form.recurrenceEndDate &&
          new Date(form.recurrenceStartDate) >= new Date(form.recurrenceEndDate)) {
        newErrors.recurrenceEndDate = "End date must be after start date";
      }
    }

    // Validate receipt file type and size
    if (form.receipt) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(form.receipt.type)) {
        newErrors.receipt = "Only PDF, JPEG, and PNG files are allowed";
      } else if (form.receipt.size > maxSize) {
        newErrors.receipt = "File size must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "receipt" && files?.[0]) {
      const file = files[0];
      
      // Validate file immediately
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, receipt: "Only PDF, JPEG, and PNG files are allowed" }));
        return;
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, receipt: "File size must be less than 5MB" }));
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);
      setForm((prev) => ({ ...prev, [name]: file }));
    } else if (name === "amount") {
      // Remove non-numeric characters except decimal point
      const numericValue = value.replace(/[^0-9.]/g, "");
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeReceipt = () => {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }
    setReceiptPreview(null);
    setForm((prev) => ({ ...prev, receipt: null }));
    setErrors((prev) => ({ ...prev, receipt: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("category", form.category);
      formData.append("amount", form.amount);
      formData.append("created_by", form.createdBy);
      formData.append("paid_to", form.paidTo);
      formData.append("description", form.description.trim());
      formData.append("recurrence_type", form.recurrenceType || "");
      if (form.recurrenceType) {
        formData.append("recurrence_start_date", form.recurrenceStartDate);
        formData.append("recurrence_end_date", form.recurrenceEndDate);
      }

      if (form.receipt instanceof File) {
        formData.append("receipt", form.receipt);
      }

      await ExpensesService.createExpense(formData);
      
      setShowSuccess(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "Failed to create expense. Please try again."));
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (onClose) {
      onClose();
    }
  };

  const handleErrorClose = () => {
    setShowError(false);
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading form data...</span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                <input
                  type="text"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full border rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.amount}
                </p>
              )}
              {form.amount && !errors.amount && (
                <p className="mt-1 text-sm text-gray-600">
                  {formatCurrency(form.amount)}
                </p>
              )}
            </div>
          </div>

          {/* Created By and Paid To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created By <span className="text-red-500">*</span>
              </label>
              <select
                name="createdBy"
                value={form.createdBy}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.createdBy ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select staff member</option>
                {staff.map((staffMember) => (
                  <option key={staffMember.id} value={staffMember.id}>
                    {`${staffMember.first_name} ${staffMember.last_name}`}
                    {staffMember.department && ` - ${staffMember.department}`}
                  </option>
                ))}
              </select>
              {errors.createdBy && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.createdBy}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid To <span className="text-red-500">*</span>
              </label>
              <select
                name="paidTo"
                value={form.paidTo}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.paidTo ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendor_name}
                  </option>
                ))}
              </select>
              {errors.paidTo && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.paidTo}
                </p>
              )}
            </div>
          </div>

          {/* Recurrence Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-gray-500" />
              Recurrence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
                <select
                  name="recurrenceType"
                  value={form.recurrenceType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {RECURRENCE_TYPES.map(rt => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
              </div>
              <div></div>
              {form.recurrenceType && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period Start <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="recurrenceStartDate"
                      value={form.recurrenceStartDate}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.recurrenceStartDate ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.recurrenceStartDate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.recurrenceStartDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period End <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="recurrenceEndDate"
                      value={form.recurrenceEndDate}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.recurrenceEndDate ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.recurrenceEndDate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.recurrenceEndDate}</p>
                    )}
                  </div>
                </>
              )}
            </div>
            {form.recurrenceType && form.amount && form.recurrenceStartDate && form.recurrenceEndDate && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Total:</span> {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(form.amount)}
                  {" | "}
                  <span className="font-medium">Daily:</span> {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(
                    parseFloat(form.amount) / Math.max(1, Math.round((new Date(form.recurrenceEndDate) - new Date(form.recurrenceStartDate)) / (1000 * 60 * 60 * 24)))
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            
            {!form.receipt ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50 ${
                  errors.receipt ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                onClick={() => document.getElementById("receipt-input").click()}
              >
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPEG, or PNG (max 5MB)
                </p>
                <input
                  id="receipt-input"
                  type="file"
                  name="receipt"
                  onChange={handleChange}
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border-2 border-gray-300 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {form.receipt.type === "application/pdf" ? (
                    <FileText className="w-10 h-10 text-red-500" />
                  ) : (
                    <Image className="w-10 h-10 text-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {form.receipt.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(form.receipt.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeReceipt}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}
            
            {errors.receipt && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.receipt}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter expense description..."
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {form.description.length} characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Expense"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          title="Expense Created!"
          message="The expense has been successfully added to the system."
          buttonText="Close"
          onClose={handleSuccessClose}
        />
      )}

      {/* Error Modal */}
      {showError && (
        <SuccessModal
          title="Error"
          message={errorMessage}
          buttonText="Try Again"
          onClose={handleErrorClose}
          isError={true}
        />
      )}
    </>
  );
};

AddExpensesForm.propTypes = {
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

export default AddExpensesForm;