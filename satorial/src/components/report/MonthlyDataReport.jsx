import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";
import ReportService from "../../services/ReportService";
import PropTypes from "prop-types";

const CustomBarChart = ({ data, color, title, legend }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="relative flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg cursor-pointer">
          <span>2024</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Chart Container */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis dataKey="month" tick={{ fill: "#666" }} />
          <YAxis tick={{ fill: "#666" }} />
          <Tooltip
            formatter={(value) => `₦${value.toLocaleString()}`}
            cursor={{ fill: "transparent" }}
          />
          <Bar
            dataKey="value"
            fill={color}
            radius={[4, 4, 0, 0]}
            barSize={40}
            fillOpacity={(entry, index) => (index === activeIndex ? 1 : 0.4)}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center mt-4 text-gray-600">
        <span
          className="w-3 h-3 inline-block mr-2 rounded-full"
          style={{ backgroundColor: color }}
        ></span>
        {legend}
      </div>
    </div>
  );
};

CustomBarChart.propTypes = {
  data: PropTypes.array.isRequired,
  color: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  legend: PropTypes.string.isRequired,
};

const MonthlyDataReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ReportService.getMonthlyStatistics();
        console.log("Monthly statistics data:", data);
        // data is an array of { month, sales, expenses }
        setSalesData(
          data.map((item) => ({ month: item.month, value: item.sales }))
        );
        setExpensesData(
          data.map((item) => ({ month: item.month, value: item.expenses }))
        );
        setOrdersData(data.map((item) => ({ month: item.month, value: 0 })));
      } catch {
        setError("Failed to load monthly statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Monthly Data Report</h2>
      {loading && <div className="text-center py-10">Loading...</div>}
      {error && <div className="text-center text-red-500 py-10">{error}</div>}
      {!loading && !error && (
        <>
          <CustomBarChart
            data={salesData}
            color="#00C853"
            title="Sales Analysis"
            legend="Monthly Sales"
          />
          <CustomBarChart
            data={expensesData}
            color="#F57C00"
            title="Expenses Analysis"
            legend="Monthly Expenses"
          />
          <CustomBarChart
            data={ordersData}
            color="#9C27B0"
            title="Order Analysis"
            legend="Monthly Orders"
          />
        </>
      )}
    </div>
  );
};

export default MonthlyDataReport;
