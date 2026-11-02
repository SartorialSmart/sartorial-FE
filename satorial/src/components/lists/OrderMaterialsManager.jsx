import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  PackagePlus,
  Search,
  Send,
  Trash2,
  UserCheck,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import InventoryService from "../../services/InventoryService";
import OrderService from "../../services/OrderService";
import DispenseAllConfirmationModal from "../modals/DispenseAllConfirmationModal";

const formatCurrency = (value) => `₦${Number(value || 0).toLocaleString()}`;

/** Extract a readable message from a DRF error response. */
const extractError = (err, fallback) => {
  const httpStatus = err?.response?.status;
  const suffix = httpStatus ? ` (HTTP ${httpStatus})` : "";
  const data = err?.response?.data;
  if (!data) return `${fallback}${suffix}`;
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  const first = Object.values(data)[0];
  if (typeof first === "string") return first;
  if (Array.isArray(first)) return first[0];
  return `${fallback}${suffix}`;
};

const STATUS_STYLES = {
  planned: "bg-amber-100 text-amber-700",
  dispensed: "bg-emerald-100 text-emerald-700",
};

const ORDER_STATUS_STYLES = {
  Pending: "bg-gray-100 text-gray-600",
  Assigned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  Processing: "bg-purple-100 text-purple-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

/**
 * Dispense materials against an assigned order: pick an order (only orders
 * with an active assignee are selectable), build its bill of materials from
 * inventory by category, and see the estimated material cost. Dispensing a
 * line hands it to the assignee and deducts stock.
 */
const OrderMaterialsManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Orders + selection
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(searchParams.get("order") || "");
  const [orderSearch, setOrderSearch] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Inventory picker
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [itemSearch, setItemSearch] = useState("");
  const [qtyDrafts, setQtyDrafts] = useState({});
  const [inventoryLoading, setInventoryLoading] = useState(true);

  // Materials list
  const [materials, setMaterials] = useState({ items: [], total_estimated_cost: 0, planned_cost: 0, dispensed_cost: 0 });
  const [materialsLoading, setMaterialsLoading] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showDispenseAllModal, setShowDispenseAllModal] = useState(false);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await OrderService.getDispensableOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load dispensable orders:", err);
      setError(extractError(err, "Failed to load assigned orders."));
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadInventory = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const [cats, inv] = await Promise.all([InventoryService.listInventoryCategory(), InventoryService.listInventory()]);
      setCategories(Array.isArray(cats) ? cats : cats?.results || []);
      setItems(Array.isArray(inv) ? inv : inv?.results || []);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setError(extractError(err, "Failed to load inventory items."));
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  const loadMaterials = useCallback(async (orderId) => {
    if (!orderId) {
      setMaterials({ items: [], total_estimated_cost: 0, planned_cost: 0, dispensed_cost: 0 });
      return;
    }
    setMaterialsLoading(true);
    try {
      const data = await OrderService.getOrderMaterials(orderId);
      setMaterials({
        items: data?.items || [],
        total_estimated_cost: data?.total_estimated_cost ?? 0,
        planned_cost: data?.planned_cost ?? 0,
        dispensed_cost: data?.dispensed_cost ?? 0,
      });
    } catch (err) {
      console.error("Failed to load materials:", err);
      setError(extractError(err, "Failed to load the materials list."));
    } finally {
      setMaterialsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadInventory();
  }, [loadOrders, loadInventory]);

  useEffect(() => {
    loadMaterials(selectedOrderId);
  }, [selectedOrderId, loadMaterials]);

  const selectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setError("");
    if (orderId) {
      setSearchParams({ order: orderId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.order_title?.toLowerCase().includes(q) ||
        o.client_full_name?.toLowerCase().includes(q) ||
        o.slug?.toLowerCase().includes(q)
    );
  }, [orders, orderSearch]);

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" ||
        (item.category && String(item.category) === String(selectedCategory)) ||
        item.category_name === selectedCategory;
      const matchesSearch = !q || item.item_name?.toLowerCase().includes(q) || item.sku?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, itemSearch]);

  const handleAddMaterial = async (item) => {
    if (!selectedOrderId) return;
    const quantity = parseInt(qtyDrafts[item.id], 10);
    if (!quantity || quantity < 1) {
      setError("Enter a quantity of at least 1 before adding.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await OrderService.addOrderMaterial(selectedOrderId, { inventory: item.id, quantity });
      setQtyDrafts((prev) => ({ ...prev, [item.id]: "" }));
      await Promise.all([loadMaterials(selectedOrderId), loadInventory()]);
    } catch (err) {
      console.error("Add material failed:", err);
      setError(extractError(err, "Failed to add the material."));
    } finally {
      setBusy(false);
    }
  };

  const handleDispense = async (material) => {
    if (!window.confirm(`Dispense ${material.quantity} ${material.unit_of_measurement || "unit(s)"} of ${material.material_name}? Stock will be deducted.`)) return;
    setBusy(true);
    setError("");
    try {
      await OrderService.dispenseOrderMaterial(material.id);
      await Promise.all([loadMaterials(selectedOrderId), loadInventory()]);
    } catch (err) {
      console.error("Dispense failed:", err);
      setError(extractError(err, "Failed to dispense the material."));
    } finally {
      setBusy(false);
    }
  };

  const plannedItems = useMemo(() => materials.items.filter((m) => m.status === "planned"), [materials.items]);

  const handleDispenseAll = async () => {
    if (!plannedItems.length) return;
    setBusy(true);
    setError("");
    try {
      await OrderService.dispenseAllOrderMaterials(selectedOrderId);
      setShowDispenseAllModal(false);
      await Promise.all([loadMaterials(selectedOrderId), loadInventory()]);
    } catch (err) {
      console.error("Dispense-all failed:", err);
      setError(extractError(err, "Failed to dispense all materials."));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (material) => {
    if (!window.confirm(`Remove ${material.material_name} from the materials list?`)) return;
    setBusy(true);
    setError("");
    try {
      await OrderService.deleteOrderMaterial(material.id);
      await loadMaterials(selectedOrderId);
    } catch (err) {
      console.error("Delete failed:", err);
      setError(extractError(err, "Failed to remove the material."));
    } finally {
      setBusy(false);
    }
  };

  const categoryName = (idOrName) => {
    const found = categories.find((c) => String(c.id) === String(idOrName));
    return found?.name || idOrName || "Uncategorised";
  };

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-semibold">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1 — pick an assigned order */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList size={18} className="text-[#7A5AF8]" />
              1. Select an assigned order
            </h3>
            <p className="text-xs text-gray-500 mt-1">Only assigned, in-progress or QA check orders can receive materials.</p>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search orders or clients..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]/40"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {ordersLoading ? (
              <p className="text-sm text-gray-400 py-4 text-center">Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No assigned orders found.</p>
            ) : (
              filteredOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => selectOrder(order.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition ${
                    order.id === selectedOrderId
                      ? "border-[#7A5AF8] bg-[#7A5AF8]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">{order.order_title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${ORDER_STATUS_STYLES[order.order_status] || "bg-gray-100 text-gray-600"}`}>
                      {order.order_status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {order.client_full_name} · {order.order_category_name}
                  </p>
                </button>
              ))
            )}
          </div>

          {selectedOrder && (
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <UserCheck size={16} className="text-emerald-600" />
                <span className="font-medium">{selectedOrder.assigned_to?.staff_name || "Unassigned"}</span>
                {selectedOrder.assigned_to?.role && (
                  <span className="text-xs text-gray-400">· {selectedOrder.assigned_to.role}</span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Due {selectedOrder.end_date || "—"} · {formatCurrency(selectedOrder.order_price)}
              </p>
            </div>
          )}
        </div>

        {/* Step 2 — add materials from inventory */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <PackagePlus size={18} className="text-[#7A5AF8]" />
              2. Add materials needed
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {selectedOrder
                ? `Adding to "${selectedOrder.order_title}" — quantities are estimates; stock is only deducted when you dispense.`
                : "Select an order first to start building its materials list."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedOrderId}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]/40 disabled:bg-gray-50"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                disabled={!selectedOrderId}
                placeholder="Search inventory items..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]/40 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {!selectedOrderId ? (
              <p className="text-sm text-gray-400 py-8 text-center">Waiting for an order selection.</p>
            ) : inventoryLoading ? (
              <p className="text-sm text-gray-400 py-8 text-center">Loading inventory...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No inventory items match.</p>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="py-2.5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[160px]">
                    <p className="text-sm font-medium text-gray-900">{item.item_name}</p>
                    <p className="text-xs text-gray-500">
                      {categoryName(item.category)} · {formatCurrency(item.unit_cost)} / {item.unit_of_measurement} ·{" "}
                      <span className={item.is_low_stock ? "text-amber-600 font-medium" : ""}>{item.quantity} in stock</span>
                    </p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={qtyDrafts[item.id] || ""}
                    onChange={(e) => setQtyDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="Qty"
                    disabled={!selectedOrderId}
                    className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]/40"
                  />
                  <button
                    onClick={() => handleAddMaterial(item)}
                    disabled={busy || !selectedOrderId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7A5AF8] text-white text-sm font-medium hover:bg-[#6a4be0] disabled:opacity-50"
                  >
                    <PackagePlus size={14} />
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Step 3 — materials list & cost estimate */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-[#7A5AF8]" />
              3. Materials list &amp; cost estimate
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {selectedOrder ? selectedOrder.order_title : "No order selected"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedOrderId && plannedItems.length > 0 && (
              <button
                onClick={() => setShowDispenseAllModal(true)}
                disabled={busy}
                title="Dispense every planned line to the assignee and deduct stock"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send size={14} /> Dispense All
              </button>
            )}
            <button
              onClick={() => selectedOrderId && loadMaterials(selectedOrderId)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#7A5AF8]/5 border border-[#7A5AF8]/20 px-4 py-3">
            <p className="text-xs text-gray-500">Total estimated cost</p>
            <p className="text-xl font-bold text-[#7A5AF8]">{formatCurrency(materials.total_estimated_cost)}</p>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-xs text-gray-500">Planned (not yet dispensed)</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(materials.planned_cost)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <p className="text-xs text-gray-500">Dispensed</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(materials.dispensed_cost)}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">Material</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Qty</th>
                <th className="py-2 pr-4 font-medium">Unit cost</th>
                <th className="py-2 pr-4 font-medium">Line total</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {materialsLoading ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-400">
                    Loading materials...
                  </td>
                </tr>
              ) : materials.items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-400">
                    {selectedOrderId ? "No materials added yet." : "Select an order to see its materials."}
                  </td>
                </tr>
              ) : (
                materials.items.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 pr-4 font-medium text-gray-900">
                      {m.material_name}
                      {m.inventory_sku ? <span className="block text-xs text-gray-400">SKU {m.inventory_sku}</span> : null}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600">{m.category_name || "—"}</td>
                    <td className="py-2.5 pr-4 text-gray-900">
                      {m.quantity} <span className="text-gray-400">{m.unit_of_measurement}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600">{formatCurrency(m.unit_cost)}</td>
                    <td className="py-2.5 pr-4 font-semibold text-gray-900">{formatCurrency(m.line_cost)}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[m.status] || "bg-gray-100 text-gray-600"}`}>
                        {m.status}
                      </span>
                      {m.status === "dispensed" && m.dispensed_to_name && (
                        <span className="block text-xs text-gray-400 mt-0.5">to {m.dispensed_to_name}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      {m.status === "planned" ? (
                        <>
                          <button
                            onClick={() => handleDispense(m)}
                            disabled={busy}
                            title="Dispense to the assignee and deduct stock"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 mr-2"
                          >
                            <Send size={12} /> Dispense
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            disabled={busy}
                            title="Remove from list"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DispenseAllConfirmationModal
        isOpen={showDispenseAllModal}
        onClose={() => setShowDispenseAllModal(false)}
        onConfirm={handleDispenseAll}
        isLoading={busy}
        lineCount={plannedItems.length}
        totalQuantity={plannedItems.reduce((sum, m) => sum + m.quantity, 0)}
        totalValue={formatCurrency(plannedItems.reduce((sum, m) => sum + Number(m.line_cost || 0), 0))}
      />
    </div>
  );
};

export default OrderMaterialsManager;
