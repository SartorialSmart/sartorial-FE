import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowDownCircle, ArrowUpCircle, ArrowRightCircle, RotateCcw, Edit3,
  Search, Filter, Loader2, Package, TrendingUp, TrendingDown, Activity,
  Plus, Trash2, MoreVertical, Calendar, X,
} from "lucide-react";
import StockMovementService from "../../services/StockMovementService";
import InventoryService from "../../services/InventoryService";
import AddStockMovementFormModal from "../modals/formModals/AddStockMovementFormModal";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { toast } from "react-toastify";

const MOVEMENT_TYPES = {
  stock_in: { label: "Stock In", icon: ArrowDownCircle, color: "text-green-600", bg: "bg-green-50", sign: "+" },
  dispense: { label: "Dispense", icon: ArrowUpCircle, color: "text-red-600", bg: "bg-red-50", sign: "-" },
  transfer: { label: "Transfer", icon: ArrowRightCircle, color: "text-blue-600", bg: "bg-blue-50", sign: "" },
  adjustment: { label: "Adjustment", icon: Edit3, color: "text-yellow-600", bg: "bg-yellow-50", sign: "" },
  return: { label: "Return", icon: RotateCcw, color: "text-purple-600", bg: "bg-purple-50", sign: "+" },
};

const LOCAL_KEY = "sartorial_stock_movements";

const getLocalMovements = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
};

const normalizeMovement = (m) => ({
  id: m.id || `gen-${Math.random().toString(36).slice(2)}`,
  _source: m._source || "api",
  movement_type: m.movement_type || "adjustment",
  inventory_item_name: m.inventory_item_name || m.item_name || m.inventory_name || m.inventory_item?.item_name || m.inventory_item?.name || "",
  inventory_sku: m.inventory_sku || m.sku || m.inventory_item?.sku || "",
  quantity: Number(m.quantity) || 0,
  from_location_name: m.from_location_name || m.from_location?.name || "",
  to_location_name: m.to_location_name || m.to_location?.name || "",
  performed_by_name: m.performed_by_name || m.performer_name || m.dispense_to_name || m.dispense_to || "",
  reason: m.reason || "",
  created_at: m.created_at || m.dispensed_at || m.date || m.updated_at || new Date().toISOString(),
});

