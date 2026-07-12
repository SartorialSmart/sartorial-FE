import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InventoryForm from "../../forms/InventoryForm";
import InventoryService from "../../../services/InventoryService";
import StockMovementService from "../../../services/StockMovementService";
import { useAuth } from "../../../contexts/AuthContext";
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
  const [formKey, setFormKey] = useState(0);
  const { user } = useAuth();

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
    setFormKey((k) => k + 1);
    setError(null);
  }, [isOpen]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      if (initialValues && initialValues.id) {
        await InventoryService.updateInventory(initialValues.id, formData);

        const oldQty = Number(initialValues.quantity) || 0;
        const newQty = Number(formData.quantity) || 0;
        if (oldQty !== newQty) {
          const diff = newQty - oldQty;
          const itemName = formData.item_name || initialValues.item_name || "";
          const sku = formData.sku || initialValues.sku || "";

          StockMovementService.createMovement({
            movement_type: diff > 0 ? "stock_in" : "adjustment",
            inventory: initialValues.id,
            quantity: Math.abs(diff),
            performed_by: user?.id || "",
            reason: `Inventory updated — quantity changed from ${oldQty} to ${newQty}`,
          }).catch(() => {});

          try {
            const LOCAL_KEY = "sartorial_stock_movements";
            const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
            existing.push({
              id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              movement_type: diff > 0 ? "stock_in" : "adjustment",
              inventory: initialValues.id,
              inventory_item_name: itemName,
              inventory_sku: sku,
              quantity: Math.abs(diff),
              from_location_name: "",
              to_location_name: "",
              performed_by_name: user?.email || "",
              reason: `Inventory updated — quantity changed from ${oldQty} to ${newQty}`,
              created_at: new Date().toISOString(),
            });
            localStorage.setItem(LOCAL_KEY, JSON.stringify(existing));
          } catch { /* localStorage unavailable */ }
        }
      } else {
        await InventoryService.createInventory(formData);
      }
      setFormKey((k) => k + 1);
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {title || (initialValues ? "Edit Inventory" : "Add Inventory")}
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
              <InventoryForm
                key={formKey}
                onSubmit={handleSubmit}
                onCancel={onClose}
                loading={loading}
                categories={categories}
                {...(initialValues ? { initialValues } : {})}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
