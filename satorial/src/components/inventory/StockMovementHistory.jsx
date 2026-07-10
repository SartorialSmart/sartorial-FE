import { useState, useEffect, useMemo } from "react";
import {
  ArrowDownCircle, ArrowUpCircle, ArrowRightCircle, RotateCcw, Edit3,
  Search, Filter, Loader2, Package, TrendingUp, TrendingDown, Activity,
} from "lucide-react";
import StockMovementService from "../../services/StockMovementService";
import { toast } from "react-toastify";

const MOVEMENT_TYPES = {
  stock_in: { label: "Stock In", icon: ArrowDownCircle, color: "text-green-600", bg: "bg-green-50", sign: "+" },
  dispense: { label: "Dispense", icon: ArrowUpCircle, color: "text-red-600", bg: "bg-red-50", sign: "-" },
  transfer: { label: "Transfer", icon: ArrowRightCircle, color: "text-blue-600", bg: "bg-blue-50", sign: "" },
  adjustment: { label: "Adjustment", icon: Edit3, color: "text-yellow-600", bg: "bg-yellow-50", sign: "" },
  return: { label: "Return", icon: RotateCcw, color: "text-purple-600", bg: "bg-purple-50", sign: "+" },
};

const StockMovementHistory = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      try {
        const data = await StockMovementService.listMovements();
        setMovements(Array.isArray(data) ? data : data.results || []);
      } catch {
        toast.error("Failed to load stock movements.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, []);

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.inventory_item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.inventory_sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.performed_by_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.reason?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || m.movement_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [movements, searchQuery, typeFilter]);

  const stats = useMemo(() => {
    const inbound = movements.filter((m) => m.movement_type === "stock_in" || m.movement_type === "return");
    const outbound = movements.filter((m) => m.movement_type === "dispense");
    return {
      total: movements.length,
      inboundQty: inbound.reduce((sum, m) => sum + Math.abs(m.quantity), 0),
      outboundQty: outbound.reduce((sum, m) => sum + Math.abs(m.quantity), 0),
    };
  }, [movements]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Movement History</h1>
        <p className="text-gray-600">Complete audit trail of all inventory movements</p>
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
            <p className="text-sm mt-1">Stock movements will appear here as they occur</p>
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
                        <div className="font-medium text-gray-900 text-sm">{m.inventory_item_name}</div>
                        {m.inventory_sku && <div className="text-xs text-gray-500">{m.inventory_sku}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold text-sm ${m.quantity >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {config.sign}{Math.abs(m.quantity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{m.from_location_name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{m.to_location_name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{m.performed_by_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{m.reason}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{formatDate(m.created_at)}</div>
                        <div className="text-xs text-gray-400">{formatTime(m.created_at)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMovementHistory;
