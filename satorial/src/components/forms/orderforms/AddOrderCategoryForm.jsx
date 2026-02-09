import { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import OrderCategoryService from "../../../services/OrderCategoryService";
import SuccessModal from "../../modals/SuccessModal";

const AddOrderCategoryForm = ({ isOpen, onClose, onCategoryAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState({ show: false, title: "", message: "", isError: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalData({ show: true, title: "Error", message: "Category name is required.", isError: true });
      return;
    }
    setLoading(true);

    try {
      await OrderCategoryService.createCategory(formData);
      setModalData({ show: true, title: "Success", message: "Order category added successfully!", isError: false });
      setFormData({ name: "", description: "" });
      onCategoryAdded();
    } catch (error) {
      setModalData({ show: true, title: "Error", message: "Failed to add order category.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {modalData.show && (
        <SuccessModal
          title={modalData.title}
          message={modalData.message}
          isError={modalData.isError}
          onClose={() => setModalData({ show: false, title: "", message: "", isError: false })}
        />
      )}

      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
        <div className="bg-white rounded-lg shadow-lg w-96 p-6">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-lg font-semibold">Add Order Category</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description (optional)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

AddOrderCategoryForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCategoryAdded: PropTypes.func.isRequired,
};

export default AddOrderCategoryForm;
