import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Download,
  MoreVertical,
  DollarSign,
  CreditCard,
  Clock,
  ChevronDown,
  Loader2,
} from "lucide-react";
import PaymentService from "../../services/PaymentService";
import OrderService from "../../services/OrderService";
import { filterByDateRange, formatDateCaption } from "../../../utils/reportUtils";

const FILTERS = [
  "All Time",
  "Today",
  "This Week",
  "This Month",
  "This Year",
  "Custom Date",
];

const PAYMENT_STATUSES = [
  "all",
  "Fully Paid",
  "Partially Paid",
  "Not Paid",
  "Payment Due",
];

const PaymentsReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [paymentsData, ordersData] = await Promise.all([
          PaymentService.getAllPayments(),
          OrderService.getOrders(),
        ]);

        const ordersList = Array.isArray(ordersData)
          ? ordersData
          : ordersData.orders || ordersData.results || [];
        const orderMap = {};
        ordersList.forEach((order) => {
          orderMap[order.id] = order;
        });

        const paymentList = Array.isArray(paymentsData)
          ? paymentsData
          : paymentsData.payments ||
            paymentsData.results ||
            paymentsData.data ||
            [];

        const mapped = paymentList.map((p) => {
          const order = p.order ? orderMap[p.order] : null;
          return {
            ...p,
            client_name:
              p.client_name ||
              order?.client_full_name ||
              order?.client_name ||
              "Unknown",
            order_name:
              p.order_name ||
              order?.order_title ||
              p.payment_type ||
              "Payment",
            amount:
              p.amount ||
              p.amount_paid ||
              0,
            payment_date:
              p.payment_date ||
              p.paid_at ||
              null,
          };
        });

        setPayments(mapped);
      } catch {
        setError("Failed to load payment report.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dateFilteredPayments = useMemo(() => {
    return filterByDateRange(payments, "payment_date", selectedFilter, customStartDate, customEndDate);
  }, [payments, selectedFilter, customStartDate, customEndDate]);

  const filteredPayments = useMemo(() => {
    return dateFilteredPayments.filter((payment) => {
      const matchesSearch =
        searchQuery === "" ||
        (payment.client_name &&
          payment.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.order_name &&
          payment.order_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        payment.payment_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [dateFilteredPayments, searchQuery, statusFilter]);

  const paymentStats = useMemo(() => {
    const total = dateFilteredPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const fullyPaid = dateFilteredPayments.filter(p => p.payment_status === "Fully Paid");
    const partiallyPaid = dateFilteredPayments.filter(p => p.payment_status === "Partially Paid");
    const due = dateFilteredPayments.filter(p => p.payment_status === "Payment Due");
    const fullyPaidTotal = fullyPaid.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const partiallyPaidTotal = partiallyPaid.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const dueTotal = due.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    return { total, fullyPaidCount: fullyPaid.length, partiallyPaidCount: partiallyPaid.length, dueCount: due.length, fullyPaidTotal, partiallyPaidTotal, dueTotal, count: dateFilteredPayments.length };
  }, [dateFilteredPayments]);

  const handleExport = useCallback(() => {
    if (filteredPayments.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = ["Client Name", "Order Name", "Amount", "Payment Date", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredPayments.map((p) =>
        [
          `"${p.client_name || "N/A"}"`,
          `"${p.order_name || "N/A"}"`,
          `"${Number(p.amount || 0).toLocaleString()}"`,
          `"${p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "N/A"}"`,
          `"${p.payment_status || ""}"`,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payments_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredPayments]);

  const filterLabel = formatDateCaption(selectedFilter, customStartDate, customEndDate);

  const cards = [
    {
      title: "Total Payment",
      value: `₦${Number(paymentStats.total).toLocaleString()}`,
      subtitle: filterLabel,
      icon: <DollarSign className="w-6 h-6" />,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    {
      title: "Fully Paid",
      value: `₦${Number(paymentStats.fullyPaidTotal).toLocaleString()}`,
      subtitle: filterLabel,
      icon: <DollarSign className="w-6 h-6" />,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
    {
      title: "Partially Paid",
      value: `₦${Number(paymentStats.partiallyPaidTotal).toLocaleString()}`,
      subtitle: filterLabel,
      icon: <CreditCard className="w-6 h-6" />,
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
    },
    {
      title: "Payment Due",
      value: `₦${Number(paymentStats.dueTotal).toLocaleString()}`,
      subtitle: filterLabel,
      icon: <Clock className="w-6 h-6" />,
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
    },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return `₦${num.toLocaleString()}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Report</h1>
            <p className="text-gray-600">
              Track and analyze payment activities
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-4 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none min-w-40"
              >
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Status" : status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <button
              onClick={handleExport}
              disabled={filteredPayments.length === 0}
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
          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter("all")} className="hover:text-purple-900">
                ×
              </button>
            </span>
          )}
          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
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
          Showing <span className="font-semibold text-gray-900">{filteredPayments.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{dateFilteredPayments.length}</span> payments
          {selectedFilter !== "All Time" && (
            <> for <span className="font-medium text-blue-600">{selectedFilter}</span></>
          )}
        </div>
        {filteredPayments.length > 0 && (
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-green-600">
              {formatCurrency(dateFilteredPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0))}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading payment data...</p>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left">
                  <th className="p-6 w-12">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Client Name</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Order Name</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Payment Date</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <CreditCard className="w-12 h-12" />
                        <p className="text-lg font-medium">No payments found</p>
                        <p className="text-sm">
                          {searchQuery || statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "No payment data available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, index) => (
                    <tr
                      key={payment.id || index}
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
                          {payment.client_name || "Unknown"}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-gray-900">{payment.order_name || "N/A"}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-gray-900 text-lg">
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-sm text-gray-600">
                          {formatDate(payment.payment_date)}
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

export default PaymentsReport;
