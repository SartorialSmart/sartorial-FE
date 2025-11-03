import { useEffect, useState, useRef } from "react";
import { MoreVertical, Search, Filter, Download, Eye, Edit, Truck, FileText, Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";
import OrderService from "../../services/OrderService";
import TrackOrderStatusModal from "../modals/formModals/TrackOrderStatusModal";
import OrderInvoiceModal from "../modals/formModals/OrderInvoiceModal";
import AssignOrderModal from "../allocationModals/AssignOrderModal";

const columns = [
  { key: "client_full_name", label: "Client Name", sortable: true },
  { key: "order_title", label: "Order Name", sortable: true },
  { key: "order_price", label: "Amount (₦)", sortable: true },
  { key: "ordered_at", label: "Order Date", sortable: true },
  { key: "order_status", label: "Status", sortable: true },
  { key: "assignment_status", label: "Staff Assignment", sortable: false },
];

const formatAmount = (amount = 0) => `₦${Number(amount).toLocaleString()}`;
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusClass = (status) => {
  const statusMap = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
    "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
    Assigned: "bg-purple-100 text-purple-800 border-purple-200",
    Delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const OrderListTable = ({
  searchTerm,
  dateFilter,
  statusFilter,
  customDateRange,
  onSearchChange,
  onStatusFilterChange
}) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showOrderInvoiceModal, setShowOrderInvoiceModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [modalMode, setModalMode] = useState("assign");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [localSearch, setLocalSearch] = useState(searchTerm || "");
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter || "All");
  
  const dropdownRefs = useRef([]);
  const buttonRefs = useRef([]);

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await OrderService.getOrders();
        setOrders(data);
        setFilteredOrders(data);
        dropdownRefs.current = new Array(data.length).fill(null);
        buttonRefs.current = new Array(data.length).fill(null);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Enhanced filtering with better performance
  useEffect(() => {
    let filtered = [...orders];

    // Apply search filter
    if (localSearch) {
      const searchLower = localSearch.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.client_full_name?.toLowerCase().includes(searchLower) ||
          order.order_title?.toLowerCase().includes(searchLower) ||
          order.order_status?.toLowerCase().includes(searchLower) ||
          order.id?.toString().includes(searchLower)
      );
    }

    // Apply status filter
    if (localStatusFilter && localStatusFilter !== "All") {
      filtered = filtered.filter(
        (order) => order.order_status === localStatusFilter
      );
    }

    // Apply date filter
    if (dateFilter && dateFilter !== "All Time") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.ordered_at);

        switch (dateFilter) {
          case "Today":
            return orderDate >= today;
          case "This Week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return orderDate >= weekStart;
          case "This Month":
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return orderDate >= monthStart;
          case "This Year":
            const yearStart = new Date(today.getFullYear(), 0, 1);
            return orderDate >= yearStart;
          case "Custom":
            if (customDateRange?.start && customDateRange?.end) {
              const startDate = new Date(customDateRange.start);
              const endDate = new Date(customDateRange.end);
              endDate.setHours(23, 59, 59, 999);
              return orderDate >= startDate && orderDate <= endDate;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric values
        if (sortConfig.key === 'order_price') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        // Handle date values
        if (sortConfig.key === 'ordered_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Handle string values
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, localSearch, localStatusFilter, dateFilter, customDateRange, sortConfig]);

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Handle status filter change
  useEffect(() => {
    onStatusFilterChange?.(localStatusFilter);
  }, [localStatusFilter, onStatusFilterChange]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdown !== null &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown].contains(event.target) &&
        buttonRefs.current[activeDropdown] &&
        !buttonRefs.current[activeDropdown].contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Toggle dropdown visibility
  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  // Handle "Track Order" click
  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowTrackModal(true);
    setActiveDropdown(null);
  };

  const handleOrderInvoice = (order) => {
    setSelectedOrder(order);
    setShowOrderInvoiceModal(true);
    setActiveDropdown(null);
  };

  // Handle assign order click
  const handleAssignClick = (order) => {
    setSelectedOrder(order);
    setModalMode("assign");
    setShowAssignModal(true);
    setActiveDropdown(null);
  };

  // Handle assign order submission
  const handleAssign = async (payload) => {
    try {
      await OrderService.assignOrder(payload);
      // Refresh orders after assignment
      const data = await OrderService.getOrders();
      setOrders(data);
      setShowAssignModal(false);
    } catch (error) {
      console.error("Failed to assign order:", error);
    }
  };

  // Check if order is assigned
  const isOrderAssigned = (order) => {
    return order.assignment_status === "Assigned" || order.order_status === "Assigned";
  };

  // Get dropdown position based on button position
  const getDropdownPosition = (index) => {
    if (!buttonRefs.current[index]) return {};

    const button = buttonRefs.current[index];
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Calculate if dropdown should open above or below
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 160; // Approximate dropdown height

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      // Open above the button
      return {
        position: "fixed",
        bottom: viewportHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
        zIndex: 1000,
      };
    } else {
      // Open below the button (default)
      return {
        position: "fixed",
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
        zIndex: 1000,
      };
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setLocalSearch("");
    setLocalStatusFilter("All");
    onSearchChange?.("");
    onStatusFilterChange?.("All");
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(orders.map(order => order.order_status))].filter(Boolean);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order List</h2>
            <p className="text-gray-600 mt-1">
              Showing {filteredOrders.length} of {orders.length} orders
              {(localStatusFilter !== "All" || localSearch || dateFilter !== "All Time") && (
                <span className="text-blue-600 font-medium">
                  {localStatusFilter !== "All" && ` • Filtered by: ${localStatusFilter}`}
                  {localSearch && ` • Searching: "${localSearch}"`}
                  {dateFilter !== "All Time" && ` • Date: ${dateFilter}`}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Status Filter */}
            <select
              value={localStatusFilter}
              onChange={(e) => setLocalStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-32"
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            {/* Clear Filters Button */}
            {(localSearch || localStatusFilter !== "All") && (
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
              >
                <Filter size={18} />
                Clear Filters
              </button>
            )}
            
            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {orders.length === 0 ? "No orders created yet" : "No orders found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0 
                ? "Get started by creating your first order." 
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            {(localSearch || localStatusFilter !== "All") && (
              <button
                onClick={handleClearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="p-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && (
                          <span className="text-gray-400">
                            {sortConfig.key === col.key 
                              ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                              : '↕'
                            }
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="p-4 w-16 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {order.client_full_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.client_full_name}</p>
                          <p className="text-sm text-gray-500">ID: {order.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{order.order_title}</p>
                      {order.order_description && (
                        <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                          {order.order_description}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{formatAmount(order.order_price)}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <p className="text-gray-600">{formatDate(order.ordered_at)}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-between">
                        {isOrderAssigned(order) ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">Assigned</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-sm text-gray-600">Not Assigned</span>
                          </div>
                        )}
                        {!isOrderAssigned(order) && (
                          <button
                            onClick={() => handleAssignClick(order)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        ref={(el) => (buttonRefs.current[index] = el)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600"
                        onClick={() => toggleDropdown(index)}
                        aria-label="More options"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dropdown positioned outside table container */}
      {activeDropdown !== null && (
        <div
          ref={(el) => (dropdownRefs.current[activeDropdown] = el)}
          className="w-48 bg-white shadow-lg border border-gray-200 rounded-lg py-1"
          style={getDropdownPosition(activeDropdown)}
        >
          <ul className="text-sm text-gray-700">
            <li>
              <Link
                to={`/order/detail/${filteredOrders[activeDropdown]?.id}`}
                onClick={() => setActiveDropdown(null)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <Eye size={16} />
                View Order
              </Link>
            </li>
            <li>
              <Link
                to={`/order/edit/${filteredOrders[activeDropdown]?.id}`}
                onClick={() => setActiveDropdown(null)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <Edit size={16} />
                Edit Order
              </Link>
            </li>
            <li
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleTrackOrder(filteredOrders[activeDropdown])}
            >
              <Truck size={16} />
              Track Order
            </li>
            <li
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleOrderInvoice(filteredOrders[activeDropdown])}
            >
              <FileText size={16} />
              Generate Invoice
            </li>
            {!isOrderAssigned(filteredOrders[activeDropdown]) && (
              <li
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer border-t border-gray-100"
                onClick={() => handleAssignClick(filteredOrders[activeDropdown])}
              >
                <User size={16} />
                Assign Staff
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Track Order Modal */}
      {showTrackModal && selectedOrder && (
        <TrackOrderStatusModal
          isOpen={showTrackModal}
          onClose={() => setShowTrackModal(false)}
          currentStatus={selectedOrder.order_status}
          orderId={selectedOrder.id}
        />
      )}

      {/* Order Invoice Modal */}
      {showOrderInvoiceModal && selectedOrder && (
        <OrderInvoiceModal
          isOpen={showOrderInvoiceModal}
          onClose={() => setShowOrderInvoiceModal(false)}
          order={selectedOrder}
        />
      )}

      {/* Assign Order Modal */}
      {showAssignModal && selectedOrder && (
        <AssignOrderModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          order={selectedOrder}
          mode={modalMode}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
};

export default OrderListTable;