import { useState, useEffect } from "react";
import {
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  Printer,
  PieChart,
  FileText,
} from "lucide-react";
import ReportService from "../../services/ReportService";
import LocationFilter from "../filters/LocationFilter";

const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ExpensesReport = () => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (location) params.location = location;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        const data = await ReportService.getExpensesReport(params);
        setReport(data);
      } catch (err) {
        console.error("Error fetching expenses report:", err);
        setError("Failed to load expenses report. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [location, startDate, endDate]);

  const handleExport = () => {
    if (!report) return;
    const rows = [
      ["Metric", "Amount"],
      ["Total Expenses", `₦${Number(report.total_expense_amount || 0).toLocaleString()}`],
      ["Recurring Expenses", `₦${Number(report.recurring_total || 0).toLocaleString()}`],
      ["One-off Expenses", `₦${Number(report.one_off_total || 0).toLocaleString()}`],
      [],
      ["Category", "Total"],
      ...(report.categories || []).map((c) => [c.category_name || "Uncategorized", formatCurrency(c.total)]),
    ];
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `expenses_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">Loading expenses report...</p>
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

  const maxCategoryTotal = Math.max(0, ...(report?.categories || []).map((c) => Number(c.total) || 0));

  return (
    <div className="print-content p-6 bg-gray-50 min-h-screen">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Expenses Report</h1>
            <p className="text-gray-600">
              Aggregated expenses overview by category
              {report?.start_date && report?.end_date
                ? ` — ${report.start_date} to ${report.end_date}`
                : " — All Time"}
            </p>
          </div>
          <div className="no-print flex gap-2 flex-wrap">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <LocationFilter value={location} onChange={setLocation} />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">{formatCurrency(report?.total_expense_amount)}</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Total Expenses</h3>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-700">{formatCurrency(report?.recurring_total)}</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Recurring</h3>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-700">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">{formatCurrency(report?.one_off_total)}</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">One-off</h3>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-700">{report?.total_expense_count ?? 0}</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Expense Count</h3>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-700">By Category</h3>
        </div>
        {(report?.categories || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">No expenses found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {report.categories.map((cat) => {
              const total = Number(cat.total) || 0;
              const pct = maxCategoryTotal ? Math.round((total / maxCategoryTotal) * 100) : 0;
              return (
                <div key={cat.category_id ?? cat.category_name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-900">{cat.category_name || "Uncategorized"}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(total)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-700">Recent Expenses</h3>
        </div>
        {(report?.recent_expenses || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">No recent expenses</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Date</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Category</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Description</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Location</th>
                  <th className="text-right p-4 font-semibold text-gray-700 text-sm">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.recent_expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-600">
                      {new Date(expense.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {expense.category_name || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-900">{expense.description}</td>
                    <td className="p-4 text-gray-600">{expense.location_name || "—"}</td>
                    <td className="p-4 text-right font-semibold text-gray-900">{formatCurrency(expense.amount)}</td>
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

export default ExpensesReport;
