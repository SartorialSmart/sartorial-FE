import { useState, useEffect } from "react";
import { Mail, User, CreditCard } from "lucide-react";
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

const COLORS = ["#42A5F5", "#66BB6A"];

const ReportDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ReportService.getReportSummary();
        setSummary(data || {});
      } catch {
        setError("Failed to load report summary.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cards mapping: adjust keys as per your API response
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
      title: "Total Staff",
      value: summary.total_staff ?? "-",
      icon: <User />,
      bg: "bg-teal-100",
    },
  ];

  // Chart data: expects summary.monthly_stats = [{ month, expenses, sales }]
  const chartData = summary.monthly_stats || [];

  // Pie data: expects summary.retention = [{ name, value }]
  const pieData = summary.retention || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light">Dashboard</h1>
        <div className="flex gap-2">
          {[
            "All Time",
            "Today",
            "This Week",
            "This Month",
            "This Year",
            "Custom Date",
          ].map((filter, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg ${
                index === 0
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

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
