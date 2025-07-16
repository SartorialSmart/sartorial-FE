import { useState, useEffect } from "react";
import InventoryService from "../../services/InventoryService";
import VendorService from "../../services/VendorService";
import PropTypes from "prop-types";

const UNIT_OPTIONS = [
  { value: "mm", label: "Millimeters" },
  { value: "cm", label: "Centimeters" },
  { value: "m", label: "Meters" },
  { value: "km", label: "Kilometers" },
  { value: "in", label: "Inches" },
  { value: "ft", label: "Feet" },
  { value: "yds", label: "Yards" },
];

const InventoryForm = ({
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
  categories = [],
}) => {
  const [form, setForm] = useState({
    item_name: initialValues.item_name || "",
    category: initialValues.category || "",
    unit_of_measurement: initialValues.unit_of_measurement || "",
    quantity: initialValues.quantity || "",
    low_stock_threshold: initialValues.low_stock_threshold || "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.item_name) newErrors.item_name = "Required";
    if (!form.category) newErrors.category = "Required";
    if (!form.unit_of_measurement) newErrors.unit_of_measurement = "Required";
    if (!form.quantity) newErrors.quantity = "Required";
    if (!form.low_stock_threshold) newErrors.low_stock_threshold = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-1">Item Name</label>
        <input
          name="item_name"
          value={form.item_name}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter item name"
          disabled={!!initialValues.item_name}
        />
        {errors.item_name && (
          <div className="text-red-500 text-xs mt-1">{errors.item_name}</div>
        )}
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Inventory Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={!!initialValues.category}
        >
          <option value="">Select</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name || cat.category}
            </option>
          ))}
        </select>
        {errors.category && (
          <div className="text-red-500 text-xs mt-1">{errors.category}</div>
        )}
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Unit of measurement</label>
        <select
          name="unit_of_measurement"
          value={form.unit_of_measurement}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={!!initialValues.unit_of_measurement}
        >
          <option value="">Select</option>
          {UNIT_OPTIONS.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
        {errors.unit_of_measurement && (
          <div className="text-red-500 text-xs mt-1">
            {errors.unit_of_measurement}
          </div>
        )}
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Quantity</label>
        <input
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter quantity"
        />
        {errors.quantity && (
          <div className="text-red-500 text-xs mt-1">{errors.quantity}</div>
        )}
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Low stock threshold</label>
        <input
          name="low_stock_threshold"
          type="number"
          value={form.low_stock_threshold}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter threshold"
        />
        {errors.low_stock_threshold && (
          <div className="text-red-500 text-xs mt-1">
            {errors.low_stock_threshold}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

InventoryForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
  categories: PropTypes.array,
};

const DispenseInventoryForm = ({
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form, setForm] = useState({
    item_name: initialValues.item_name || "",
    dispense_to: initialValues.dispense_to || "",
    quantity_dispensed: initialValues.quantity_dispensed || "",
    reason: initialValues.reason || "",
  });
  const [errors, setErrors] = useState({});
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await InventoryService.listInventory();
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      }
    };
    const fetchVendors = async () => {
      try {
        const data = await VendorService.getVendorsList();
        if (Array.isArray(data.results)) {
          setVendors(data.results);
        } else if (Array.isArray(data)) {
          setVendors(data);
        } else {
          setVendors([]);
        }
      } catch {
        setVendors([]);
      }
    };
    fetchItems();
    fetchVendors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.item_name) newErrors.item_name = "Required";
    if (!form.dispense_to) newErrors.dispense_to = "Required";
    if (!form.quantity_dispensed) newErrors.quantity_dispensed = "Required";
    if (!form.reason) newErrors.reason = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-1">Item Name</label>
        <select
          name="item_name"
          value={form.item_name}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.item_name}
            </option>
          ))}
        </select>
        {errors.item_name && (
          <div className="text-red-500 text-xs mt-1">{errors.item_name}</div>
        )}
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Dispense To</label>
        <select
          name="dispense_to"
          value={form.dispense_to}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name || vendor.vendor_name || vendor.email}
            </option>
          ))}
        </select>
        {errors.dispense_to && (
          <div className="text-red-500 text-xs mt-1">{errors.dispense_to}</div>
        )}
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Quantity Dispensed</label>
        <input
          name="quantity_dispensed"
          type="number"
          value={form.quantity_dispensed}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter quantity"
        />
        {errors.quantity_dispensed && (
          <div className="text-red-500 text-xs mt-1">
            {errors.quantity_dispensed}
          </div>
        )}
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Reason</label>
        <textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter reason for dispensing"
          rows={3}
        />
        {errors.reason && (
          <div className="text-red-500 text-xs mt-1">{errors.reason}</div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

DispenseInventoryForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
};

export default InventoryForm;
export { DispenseInventoryForm };
