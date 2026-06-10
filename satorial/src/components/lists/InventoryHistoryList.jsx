import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Package,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Clock,
  RefreshCw,
} from "lucide-react";
import InventoryService from "../../services/InventoryService";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const InventoryHistoryList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [dispensedItems, setDispensedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invData, dispData] = await Promise.all([
        InventoryService.listInventory(),
        InventoryService.listDispenseInventory(),
      ]);
      setInventoryItems(Array.isArray(invData) ? invData : []);
      setDispensedItems(Array.isArray(dispData) ? dispData : []);
    } catch {
      setError("Failed to load inventory history data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Build movement log from dispense records + current stock snapshots
  const movementLog = useMemo(() => {
    const logs = [];

    dispensedItems.forEach((item) => {
      logs.push({
        id: `disp-${item.id}`,
        date: item.dispensed_at || item.date || item.created_at,
        itemName: item.item_name || "-",
        type: "Dispensed",
        quantity: -(item.quantity_dispensed || item.quantity || 0),
        unit: item.unit || "pcs",
        reason: item.reason || "-",
        actor: item.dispense_to_name || item.dispense_to || "-",
        raw: item,
      });
    });

    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    return logs;
  }, [dispensedItems]);

  // Per-item statistics for sales trajectory
  const itemStats = useMemo(() => {
    const statsMap = {};

    inventoryItems.forEach((item) => {
      const name = item.item_name || item.itemName || "Unknown";
      if (!statsMap[name]) {
        statsMap[name] = {
          name,
          currentStock: 0,
          totalDispensed: 0,
          timesDispensed: 0,
          lastDispensed: null,
          lowStock: false,
          unitCost: 0,
          sellingPrice: 0,
        };
      }
      statsMap[name].currentStock += item.quantity || 0;
      statsMap[name].unitCost = parseFloat(item.unit_cost) || 0;
      statsMap[name].sellingPrice = parseFloat(item.selling_price) || 0;
      if (item.is_low_stock) {
        statsMap[name].lowStock = true;
      }
    });

    dispensedItems.forEach((item) => {
      const name = item.item_name || "Unknown";
      if (!statsMap[name]) {
        statsMap[name] = {
          name,
          currentStock: 0,
          totalDispensed: 0,
          timesDispensed: 0,
          lastDispensed: null,
          lowStock: false,
        };
      }
      statsMap[name].totalDispensed += item.quantity_dispensed || item.quantity || 0;
      statsMap[name].timesDispensed += 1;
      const d = item.dispensed_at || item.date || item.created_at;
      if (d && (!statsMap[name].lastDispensed || new Date(d) > new Date(statsMap[name].lastDispensed))) {
        statsMap[name].lastDispensed = d;
      }
    });

    return Object.values(statsMap).sort((a, b) => b.timesDispensed - a.timesDispensed);
  }, [inventoryItems, dispensedItems]);

  // Filtered log
  const filteredLog = useMemo(() => {
    let items = [...movementLog];

    if (typeFilter !== "All") {
      items = items.filter((item) => item.type === typeFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.itemName.toLowerCase().includes(term) ||
          item.reason.toLowerCase().includes(term) ||
          item.actor.toLowerCase().includes(term)
      );
    }

    if (sortBy === "date-desc") {
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "date-asc") {
      items.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "name-asc") {
      items.sort((a, b) => a.itemName.localeCompare(b.itemName));
    } else if (sortBy === "name-desc") {
      items.sort((a, b) => b.itemName.localeCompare(a.itemName));
    }

    return items;
  }, [movementLog, typeFilter, searchTerm, sortBy]);

  const totalMovements = movementLog.length;
  const totalDispensed = movementLog.reduce((sum, l) => sum + Math.abs(l.quantity), 0);
  const totalItems = inventoryItems.length;
  const lowStockCount = inventoryItems.filter((i) => i.is_low_stock).length;

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inventory History</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track movement of items in and out of stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-all">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-lg">
            <Package size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Items</p>
            <p className="text-xl font-bold text-gray-900">{totalItems}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-lg">
            <ShoppingCart size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Dispensed</p>
            <p className="text-xl font-bold text-gray-900">{totalDispensed}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-lg">
            <Clock size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Movements</p>
            <p className="text-xl font-bold text-gray-900">{totalMovements}</p>
          </div>
        </div>
        <div className={`bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3 ${lowStockCount > 0 ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
          <div className={`p-2.5 rounded-lg ${lowStockCount > 0 ? "bg-red-100" : "bg-gray-100"}`}>
            <BarChart3 size={20} className={lowStockCount > 0 ? "text-red-600" : "text-gray-400"} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Low Stock Items</p>
            <p className={`text-xl font-bold ${lowStockCount > 0 ? "text-red-700" : "text-gray-900"}`}>{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Product Sales Trajectory */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            Product Sales Trajectory
          </h3>
        </div>
        {loading ? (
          <div className="py-8 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mx-auto mb-2"></div>
            Loading trajectory data...
          </div>
        ) : itemStats.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No product data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Unit Cost</th>
                  <th className="pb-3 font-medium">Selling Price</th>
                  <th className="pb-3 font-medium">Profit</th>
                  <th className="pb-3 font-medium">Current Stock</th>
                  <th className="pb-3 font-medium">Total Dispensed</th>
                  <th className="pb-3 font-medium">Times Dispensed</th>
                  <th className="pb-3 font-medium">Last Dispensed</th>
                  <th className="pb-3 font-medium">Trajectory</th>
                </tr>
              </thead>
              <tbody>
                {itemStats.map((stat, idx) => {
                  const trajectory = stat.timesDispensed > 0
                    ? (stat.totalDispensed / stat.timesDispensed).toFixed(1)
                    : "0";
                  const turnoverRate = stat.currentStock > 0 && stat.totalDispensed > 0
                    ? ((stat.totalDispensed / (stat.currentStock + stat.totalDispensed)) * 100).toFixed(0)
                    : "0";

                  return (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 pr-4">
                        <span className="font-medium text-gray-900">{stat.name}</span>
                        {stat.lowStock && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            Low
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {stat.unitCost > 0 ? (
                          <span className="text-gray-700">₦{stat.unitCost.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {stat.sellingPrice > 0 ? (
                          <span className="text-gray-700">₦{stat.sellingPrice.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {stat.unitCost > 0 && stat.sellingPrice > 0 ? (
                          <span className={`font-semibold ${
                            stat.sellingPrice >= stat.unitCost
                              ? "text-green-600"
                              : "text-red-600"
                          }`}>
                            ₦{(stat.sellingPrice - stat.unitCost).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-semibold text-gray-900">{stat.currentStock}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-semibold text-amber-600">{stat.totalDispensed}</span>
                      </td>
                      <td className="py-3 pr-4">{stat.timesDispensed}x</td>
                      <td className="py-3 pr-4 text-gray-500">
                        {stat.lastDispensed ? formatShortDate(stat.lastDispensed) : "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                              style={{ width: `${Math.min(parseInt(turnoverRate), 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{turnoverRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Movement Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Movement Log
            </h3>
            <div className="flex items-center gap-3">
              {/* Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="All">All Types</option>
                <option value="Dispensed">Dispensed</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-52"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 mx-auto mb-3"></div>
            Loading movement log...
          </div>
        ) : filteredLog.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No movements found</p>
            <p className="text-sm mt-1">
              {searchTerm || typeFilter !== "All"
                ? "Try adjusting your search or filter"
                : "No inventory movements recorded yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Item</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Qty</th>
                  <th className="p-3 font-medium">Reason</th>
                  <th className="p-3 font-medium">Actor</th>
                </tr>
              </thead>
              <tbody>
                {filteredLog.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="p-3 text-gray-600 whitespace-nowrap">
                      {formatDate(entry.date)}
                    </td>
                    <td className="p-3 font-medium text-gray-900">{entry.itemName}</td>
                    <td className="p-3">
                      {entry.type === "Dispensed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <ArrowUpRight size={12} />
                          Dispensed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <ArrowDownLeft size={12} />
                          {entry.type}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-red-600">
                        {entry.quantity}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 max-w-[200px] truncate">
                      {entry.reason}
                    </td>
                    <td className="p-3 text-gray-600">{entry.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryHistoryList;
