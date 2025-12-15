import { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  MoreVertical, 
  Eye, 
  Filter,
  Calendar,
  DollarSign,
  Users,
  Package,
  Loader2,
  ChevronDown,
  BarChart3
} from "lucide-react";
import ReportService from "../../services/ReportService";
import OrderService from "../../services/OrderService";
import OrderCategoryService from "../../services/OrderCategoryService";

const SalesReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalSales, setTotalSales] = useState(null);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Time filter options
  const timeFilters = [
    "Today",
    "Yesterday", 
    "This Week",
    "Last Week",
    "This Month",
    "Last Month",
    "This Quarter",
    "All Time"
  ];

  // Status options
  const statusOptions = [
    "all",
    "Pending",
    "Assigned", 
    "In Progress",
    "On Delivery",
    "Completed",
    "Cancelled"
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch total sales
        const salesData = await ReportService.getSalesByDuration();
        setTotalSales(
          salesData.total_sales ?? salesData.total_sales_amount ?? 0
        );
        
        // Fetch orders for table
        const ordersData = await OrderService.getOrders();
        setOrders(
          Array.isArray(ordersData) ? ordersData : ordersData.orders || []
        );
        
        // Fetch categories for filter dropdown
        const categoriesData = await OrderCategoryService.getCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load sales data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate additional metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.order_status === 'Completed').length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Enhanced filter logic
  const filteredOrders = orders.filter((order) => {
    // Search filter
    const matchesSearch = searchQuery === "" ||
      (order.client_full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.order_title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.order_description?.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = selectedCategory === "All" ||
      (order.order_category &&
        ((typeof order.order_category === "object" &&
          order.order_category.name === selectedCategory) ||
          order.order_category === selectedCategory));

    // Status filter
    const matchesStatus = statusFilter === "all" || 
      order.order_status === statusFilter;

    // Date range filter (simplified - you can implement actual date filtering)
    const matchesDateRange = dateRange === "all" || true; // Implement actual date logic

    return matchesSearch && matchesCategory && matchesStatus && matchesDateRange;
  });

  // Calculate filtered metrics
  const filteredTotalSales = filteredOrders.reduce((sum, order) => 
    sum + (parseFloat(order.order_price) || 0), 0
  );

  // Export functionality
  const handleExport = () => {
    if (filteredOrders.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Client Name", "Order Name", "Amount", "Status", "Order Date", "Category"];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((order) =>
        [
          `"${order.client_full_name || "N/A"}"`,
          `"${order.order_title || "N/A"}"`,
          `"₦${Number(order.order_price || 0).toLocaleString()}"`,
          `"${order.order_status || "N/A"}"`,
          `"${order.ordered_at ? order.ordered_at.slice(0, 10) : "N/A"}"`,
          `"${typeof order.order_category === 'object' ? order.order_category.name : order.order_category || "N/A"}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats cards data
  const cards = [
    {
      title: "Total Sales",
      value: `₦${Number(totalSales).toLocaleString()}`,
      subtitle: "All time revenue",
      icon: <DollarSign className="w-6 h-6" />,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700"
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      subtitle: `${completedOrders} completed`,
      icon: <Package className="w-6 h-6" />,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700"
    },
    {
      title: "Average Order",
      value: `₦${Number(averageOrderValue).toLocaleString()}`,
      subtitle: "Per order value",
      icon: <BarChart3 className="w-6 h-6" />,
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700"
    },
    {
      title: "Filtered Sales",
      value: `₦${Number(filteredTotalSales).toLocaleString()}`,
      subtitle: "Based on current filters",
      icon: <Eye className="w-6 h-6" />,
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700"
    },
  ];

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Assigned': 'bg-purple-100 text-purple-800',
      'On Delivery': 'bg-orange-100 text-orange-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Report</h1>
            <p className="text-gray-600">
              Track and analyze your sales performance
            </p>
          </div>
          
          {/* Time Filter */}
          <div className="flex gap-2 flex-wrap">
            {timeFilters.map((filter) => (
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <div className="text-sm text-gray-600 mt-1">
                    {card.subtitle}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients, orders, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
              />
            </div>
          </div>

          {/* Filter Group */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none min-w-40"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-4 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none min-w-40"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* Export Button */}
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

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Search: "{searchQuery}"
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
          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter("all")} className="hover:text-purple-900">
                ×
              </button>
            </span>
          )}
          {(searchQuery || selectedCategory !== "All" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setStatusFilter("all");
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{orders.length}</span> orders
        </div>
        {filteredOrders.length > 0 && (
          <div className="text-sm text-gray-600">
            Filtered total: <span className="font-semibold text-green-600">
              ₦{Number(filteredTotalSales).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading sales data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left">
                  <th className="p-6 w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                  </th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Client
                  </th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Actions
                  </th>
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
                          {searchQuery || selectedCategory !== "All" || statusFilter !== "all" 
                            ? "Try adjusting your search or filters" 
                            : "No sales data available"
                          }
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
                          {order.client_full_name || "Unknown Client"}
                        </div>
                        {order.client_email && (
                          <div className="text-sm text-gray-500 mt-1">
                            {order.client_email}
                          </div>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="font-medium text-gray-900">
                          {order.order_title || "Untitled Order"}
                        </div>
                        {order.order_description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-xs">
                            {order.order_description}
                          </div>
                        )}
                        {order.order_category && (
                          <div className="text-xs text-gray-400 mt-2">
                            {typeof order.order_category === 'object' 
                              ? order.order_category.name 
                              : order.order_category
                            }
                          </div>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-gray-900 text-lg">
                          ₦{Number(order.order_price || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-6">
                        <StatusBadge status={order.order_status} />
                      </td>
                      <td className="p-6">
                        <div className="text-sm text-gray-600">
                          {order.ordered_at ? (
                            <>
                              <div>{new Date(order.ordered_at).toLocaleDateString()}</div>
                              <div className="text-gray-400 text-xs">
                                {new Date(order.ordered_at).toLocaleTimeString()}
                              </div>
                            </>
                          ) : (
                            "-"
                          )}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;