import { useState, useEffect } from "react";
import { Factory } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../../contexts/AuthContext";
import ProductionService from "../../../services/ProductionService";
import InventoryService from "../../../services/InventoryService";
import LocationService from "../../../services/LocationService";
import SuccessModal from "../../modals/SuccessModal";
import { extractErrorMessage } from "../../../../utils/errorUtils";
import { isAdminRole } from "../../../utils/permissions";
import { PRODUCTION_PRIORITIES } from "../../../constants/productionConstants";

const getTodayDateString = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];
};

const AddProductionOrderForm = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [existingOrders, setExistingOrders] = useState([]);
  const [copiedOrderId, setCopiedOrderId] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);
  const todayDate = getTodayDateString();

  const [formData, setFormData] = useState({
    created_by: user.id,
    title: "",
    description: "",
    category: "",
    priority: "medium",
    total_quantity: "",
    location: isAdmin ? "" : user?.location || "",
    order_created_at: todayDate,
    target_completion_date: todayDate,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { title, category, total_quantity, location } = formData;
    if (!title || !category || !total_quantity) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please fill in all required fields.");
      return false;
    }
    if (Number(total_quantity) <= 0) {
      setErrorTitle("Validation Error");
      setErrorMessage("Total quantity must be greater than 0.");
      return false;
    }
    if (isAdmin && !location) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please select a location.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setIsErrorModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      await ProductionService.createOrder({
        ...formData,
        category: selectedCategory,
        total_quantity: Number(formData.total_quantity),
      });
      setFormData({
        created_by: user.id,
        title: "",
        description: "",
        category: "",
        priority: "medium",
        total_quantity: "",
        location: isAdmin ? "" : user?.location || "",
        order_created_at: getTodayDateString(),
        target_completion_date: getTodayDateString(),
      });
      setSelectedCategory(null);
      setCopiedOrderId("");
      if (onClose) onClose();
    } catch (error) {
      setErrorTitle("Error");
      setErrorMessage(
        extractErrorMessage(error, "Failed to create production order. Please try again.")
      );
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await InventoryService.listInventoryCategory();
        setCategories(Array.isArray(response) ? response : response?.results || []);
      } catch {
        setErrorTitle("Error");
        setErrorMessage("Failed to fetch inventory categories.");
        setIsErrorModalOpen(true);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await LocationService.listLocations();
        const list = Array.isArray(response) ? response : response?.results || [];
        setLocations(list);
      } catch {
        // Location fetch failure shouldn't block the form.
      }
    };

    const fetchExistingOrders = async () => {
      try {
        const response = await ProductionService.listOrders();
        setExistingOrders(Array.isArray(response) ? response : response?.results || []);
      } catch {
        // Copy-from-existing is optional; ignore failures.
      }
    };

    fetchCategories();
    fetchLocations();
    fetchExistingOrders();
  }, []);

  const handleCopyOrder = (e) => {
    const orderId = e.target.value;
    setCopiedOrderId(orderId);
    if (!orderId) return;

    const order = existingOrders.find((o) => String(o.id) === String(orderId));
    if (!order) return;

    setSelectedCategory(order.category || null);
    setFormData((prev) => ({
      ...prev,
      title: order.title || "",
      description: order.description || "",
      category: order.category || "",
      priority: order.priority || "medium",
      location: isAdmin ? order.location || prev.location : prev.location,
      total_quantity: order.total_quantity || "",
      order_created_at: getTodayDateString(),
      target_completion_date: getTodayDateString(),
    }));
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center rounded-lg">
      <div className="bg-white w-full rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Factory className="w-6 h-6 text-blue-600" />
          Create Production Order
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6 pb-5 border-b border-gray-100">
            <label className="block text-gray-700 font-medium mb-2">
              Copy from an existing order{" "}
              <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              name="copiedOrder"
              value={copiedOrderId}
              onChange={handleCopyOrder}
              disabled={loading}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">
                {existingOrders.length === 0
                  ? "No previous orders to copy from"
                  : "Select a previous order to renew (e.g. when stock is exhausted)"}
              </option>
              {existingOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.title} — {order.status} ({Number(order.total_quantity) || 0} units)
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1.5">
              Picking an order pre-fills this form with its configuration. Adjust the
              quantity and dates, then save to create a new production run.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Location *
              </label>
              {isAdmin ? (
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={
                    locations.find((loc) => String(loc.id) === String(user?.location))?.name ||
                    user?.location ||
                    "Your location"
                  }
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-3 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {PRODUCTION_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Production Title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Ready-made Lace Gowns Batch A"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Production Category *
            </label>
            <div className="flex flex-wrap gap-3">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setFormData((prev) => ({ ...prev, category: category.id }));
                    }}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white"
                        : "border-gray-300 text-gray-600"
                    }`}
                    disabled={loading}
                  >
                    {category.name}
                  </button>
                ))
              ) : (
                <p className="text-gray-500">No categories available.</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Describe the production run, fabric, sizing etc."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Total Quantity *
              </label>
              <input
                type="number"
                name="total_quantity"
                min="1"
                value={formData.total_quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Order Created *
              </label>
              <input
                type="date"
                name="order_created_at"
                value={formData.order_created_at}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Target Completion *
              </label>
              <input
                type="date"
                name="target_completion_date"
                value={formData.target_completion_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-6 text-right">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition duration-300 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>

      {isErrorModalOpen && (
        <SuccessModal
          title={errorTitle}
          message={errorMessage}
          onClose={() => setIsErrorModalOpen(false)}
          isError={true}
        />
      )}
    </div>
  );
};

AddProductionOrderForm.propTypes = {
  onClose: PropTypes.func,
};

export default AddProductionOrderForm;
