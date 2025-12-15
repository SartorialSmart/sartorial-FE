import { useState, useEffect } from "react";
import InventoryService from "../../services/InventoryService";
import StaffService from "../../services/staffServices/StaffService";
import PropTypes from "prop-types";
import { 
  Package, 
  Users, 
  Hash, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Item Name
        </label>
        <input
          name="item_name"
          value={form.item_name}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.item_name ? 'border-red-300' : 'border-gray-300'
          } ${initialValues.item_name ? 'bg-gray-50 text-gray-500' : ''}`}
          placeholder="Enter item name"
          disabled={!!initialValues.item_name}
        />
        {errors.item_name && (
          <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {errors.item_name}
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Inventory Category
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.category ? 'border-red-300' : 'border-gray-300'
          } ${initialValues.category ? 'bg-gray-50 text-gray-500' : ''}`}
          disabled={!!initialValues.category}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name || cat.category}
            </option>
          ))}
        </select>
        {errors.category && (
          <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {errors.category}
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Hash className="w-4 h-4" />
          Unit of Measurement
        </label>
        <select
          name="unit_of_measurement"
          value={form.unit_of_measurement}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.unit_of_measurement ? 'border-red-300' : 'border-gray-300'
          } ${initialValues.unit_of_measurement ? 'bg-gray-50 text-gray-500' : ''}`}
          disabled={!!initialValues.unit_of_measurement}
        >
          <option value="">Select unit</option>
          {UNIT_OPTIONS.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
        {errors.unit_of_measurement && (
          <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {errors.unit_of_measurement}
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Hash className="w-4 h-4" />
          Quantity
        </label>
        <input
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.quantity ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter quantity"
        />
        {errors.quantity && (
          <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {errors.quantity}
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Low Stock Threshold
        </label>
        <input
          name="low_stock_threshold"
          type="number"
          value={form.low_stock_threshold}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.low_stock_threshold ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter threshold"
        />
        {errors.low_stock_threshold && (
          <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {errors.low_stock_threshold}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Item'
          )}
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
  const [staff, setStaff] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch items
        const itemsData = await InventoryService.listInventory();
        setItems(Array.isArray(itemsData) ? itemsData : []);

        // Fetch staff
        const staffData = await StaffService.listStaff();
        if (Array.isArray(staffData.results)) {
          setStaff(staffData.results);
        } else if (Array.isArray(staffData)) {
          setStaff(staffData);
        } else {
          setStaff([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setItems([]);
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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.item_name) newErrors.item_name = "Item name is required";
    if (!form.dispense_to) newErrors.dispense_to = "Staff member is required";
    if (!form.quantity_dispensed) newErrors.quantity_dispensed = "Quantity is required";
    if (!form.reason) newErrors.reason = "Reason is required";
    
    // Validate quantity is positive
    if (form.quantity_dispensed && parseFloat(form.quantity_dispensed) <= 0) {
      newErrors.quantity_dispensed = "Quantity must be greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Prepare the data for submission
    const submitData = {
      ...form,
      item_name: form.item_name, // This should be the item ID
      dispense_to: form.dispense_to, // This should be the staff UUID
      quantity_dispensed: parseFloat(form.quantity_dispensed),
    };
    
    onSubmit(submitData);
  };

  // Get selected item for stock validation
  const selectedItem = items.find(item => item.id === form.item_name);

  // Stock status indicator
  const getStockStatus = (item) => {
    if (!item) return null;
    
    const quantity = parseFloat(form.quantity_dispensed) || 0;
    const available = item.quantity || 0;
    
    if (quantity > available) {
      return {
        type: 'error',
        message: `Insufficient stock! Available: ${available} ${item.unit_of_measurement || ''}`,
        icon: XCircle
      };
    } else if (quantity === available) {
      return {
        type: 'warning',
        message: `Using all available stock: ${available} ${item.unit_of_measurement || ''}`,
        icon: AlertTriangle
      };
    } else {
      return {
        type: 'success',
        message: `Available: ${available} ${item.unit_of_measurement || ''}`,
        icon: CheckCircle
      };
    }
  };

  const stockStatus = selectedItem ? getStockStatus(selectedItem) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {loadingData ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      ) : (
        <>
          {/* Item Selection with Stock Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Item Name *
              </label>
              {selectedItem && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Available: {selectedItem.quantity} {selectedItem.unit_of_measurement || ''}
                </div>
              )}
            </div>
            <select
              name="item_name"
              value={form.item_name}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.item_name ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select an item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_name} 
                  {item.quantity !== undefined && ` • ${item.quantity} ${item.unit_of_measurement || ''} available`}
                </option>
              ))}
            </select>
            {errors.item_name && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.item_name}
              </div>
            )}
          </div>

          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Dispense To *
            </label>
            <select
              name="dispense_to"
              value={form.dispense_to}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.dispense_to ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select staff member</option>
              {staff.map((person) => {
                const displayName = person.get_full_name 
                  ? person.get_full_name 
                  : (person.first_name && person.last_name 
                    ? `${person.first_name} ${person.last_name}`
                    : person.email || person.username || 'Unknown Staff');
                
                return (
                  <option key={person.id} value={person.id}>
                    {displayName} {person.email ? `(${person.email})` : ''}
                  </option>
                );
              })}
            </select>
            {errors.dispense_to && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.dispense_to}
              </div>
            )}
          </div>

          {/* Quantity with Stock Validation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Quantity Dispensed *
            </label>
            <input
              name="quantity_dispensed"
              type="number"
              step="0.01"
              min="0.01"
              value={form.quantity_dispensed}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.quantity_dispensed ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter quantity to dispense"
            />
            {errors.quantity_dispensed && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.quantity_dispensed}
              </div>
            )}
            
            {/* Stock Status Indicator */}
            {stockStatus && (
              <div className={`text-xs mt-2 flex items-center gap-1 ${
                stockStatus.type === 'error' ? 'text-red-600' :
                stockStatus.type === 'warning' ? 'text-amber-600' :
                'text-green-600'
              }`}>
                <stockStatus.icon className="w-3 h-3" />
                {stockStatus.message}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reason for Dispensing *
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Please provide a reason for dispensing this item..."
              rows={3}
            />
            {errors.reason && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.reason}
              </div>
            )}
          </div>

          {/* Summary Card */}
          {selectedItem && form.quantity_dispensed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Dispense Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Item:</span>
                  <div className="font-medium">{selectedItem.item_name}</div>
                </div>
                <div>
                  <span className="text-blue-600">Quantity:</span>
                  <div className="font-medium">
                    {form.quantity_dispensed} {selectedItem.unit_of_measurement || ''}
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">Current Stock:</span>
                  <div className="font-medium">
                    {selectedItem.quantity} {selectedItem.unit_of_measurement || ''}
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">Remaining After:</span>
                  <div className={`font-medium ${
                    (selectedItem.quantity - parseFloat(form.quantity_dispensed)) < selectedItem.low_stock_threshold 
                      ? 'text-amber-600' 
                      : 'text-green-600'
                  }`}>
                    {selectedItem.quantity - parseFloat(form.quantity_dispensed)} {selectedItem.unit_of_measurement || ''}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || (selectedItem && parseFloat(form.quantity_dispensed) > selectedItem.quantity)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dispensing...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Dispense Item
                </>
              )}
            </button>
          </div>
        </>
      )}
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