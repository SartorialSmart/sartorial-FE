import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

const CustomBarChart = ({ data, color, title }) => (
  <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="month" tick={{ fill: "#666" }} />
        <YAxis tick={{ fill: "#666" }} />
        <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const MonthlyDataReport = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <CustomBarChart data={salesData} color="#00C853" title="Monthly Sales" />
      <CustomBarChart data={expensesData} color="#F57C00" title="Monthly Expenses" />
      <CustomBarChart data={ordersData} color="#9C27B0" title="Monthly Orders" />
    </div>
  );
};

export default MonthlyDataReport;
