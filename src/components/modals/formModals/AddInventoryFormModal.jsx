import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InventoryForm from "../../forms/InventoryForm";
import InventoryService from "../../../services/InventoryService";
import LocationService from "../../../services/LocationService";
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
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const { user } = useAuth();

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

  const saveMovementLocally = (entry) => {
    try {
      const LOCAL_KEY = "sartorial_stock_movements";
      const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      existing.push(entry);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(existing));
    } catch { /* localStorage unavailable */ }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      if (initialValues && initialValues.id) {
        await InventoryService.updateInventory(initialValues.id, formData);

        const oldQty = Number(initialValues.quantity) || 0;
        const newQty = Number(formData.quantity) || 0;
        const qtyChanged = oldQty !== newQty;
        const oldLocation = String(initialValues.location || "");
        const newLocation = String(formData.location || "");
        const locationChanged = oldLocation !== newLocation && newLocation;

        if (qtyChanged || locationChanged) {
          const itemName = formData.item_name || initialValues.item_name || "";
          const sku = formData.sku || initialValues.sku || "";

          if (qtyChanged) {
            const diff = newQty - oldQty;
            const toName = newLocation ? (locations.find((l) => String(l.id) === newLocation)?.name || "") : "";
            const movementPayload = {
              movement_type: diff > 0 ? "stock_in" : "adjustment",
              inventory: initialValues.id,
              quantity: Math.abs(diff),
              performed_by: user?.id || "",
              reason: `Inventory updated — quantity changed from ${oldQty} to ${newQty}`,
              _inventory_item_name: itemName,
              _inventory_sku: sku,
              _performed_by_name: user?.email || "",
              _from_location_name: "",
              _to_location_name: toName,
            };
            if (newLocation) {
              movementPayload.to_location = newLocation;
            }

            let apiId = null;
            try {
              const result = await StockMovementService.createMovement(movementPayload);
              apiId = result?.id || result?.pk || null;
            } catch (apiErr) {
              console.error("[AddInventoryFormModal] qty change movement API failed:", apiErr);
            }
            saveMovementLocally({
              id: apiId ? String(apiId) : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              movement_type: diff > 0 ? "stock_in" : "adjustment",
              inventory: initialValues.id,
              inventory_item_name: itemName,
              inventory_sku: sku,
              quantity: Math.abs(diff),
              from_location: "",
              to_location: newLocation || "",
              from_location_name: "",
              to_location_name: toName,
              performed_by_name: user?.email || "",
              reason: `Inventory updated — quantity changed from ${oldQty} to ${newQty}`,
              created_at: new Date().toISOString(),
            });
          }

          if (locationChanged && !qtyChanged) {
            const fromName = locations.find((l) => String(l.id) === oldLocation)?.name || "";
            const toName = locations.find((l) => String(l.id) === newLocation)?.name || "";
            const movementPayload = {
              movement_type: "transfer",
              inventory: initialValues.id,
              quantity: newQty || oldQty,
              from_location: oldLocation,
              to_location: newLocation,
              performed_by: user?.id || "",
              reason: `Location changed`,
              _inventory_item_name: itemName,
              _inventory_sku: sku,
              _performed_by_name: user?.email || "",
              _from_location_name: fromName,
              _to_location_name: toName,
            };

            let apiId = null;
            try {
              const result = await StockMovementService.createMovement(movementPayload);
              apiId = result?.id || result?.pk || null;
            } catch (apiErr) {
              console.error("[AddInventoryFormModal] transfer movement API failed:", apiErr);
            }
            saveMovementLocally({
              id: apiId ? String(apiId) : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              movement_type: "transfer",
              inventory: initialValues.id,
              inventory_item_name: itemName,
              inventory_sku: sku,
              quantity: newQty || oldQty,
              from_location: oldLocation,
              to_location: newLocation,
              from_location_name: fromName,
              to_location_name: toName,
              performed_by_name: user?.email || "",
              reason: `Location changed`,
              created_at: new Date().toISOString(),
            });
          }
        }
      } else {
        const created = await InventoryService.createInventory(formData);
        const location = formData.location || "";
        const quantity = Number(formData.quantity) || 0;
        if (location && quantity > 0 && created?.id) {
          const itemName = formData.item_name || "";
          const sku = formData.sku || "";
          const locName = locations.find((l) => String(l.id) === String(location))?.name || "";

          const movementPayload = {
            movement_type: "stock_in",
            inventory: created.id,
            quantity,
            to_location: location,
            performed_by: user?.id || "",
            reason: `Initial stock — ${quantity} units added to ${locName || "location"}`,
            _inventory_item_name: itemName,
            _inventory_sku: sku,
            _performed_by_name: user?.email || "",
            _from_location_name: "",
            _to_location_name: locName,
          };

          let apiId = null;
          try {
            const result = await StockMovementService.createMovement(movementPayload);
            apiId = result?.id || result?.pk || null;
          } catch (apiErr) {
            console.error("[AddInventoryFormModal] stock_in movement API failed:", apiErr);
          }
          saveMovementLocally({
            id: apiId ? String(apiId) : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            movement_type: "stock_in",
            inventory: created.id,
            inventory_item_name: itemName,
            inventory_sku: sku,
            quantity,
            from_location: "",
            to_location: location,
            from_location_name: "",
            to_location_name: locName,
            performed_by_name: user?.email || "",
            reason: `Initial stock — ${quantity} units added to ${locName || "location"}`,
            created_at: new Date().toISOString(),
          });
        }
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
                locations={locations}
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
