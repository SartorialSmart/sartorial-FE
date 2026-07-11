import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Mail,
  User,
  Search,
  Download,
  MoreVertical,
  ChevronDown,
  Filter,
  Package,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import OrderService from "../../services/OrderService";
import OrderCategoryService from "../../services/OrderCategoryService";
import { formatDateCaption } from "../../../utils/reportUtils";

const FILTERS = [
  "All Time",
  "Today",
  "This Week",
  "This Month",
  "This Year",
  "Custom Date",
];

const STATUS_OPTIONS = [
  "all",
  "Pending",
  "Assigned",
  "In Progress",
  "QA Check",
  "On Delivery",
  "Completed",
  "Cancelled",
];

const OrderReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersData = await OrderService.getOrders();
        setOrders(
          Array.isArray(ordersData) ? ordersData : ordersData.orders || []
        );
        const categoriesData = await OrderCategoryService.getCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const matchDate = useCallback((order) => {
    if (selectedFilter === "All Time") return true;

    const orderDate = new Date(order.ordered_at || order.order_date || order.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (selectedFilter) {
      case "Today":
        return orderDate >= today;
      case "This Week": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return orderDate >= weekStart;
      }
      case "This Month": {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return orderDate >= monthStart;
      }
      case "This Year": {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return orderDate >= yearStart;
      }
      case "Custom Date": {
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(customStartDate);
        const end = new Date(customEndDate + "T23:59:59.999");
        return orderDate >= start && orderDate <= end;
      }
      default:
        return true;
    }
  }, [selectedFilter, customStartDate, customEndDate]);

  const dateFilteredOrders = useMemo(() => {
    return orders.filter(matchDate);
  }, [orders, matchDate]);

  const orderStats = useMemo(() => {
    const total = dateFilteredOrders.length;
    const assigned = dateFilteredOrders.filter(o => o.order_status === "Assigned").length;
    const inProgress = dateFilteredOrders.filter(o => o.order_status === "In Progress").length;
    const onDelivery = dateFilteredOrders.filter(o => o.order_status === "On Delivery").length;
    const completed = dateFilteredOrders.filter(o => o.order_status === "Completed").length;
    const cancelled = dateFilteredOrders.filter(o => o.order_status === "Cancelled").length;
    const qaCheck = dateFilteredOrders.filter(o => o.order_status === "QA Check").length;
    const pending = dateFilteredOrders.filter(o => o.order_status === "Pending").length;
    return { total, assigned, inProgress, onDelivery, completed, cancelled, qaCheck, pending };
  }, [dateFilteredOrders]);

  const filterLabel = formatDateCaption(selectedFilter, customStartDate, customEndDate);

  const cards = [
    {
      title: "Total Orders",
      value: orderStats.total,
      icon: <Package className="w-6 h-6" />,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      subtitle: filterLabel,
    },
    {
      title: "Assigned",
      value: orderStats.assigned,
      icon: <User className="w-6 h-6" />,
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      subtitle: filterLabel,
    },
    {
      title: "In Progress",
      value: orderStats.inProgress,
      icon: <Clock className="w-6 h-6" />,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      subtitle: filterLabel,
    },
    {
      title: "On Delivery",
      value: orderStats.onDelivery,
      icon: <Mail className="w-6 h-6" />,
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      subtitle: filterLabel,
    },
    {
      title: "Completed",
      value: orderStats.completed,
      icon: <CheckCircle className="w-6 h-6" />,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      subtitle: filterLabel,
    },
    {
      title: "Cancelled",
      value: orderStats.cancelled,
      icon: <XCircle className="w-6 h-6" />,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      subtitle: filterLabel,
    },
    {
      title: "QA Check",
      value: orderStats.qaCheck,
      icon: <AlertCircle className="w-6 h-6" />,
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      text: "text-cyan-700",
      subtitle: filterLabel,
    },
    {
      title: "Pending",
      value: orderStats.pending,
      icon: <AlertCircle className="w-6 h-6" />,
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-700",
      subtitle: filterLabel,
    },
  ];

  const filteredOrders = useMemo(() => {
    return dateFilteredOrders.filter((order) => {
      const matchesSearch =
        searchQuery === "" ||
        (order.client_full_name &&
          order.client_full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (order.order_title &&
          order.order_title.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        selectedStatus === "all" || order.order_status === selectedStatus;

      const matchesCategory = selectedCategory === "All" ||
        (order.order_category &&
          ((typeof order.order_category === "object" &&
            order.order_category.name === selectedCategory) ||
            order.order_category === selectedCategory));

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [dateFilteredOrders, searchQuery, selectedStatus, selectedCategory]);

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Client Name",
      "Order Name",
      "Amount",
      "Order Date",
      "Status",
      "Category",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((order) =>
        [
          `"${order.client_full_name || order.client_name || order.client || ""}"`,
          `"${order.order_title || order.order_name || order.name || ""}"`,
          `"₦${Number(order.order_price || order.amount || 0).toLocaleString()}"`,
          `"${order.ordered_at ? order.ordered_at.slice(0, 10) : order.order_date || order.date || ""}"`,
          `"${order.order_status || ""}"`,
          `"${typeof order.order_category === "object" ? order.order_category.name : order.order_category || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `order_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Report</h1>
            <p className="text-gray-600">
              Track and analyze order activities
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {selectedFilter === "Custom Date" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border-2 ${card.bg} ${card.border} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bg} ${card.text}`}>
                  {card.icon}
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${card.text}`}>
                    {card.value}
                  </div>
                  {card.subtitle && (
                    <div className="text-sm text-gray-500 mt-1">{card.subtitle}</div>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients or orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none min-w-40"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-4 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none min-w-40"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Status" : status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <button
              onClick={handleExport}
              disabled={filteredOrders.length === 0}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Search: &ldquo;{searchQuery}&rdquo;
              <button onClick={() => setSearchQuery("")} className="hover:text-blue-900">
                ×
              </button>
            </span>
          )}
          {selectedCategory !== "All" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory("All")} className="hover:text-green-900">
                ×
              </button>
            </span>
          )}
          {selectedStatus !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Status: {selectedStatus}
              <button onClick={() => setSelectedStatus("all")} className="hover:text-purple-900">
                ×
              </button>
            </span>
          )}
          {(searchQuery || selectedCategory !== "All" || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedStatus("all");
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{dateFilteredOrders.length}</span> orders
          {selectedFilter !== "All Time" && (
            <> for <span className="font-medium text-blue-600">{selectedFilter}</span></>
          )}
        </div>
        {filteredOrders.length > 0 && (
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-green-600">
              ₦{Number(dateFilteredOrders.reduce((sum, o) => sum + (parseFloat(o.order_price) || 0), 0)).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading order data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-2">⚠️</p>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left">
                <th className="p-6 w-12">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Client Name</th>
                <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Order Name</th>
                <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount</th>
                <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Order Date</th>
                <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Package className="w-12 h-12" />
                      <p className="text-lg font-medium">No orders found</p>
                      <p className="text-sm">
                        {searchQuery || selectedCategory !== "All" || selectedStatus !== "all"
                          ? "Try adjusting your search or filters"
                          : "No order data available"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr
                    key={order.id || index}
                    className="hover:bg-gray-50/50 transition-colors duration-150 group"
                  >
                    <td className="p-6 w-12">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 group-hover:border-gray-400"
                      />
                    </td>
                    <td className="p-6">
                      <div className="font-medium text-gray-900">
                        {order.client_full_name || order.client_name || order.client || "-"}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-gray-900">
                        {order.order_title || order.order_name || order.name || "-"}
                      </div>
                      {order.order_category && (
                        <div className="text-xs text-gray-400 mt-1">
                          {typeof order.order_category === "object"
                            ? order.order_category.name
                            : order.order_category}
                        </div>
                      )}
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.order_status === "Completed" ? "bg-green-100 text-green-800" :
                        order.order_status === "Cancelled" ? "bg-red-100 text-red-800" :
                        order.order_status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                        order.order_status === "On Delivery" ? "bg-orange-100 text-orange-800" :
                        order.order_status === "QA Check" ? "bg-cyan-100 text-cyan-800" :
                        order.order_status === "Assigned" ? "bg-purple-100 text-purple-800" :
                        order.order_status === "Pending" ? "bg-gray-100 text-gray-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.order_status || "-"}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-gray-900 text-lg">
                        ₦{Number(order.order_price || order.amount || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm text-gray-600">
                        {order.ordered_at
                          ? order.ordered_at.slice(0, 10)
                          : order.order_date || order.date || "-"}
                      </div>
                    </td>
                    <td className="p-6">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrderReport;
