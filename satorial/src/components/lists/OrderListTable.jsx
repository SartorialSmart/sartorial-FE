import { useEffect, useState, useRef, useMemo } from "react";
import { 
  MoreVertical, Search, Filter, Download, Eye, Edit, Truck, FileText, 
  Calendar, User, ChevronDown, X, Check, Loader2, SlidersHorizontal, 
  Plus, Users, CreditCard, Package, AlertCircle, BarChart3, RefreshCw,
  ShoppingBag, Clock, CheckCircle, XCircle, TrendingUp, Bell, UserCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import OrderService from "../../services/OrderService";
import TrackOrderStatusModal from "../modals/formModals/TrackOrderStatusModal";
import OrderInvoiceModal from "../modals/formModals/OrderInvoiceModal";
import AssignOrderModal from "../allocationModals/AssignOrderModal";

const columns = [
  { key: "client_full_name", label: "Client", sortable: true, icon: Users },
  { key: "order_title", label: "Order Details", sortable: true, icon: ShoppingBag },
  { key: "order_price", label: "Amount", sortable: true, icon: CreditCard },
  { key: "ordered_at", label: "Date", sortable: true, icon: Calendar },
  { key: "order_status", label: "Status", sortable: true, icon: BarChart3 },
  { key: "assignment_status", label: "Assignment", sortable: false, icon: UserCheck },
];

const formatAmount = (amount = 0) => `₦${Number(amount).toLocaleString()}`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getStatusClass = (status) => {
  const statusMap = {
    Pending: "bg-amber-50 text-amber-800 border-amber-200",
    Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    "In Progress": "bg-blue-50 text-blue-800 border-blue-200",
    Assigned: "bg-indigo-50 text-indigo-800 border-indigo-200",
    "On Delivery": "bg-purple-50 text-purple-800 border-purple-200",
    Delivered: "bg-teal-50 text-teal-800 border-teal-200",
    Cancelled: "bg-red-50 text-red-800 border-red-200",
    Processing: "bg-cyan-50 text-cyan-800 border-cyan-200",
  };
  return statusMap[status] || "bg-gray-50 text-gray-800 border-gray-200";
};

const OrderListTable = () => {
  // Data states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // UI states
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showOrderInvoiceModal, setShowOrderInvoiceModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [modalMode, setModalMode] = useState("assign");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refs
  const dropdownRefs = useRef([]);
  const buttonRefs = useRef([]);
  const filterRef = useRef(null);

  // Available filter options
  const statusOptions = [
    { value: "all", label: "All Statuses", color: "gray" },
    { value: "Pending", label: "Pending", color: "amber" },
    { value: "Processing", label: "Processing", color: "cyan" },
    { value: "In Progress", label: "In Progress", color: "blue" },
    { value: "Assigned", label: "Assigned", color: "indigo" },
    { value: "On Delivery", label: "On Delivery", color: "purple" },
    { value: "Delivered", label: "Delivered", color: "teal" },
    { value: "Completed", label: "Completed", color: "emerald" },
    { value: "Cancelled", label: "Cancelled", color: "red" },
  ];

  const dateOptions = [
    { value: "all", label: "All Time", icon: Calendar },
    { value: "today", label: "Today", icon: Clock },
    { value: "week", label: "This Week", icon: Calendar },
    { value: "month", label: "This Month", icon: Calendar },
    { value: "quarter", label: "This Quarter", icon: Calendar },
    { value: "year", label: "This Year", icon: Calendar },
  ];

  const amountOptions = [
    { value: "all", label: "All Amounts" },
    { value: "under_10k", label: "Under ₦10,000" },
    { value: "10k_50k", label: "₦10,000 - ₦50,000" },
    { value: "50k_100k", label: "₦50,000 - ₦100,000" },
    { value: "over_100k", label: "Over ₦100,000" },
  ];

  const tagOptions = [
    "Urgent",
    "VIP Client",
    "Repeat Customer",
    "New Client",
    "Bulk Order",
    "Express Delivery"
  ];

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrderService.getOrders();
      setOrders(data);
      dropdownRefs.current = new Array(data.length).fill(null);
      buttonRefs.current = new Array(data.length).fill(null);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  // Filter and sort logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order => {
        const searchableFields = [
          order.client_full_name,
          order.order_title,
          order.order_description,
          order.order_status,
          order.id?.toString(),
          order.client_email,
          order.client_phone
        ].filter(Boolean).join(" ").toLowerCase();
        return searchableFields.includes(query);
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => order.order_status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      result = result.filter(order => {
        const orderDate = new Date(order.ordered_at);
        
        switch (dateFilter) {
          case "today":
            return orderDate >= today;
          case "week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return orderDate >= weekStart;
          case "month":
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return orderDate >= monthStart;
          case "quarter":
            const quarter = Math.floor(today.getMonth() / 3);
            const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
            return orderDate >= quarterStart;
          case "year":
            const yearStart = new Date(today.getFullYear(), 0, 1);
            return orderDate >= yearStart;
          default:
            return true;
        }
      });
    }

    // Apply amount filter
    if (amountFilter !== "all") {
      result = result.filter(order => {
        const amount = Number(order.order_price) || 0;
        switch (amountFilter) {
          case "under_10k":
            return amount < 10000;
          case "10k_50k":
            return amount >= 10000 && amount <= 50000;
          case "50k_100k":
            return amount > 50000 && amount <= 100000;
          case "over_100k":
            return amount > 100000;
          default:
            return true;
        }
      });
    }

    // Apply tag filtering (simulated)
    if (selectedTags.length > 0) {
      result = result.filter(order => {
        return selectedTags.some(tag => 
          order.order_title?.toLowerCase().includes(tag.toLowerCase()) ||
          order.client_full_name?.toLowerCase().includes(tag.toLowerCase())
        );
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle numeric values
        if (sortConfig.key === 'order_price') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        }

        // Handle date values
        if (sortConfig.key === 'ordered_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        // Handle string values
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [orders, searchQuery, statusFilter, dateFilter, amountFilter, selectedTags, sortConfig]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAmount = orders.reduce((sum, order) => sum + (Number(order.order_price) || 0), 0);
    const pendingOrders = orders.filter(o => o.order_status === 'Pending').length;
    const completedOrders = orders.filter(o => o.order_status === 'Completed').length;
    const avgOrderValue = orders.length ? totalAmount / orders.length : 0;

    return {
      totalOrders: orders.length,
      totalAmount,
      pendingOrders,
      completedOrders,
      avgOrderValue,
      filterCount: filteredOrders.length
    };
  }, [orders, filteredOrders]);

  // Sort handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Row selection
  const toggleRowSelection = (id) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllRows = () => {
    if (selectedRows.size === filteredOrders.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredOrders.map(order => order.id)));
    }
  };

  // Dropdown handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown !== null) {
        const dropdown = dropdownRefs.current[activeDropdown];
        const button = buttonRefs.current[activeDropdown];
        if (dropdown && !dropdown.contains(event.target) && button && !button.contains(event.target)) {
          setActiveDropdown(null);
        }
      }
      if (showAdvancedFilters && filterRef.current && !filterRef.current.contains(event.target)) {
        setShowAdvancedFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown, showAdvancedFilters]);

  const toggleDropdown = (index) => {
    setActiveDropdown(prev => prev === index ? null : index);
  };

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
    } else {
      return {
        position: "fixed",
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      };
    }
  };

  // Action handlers
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

  const handleAssignClick = (order) => {
    setSelectedOrder(order);
    setModalMode("assign");
    setShowAssignModal(true);
    setActiveDropdown(null);
  };

  const handleReassignClick = (order) => {
    setSelectedOrder(order);
    setModalMode("reassign");
    setShowAssignModal(true);
    setActiveDropdown(null);
  };

  const handleAssign = async (payload) => {
    try {
      await OrderService.assignOrder(payload);
      await fetchOrders();
      setShowAssignModal(false);
    } catch (error) {
      console.error("Failed to assign order:", error);
      setError("Failed to assign order. Please try again.");
    }
  };

  // Tag handlers
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFilter("all");
    setAmountFilter("all");
    setSelectedTags([]);
    setSortConfig({ key: null, direction: 'asc' });
  };

  // Export function
  const handleExport = () => {
    const csvContent = [
      ["Client Name", "Order Title", "Amount", "Date", "Status", "Assignment Status"].join(","),
      ...filteredOrders.map(order => [
        `"${order.client_full_name}"`,
        `"${order.order_title}"`,
        order.order_price,
        `"${formatDate(order.ordered_at)}"`,
        `"${order.order_status}"`,
        `"${order.assignment_status || 'Not Assigned'}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Skeleton loader
  const SkeletonRow = () => (
    <tr className="border-b animate-pulse">
      <td className="p-4">
        <div className="w-5 h-5 bg-gray-200 rounded"></div>
      </td>
      {columns.map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </td>
      ))}
      <td className="p-4">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      </td>
    </tr>
  );

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Orders Management
            </h1>
            <p className="text-gray-600 mt-1">Manage and track all your orders efficiently</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshOrders}
              disabled={isRefreshing}
              className="p-2.5 hover:bg-white rounded-xl transition-all disabled:opacity-50 border border-gray-200 shadow-sm"
              title="Refresh orders"
            >
              <RefreshCw size={20} className={`text-gray-600 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleExport}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-gray-400 transition-all shadow-sm font-medium"
            >
              <Download size={16} />
              Export
            </button>
            <Link
              to="/order/create"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus size={18} />
              New Order
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-semibold text-blue-600">{stats.filterCount}</span> shown with filters
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₦{(stats.totalAmount / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-sm">
                <CreditCard className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              ₦{Math.round(stats.avgOrderValue).toLocaleString()} average
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingOrders}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-sm">
                <Clock className="text-amber-600" size={24} />
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {stats.totalOrders > 0 ? Math.round((stats.pendingOrders / stats.totalOrders) * 100) : 0}% of total
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedOrders}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl shadow-sm">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}% success rate
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders by client name, order title, status, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-medium shadow-sm ${
                  showAdvancedFilters || statusFilter !== "all" || dateFilter !== "all" || amountFilter !== "all" || selectedTags.length > 0
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline">Filters</span>
                {(statusFilter !== "all" || dateFilter !== "all" || amountFilter !== "all" || selectedTags.length > 0) && (
                  <span className="bg-white text-blue-600 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {[statusFilter !== "all", dateFilter !== "all", amountFilter !== "all", selectedTags.length > 0].filter(Boolean).length}
                  </span>
                )}
              </button>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border-2 border-gray-200 text-gray-700 px-5 py-3 rounded-xl hover:border-gray-300 transition-all pr-10 outline-none cursor-pointer min-w-40 font-medium shadow-sm"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" size={18} />
              </div>

              <button
                onClick={handleExport}
                className="sm:hidden px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white transition-all shadow-sm"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div ref={filterRef} className="mt-5 p-5 border-t-2 border-gray-100 animate-fadeIn bg-gray-50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar size={16} className="inline mr-2" />
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    {dateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <CreditCard size={16} className="inline mr-2" />
                    Order Amount
                  </label>
                  <select
                    value={amountFilter}
                    onChange={(e) => setAmountFilter(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    {amountOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FileText size={16} className="inline mr-2" />
                    Order Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.slice(0, 3).map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all font-medium ${
                          selectedTags.includes(tag)
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {selectedTags.includes(tag) && <Check size={12} className="inline mr-1" />}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(statusFilter !== "all" || dateFilter !== "all" || amountFilter !== "all" || selectedTags.length > 0) && (
                <div className="mt-6 pt-5 border-t-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {statusFilter !== "all" && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          Status: {statusOptions.find(s => s.value === statusFilter)?.label}
                          <button onClick={() => setStatusFilter("all")} className="hover:bg-blue-200 rounded-full p-0.5">
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {dateFilter !== "all" && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          Date: {dateOptions.find(d => d.value === dateFilter)?.label}
                          <button onClick={() => setDateFilter("all")} className="hover:bg-purple-200 rounded-full p-0.5">
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {amountFilter !== "all" && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Amount: {amountOptions.find(a => a.value === amountFilter)?.label}
                          <button onClick={() => setAmountFilter("all")} className="hover:bg-green-200 rounded-full p-0.5">
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {selectedTags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                          {tag}
                          <button onClick={() => toggleTag(tag)} className="hover:bg-indigo-200 rounded-full p-0.5">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-4">
            <p className="text-gray-600 font-medium">
              Showing <span className="font-bold text-gray-900">{filteredOrders.length}</span> of{" "}
              <span className="font-bold text-gray-900">{stats.totalOrders}</span> orders
            </p>
            {searchQuery && (
              <p className="text-sm text-gray-500">
                Results for: <span className="font-semibold text-gray-700">"{searchQuery}"</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <span className="text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-full">
                {selectedRows.size} selected
              </span>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-6 font-medium text-lg">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center">
              <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
              <p className="text-gray-900 font-semibold text-xl mb-2">Failed to load orders</p>
              <p className="text-gray-600 mb-8">{error}</p>
              <button
                onClick={refreshOrders}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md font-medium"
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center">
              <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {orders.length === 0 ? "No orders created yet" : "No orders found"}
              </h3>
              <p className="text-gray-600 mb-8">
                {orders.length === 0 
                  ? "Get started by creating your first order." 
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              {(searchQuery || statusFilter !== "all" || dateFilter !== "all") && (
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === filteredOrders.length && filteredOrders.length > 0}
                        onChange={selectAllRows}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="p-4 text-left text-sm font-bold text-gray-900"
                      >
                        <button
                          onClick={() => col.sortable && handleSort(col.key)}
                          className={`flex items-center gap-2 ${col.sortable ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                        >
                          {col.icon && <col.icon size={16} className="text-gray-500" />}
                          {col.label}
                          {col.sortable && (
                            <span className="text-gray-400 font-normal">
                              {sortConfig.key === col.key 
                                ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                                : '↕'
                              }
                            </span>
                          )}
                        </button>
                      </th>
                    ))}
                    <th className="p-4 text-sm font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order, index) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all ${
                        selectedRows.has(order.id) ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(order.id)}
                          onChange={() => toggleRowSelection(order.id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md text-lg">
                            {order.client_full_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{order.client_full_name}</p>
                            <p className="text-xs text-gray-500 font-mono">ID: {order.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-900">{order.order_title}</p>
                          {order.order_description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {order.order_description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-gray-400" />
                          <p className="font-bold text-gray-900">{formatAmount(order.order_price)}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <div>
                            <p className="text-gray-700 font-medium">{formatDate(order.ordered_at)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.ordered_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 shadow-sm ${getStatusClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          {order.assignment_status === "Assigned" ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                              <span className="text-sm text-gray-700 font-medium">Assigned</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
                              <span className="text-sm text-gray-500">Not Assigned</span>
                            </div>
                          )}
                          
                          {/* CRITICAL FIX: Assign button only for Pending orders */}
                          {!order.assignment_status && order.order_status === "Pending" && (
                            <button
                              onClick={() => handleAssignClick(order)}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm font-medium flex items-center gap-1.5"
                            >
                              <UserCheck size={14} />
                              Assign
                            </button>
                          )}
                          
                          {/* CRITICAL FIX: Reassign button for all other statuses except Cancelled */}
                          {order.assignment_status && order.order_status !== "Cancelled" && (
                            <button
                              onClick={() => handleReassignClick(order)}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm font-medium flex items-center gap-1.5"
                            >
                              <RefreshCw size={14} />
                              Reassign
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          ref={(el) => (buttonRefs.current[index] = el)}
                          className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 relative shadow-sm border border-gray-200"
                          onClick={() => toggleDropdown(index)}
                        >
                          <MoreVertical size={18} />
                          {index === activeDropdown && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Dropdown */}
        {activeDropdown !== null && filteredOrders[activeDropdown] && (
          <div
            ref={(el) => (dropdownRefs.current[activeDropdown] = el)}
            className="w-64 bg-white shadow-2xl border-2 border-gray-200 rounded-2xl py-2 z-50"
            style={getDropdownPosition(activeDropdown)}
          >
            <ul className="text-sm">
              <li>
                <Link
                  to={`/order/detail/${filteredOrders[activeDropdown]?.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">View Order</p>
                    <p className="text-xs text-gray-500">See full details</p>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to={`/order/edit/${filteredOrders[activeDropdown]?.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Edit size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Edit Order</p>
                    <p className="text-xs text-gray-500">Modify order details</p>
                  </div>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => handleTrackOrder(filteredOrders[activeDropdown])}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer w-full text-left transition-all"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Track Order</p>
                    <p className="text-xs text-gray-500">View order progress</p>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOrderInvoice(filteredOrders[activeDropdown])}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer w-full text-left transition-all"
                >
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Generate Invoice</p>
                    <p className="text-xs text-gray-500">Create order invoice</p>
                  </div>
                </button>
              </li>
              {!filteredOrders[activeDropdown]?.assignment_status && filteredOrders[activeDropdown]?.order_status === "Pending" && (
                <li className="border-t-2 border-gray-100">
                  <button
                    onClick={() => handleAssignClick(filteredOrders[activeDropdown])}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer w-full text-left transition-all"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserCheck size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Assign Staff</p>
                      <p className="text-xs text-gray-500">Allocate to team member</p>
                    </div>
                  </button>
                </li>
              )}
              {filteredOrders[activeDropdown]?.assignment_status && filteredOrders[activeDropdown]?.order_status !== "Cancelled" && (
                <li className="border-t-2 border-gray-100">
                  <button
                    onClick={() => handleReassignClick(filteredOrders[activeDropdown])}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer w-full text-left transition-all"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <RefreshCw size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Reassign Staff</p>
                      <p className="text-xs text-gray-500">Change team member</p>
                    </div>
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Modals */}
        {showTrackModal && selectedOrder && (
          <TrackOrderStatusModal
            isOpen={showTrackModal}
            onClose={() => setShowTrackModal(false)}
            currentStatus={selectedOrder.order_status}
            orderId={selectedOrder.id}
          />
        )}

        {showOrderInvoiceModal && selectedOrder && (
          <OrderInvoiceModal
            isOpen={showOrderInvoiceModal}
            onClose={() => setShowOrderInvoiceModal(false)}
            order={selectedOrder}
          />
        )}

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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default OrderListTable;