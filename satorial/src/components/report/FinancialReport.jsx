import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Search,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  Printer,
  PieChart,
  Filter,
  Percent,
} from "lucide-react";
import OrderService from "../../services/OrderService";
import ExpensesService from "../../services/expensesServices/ExpensesService";
import SettingsService from "../../services/settings";
import { getLocalInvoiceSettings } from "../../utils/localImageService";
import LocationFilter from "../filters/LocationFilter";
import { formatDateCaption } from "../../../utils/reportUtils";

const toLocalDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getDateRange = (filter, customStartDate, customEndDate) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (filter) {
    case "Today":
      return { startDate: start, endDate: end, days: 1, label: "Today" };
    case "Yesterday": {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      return { startDate: start, endDate: end, days: 1, label: "Yesterday" };
    }
    case "This Week": {
      const day = start.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + mondayOffset);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return { startDate: start, endDate: end, days, label: "This Week" };
    }
    case "Last Week": {
      const day = start.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + mondayOffset - 7);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end, days: 7, label: "Last Week" };
    }
    case "This Month":
      start.setDate(1);
      return { startDate: start, endDate: end, days: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), label: "This Month" };
    case "Last Month": {
      start.setMonth(start.getMonth() - 1, 1);
      end.setMonth(end.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      const days = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      return { startDate: start, endDate: end, days, label: "Last Month" };
    }
    case "This Quarter": {
      const qStart = Math.floor(start.getMonth() / 3) * 3;
      start.setMonth(qStart, 1);
      end.setMonth(qStart + 3, 0);
      end.setHours(23, 59, 59, 999);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return { startDate: start, endDate: end, days, label: "This Quarter" };
    }
    case "This Year":
      start.setMonth(0, 1);
      return { startDate: start, endDate: end, days: 366, label: "This Year" };
    case "Custom Date": {
      if (!customStartDate || !customEndDate) return null;
      const s = new Date(customStartDate);
      const e = new Date(customEndDate + "T23:59:59.999");
      const days = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return { startDate: s, endDate: e, days, label: "Custom Range" };
    }
    case "All Time":
    default:
      return null;
  }
};

const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const FILTERS = [
  "Today", "Yesterday", "This Week", "Last Week",
  "This Month", "Last Month", "This Quarter", "This Year",
  "All Time", "Custom Date",
];

const FinancialReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullPeriod, setShowFullPeriod] = useState(false);
  const [location, setLocation] = useState("");
  const [vatSettings, setVatSettings] = useState({ vatEnabled: false, vatRate: 7.5 });
  const printRef = useRef();

  const dateRange = useMemo(
    () => getDateRange(selectedFilter, customStartDate, customEndDate),
    [selectedFilter, customStartDate, customEndDate]
  );

  // Fetch all expenses once on mount (no date filter — proration is client-side)
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const expensesParams = {};
        if (location) expensesParams.location = location;
        const expensesData = await ExpensesService.getExpenseList(expensesParams).catch(() => []);
        const fetchedExpenses = Array.isArray(expensesData)
          ? expensesData
          : expensesData.results || expensesData.expenses || [];
        setExpenses(fetchedExpenses);
      } catch {
        // silently handle — expenses will stay empty
      }
    };
    fetchExpenses();
  }, [location]);

  // Fetch VAT settings
  useEffect(() => {
    const local = getLocalInvoiceSettings();
    if (local) {
      setVatSettings({
        vatEnabled: local.vatEnabled ?? false,
        vatRate: local.vatRate ?? 7.5,
      });
    } else {
      SettingsService.Invoice.getSettings()
        .then((data) => {
          setVatSettings({
            vatEnabled: data.vat_enabled ?? false,
            vatRate: data.vat_rate ?? 7.5,
          });
        })
        .catch(() => {});
    }
  }, []);

  // Fetch orders when date range changes
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const orderParams = {};
        if (dateRange?.startDate) orderParams.start_date = toLocalDateStr(dateRange.startDate);
        if (dateRange?.endDate) orderParams.end_date = toLocalDateStr(dateRange.endDate);
        if (location) orderParams.location = location;

        const ordersData = await OrderService.getOrders(orderParams);

        const fetchedOrders = Array.isArray(ordersData)
          ? ordersData
          : ordersData.results || ordersData.orders || [];
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Error fetching financial data:", err);
        setError("Failed to load financial data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [dateRange, location]);

  // Client-side date filter
  const dateFilteredOrders = useMemo(() => {
    if (!dateRange) return orders;
    return orders.filter((o) => {
      const d = new Date(o.ordered_at || o.created_at);
      return d >= dateRange.startDate && d <= dateRange.endDate;
    });
  }, [orders, dateRange]);

  // Recurrence period helpers
  const toMidnight = (d) => { const m = new Date(d); m.setHours(0, 0, 0, 0); return m; };

  const overlapDays = useCallback((aStart, aEnd, bStart, bEnd) => {
    const latest = aStart > bStart ? aStart : bStart;
    const earliest = aEnd < bEnd ? aEnd : bEnd;
    const diffDays = Math.round((toMidnight(earliest) - toMidnight(latest)) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays + 1);
  }, []);

  const prorateExpense = useCallback((expense, filterStart, filterEnd, periodDays) => {
    const amt = parseFloat(expense.amount) || 0;
    const recType = (expense.recurrence_type || "").toLowerCase();
    if (!recType) return amt;

    const rStart = expense.recurrence_start_date ? toMidnight(expense.recurrence_start_date) : null;
    const rEnd = expense.recurrence_end_date ? toMidnight(expense.recurrence_end_date) : null;
    if (!rStart || !rEnd) return amt;

    const overlaps = rStart <= toMidnight(filterEnd) && rEnd >= toMidnight(filterStart);
    if (!overlaps) return 0;

    const totalDays = Math.max(Math.round((toMidnight(rEnd) - toMidnight(rStart)) / (1000 * 60 * 60 * 24)) + 1, 1);
    const dailyRate = amt / totalDays;

    if (showFullPeriod) {
      return dailyRate * periodDays;
    }

    const overlap = overlapDays(rStart, rEnd, toMidnight(filterStart), toMidnight(filterEnd));
    return dailyRate * overlap;
  }, [showFullPeriod, overlapDays]);

  // Include recurring expenses whose period overlaps the filter range, not just created_at
  const dateFilteredExpenses = useMemo(() => {
    if (!dateRange) return expenses;
    const fStart = toMidnight(dateRange.startDate);
    const fEnd = toMidnight(dateRange.endDate);
    return expenses.filter((e) => {
      const recType = (e.recurrence_type || "").toLowerCase();
      if (recType) {
        const rStart = e.recurrence_start_date ? toMidnight(e.recurrence_start_date) : null;
        const rEnd = e.recurrence_end_date ? toMidnight(e.recurrence_end_date) : null;
        if (rStart && rEnd) {
          return rStart <= fEnd && rEnd >= fStart;
        }
      }
      const d = new Date(e.created_at || e.date);
      return d >= dateRange.startDate && d <= dateRange.endDate;
    });
  }, [expenses, dateRange]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return dateFilteredOrders;
    return dateFilteredOrders.filter((o) =>
      (o.client_full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.order_title?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [dateFilteredOrders, searchQuery]);

  // Revenue: sum of order prices from date-filtered orders
  const grossRevenue = useMemo(
    () => dateFilteredOrders.reduce((sum, o) => sum + (parseFloat(o.order_price) || 0), 0),
    [dateFilteredOrders]
  );

  // Expenditure: expense amounts prorated by actual recurrence period overlap
  const grossExpenditure = useMemo(() => {
    if (!dateRange) return dateFilteredExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    return dateFilteredExpenses.reduce(
      (sum, e) => sum + prorateExpense(e, dateRange.startDate, dateRange.endDate, dateRange.days),
      0
    );
  }, [dateFilteredExpenses, dateRange, prorateExpense]);

  const grossProfit = grossRevenue - grossExpenditure;

  const vatAmount = vatSettings.vatEnabled ? grossProfit * (vatSettings.vatRate / 100) : 0;
  const netProfit = grossProfit - vatAmount;

  // Breakdown items for the table
  const breakdownItems = useMemo(() => {
    const categoryMap = {};
    for (const e of dateFilteredExpenses) {
      const cat = e.category_name || "Uncategorized";
      const effectiveAmt = dateRange
        ? prorateExpense(e, dateRange.startDate, dateRange.endDate, dateRange.days)
        : parseFloat(e.amount) || 0;
      categoryMap[cat] = (categoryMap[cat] || 0) + effectiveAmt;
    }
    return Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [dateFilteredExpenses, dateRange, prorateExpense]);

  const totalExpenditureFromBreakdown = breakdownItems.reduce((s, i) => s + i.amount, 0);

  const handleExport = () => {
    const rows = [
      ["Metric", "Amount"],
      [`Revenue (${dateFilteredOrders.length} orders)`, `₦${grossRevenue.toLocaleString()}`],
      ...breakdownItems.map((i) => [`  Expense: ${i.name}`, `₦${i.amount.toLocaleString()}`]),
      ["Expenditure", `₦${grossExpenditure.toLocaleString()}`],
      ["Gross Profit", `₦${grossProfit.toLocaleString()}`],
    ];
    if (vatSettings.vatEnabled) {
      rows.push([`VAT (${vatSettings.vatRate}%)`, `₦${vatAmount.toLocaleString()}`]);
    }
    rows.push(["Net Profit", `₦${netProfit.toLocaleString()}`]);
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `financial_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterLabel = formatDateCaption(selectedFilter, customStartDate, customEndDate);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">Loading financial report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-red-500 text-lg mb-2">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div ref={printRef} className="print-content p-6 bg-gray-50 min-h-screen">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Report</h1>
            <p className="text-gray-600">
              Revenue, expenditures &amp; profit overview
            </p>
          </div>
          <div className="no-print flex gap-2 flex-wrap items-center">
            <LocationFilter value={location} onChange={setLocation} />
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

        {selectedFilter !== "All Time" && (
          <div className="no-print flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowFullPeriod(!showFullPeriod)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showFullPeriod ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showFullPeriod ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-700 font-medium">
              {showFullPeriod ? "Full filter period" : "Prorated to date"}
            </span>
          </div>
        )}

        {selectedFilter === "Custom Date" && (
          <div className="no-print flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-700">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">{formatCurrency(grossRevenue)}</div>
              <div className="text-sm text-gray-500 mt-1">{filterLabel}</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Revenue</h3>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-100 text-red-700">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-700">{formatCurrency(grossExpenditure)}</div>
              <div className="text-sm text-gray-500 mt-1">{dateFilteredExpenses.length} expense{dateFilteredExpenses.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Expenditure</h3>
        </div>

        <div className={`rounded-2xl p-6 transition-all hover:shadow-md border-2 ${
          grossProfit >= 0
            ? "bg-blue-50 border-blue-200"
            : "bg-orange-50 border-orange-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              grossProfit >= 0 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
            }`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                grossProfit >= 0 ? "text-blue-700" : "text-orange-700"
              }`}>
                {formatCurrency(grossProfit)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {grossProfit >= 0 ? "Profit" : "Loss"}
              </div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Gross Profit</h3>
        </div>

        <div className={`rounded-2xl p-6 transition-all hover:shadow-md border-2 ${
          netProfit >= 0
            ? "bg-purple-50 border-purple-200"
            : "bg-orange-50 border-orange-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              netProfit >= 0 ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
            }`}>
              <Percent className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                netProfit >= 0 ? "text-purple-700" : "text-orange-700"
              }`}>
                {formatCurrency(netProfit)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {vatSettings.vatEnabled ? `${vatSettings.vatRate}% VAT` : "No VAT"}
              </div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Net Profit</h3>
        </div>
      </div>

      {/* Search & Export Bar */}
      <div className="no-print bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{dateFilteredOrders.length}</span> orders
          {" & "}
          <span className="font-semibold text-gray-900">{dateFilteredExpenses.length}</span> expense{dateFilteredExpenses.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-700">Financial Breakdown</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Metric</th>
              <th className="text-right p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-medium text-gray-900">Revenue</td>
              <td className="p-4 text-right font-semibold text-green-600">{formatCurrency(grossRevenue)}</td>
            </tr>
            <tr className="hover:bg-gray-50 bg-gray-50/50">
              <td className="p-4 font-semibold text-gray-700">Orders ({dateFilteredOrders.length})</td>
              <td className="p-4 text-right text-gray-500 text-sm">{formatCurrency(grossRevenue)}</td>
            </tr>
            {breakdownItems.length > 0 && (
              <>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">Expenditure</td>
                  <td className="p-4 text-right font-semibold text-red-600">{formatCurrency(totalExpenditureFromBreakdown)}</td>
                </tr>
                {breakdownItems.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 bg-gray-50/50">
                    <td className="p-4 pl-8 text-sm text-gray-700">Expense: {item.name}</td>
                    <td className="p-4 text-right text-sm text-red-500">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </>
            )}
            <tr className={`hover:bg-gray-50 border-t-2 ${
              grossProfit >= 0 ? "bg-blue-50/50 border-blue-200" : "bg-orange-50/50 border-orange-200"
            }`}>
              <td className="p-4 font-bold text-gray-900">Gross Profit</td>
              <td className={`p-4 text-right font-bold ${
                grossProfit >= 0 ? "text-blue-700" : "text-orange-700"
              }`}>{formatCurrency(grossProfit)}</td>
            </tr>
            {vatSettings.vatEnabled && (
              <tr className="hover:bg-gray-50 bg-gray-50/50">
                <td className="p-4 font-medium text-gray-700">VAT ({vatSettings.vatRate}%)</td>
                <td className="p-4 text-right font-semibold text-red-600">{formatCurrency(vatAmount)}</td>
              </tr>
            )}
            <tr className={`hover:bg-gray-50 border-t-2 ${
              netProfit >= 0 ? "bg-purple-50/50 border-purple-200" : "bg-orange-50/50 border-orange-200"
            }`}>
              <td className="p-4 font-bold text-gray-900">Net Profit</td>
              <td className={`p-4 text-right font-bold ${
                netProfit >= 0 ? "text-purple-700" : "text-orange-700"
              }`}>{formatCurrency(netProfit)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-700">Orders</h3>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <DollarSign className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Client</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Order</th>
                  <th className="text-right p-4 font-semibold text-gray-700 text-sm">Amount</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id || index} className="hover:bg-gray-50">
                    <td className="p-4">
                      <span className="font-medium text-gray-900">{order.client_full_name || "N/A"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-900">{order.order_title || "N/A"}</span>
                    </td>
                    <td className="p-4 text-right font-semibold text-gray-900">
                      {formatCurrency(order.order_price || 0)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReport;
