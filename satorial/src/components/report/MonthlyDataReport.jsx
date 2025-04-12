import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";

const salesData = [
  { month: "Jan", value: 400000 },
  { month: "Feb", value: 300000 },
  { month: "Mar", value: 600000 },
  { month: "Apr", value: 450000 },
  { month: "May", value: 500000 },
  { month: "Jun", value: 480000 },
  { month: "Jul", value: 520000 },
  { month: "Aug", value: 700000 },
  { month: "Sep", value: 550000 },
  { month: "Oct", value: 350000 },
  { month: "Nov", value: 450000 },
  { month: "Dec", value: 400000 },
];

const expensesData = salesData.map((item) => ({
  month: item.month,
  value: item.value * 0.6,
}));

const ordersData = salesData.map((item) => ({
  month: item.month,
  value: Math.round(item.value / 2000),
}));

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

const MonthlyDataReport = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Monthly Data Report</h2>

      <CustomBarChart data={salesData} color="#00C853" title="Sales Analysis" legend="Monthly Sales" />
      <CustomBarChart data={expensesData} color="#F57C00" title="Expenses Analysis" legend="Monthly Expenses" />
      <CustomBarChart data={ordersData} color="#9C27B0" title="Order Analysis" legend="Monthly Orders" />
    </div>
  );
};

export default MonthlyDataReport;
