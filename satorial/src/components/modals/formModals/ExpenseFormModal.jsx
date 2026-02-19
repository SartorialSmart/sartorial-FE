import React, { useState, useEffect, useCallback, useRef } from "react";
import { Upload, X, FileText, Image, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExpensesService from "../../../services/expensesServices/ExpensesService";
import ExpensescategoryService from "../../../services/expensesServices/ExpensesCategoryService";
import VendorService from "../../../services/VendorService";
import StaffService from "../../../services/staffServices/StaffService";
import { useAuth } from "../../../contexts/AuthContext";
import SuccessModal from "../../modals/SuccessModal";
import PropTypes from "prop-types";

const ExpenseFormModal = ({ isOpen, onClose, onSuccess, expenseToEdit = null }) => {
  const { user } = useAuth();
  const isEditMode = !!expenseToEdit;
  const formRef = useRef(null);
  const modalContentRef = useRef(null);

  const [form, setForm] = useState({
    category: "",
    amount: "",
    createdBy: "",
    paidTo: "",
    receipt: null,
    description: "",
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
  const [existingReceiptUrl, setExistingReceiptUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !loading && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, loading, isSubmitting, onClose]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      const firstInput = modalContentRef.current.querySelector(
        'input, select, textarea'
      );
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Clear preview URLs to prevent memory leaks
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
      
      // Reset all states after a delay
      const timer = setTimeout(() => {
        setForm({
          category: "",
          amount: "",
          createdBy: "",
          paidTo: "",
          receipt: null,
          description: "",
        });
        setReceiptPreview(null);
        setExistingReceiptUrl(null);
        setErrors({});
        setDataLoading(true);
        setIsSubmitting(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, receiptPreview]);

  // Load expense data for editing
  useEffect(() => {
    if (isOpen && isEditMode && expenseToEdit) {
      setForm({
        category: expenseToEdit.category?.id || "",
        amount: expenseToEdit.amount || "",
        createdBy: expenseToEdit.created_by || "",
        paidTo: expenseToEdit.paid_to || "",
        receipt: null,
        description: expenseToEdit.description || "",
      });
      setExistingReceiptUrl(expenseToEdit.receipt_url);
    }
  }, [isOpen, isEditMode, expenseToEdit]);

  // Fetch all data on mount
  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen]);

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

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!form.category) newErrors.category = "Category is required";
    if (!form.amount || form.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!form.createdBy) newErrors.createdBy = "Created by is required";
    if (!form.paidTo) newErrors.paidTo = "Paid to is required";
    
    // Receipt is required only for new expenses
    if (!isEditMode && !form.receipt) {
      newErrors.receipt = "Receipt is required";
    }
    
    if (!form.description?.trim()) newErrors.description = "Description is required";

    // Validate receipt file type and size if provided
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
  }, [form, isEditMode]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "receipt" && files?.[0]) {
      const file = files[0];
      
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, receipt: "Only PDF, JPEG, and PNG files are allowed" }));
        return;
      }

      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, receipt: "File size must be less than 5MB" }));
        return;
      }

      // Clean up previous preview
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }

      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);
      setExistingReceiptUrl(null);
      setForm(prev => ({ ...prev, [name]: file }));
    } else if (name === "amount") {
      // Allow only numbers and one decimal point
      const numericValue = value.replace(/[^0-9.]/g, "");
      // Ensure only one decimal point
      const decimalCount = (numericValue.match(/\./g) || []).length;
      const finalValue = decimalCount > 1 
        ? numericValue.substring(0, numericValue.lastIndexOf('.'))
        : numericValue;
      
      setForm(prev => ({ ...prev, [name]: finalValue }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const removeReceipt = () => {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }
    setReceiptPreview(null);
    setExistingReceiptUrl(null);
    setForm(prev => ({ ...prev, receipt: null }));
    setErrors(prev => ({ ...prev, receipt: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = formRef.current?.querySelector(`[name="${firstError}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("category", form.category);
      formData.append("amount", form.amount);
      formData.append("created_by", form.createdBy);
      formData.append("paid_to", form.paidTo);
      formData.append("description", form.description.trim());

      if (form.receipt instanceof File) {
        formData.append("receipt", form.receipt);
      }

      if (isEditMode) {
        await ExpensesService.updateExpense(expenseToEdit.id, formData);
      } else {
        await ExpensesService.createExpense(formData);
      }
      
      setShowSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Error saving expense:", err);
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.message || 
                       `Failed to ${isEditMode ? 'update' : 'create'} expense. Please try again.`;
      setErrorMessage(errorMsg);
      setShowError(true);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
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

  // Handle modal background click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalContentRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative flex flex-col max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? "Edit Expense" : "Add New Expense"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isEditMode ? "Update the expense details below" : "Fill in the expense details below"}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={loading || isSubmitting}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {dataLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                  <span className="text-gray-600">Loading form data...</span>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
                        disabled={loading}
                        className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.category ? "border-red-500 bg-red-50" : "border-gray-300"
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
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
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
                          disabled={loading}
                          placeholder="0.00"
                          className={`w-full border rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
                            errors.amount ? "border-red-500 bg-red-50" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
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
                        disabled={loading}
                        className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.createdBy ? "border-red-500 bg-red-50" : "border-gray-300"
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
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
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
                        disabled={loading}
                        className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.paidTo ? "border-red-500 bg-red-50" : "border-gray-300"
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
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                          {errors.paidTo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Receipt Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receipt {!isEditMode && <span className="text-red-500">*</span>}
                      <span className="text-xs text-gray-500 ml-1">(PDF, JPEG, or PNG, max 5MB)</span>
                    </label>
                    
                    {!form.receipt && !existingReceiptUrl ? (
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50 ${
                          errors.receipt ? "border-red-500 bg-red-50" : "border-gray-300"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => !loading && document.getElementById("receipt-input").click()}
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
                          disabled={loading}
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-gray-300 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {form.receipt ? (
                            form.receipt.type === "application/pdf" ? (
                              <FileText className="w-10 h-10 text-red-500 flex-shrink-0" />
                            ) : (
                              <Image className="w-10 h-10 text-blue-500 flex-shrink-0" />
                            )
                          ) : (
                            <FileText className="w-10 h-10 text-gray-500 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {form.receipt ? form.receipt.name : "Existing receipt"}
                            </p>
                            {form.receipt && (
                              <p className="text-xs text-gray-500">
                                {(form.receipt.size / 1024).toFixed(2)} KB
                              </p>
                            )}
                            {existingReceiptUrl && (
                              <a
                                href={existingReceiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline inline-flex items-center"
                              >
                                View current receipt
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeReceipt}
                          disabled={loading}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    )}
                    
                    {errors.receipt && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        {errors.receipt}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-1">(Briefly describe the expense)</span>
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      disabled={loading}
                      rows={4}
                      placeholder="Enter expense description..."
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.description ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
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
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[120px] justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                          {isEditMode ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          {isEditMode ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                              Update Expense
                            </>
                          ) : (
                            "Create Expense"
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {isEditMode ? "Updating expense..." : "Creating expense..."}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          title={isEditMode ? "Expense Updated!" : "Expense Created!"}
          message={`The expense has been successfully ${isEditMode ? 'updated' : 'added to the system'}.`}
          buttonText="Close"
          onClose={handleSuccessClose}
          autoClose={true}
          autoCloseDelay={1500}
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

ExpenseFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  expenseToEdit: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    created_by: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paid_to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    receipt_url: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default ExpenseFormModal;