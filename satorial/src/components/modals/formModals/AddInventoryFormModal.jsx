import { useState, useEffect } from "react";
import InventoryForm from "../../forms/InventoryForm";
import InventoryService from "../../../services/InventoryService";
import PropTypes from "prop-types";

const AddInventoryFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialValues,
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0); // For resetting InventoryForm

  useEffect(() => {
    if (!isOpen) return;
    const fetchCategories = async () => {
      try {
        const data = await InventoryService.listInventoryCategory();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
    setFormKey((k) => k + 1); // Reset form when modal opens
    setError(null);
  }, [isOpen]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      if (initialValues && initialValues.id) {
        await InventoryService.updateInventory(initialValues.id, formData);
      } else {
        await InventoryService.createInventory(formData);
      }
      setFormKey((k) => k + 1); // Reset form after submit
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      setError(
        initialValues
          ? "Failed to update inventory. Please try again."
          : "Failed to add inventory. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {title || (initialValues ? "Edit Inventory" : "Add Inventory")}
        </h2>
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        <InventoryForm
          key={formKey}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
          categories={categories}
          {...(initialValues ? { initialValues } : {})}
        />
      </div>
    </div>
  );
};

AddInventoryFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  initialValues: PropTypes.object,
  title: PropTypes.string,
};

export default AddInventoryFormModal;
