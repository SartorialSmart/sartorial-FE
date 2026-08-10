import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, PackageCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InventoryForm from "../forms/InventoryForm";
import InventoryService from "../../services/InventoryService";
import LocationService from "../../services/LocationService";
import ProductionService from "../../services/ProductionService";

const AddProductionToInventoryModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const [catData, locData] = await Promise.allSettled([
          InventoryService.listInventoryCategory(),
          LocationService.listLocations(),
        ]);
        if (catData.status === "fulfilled") {
          setCategories(Array.isArray(catData.value) ? catData.value : []);
        }
        if (locData.status === "fulfilled") {
          const raw = locData.value;
          setLocations(Array.isArray(raw) ? raw : raw?.results || []);
        }
      } catch {
        setCategories([]);
        setLocations([]);
      }
    };
    fetchData();
    setFormKey((k) => k + 1);
    setError(null);
  }, [isOpen]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await ProductionService.completeOrder(order.id, {
        item_name: formData.item_name,
        sku: formData.sku,
        category: formData.category,
        location: formData.location || "",
        unit_of_measurement: formData.unit_of_measurement,
        quantity: Number(formData.quantity) || 0,
        unit_cost: Number(formData.unit_cost) || 0,
        selling_price: Number(formData.selling_price) || 0,
        low_stock_threshold: Number(formData.low_stock_threshold) || 0,
        barcode: formData.barcode || "",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      setError(
        "Failed to add production output to inventory. Please try again."
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <PackageCheck size={20} className="text-emerald-600" />
                  Add to Inventory
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {order?.title || "Production order"} • Complete &amp; stock finished goods
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}
              <InventoryForm
                key={formKey}
                initialValues={{
                  item_name: order?.title || "",
                  quantity: String(order?.total_quantity || ""),
                }}
                onSubmit={handleSubmit}
                onCancel={onClose}
                loading={loading}
                categories={categories}
                locations={locations}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

AddProductionToInventoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    total_quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onSuccess: PropTypes.func,
};

export default AddProductionToInventoryModal;
