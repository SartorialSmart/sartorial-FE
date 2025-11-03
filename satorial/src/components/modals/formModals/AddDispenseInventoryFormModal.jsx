import { useState } from "react";
import { DispenseInventoryForm } from "../../forms/InventoryForm";
import InventoryService from "../../../services/InventoryService";
import PropTypes from "prop-types";

const AddDispenseInventoryFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0); // For resetting DispenseInventoryForm

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await InventoryService.createDispenseInventory(formData);
      setFormKey((k) => k + 1); // Reset form after submit
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      setError("Failed to dispense inventory. Please try again.");
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
        <h2 className="text-xl font-semibold mb-4">Dispense Inventory</h2>
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        <DispenseInventoryForm
          key={formKey}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </div>
    </div>
  );
};

AddDispenseInventoryFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default AddDispenseInventoryFormModal;
