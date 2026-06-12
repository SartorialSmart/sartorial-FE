import { useEffect, useState, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import {
  MoreVertical, Search, Filter, Download, Eye, Edit, Truck, FileText,
  Calendar, User, ChevronDown, X, Check, Loader2, SlidersHorizontal,
  Plus, Users, CreditCard, Package, AlertCircle, BarChart3, RefreshCw,
  ShoppingBag, Clock, CheckCircle, XCircle, TrendingUp, Bell,
  UserPlus, Repeat
} from "lucide-react";
import { Link } from "react-router-dom";
import OrderService from "../../services/OrderService";
import TrackOrderStatusModal from "../modals/formModals/TrackOrderStatusModal";
import OrderInvoiceModal from "../modals/formModals/OrderInvoiceModal";
import AssignOrderModal from "../allocationModals/AssignOrderModal";
import AddOrderFormModal from "../modals/formModals/AddOrderFormModal";
import { isReadyMadeOrder } from "../../../utils/orderUtils";

const columns = [
  { key: "client_full_name", label: "Client", sortable: true, icon: Users },
  { key: "invoice_number", label: "Invoice #", sortable: true, icon: FileText },
  { key: "order_title", label: "Details", sortable: true, icon: ShoppingBag },
  { key: "order_price", label: "Amount", sortable: true, icon: CreditCard },
  { key: "ordered_at", label: "Date", sortable: true, icon: Calendar },
  { key: "order_status", label: "Status", sortable: true, icon: BarChart3 },
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

const formatCurrencyDisplay = (amount = 0) => `${Number(amount).toLocaleString()}`;

const formatDisplayDate = (dateString) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDisplayTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const getClientName = (order) => {
  const rawName = order.client_full_name || order.client_name || "Unknown Client";
  return rawName.replace(/\s+/g, " ").trim();
};

const getInitials = (name) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "C";
  return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
};

const getPaymentState = (order) => {
  const price = Number(order.order_price) || 0;
  const paid = Number(order.total_paid ?? 0);
  const balance = Number(order.balance_amount ?? Math.max(price - paid, 0));

  if (price > 0 && balance <= 0) {
    return { label: "Fully Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle };
  }
  if (paid > 0) {
    return { label: "Partially Paid", className: "bg-amber-50 text-amber-700 border-amber-200", Icon: TrendingUp };
  }
  return { label: "Unpaid", className: "bg-red-50 text-red-700 border-red-200", Icon: XCircle };
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

const OrderListTable = ({ searchTerm, showAddButton = true, showEditAction = true, title = "Orders Management", clientView = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Data states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchTerm !== undefined) setSearchQuery(searchTerm);
  }, [searchTerm]);
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

  const handleStatusClick = (order) => {
    if (clientView) return;
    if (order.order_status === "Pending" && !order.assignment_status) {
      setSelectedOrder(order);
      setModalMode("assign");
      setShowAssignModal(true);
    } else if (order.assignment_status === "Assigned") {
      setSelectedOrder(order);
      setModalMode("reassign");
      setShowAssignModal(true);
    }
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
        `"${formatDisplayDate(order.ordered_at)}"`,
        `"${order.order_status}"`
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
    <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{clientView ? "View orders placed by this client" : "Manage and track all your orders efficiently"}</p>
          </div>
          {showAddButton && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow"
            >
              <Plus size={16} />
              Add Order
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalOrders}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                <ShoppingBag className="text-blue-600" size={20} />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <span className="font-semibold text-blue-600">{stats.filterCount}</span> shown with filters
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{(stats.totalAmount / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                <CreditCard className="text-green-600" size={20} />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {Math.round(stats.avgOrderValue).toLocaleString()} average
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.pendingOrders}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                <Clock className="text-amber-600" size={20} />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {stats.totalOrders > 0 ? Math.round((stats.pendingOrders / stats.totalOrders) * 100) : 0}% of total
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.completedOrders}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}% success rate
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all text-sm font-medium ${
                  showAdvancedFilters || statusFilter !== "all" || dateFilter !== "all" || amountFilter !== "all" || selectedTags.length > 0
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <SlidersHorizontal size={16} />
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
                  className="appearance-none bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-300 transition-all pr-8 outline-none cursor-pointer min-w-36 text-sm font-medium"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" size={15} />
              </div>

              <button
                onClick={handleExport}
                className="sm:hidden px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-all shadow-sm"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div ref={filterRef} className="mt-3 p-4 border-t border-gray-100 animate-fadeIn bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    <Calendar size={13} className="inline mr-1.5" />
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    <CreditCard size={13} className="inline mr-1.5" />
                    Order Amount
                  </label>
                  <select
                    value={amountFilter}
                    onChange={(e) => setAmountFilter(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    <Package size={13} className="inline mr-1.5" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {tagOptions.map(tag => (
                      <button
                        key={tag.value}
                        onClick={() => toggleTag(tag.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          selectedTags.includes(tag.value)
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(dateFilter !== "all" || amountFilter !== "all" || selectedTags.length > 0) && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-wrap gap-2">
                {dateFilter !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    Date: {dateOptions.find(d => d.value === dateFilter)?.label}
                    <button onClick={() => setDateFilter("all")} className="hover:bg-purple-200 rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {amountFilter !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Amount: {amountOptions.find(a => a.value === amountFilter)?.label}
                    <button onClick={() => setAmountFilter("all")} className="hover:bg-green-200 rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                    {tag}
                    <button onClick={() => toggleTag(tag)} className="hover:bg-indigo-200 rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
              >
                Clear all
              </button>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4 text-sm">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold text-base mb-1">Failed to load orders</p>
              <p className="text-sm text-gray-500 mb-5">{error}</p>
              <button
                onClick={refreshOrders}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all shadow text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {orders.length === 0 ? "No orders created yet" : "No orders found"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {orders.length === 0 
                  ? "Get started by creating your first order." 
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              {(searchQuery || statusFilter !== "all" || dateFilter !== "all") && (
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all shadow text-sm font-medium"
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
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === filteredOrders.length && filteredOrders.length > 0}
                        onChange={selectAllRows}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="p-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider"
                      >
                        <button
                          onClick={() => col.sortable && handleSort(col.key)}
                          className={`flex items-center gap-1 ${col.sortable ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                        >
                          {col.icon && <col.icon size={13} className="text-gray-500" />}
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
                    <th className="p-3 text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order, index) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-blue-50/40 transition-colors ${
                        selectedRows.has(order.id) ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(order.id)}
                          onChange={() => toggleRowSelection(order.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-44">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            {getInitials(getClientName(order))}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{getClientName(order)}</p>
                            {order.client_email && (
                              <p className="text-xs text-gray-500 truncate">{order.client_email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-sm font-mono font-semibold text-gray-700">{order.invoice_number || "—"}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-40">{order.order_title}</p>
                        {order.order_type && (
                          <p className="text-xs text-gray-400 mt-0.5">{order.order_type}</p>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <CreditCard size={13} className="text-gray-400 shrink-0" />
                          <span className="text-sm font-semibold text-gray-900">{formatCurrencyDisplay(order.order_price)}</span>
                        </div>
                        {(() => {
                          const payment = getPaymentState(order);
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${payment.className}`}>
                              <payment.Icon size={10} />
                              {payment.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-700">{formatDisplayDate(order.end_date || order.ordered_at)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {isReadyMadeOrder(order) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                              Ready
                            </span>
                          )}
                          {!clientView && !isReadyMadeOrder(order) && (order.order_status === "Pending" || order.assignment_status === "Assigned") ? (
                            <button
                              onClick={() => handleStatusClick(order)}
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 transition-all ${getStatusClass(order.order_status)}`}
                              title={order.assignment_status === "Assigned" ? "Click to reassign" : "Click to assign"}
                            >
                              {order.order_status}
                            </button>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusClass(order.order_status)}`}>
                              {order.order_status}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <button
                          ref={(el) => (buttonRefs.current[index] = el)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700 border border-gray-200"
                          onClick={() => toggleDropdown(index)}
                        >
                          <MoreVertical size={15} />
                          {index === activeDropdown && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
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
                  to={`/order/detail/${filteredOrders[activeDropdown]?.id}${clientView ? '?clientView=1' : ''}`}
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
              {showEditAction && (
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
              )}
              {!clientView && !isReadyMadeOrder(filteredOrders[activeDropdown]) && ["Pending", "Assigned", "In Progress"].includes(filteredOrders[activeDropdown]?.order_status) && (
                <li>
                  <button
                    onClick={() =>
                      filteredOrders[activeDropdown]?.order_status === "Pending"
                        ? handleAssignClick(filteredOrders[activeDropdown])
                        : handleReassignClick(filteredOrders[activeDropdown])
                    }
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer w-full text-left transition-all"
                  >
                    <div className="p-2 bg-amber-100 rounded-lg">
                      {filteredOrders[activeDropdown]?.order_status === "Pending" ? (
                        <UserPlus size={16} className="text-amber-600" />
                      ) : (
                        <Repeat size={16} className="text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {filteredOrders[activeDropdown]?.order_status === "Pending" ? "Assign Tailor" : "Reassign"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {filteredOrders[activeDropdown]?.order_status === "Pending" ? "Assign to staff member" : "Change staff assignment"}
                      </p>
                    </div>
                  </button>
                </li>
              )}
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
            isReadyMade={isReadyMadeOrder(selectedOrder)}
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

        {isModalOpen && (
          <AddOrderFormModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); fetchOrders(); }}
          />
        )}
      </div>

      <style>{`
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

OrderListTable.propTypes = {
  showAddButton: PropTypes.bool,
  showEditAction: PropTypes.bool,
  title: PropTypes.string,
  clientView: PropTypes.bool,
};

export default OrderListTable;
