import { useState, useEffect } from "react";
import {
  Mail,
  Search,
  Download,
  MoreVertical,
  CheckSquare,
  User,
} from "lucide-react";
import PropTypes from "prop-types";
import ReportService from "../../services/ReportService";
import OrderService from "../../services/OrderService";

const OrderReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ReportService.getOrderSummary();
        setSummary(data || {});
        const ordersData = await OrderService.getOrders();
        setOrders(
          Array.isArray(ordersData) ? ordersData : ordersData.orders || []
        );
      } catch {
        setError("Failed to load order summary.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    {
      title: "Total Orders",
      value: summary?.total_orders ?? "-",
      icon: <Mail />,
      bg: "bg-green-100",
    },
    {
      title: "Assigned",
      value: summary?.status_summary?.Assigned ?? "-",
      icon: <Mail />,
      bg: "bg-purple-100",
    },
    {
      title: "In Progress",
      value: summary?.status_summary?.["In Progress"] ?? "-",
      icon: <User />,
      bg: "bg-yellow-100",
    },
    {
      title: "On Delivery",
      value: summary?.status_summary?.["On Delivery"] ?? "-",
      icon: <User />,
      bg: "bg-blue-100",
    },
    {
      title: "Completed",
      value: summary?.status_summary?.Completed ?? "-",
      icon: <User />,
      bg: "bg-blue-100",
    },
    {
      title: "Cancelled",
      value: summary?.status_summary?.Cancelled ?? "-",
      icon: <User />,
      bg: "bg-blue-100",
    },
    {
      title: "Pending",
      value: summary?.status_summary?.Pending ?? "-",
      icon: <User />,
      bg: "bg-blue-100",
    },
  ];

  // Filter orders based on search query, status, and date
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      (order.client_full_name &&
        order.client_full_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (order.order_title &&
        order.order_title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === "All" || order.order_status === selectedStatus;

    // Date filtering logic
    const matchesDate = (() => {
      if (selectedFilter === "All Time") return true;

      const orderDate = new Date(order.ordered_at || order.order_date || order.date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (selectedFilter) {
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
        case "Custom Date":
          // For custom date, you might want to implement date range pickers
          // For now, return true to show all (can be enhanced later)
          return true;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Export functionality
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
    ];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((order) =>
        [
          `"${
            order.client_full_name || order.client_name || order.client || ""
          }"`,
          `"${order.order_title || order.order_name || order.name || ""}"`,
          `"₦${Number(
            order.order_price || order.amount || 0
          ).toLocaleString()}"`,
          `"${
            order.ordered_at
              ? order.ordered_at.slice(0, 10)
              : order.order_date || order.date || ""
          }"`,
          `"${order.order_status || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `order_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px] font-semibold text-gray-900">
          Order Report
        </h2>
        <div className="flex space-x-2">
          {[
            "All Time",
            "Today",
            "This Week",
            "This Month",
            "This Year",
            "Custom Date",
          ].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-[6px] text-sm rounded-md border transition ${
                selectedFilter === filter
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-md flex flex-col ${card.bg}`}
          >
            <div className="flex items-center mb-2 text-gray-600 border border-blue-600 w-10 h-10 rounded-full justify-center">
              {card.icon}
            </div>
            <p className="my-5 font-light">{card.value}</p>
            <p className="text-gray-500">{card.title}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center my-6">
        <div className="flex space-x-2 mb-4 bg-white p-1 rounded-lg">
          {[
            "All",
            "Assigned",
            "In Progress",
            "On Delivery",
            "Completed",
            "Cancelled",
            "Pending",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-[6px] text-sm rounded-md border transition ${
                selectedStatus === status
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex justify-end items-center mb-4 space-x-3 flex-end">
          <div className="relative w-[300px]">
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-[9px] pl-10 w-full bg-white text-sm focus:ring focus:ring-gray-200 outline-none"
            />
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-[9px] border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-5 h-5 mr-2 text-gray-600" />
            Export
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 text-gray-700 text-left">
              <tr>
                <th className="p-3 text-sm font-semibold"></th>
                <th className="p-3 text-sm font-semibold">Client Name</th>
                <th className="p-3 text-sm font-semibold">Order Name</th>
                <th className="p-3 text-sm font-semibold">Amount</th>
                <th className="p-3 text-sm font-semibold">Order Date</th>
                <th className="p-3 text-sm font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={index} className="border-b text-gray-700">
                    <td className="p-3">
                      <CheckSquare className="w-5 h-5 text-gray-500" />
                    </td>
                    <td className="p-3 text-sm">
                      {order.client_full_name ||
                        order.client_name ||
                        order.client ||
                        "-"}
                    </td>
                    <td className="p-3 text-sm">
                      {order.order_title ||
                        order.order_name ||
                        order.name ||
                        "-"}
                    </td>
                    <td className="p-3 text-sm">
                      ₦
                      {Number(
                        order.order_price || order.amount
                      ).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm">
                      {order.ordered_at
                        ? order.ordered_at.slice(0, 10)
                        : order.order_date || order.date || "-"}
                    </td>
                    <td className="p-3 text-right">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
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
