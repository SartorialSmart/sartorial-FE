import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Minus,
  Plus,
  Package,
  AlertCircle,
  Loader2,
} from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../../contexts/AuthContext";
import ClientService from "../../../services/ClientService";
import InventoryService from "../../../services/InventoryService";
import OrderService from "../../../services/OrderService";
import SuccessModal from "../../modals/SuccessModal";
import { extractErrorMessage } from "../../../../utils/errorUtils";
import { buildReadyMadeDescription } from "../../../../utils/orderUtils";

const READY_MADE_CATEGORY_NAME = "Ready Made Wears";

const getTodayDateString = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];
};

const findOrCreateReadyMadeCategory = async () => {
  const categoriesData = await InventoryService.listInventoryCategory();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  let category = categories.find(
    (cat) =>
      cat.name?.toLowerCase() === READY_MADE_CATEGORY_NAME.toLowerCase() ||
      cat.name?.toLowerCase().includes("ready made") ||
      cat.name?.toLowerCase().includes("readymade")
  );

  if (!category) {
    const created = await InventoryService.createInventoryCategory({
      name: READY_MADE_CATEGORY_NAME,
      description: "Pre-made clothing items available for immediate sale",
    });
    category = created;
  }

  return category;
};

const AddReadyMadeOrderForm = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [fetchError, setFetchError] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();
  const todayDate = getTodayDateString();

  const [formData, setFormData] = useState({
    created_by: user?.id || "",
    client: "",
    client_email: "",
    order_title: "",
    order_price: "",
    initial_deposit: "",
    balance: "",
    order_status: "Completed",
    order_type: "Single",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [clientsData, itemsData] = await Promise.all([
          ClientService.getClients(),
          InventoryService.listInventory(),
        ]);

        setClients(Array.isArray(clientsData) ? clientsData : []);

        let category;
        try {
          category = await findOrCreateReadyMadeCategory();
        } catch {
          setFetchError(
            `Failed to create "${READY_MADE_CATEGORY_NAME}" category. Please create it manually in Inventory Categories.`
          );
          setPageLoading(false);
          return;
        }

        if (category) {
          const allItems = Array.isArray(itemsData) ? itemsData : [];
          const filtered = allItems.filter(
            (item) =>
              item.category === category.id ||
              item.category?.toString() === category.id?.toString()
          );
          setInventoryItems(filtered);
        }
      } catch {
        setFetchError("Failed to load data. Please try again.");
      } finally {
        setPageLoading(false);
      }
    };

    init();
  }, []);

  const handleClientChange = (e) => {
    const value = e.target.value;
    const selectedClient = clients.find((c) => c.id === value);
    setFormData((prev) => ({
      ...prev,
      client: value,
      client_email: selectedClient ? selectedClient.email : "",
    }));
  };

  const toggleItem = (item) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = { item, quantity: 1 };
      }
      return next;
    });
  };

  const adjustQty = (itemId, delta) => {
    setSelectedItems((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      const newQty = Math.max(1, (current.quantity || 1) + delta);
      const maxQty = current.item.quantity || 999;
      return {
        ...prev,
        [itemId]: { ...current, quantity: Math.min(newQty, maxQty) },
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "order_price" || name === "initial_deposit") {
        const price = parseFloat(updated.order_price) || 0;
        const deposit = parseFloat(updated.initial_deposit) || 0;
        updated.balance = Math.max(price - deposit, 0).toFixed(2);
      }
      return updated;
    });
  };

  const validateForm = () => {
    const { client, client_email, order_title, order_price } = formData;

    if (!client || !client_email) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please select a client.");
      setIsErrorModalOpen(true);
      return false;
    }

    if (!order_title) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please enter an order title.");
      setIsErrorModalOpen(true);
      return false;
    }

    if (Object.keys(selectedItems).length === 0) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please select at least one inventory item.");
      setIsErrorModalOpen(true);
      return false;
    }

    if (!order_price || isNaN(parseFloat(order_price))) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please enter a valid price.");
      setIsErrorModalOpen(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const itemsSummary = Object.values(selectedItems).map(
        ({ item, quantity }) => ({
          item_id: item.id,
          item_name: item.item_name,
          quantity,
        })
      );

      const orderResponse = await OrderService.createOrder({
        ...formData,
        order_description: buildReadyMadeDescription(itemsSummary),
        start_date: todayDate,
        end_date: todayDate,
        order_category: null,
        ready_made_items: itemsSummary,
      });

      const orderId = orderResponse?.id || orderResponse?.order_id || "";

      // Auto-dispense each selected item from inventory
      const dispensePromises = Object.values(selectedItems).map(
        ({ item, quantity }) =>
          InventoryService.createDispenseInventory({
            item_name: item.id,
            dispense_to: user?.staff_id || user?.id || "",
            quantity_dispensed: quantity,
            reason: orderId
              ? `Ready Made Order - Order #${orderId}`
              : "Ready Made Order",
          })
      );

      await Promise.all(dispensePromises);

      if (onClose) onClose();
    } catch (error) {
      setErrorTitle("Error");
      setErrorMessage(
        extractErrorMessage(error, "Failed to create order. Please try again.")
      );
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.keys(selectedItems).length;

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-gray-500">Loading ready made items...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center rounded-lg">
      <div className="bg-white w-full rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-6">
          Create Ready Made Order
        </h2>

        {fetchError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-16 h-16 text-amber-400 mb-4" />
            <p className="text-gray-700 font-medium text-lg mb-2">
              No Ready Made Items Available
            </p>
            <p className="text-gray-500 max-w-md">{fetchError}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Client Name *
                </label>
                <select
                  name="client"
                  value={formData.client}
                  onChange={handleClientChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select Customer</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Client Email Address *
                </label>
                <input
                  type="email"
                  name="client_email"
                  placeholder="Email here"
                  value={formData.client_email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 font-medium mb-2">
                Order Title *
              </label>
              <input
                type="text"
                name="order_title"
                placeholder="e.g. Ready Made Shirt Order"
                value={formData.order_title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-gray-700 font-medium">
                  Select Ready Made Items *
                </label>
                {selectedCount > 0 && (
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                    {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>

              {inventoryItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    No ready made items in inventory.
                  </p>
                  <p className="text-sm text-gray-400">
                    Add items to the "{READY_MADE_CATEGORY_NAME}" category first.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {inventoryItems.map((item) => {
                    const isSelected = !!selectedItems[item.id];
                    const selected = selectedItems[item.id];
                    const availableStock = item.quantity || 0;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-blue-300"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(item)}
                          disabled={loading || availableStock <= 0}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.item_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Stock:{" "}
                            <span
                              className={
                                availableStock <= 0
                                  ? "text-red-600 font-semibold"
                                  : "text-gray-700"
                              }
                            >
                              {availableStock}{" "}
                              {item.unit_of_measurement || "pcs"}
                            </span>
                          </p>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => adjustQty(item.id, -1)}
                              disabled={
                                loading || (selected?.quantity || 1) <= 1
                              }
                              className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-semibold text-sm">
                              {selected?.quantity || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => adjustQty(item.id, 1)}
                              disabled={
                                loading ||
                                (selected?.quantity || 0) >= availableStock
                              }
                              className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}

                        {availableStock <= 0 && (
                          <span className="text-xs text-red-600 font-medium shrink-0">
                            Out of stock
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Total Price *
                </label>
                <input
                  type="text"
                  name="order_price"
                  placeholder="₦ Enter Amount"
                  value={formData.order_price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Initial Deposit *
                </label>
                <input
                  type="text"
                  name="initial_deposit"
                  placeholder="₦ Enter Amount"
                  value={formData.initial_deposit}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Balance
                </label>
                <input
                  type="text"
                  name="balance"
                  placeholder="₦ 0.00"
                  value={formData.balance}
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-3 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-gray-700 font-medium mb-3">
                Order Status
              </label>
              <div className="flex gap-4">
                <label
                  className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.order_status === "Completed"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="order_status"
                    value="Completed"
                    checked={formData.order_status === "Completed"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.order_status === "Completed"
                        ? "border-emerald-500"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.order_status === "Completed" && (
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">Completed</span>
                </label>

                <label
                  className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.order_status === "On Delivery"
                      ? "bg-purple-50 border-purple-500 text-purple-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="order_status"
                    value="On Delivery"
                    checked={formData.order_status === "On Delivery"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.order_status === "On Delivery"
                        ? "border-purple-500"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.order_status === "On Delivery" && (
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">On Delivery</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ready made orders do not require staff assignment.
              </p>
            </div>

            <div className="mt-8 text-right">
              <button
                type="submit"
                disabled={loading || Object.keys(selectedItems).length === 0}
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
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

AddReadyMadeOrderForm.propTypes = {
  onClose: PropTypes.func,
};

export default AddReadyMadeOrderForm;
