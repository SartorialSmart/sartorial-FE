import { useState, useEffect } from "react";
import InventoryService from "../../services/InventoryService";
import LocationService from "../../services/LocationService";
import StaffService from "../../services/staffServices/StaffService";
import { useAuth } from "../../contexts/AuthContext";
import PropTypes from "prop-types";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightCircle,
  RotateCcw,
  Edit3,
  Package,
  MapPin,
  Users,
  Hash,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";

const MOVEMENT_TYPES = [
  { value: "stock_in", label: "Stock In", icon: ArrowDownCircle, color: "text-green-600" },
  { value: "dispense", label: "Dispense", icon: ArrowUpCircle, color: "text-red-600" },
  { value: "transfer", label: "Transfer", icon: ArrowRightCircle, color: "text-blue-600" },
  { value: "adjustment", label: "Adjustment", icon: Edit3, color: "text-yellow-600" },
  { value: "return", label: "Return", icon: RotateCcw, color: "text-purple-600" },
];

const StockMovementForm = ({
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    movement_type: initialValues.movement_type || "stock_in",
    inventory_item: initialValues.inventory_item || "",
    quantity: initialValues.quantity || "",
    from_location: initialValues.from_location || "",
    to_location: initialValues.to_location || "",
    performed_by: initialValues.performed_by || "",
    reason: initialValues.reason || "",
  });
  const [errors, setErrors] = useState({});
  const [inventoryItems, setInventoryItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [itemsData, locationsData, staffData] = await Promise.all([
          InventoryService.listInventory(),
          LocationService.listLocations(),
          StaffService.listStaff(),
        ]);

        setInventoryItems(Array.isArray(itemsData) ? itemsData : []);
        setLocations(Array.isArray(locationsData) ? locationsData : locationsData?.results || []);

        const staffList = Array.isArray(staffData?.results)
          ? staffData.results
          : Array.isArray(staffData)
          ? staffData
          : [];
        setStaff(staffList);

        if (!initialValues.performed_by && user) {
          const currentStaff = staffList.find(
            (s) => s.email === user.email || s.user?.toString() === user.id?.toString()
          );
          if (currentStaff) {
            setForm((prev) => ({
              ...prev,
              performed_by: currentStaff.id || currentStaff.slug,
            }));
          }
        }
      } catch {
        setInventoryItems([]);
        setLocations([]);
        setStaff([]);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.movement_type) newErrors.movement_type = "Movement type is required";
    if (!form.inventory_item) newErrors.inventory_item = "Inventory item is required";
    if (!form.quantity || parseFloat(form.quantity) <= 0) newErrors.quantity = "A valid quantity is required";
    if (!form.performed_by) newErrors.performed_by = "Staff member is required";
    if (!form.reason) newErrors.reason = "Reason is required";
    if ((form.movement_type === "stock_in" || form.movement_type === "return") && !form.to_location) {
      newErrors.to_location = "Destination location is required";
    }
    if (form.movement_type === "transfer") {
      if (!form.from_location) newErrors.from_location = "Source location is required";
      if (!form.to_location) newErrors.to_location = "Destination location is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const quantity = Math.abs(parseFloat(form.quantity));
    const selectedItem = inventoryItems.find((i) => String(i.id) === String(form.inventory_item));
    const selectedStaff = staff.find((s) => String(s.id) === String(form.performed_by));
    const staffName = selectedStaff?.get_full_name
      || (selectedStaff ? `${selectedStaff.first_name || ""} ${selectedStaff.last_name || ""}`.trim() : "");

    const payload = {
      movement_type: form.movement_type,
      inventory: form.inventory_item,
      quantity: form.movement_type === "dispense" ? -quantity : quantity,
      performed_by: form.performed_by,
      reason: form.reason,
      _inventory_item_name: selectedItem?.item_name || "",
      _inventory_sku: selectedItem?.sku || "",
      _performed_by_name: staffName,
      _from_location_name: "",
      _to_location_name: "",
    };

    if (form.movement_type === "transfer" || form.movement_type === "stock_in" || form.movement_type === "return") {
      const toLoc = locations.find((l) => String(l.id) === String(form.to_location));
      if (form.to_location) {
        payload.to_location = form.to_location;
        payload._to_location_name = toLoc?.name || "";
      }
    }

    if (form.movement_type === "transfer") {
      const fromLoc = locations.find((l) => String(l.id) === String(form.from_location));
      if (form.from_location) {
        payload.from_location = form.from_location;
        payload._from_location_name = fromLoc?.name || "";
      }
    }

    onSubmit(payload);
  };

  const showToLocation = form.movement_type === "transfer" || form.movement_type === "stock_in" || form.movement_type === "return";
  const showFromLocation = form.movement_type === "transfer";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {loadingData ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      ) : (
        <>
          {/* Movement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Movement Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MOVEMENT_TYPES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, movement_type: value }))}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.movement_type === value
                      ? `bg-gray-50 border-blue-500 ${color}`
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            {errors.movement_type && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> {errors.movement_type}
              </div>
            )}
          </div>

          {/* Inventory Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventory Item
            </label>
            <select
              name="inventory_item"
              value={form.inventory_item}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.inventory_item ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Select an item</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_name} {item.sku ? `(${item.sku})` : ""} — Stock: {item.quantity ?? 0}
                </option>
              ))}
            </select>
            {errors.inventory_item && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> {errors.inventory_item}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Quantity
            </label>
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.quantity ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter quantity"
            />
            {errors.quantity && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> {errors.quantity}
              </div>
            )}
          </div>

          {/* Locations */}
          {(showFromLocation || showToLocation) && (
            <div className={`grid ${showFromLocation ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
              {showFromLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    From Location
                  </label>
                  <select
                    name="from_location"
                    value={form.from_location}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.from_location ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  {errors.from_location && (
                    <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {errors.from_location}
                    </div>
                  )}
                </div>
              )}
              {showToLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {form.movement_type === "transfer" ? "To Location" : "Location"}
                  </label>
                  <select
                    name="to_location"
                    value={form.to_location}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.to_location ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  {errors.to_location && (
                    <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {errors.to_location}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Performed By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Performed By
            </label>
            <select
              name="performed_by"
              value={form.performed_by}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.performed_by ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Select staff member</option>
              {staff.map((person) => {
                const displayName = person.get_full_name
                  ? person.get_full_name
                  : person.first_name && person.last_name
                  ? `${person.first_name} ${person.last_name}`
                  : person.email || person.username || "Unknown";
                return (
                  <option key={person.id} value={person.id}>
                    {displayName}
                  </option>
                );
              })}
            </select>
            {errors.performed_by && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> {errors.performed_by}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reason
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.reason ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Why is this movement being recorded?"
              rows={3}
            />
            {errors.reason && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> {errors.reason}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Movement"
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

StockMovementForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
};

export default StockMovementForm;
