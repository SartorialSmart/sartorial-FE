import { useState, useEffect, useMemo } from "react";
import {
  Mail,
  User,
  Search,
  Download,
  MoreVertical,
  CheckSquare,
} from "lucide-react";
import ReportService from "../../services/ReportService";
import PaymentService from "../../services/PaymentService";
import OrderService from "../../services/OrderService";
import { filterByDateRange, getDateRangeISO } from "../../../utils/reportUtils";

const FILTERS = [
  "All Time",
  "Today",
  "This Week",
  "This Month",
  "This Year",
  "Custom Date",
];

const PaymentsReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, paymentsData, ordersData] = await Promise.all([
          ReportService.getPaymentSummary(),
          PaymentService.getAllPayments(),
          OrderService.getOrders(),
        ]);

        setSummary(summaryData || {});

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

  useEffect(() => {
    if (selectedFilter === "Custom Date" && (!customStartDate || !customEndDate)) return;
    const fetchFilteredSummary = async () => {
      const params = selectedFilter === "All Time" ? {} : (() => {
        const dr = getDateRangeISO(selectedFilter, customStartDate, customEndDate);
        return {
          start_date: dr.startDate?.split("T")[0],
          end_date: dr.endDate?.split("T")[0],
        };
      })();
      try {
        const summaryData = await ReportService.getPaymentSummary(params);
        setSummary(summaryData || {});
      } catch {}
    };
    fetchFilteredSummary();
  }, [selectedFilter, customStartDate, customEndDate]);

  const filteredPayments = useMemo(() => {
    return filterByDateRange(payments, "payment_date", selectedFilter, customStartDate, customEndDate);
  }, [payments, selectedFilter, customStartDate, customEndDate]);

  const cards = [
    {
      title: "Fully Paid",
      value: summary?.fully_paid ?? "-",
      icon: <Mail />,
      bg: "bg-green-100",
    },
    {
      title: "Partially Paid",
      value: summary?.partially_paid ?? "-",
      icon: <Mail />,
      bg: "bg-purple-100",
    },
    {
      title: "Payment Due",
      value: summary?.payment_due ?? "-",
      icon: <User />,
      bg: "bg-yellow-100",
    },
    {
      title: "Total Payment",
      value:
        summary?.total_payment !== undefined
          ? `₦${Number(summary.total_payment).toLocaleString()}`
          : "-",
      icon: <User />,
      bg: "bg-blue-100",
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px] font-semibold text-gray-900">
          Payment Report
        </h2>
        <div className="flex space-x-2 bg-white p-1 rounded-lg">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-[6px] text-sm rounded-md border transition ${
                selectedFilter === filter
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-white text-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {selectedFilter === "Custom Date" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-3 bg-white p-3 rounded-lg shadow-sm">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="flex justify-between items-center mt-6 ">
        <div className="flex space-x-2 mb-4 bg-white p-1 rounded-lg">
          {[
            "All",
            "Fully Paid",
            "Partially paid",
            "Not Paid",
            "Payment Due",
          ].map((filter) => (
            <button
              key={filter}
              className="px-4 py-[6px] text-sm rounded-md border bg-gray-200 text-gray-700"
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex justify-end items-center mb-4 space-x-3">
          <div className="relative w-[300px]">
            <input
              type="text"
              placeholder="Search here..."
              className="border border-gray-300 rounded-lg px-4 py-[9px] pl-10 w-full bg-white text-sm focus:ring focus:ring-gray-200 outline-none"
            />
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          </div>
          <button className="flex items-center px-4 py-[9px] border border-gray-300 rounded-lg bg-white text-sm text-gray-700">
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
                {[
                  "",
                  "Client Name",
                  "Order Name",
                  "Amount",
                  "Payment Date",
                  "",
                ].map((header, index) => (
                  <th key={index} className="p-3 text-sm font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No payments found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                  <tr key={payment.id || index} className="border-b text-gray-700">
                    <td className="p-3">
                      <CheckSquare className="w-5 h-5 text-gray-500" />
                    </td>
                    <td className="p-3 text-sm">{payment.client_name}</td>
                    <td className="p-3 text-sm">{payment.order_name}</td>
                    <td className="p-3 text-sm">{formatCurrency(payment.amount)}</td>
                    <td className="p-3 text-sm">{formatDate(payment.payment_date)}</td>
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

export default PaymentsReport;
