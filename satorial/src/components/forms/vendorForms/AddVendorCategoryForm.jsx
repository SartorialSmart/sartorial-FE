import { useState } from "react";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import VendorCategoryService from "../../../services/VendorCategoryService";
import SuccessModal from "../../modals/SuccessModal";

const AddVendorCategoryForm = ({ onClose }) => {
  const [categoryName, setCategoryName] = useState("Materials");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null); // State to handle success/error modal

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newCategory = {
        name: categoryName,
        description,
      };

      await VendorCategoryService.createCategory(newCategory);
      setModalData({
        title: "Success!",
        message: "Vendor category created successfully.",
        isError: false,
      });
    } catch (error) {
      setModalData({
        title: "Error!",
        message: error.message || "Failed to create vendor category.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-96 relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add Vendor Category</h2>

        <form onSubmit={handleSubmit}>
          {/* Category Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Type here"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>

      {/* Success/Error Modal */}
      {modalData && (
        <SuccessModal
          title={modalData.title}
          message={modalData.message}
          isError={modalData.isError}
          onClose={() => {
            setModalData(null);
            if (!modalData.isError) {
              onClose();
            }
          }}
        />
      )}
    </div>
  );
};

AddVendorCategoryForm.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddVendorCategoryForm;
