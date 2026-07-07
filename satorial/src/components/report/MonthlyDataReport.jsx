import { useState, useEffect, useRef } from "react";
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

const FILTERS = [
  "All Time",
  "This Year",
  "Custom Date",
];

const CustomBarChart = ({ data, color, title, legend, selectedFilter, customYear, onYearChange }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!showYearPicker) return;
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowYearPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showYearPicker]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {selectedFilter !== "All Time" && (
          <div className="relative" ref={pickerRef}>
            <div
              className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg cursor-pointer hover:bg-gray-200"
              onClick={() => setShowYearPicker(!showYearPicker)}
            >
              <span>{customYear}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
            {showYearPicker && (
              <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg p-2 z-10">
                <input
                  type="number"
                  value={customYear}
                  onChange={(e) => onYearChange(e.target.value)}
                  min="2000"
                  max="2100"
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}
      </div>

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
  selectedFilter: PropTypes.string,
  customYear: PropTypes.string,
  onYearChange: PropTypes.func,
};

const MonthlyDataReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [customYear, setCustomYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [allSalesData, setAllSalesData] = useState([]);
  const [allExpensesData, setAllExpensesData] = useState([]);
  const [allOrdersData, setAllOrdersData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ReportService.getMonthlyStatistics();
        const items = Array.isArray(data) ? data : data?.results || [];
        setAllSalesData(
          items.map((item) => ({ month: item.month, value: item.sales }))
        );
        setAllExpensesData(
          items.map((item) => ({ month: item.month, value: item.expenses }))
        );
        setAllOrdersData(
          items.map((item) => ({ month: item.month, value: item.orders ?? 0 }))
        );
      } catch {
        setError("Failed to load monthly statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFilter === "All Time") {
      setSalesData(allSalesData);
      setExpensesData(allExpensesData);
      setOrdersData(allOrdersData);
      return;
    }
    if (selectedFilter === "This Year" || selectedFilter === "Custom Date") {
      const hasYearInfo = allSalesData.some((d) => d.month && /\d{4}/.test(d.month));
      if (!hasYearInfo) {
        setSalesData(allSalesData);
        setExpensesData(allExpensesData);
        setOrdersData(allOrdersData);
        return;
      }
      const year = parseInt(customYear);
      const filterByYear = (d) => d.month && d.month.includes(String(year));
      setSalesData(allSalesData.filter(filterByYear));
      setExpensesData(allExpensesData.filter(filterByYear));
      setOrdersData(allOrdersData.filter(filterByYear));
    }
  }, [selectedFilter, customYear, allSalesData, allExpensesData, allOrdersData]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Monthly Data Report</h2>
        <div className="flex space-x-2">
          {FILTERS.map((filter) => (
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

      {loading && <div className="text-center py-10">Loading...</div>}
      {error && <div className="text-center text-red-500 py-10">{error}</div>}
      {!loading && !error && (
        <>
          <CustomBarChart
            data={salesData}
            color="#00C853"
            title="Sales Analysis"
            legend="Monthly Sales"
            selectedFilter={selectedFilter}
            customYear={customYear}
            onYearChange={setCustomYear}
          />
          <CustomBarChart
            data={expensesData}
            color="#F57C00"
            title="Expenses Analysis"
            legend="Monthly Expenses"
            selectedFilter={selectedFilter}
            customYear={customYear}
            onYearChange={setCustomYear}
          />
          <CustomBarChart
            data={ordersData}
            color="#9C27B0"
            title="Order Analysis"
            legend="Monthly Orders"
            selectedFilter={selectedFilter}
            customYear={customYear}
            onYearChange={setCustomYear}
          />
        </>
      )}
    </div>
  );
};

export default MonthlyDataReport;
