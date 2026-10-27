import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StockMovementForm from "../../forms/StockMovementForm";
import StockMovementService from "../../../services/StockMovementService";
import { extractErrorMessage } from "../../../../utils/errorUtils";
import PropTypes from "prop-types";

const AddStockMovementFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialValues,
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LOCAL_KEY = "sartorial_stock_movements";

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    let apiCreatedId = null;
    try {
      if (initialValues && initialValues.id) {
        await StockMovementService.updateMovement(initialValues.id, formData);
      } else {
        try {
          const result = await StockMovementService.createMovement(formData);
          apiCreatedId = result?.id || result?.pk || null;
        } catch (apiErr) {
          console.error("[AddStockMovementFormModal] API create failed:", apiErr);
        }

        const localEntry = {
          id: apiCreatedId ? String(apiCreatedId) : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          movement_type: formData.movement_type,
          inventory: formData.inventory,
          inventory_item_name: formData._inventory_item_name || "",
          inventory_sku: formData._inventory_sku || "",
          quantity: formData.quantity,
          from_location: formData.from_location || "",
          to_location: formData.to_location || "",
          from_location_name: formData._from_location_name || "",
          to_location_name: formData._to_location_name || "",
          performed_by_name: formData._performed_by_name || "",
          reason: formData.reason || "",
          created_at: new Date().toISOString(),
        };
        try {
          const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
          existing.push(localEntry);
          localStorage.setItem(LOCAL_KEY, JSON.stringify(existing));
        } catch { /* localStorage unavailable */ }
      }
      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      setError(
        extractErrorMessage(err, initialValues
          ? "Failed to update stock movement. Please try again."
          : "Failed to create stock movement. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {title || (initialValues ? "Edit Stock Movement" : "New Stock Movement")}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}
              <StockMovementForm
                onSubmit={handleSubmit}
                onCancel={onClose}
                loading={loading}
                initialValues={initialValues || {}}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

AddStockMovementFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  initialValues: PropTypes.object,
  title: PropTypes.string,
};

export default AddStockMovementFormModal;
