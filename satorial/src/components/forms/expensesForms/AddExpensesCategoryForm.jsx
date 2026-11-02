import React, { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../../contexts/AuthContext";
import ExpensescategoryService from "../../../services/expensesServices/ExpensesCategoryService";
import SuccessModal from "../../modals/SuccessModal"; // ✅ Import SuccessModal

const AddExpensesCategoryForm = ({ onClose }) => {
  const [form, setForm] = useState({
    categoryName: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useAuth(); // 👈 get the logged-in user

  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    isError: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prev) => (prev.categoryName ? { ...prev, categoryName: undefined } : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.categoryName.trim()) {
      setErrors({ categoryName: "Category name is required." });
      setModal({
        show: true,
        title: "Validation Error",
        message: "Please fix the highlighted required fields.",
        isError: true,
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: form.categoryName,
      };

      await ExpensescategoryService.createExpenseCategory(payload);

      setModal({
        show: true,
        title: "Success",
        message: "Expense category created successfully!",
        isError: false,
      });
    } catch (err) {
      console.error(err);

      const errorMessage =
        err?.response?.data?.name?.[0] || "Something went wrong while creating the category.";

      setModal({
        show: true,
        title: "Error",
        message: errorMessage,
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModal({ ...modal, show: false });
    if (!modal.isError) onClose(); // close form only if success
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Create Expense Category</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name<span className="text-red-500"> *</span>
          </label>
          <input
            type="text"
            name="categoryName"
            value={form.categoryName}
            onChange={handleChange}
            required
            className={`w-full border rounded-md px-3 py-2 ${
              errors.categoryName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Materials"
          />
          {errors.categoryName && (
            <p className="text-red-500 text-sm mt-1">{errors.categoryName}</p>
          )}
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {/* ✅ Success / Error Modal */}
      {modal.show && (
        <SuccessModal
          title={modal.title}
          message={modal.message}
          isError={modal.isError}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

AddExpensesCategoryForm.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddExpensesCategoryForm;
