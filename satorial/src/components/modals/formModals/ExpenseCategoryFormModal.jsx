import React, { useState, useEffect } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExpensescategoryService from "../../../services/expensesServices/ExpensesCategoryService";
import SuccessModal from "../../modals/SuccessModal";

const ExpenseCategoryFormModal = ({ isOpen, onClose, onSuccess, categoryToEdit = null }) => {
  const isEditMode = !!categoryToEdit;

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load category data for editing
  useEffect(() => {
    if (isEditMode && categoryToEdit) {
      setForm({
        name: categoryToEdit.name || "",
        description: categoryToEdit.description || "",
      });
    } else {
      // Reset form when opening for create
      setForm({
        name: "",
        description: "",
      });
    }
  }, [isEditMode, categoryToEdit, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name?.trim()) {
      newErrors.name = "Category name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    } else if (form.name.trim().length > 50) {
      newErrors.name = "Category name must not exceed 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || "",
      };

      if (isEditMode) {
        await ExpensescategoryService.updateExpenseCategory(categoryToEdit.id, payload);
      } else {
        await ExpensescategoryService.createExpenseCategory(payload);
      }

      setShowSuccess(true);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error saving category:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.name?.[0] ||
        `Failed to ${isEditMode ? "update" : "create"} category. Please try again.`;
      setErrorMessage(errorMsg);
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

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? "Edit Category" : "Create New Category"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Office Supplies, Travel, Marketing"
                    className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {form.name.length}/50 characters
                  </p>
                </div>

                {/* Description (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Add a brief description for this category..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {form.description?.length || 0} characters
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
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      isEditMode ? "Update Category" : "Create Category"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          title={isEditMode ? "Category Updated!" : "Category Created!"}
          message={`The category has been successfully ${isEditMode ? "updated" : "created"}.`}
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

export default ExpenseCategoryFormModal;