const StockMovementHistory = () => {
  const [apiMovements, setApiMovements] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [localTick, setLocalTick] = useState(0);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const [rawMovements, dispenseData, inventoryData] = await Promise.allSettled([
        StockMovementService.listMovements(),
        InventoryService.listDispenseInventory(),
        InventoryService.listInventory(),
      ]);

      const items = [];

      if (rawMovements.status === "fulfilled") {
        const data = rawMovements.value;
        let arr = [];
        if (Array.isArray(data)) arr = data;
        else if (data?.results) arr = data.results;
        else if (data?.data) arr = data.data;
        else if (data?.items) arr = data.items;
        arr.forEach((m) => items.push(normalizeMovement({ ...m, _source: "movement" })));
      }

      if (dispenseData.status === "fulfilled") {
        const data = dispenseData.value;
        let arr = Array.isArray(data) ? data : data?.results || [];
        arr.forEach((d) => items.push(normalizeMovement({ ...d, _source: "dispense" })));
      }

      if (inventoryData.status === "fulfilled") {
        const data = inventoryData.value;
        let arr = Array.isArray(data) ? data : data?.results || [];
        setInventoryItems(arr);
        arr.forEach((item) => {
          if (item.quantity > 0) {
            items.push(normalizeMovement({
              id: `inv-stock-${item.id}`,
              _source: "inventory",
              inventory_item_name: item.item_name || item.name || "",
              inventory_sku: item.sku || "",
              quantity: item.quantity,
              performed_by_name: "",
              reason: "Current inventory stock",
              created_at: item.created_at || new Date().toISOString(),
              movement_type: "stock_in",
            }));
          }
          if (item.is_low_stock && item.quantity > 0) {
            items.push(normalizeMovement({
              id: `inv-low-${item.id}`,
              _source: "inventory",
              inventory_item_name: item.item_name || item.name || "",
              inventory_sku: item.sku || "",
              quantity: item.quantity,
              performed_by_name: "System",
              reason: `Low stock — ${item.quantity} ${item.unit_of_measurement || "pcs"} left`,
              created_at: item.updated_at || item.created_at || new Date().toISOString(),
              movement_type: "adjustment",
            }));
          }
        });
      }

      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setApiMovements(items);
    } catch {
      toast.error("Failed to load stock movements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // Merge API data with localStorage on every render so local changes always appear
  const allMovements = useMemo(() => {
    const local = getLocalMovements().map((m) => {
      const normalized = normalizeMovement({ ...m, _source: "local" });
      if (!normalized.inventory_item_name && inventoryItems.length > 0) {
        const match = inventoryItems.find((i) => String(i.id) === String(m.inventory || m.inventory_item || m.inventory_item_id));
        if (match) {
          normalized.inventory_item_name = match.item_name || match.name || "";
          normalized.inventory_sku = match.sku || "";
        }
      }
      return normalized;
    });
    const apiIds = new Set(apiMovements.map((i) => i.id));
    const merged = [...apiMovements];
    local.forEach((m) => {
      if (!apiIds.has(m.id)) merged.push(m);
    });
    merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return merged;
  }, [apiMovements, inventoryItems, localTick]);

  const hasActiveFilters = searchQuery || typeFilter !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortBy("date-desc");
  };

  const filtered = useMemo(() => {
    return allMovements.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.inventory_item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.inventory_sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.performed_by_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.reason?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || m.movement_type === typeFilter;
      const matchDateFrom = !dateFrom || new Date(m.created_at) >= new Date(dateFrom);
      const matchDateTo = !dateTo || new Date(m.created_at) <= new Date(dateTo + "T23:59:59");
      return matchesSearch && matchesType && matchDateFrom && matchDateTo;
    }).sort((a, b) => {
      const da = new Date(a.created_at);
      const db = new Date(b.created_at);
      switch (sortBy) {
        case "date-asc": return da - db;
        case "name-asc": return (a.inventory_item_name || "").localeCompare(b.inventory_item_name || "");
        case "name-desc": return (b.inventory_item_name || "").localeCompare(a.inventory_item_name || "");
        case "date-desc":
        default: return db - da;
      }
    });
  }, [allMovements, searchQuery, typeFilter, dateFrom, dateTo, sortBy]);

  const stats = useMemo(() => {
    const inbound = allMovements.filter((m) => m.movement_type === "stock_in" || m.movement_type === "return");
    const outbound = allMovements.filter((m) => m.movement_type === "dispense");
    return {
      total: allMovements.length,
      inboundQty: inbound.reduce((sum, m) => sum + Math.abs(m.quantity), 0),
      outboundQty: outbound.reduce((sum, m) => sum + Math.abs(m.quantity), 0),
    };
  }, [allMovements]);

  const handleEdit = (movement) => {
    setEditingMovement(movement);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      if (deleteConfirm._source === "movement") {
        await StockMovementService.deleteMovement(deleteConfirm.id);
      }
      if (deleteConfirm.id?.startsWith("local-")) {
        const existing = getLocalMovements().filter((m) => m.id !== deleteConfirm.id);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(existing));
        setLocalTick((t) => t + 1);
      }
      toast.success("Stock movement deleted.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete stock movement.");
    } finally {
      setDeleting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMovement(null);
    setLocalTick((t) => t + 1);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Movement History</h1>
          <p className="text-gray-600">Complete audit trail of all inventory movements</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          New Movement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl"><Activity className="w-6 h-6 text-blue-600" /></div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Movements</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl"><TrendingUp className="w-6 h-6 text-green-600" /></div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.inboundQty}</div>
            <div className="text-sm text-gray-500">Units Received</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl"><TrendingDown className="w-6 h-6 text-red-600" /></div>
          <div>
            <div className="text-2xl font-bold text-red-600">{stats.outboundQty}</div>
            <div className="text-sm text-gray-500">Units Dispensed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by item, SKU, person, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">All Types</option>
                {Object.entries(MOVEMENT_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Item A-Z</option>
              <option value="name-desc">Item Z-A</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <label className="text-xs text-gray-500 font-medium">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={14} />
                Clear Filters
              </button>
            )}
            <div className="text-xs text-gray-400 ml-auto">
              Showing {filtered.length} of {allMovements.length}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">Loading movements...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No movements found</p>
            <p className="text-sm mt-1">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Stock movements will appear here as they occur"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Item</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Qty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">From</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">To</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m) => {
                  const config = MOVEMENT_TYPES[m.movement_type] || MOVEMENT_TYPES.adjustment;
                  const Icon = config.icon;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {config.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm">{m.inventory_item_name || "—"}</div>
                        {m.inventory_sku && <div className="text-xs text-gray-500">{m.inventory_sku}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold text-sm ${m.quantity >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {config.sign}{Math.abs(m.quantity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{m.from_location_name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{m.to_location_name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{m.performed_by_name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{m.reason || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{formatDate(m.created_at)}</div>
                        <div className="text-xs text-gray-400">{formatTime(m.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        {(m._source === "movement" || m._source === "local") ? (
                          <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="p-2 rounded-full hover:bg-gray-200">
                              <MoreVertical size={16} />
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-10">
                                <div className="py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`${active ? "bg-gray-100" : ""} w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2`}
                                        onClick={() => handleEdit(m)}
                                      >
                                        <Edit3 size={14} /> Edit
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`${active ? "bg-gray-100" : ""} w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2`}
                                        onClick={() => setDeleteConfirm(m)}
                                      >
                                        <Trash2 size={14} /> Delete
                                      </button>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AddStockMovementFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={fetchMovements}
        initialValues={editingMovement}
        title={editingMovement ? "Edit Stock Movement" : "New Stock Movement"}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <Trash2 className="text-white w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Delete Stock Movement</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete this {MOVEMENT_TYPES[deleteConfirm.movement_type]?.label || "stock"} movement for &quot;{deleteConfirm.inventory_item_name}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovementHistory;
