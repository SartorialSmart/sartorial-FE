import { useEffect, useState, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import {
  MoreVertical,
  Search,
  Download,
  Eye,
  Plus,
  Users,
  Factory,
  AlertCircle,
  Clock,
  CheckCircle,
  Package,
  UserPlus,
  X,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductionService from "../../services/ProductionService";
import AddProductionOrderFormModal from "../modals/formModals/AddProductionOrderFormModal";
import AssignProductionModal from "../allocationModals/AssignProductionModal";
import ProductionQAModal from "../allocationModals/ProductionQAModal";
import AddProductionToInventoryModal from "../allocationModals/AddProductionToInventoryModal";
import LocationFilter from "../filters/LocationFilter";
import { usePermissions } from "../../utils/permissions";
import {
  PRODUCTION_ORDER_STATUSES,
  getProductionOrderStatusStyle,
  getProductionProgress,
} from "../../constants/productionConstants";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ProductionOrderList = ({ searchTerm }) => {
  const { canPerform } = usePermissions();
  const canManage = canPerform("production", "manage_production");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [location, setLocation] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  const dropdownRefs = useRef([]);
  const buttonRefs = useRef([]);

  useEffect(() => {
    if (searchTerm !== undefined) setSearchQuery(searchTerm);
  }, [searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (location) params.location = location;
      const data = await ProductionService.listOrders(params);
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setOrders(list);
      dropdownRefs.current = new Array(list.length).fill(null);
      buttonRefs.current = new Array(list.length).fill(null);
    } catch {
      setError("Failed to load production orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown !== null) {
        const dropdown = dropdownRefs.current[activeDropdown];
        const button = buttonRefs.current[activeDropdown];
        if (
          dropdown &&
          !dropdown.contains(event.target) &&
          button &&
          !button.contains(event.target)
        ) {
          setActiveDropdown(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const getDropdownPosition = (index) => {
    if (!buttonRefs.current[index]) return {};
    const button = buttonRefs.current[index];
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    if (spaceBelow < 160) {
      return {
        position: "fixed",
        bottom: viewportHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      };
    }
    return {
      position: "fixed",
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    };
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((order) =>
        [
          order.title,
          order.description,
          order.status,
          order.category_name,
          String(order.id),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }
    return result;
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const inProgress = orders.filter((o) => o.status === "In Progress").length;
    const qa = orders.filter((o) => o.status === "QA Check").length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;
    const totalUnits = orders.reduce(
      (sum, o) => sum + (Number(o.total_quantity) || 0),
      0
    );
    return {
      totalOrders,
      pending,
      inProgress,
      qa,
      completed,
      cancelled,
      totalUnits,
    };
  }, [orders]);

  const handleExport = () => {
    const csvContent = [
      ["Title", "Category", "Status", "Total Quantity", "Progress", "Created", "Target"],
      ...filteredOrders.map((order) => [
        `"${order.title || ""}"`,
        `"${order.category_name || order.category || ""}"`,
        `"${order.status || ""}"`,
        order.total_quantity,
        `${getProductionProgress(order)}%`,
        `"${formatDate(order.order_created_at)}"`,
        `"${formatDate(order.target_completion_date)}"`,
      ]),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `production_orders_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Production Orders
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage ready-made clothing production runs
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Add Production Order
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
            icon={<Factory className="text-blue-600" size={20} />}
            sub={`${stats.totalUnits} units`}
            bg="from-blue-100 to-blue-200"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock className="text-amber-600" size={20} />}
            bg="from-amber-100 to-amber-200"
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={<Package className="text-purple-600" size={20} />}
            bg="from-purple-100 to-purple-200"
          />
          <StatCard
            label="QA Check"
            value={stats.qa}
            icon={<CheckCircle className="text-cyan-600" size={20} />}
            bg="from-cyan-100 to-cyan-200"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle className="text-emerald-600" size={20} />}
            bg="from-emerald-100 to-emerald-200"
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            icon={<X className="text-red-600" size={20} />}
            bg="from-red-100 to-red-200"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search production orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <LocationFilter value={location} onChange={setLocation} className="min-w-44" />
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg pr-8 outline-none cursor-pointer min-w-36 text-sm font-medium"
                >
                  <option value="all">All Statuses</option>
                  {PRODUCTION_ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
                  size={15}
                />
              </div>
              <button
                onClick={handleExport}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                title="Export CSV"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-2">
          <p className="text-gray-600 font-medium">
            Showing{" "}
            <span className="font-bold text-gray-900">{filteredOrders.length}</span> of{" "}
            <span className="font-bold text-gray-900">{orders.length}</span> production orders
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4 text-sm">Loading production orders...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold text-base mb-1">
                Failed to load production orders
              </p>
              <p className="text-sm text-gray-500 mb-5">{error}</p>
              <button
                onClick={fetchOrders}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {orders.length === 0
                  ? "No production orders created yet"
                  : "No production orders found"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {orders.length === 0
                  ? "Get started by creating your first production order."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="p-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Production Order
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Target Date
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order, index) => {
                    const progress = getProductionProgress(order);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="px-3 py-3">
                          <Link
                            to={`/production/detail/${order.id}`}
                            className="flex items-center gap-2.5 min-w-44 group"
                          >
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shrink-0">
                              <Factory size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600">
                                {order.title || `Production #${order.id}`}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {Array.isArray(order.assignments) &&
                                order.assignments.length > 0
                                  ? `${order.assignments.length} staff assigned`
                                  : "No staff assigned"}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-gray-600">
                            {order.category_name || order.category || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {Number(order.total_quantity) || 0}
                          </span>
                          <span className="text-xs text-gray-400"> units</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700">
                              {progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-gray-600">
                            {formatDate(order.target_completion_date)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getProductionOrderStatusStyle(order.status)}`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            ref={(el) => (buttonRefs.current[index] = el)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 border border-gray-200"
                            onClick={() =>
                              setActiveDropdown((prev) => (prev === index ? null : index))
                            }
                          >
                            <MoreVertical size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {activeDropdown !== null && filteredOrders[activeDropdown] && (
          <div
            ref={(el) => (dropdownRefs.current[activeDropdown] = el)}
            className="w-64 bg-white shadow-2xl border-2 border-gray-200 rounded-2xl py-2 z-50"
            style={getDropdownPosition(activeDropdown)}
          >
            <ul className="text-sm">
              <li>
                <Link
                  to={`/production/detail/${filteredOrders[activeDropdown]?.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">View Details</p>
                    <p className="text-xs text-gray-500">See full production info</p>
                  </div>
                </Link>
              </li>
              {canManage && ["Pending", "In Progress"].includes(filteredOrders[activeDropdown]?.status) && (
                <li>
                  <button
                    onClick={() => {
                      setSelectedOrder(filteredOrders[activeDropdown]);
                      setShowAssignModal(true);
                      setActiveDropdown(null);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 w-full text-left transition-all"
                  >
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <UserPlus size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Assign Staff</p>
                      <p className="text-xs text-gray-500">Batch-assign to staff</p>
                    </div>
                  </button>
                </li>
              )}
              {canManage && filteredOrders[activeDropdown]?.status === "QA Check" && (
                <>
                  <li>
                    <button
                      onClick={() => {
                        setSelectedOrder(filteredOrders[activeDropdown]);
                        setShowQAModal(true);
                        setActiveDropdown(null);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 w-full text-left transition-all"
                    >
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <CheckCircle size={16} className="text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Run QA Check</p>
                        <p className="text-xs text-gray-500">Quality assurance review</p>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setSelectedOrder(filteredOrders[activeDropdown]);
                        setShowInventoryModal(true);
                        setActiveDropdown(null);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 w-full text-left transition-all"
                    >
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Users size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Complete & Add to Inventory</p>
                        <p className="text-xs text-gray-500">Stock finished goods</p>
                      </div>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}

        {isModalOpen && (
          <AddProductionOrderFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              fetchOrders();
            }}
          />
        )}
        {showAssignModal && selectedOrder && (
          <AssignProductionModal
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            order={selectedOrder}
            onSuccess={fetchOrders}
          />
        )}
        {showQAModal && selectedOrder && (
          <ProductionQAModal
            isOpen={showQAModal}
            onClose={() => setShowQAModal(false)}
            order={selectedOrder}
            onSuccess={fetchOrders}
          />
        )}
        {showInventoryModal && selectedOrder && (
          <AddProductionToInventoryModal
            isOpen={showInventoryModal}
            onClose={() => setShowInventoryModal(false)}
            order={selectedOrder}
            onSuccess={fetchOrders}
          />
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, sub, bg }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-xs font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`p-2.5 bg-gradient-to-br ${bg} rounded-lg`}>{icon}</div>
    </div>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.node,
  sub: PropTypes.string,
  bg: PropTypes.string,
};

ProductionOrderList.propTypes = {
  searchTerm: PropTypes.string,
};

export default ProductionOrderList;
