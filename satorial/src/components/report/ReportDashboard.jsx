import { useState, useEffect } from "react";
import { Mail, User, CreditCard, TrendingUp, Wallet } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ReportService from "../../services/ReportService";
import { getDateRangeISO } from "../../../utils/reportUtils";

const COLORS = ["#42A5F5", "#66BB6A"];

const FILTERS = [
  "All Time",
  "Today",
  "This Week",
  "This Month",
  "This Year",
  "Custom Date",
];

const ReportDashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const [profitReport, setProfitReport] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);

  const fetchData = async (filter, startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const params = filter === "All Time" ? {} : (() => {
        const dr = getDateRangeISO(filter, startDate, endDate);
        return {
          start_date: dr.startDate?.split("T")[0],
          end_date: dr.endDate?.split("T")[0],
        };
      })();

      const [summaryData, monthly] = await Promise.all([
        ReportService.getReportSummary(params),
        ReportService.getMonthlyStatistics(),
      ]);
      setSummary(summaryData || {});
      setMonthlyStats(Array.isArray(monthly) ? monthly : []);

      let profit = null;
      if (filter === "All Time") {
        profit = await ReportService.getProfitReport();
      } else {
        profit = await ReportService.getProfitReport(params);
      }
      setProfitReport(profit || null);
    } catch {
      setError("Failed to load report summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedFilter, customStartDate, customEndDate);
  }, []);

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    if (filter !== "Custom Date") {
      setCustomStartDate("");
      setCustomEndDate("");
      fetchData(filter, "", "");
    }
  };

  const handleCustomDateFilter = () => {
    if (customStartDate && customEndDate) {
      fetchData("Custom Date", customStartDate, customEndDate);
    }
  };

  const cards = [
    {
      title: "Total Orders",
      value: summary.total_orders ?? "-",
      icon: <Mail />,
      bg: "bg-green-100",
    },
    {
      title: "Total Delivered",
      value: summary.total_delivered ?? "-",
      icon: <Mail />,
      bg: "bg-blue-100",
    },
    {
      title: "Total Clients",
      value: summary.total_clients ?? "-",
      icon: <User />,
      bg: "bg-yellow-100",
    },
    {
      title: "Total Expense Amount",
      value: summary.total_expense_amount ?? "-",
      icon: <CreditCard />,
      bg: "bg-red-100",
    },
    {
      title: "Total Sales Amount",
      value: summary.total_sales_amount ?? "-",
      icon: <CreditCard />,
      bg: "bg-purple-100",
    },
    {
      title: "Revenue",
      value: profitReport ? `₦${Number(profitReport.revenue).toLocaleString()}` : "-",
      icon: <TrendingUp />,
      bg: "bg-emerald-100",
    },
    {
      title: "Gross Profit",
      value: profitReport ? `₦${Number(profitReport.gross_profit).toLocaleString()}` : "-",
      icon: <Wallet />,
      bg: "bg-cyan-100",
    },
    {
      title: "Net Profit",
      value: profitReport ? `₦${Number(profitReport.net_profit).toLocaleString()}` : "-",
      icon: <Wallet />,
      bg: "bg-indigo-100",
    },
    {
      title: "Total Staff",
      value: summary.total_staff ?? "-",
      icon: <User />,
      bg: "bg-teal-100",
    },
  ];

  const chartData = monthlyStats;
  const pieData = summary.retention || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light">Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={`px-4 py-2 rounded-lg ${
                selectedFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {selectedFilter === "Custom Date" && (
        <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-lg shadow-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleCustomDateFilter}
            disabled={!customStartDate || !customEndDate}
            className="mt-5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Apply
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg shadow-md flex flex-col ${card.bg}`}
              >
                <div className="flex items-center mb-2 text-gray-600 border border-blue-600 w-10 h-10 rounded-full justify-center">
                  {card.icon}
                </div>
                <p className="my-10 font-light">{card.value}</p>
                <p className="text-gray-500">{card.title}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Statistic</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#E91E63"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#4CAF50"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Retention Rate</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-center gap-4">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <p>
                      {entry.name} {entry.value}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportDashboard;
