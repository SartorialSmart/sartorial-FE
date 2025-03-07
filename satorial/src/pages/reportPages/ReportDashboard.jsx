import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const data = [
  { month: "Jan", expenses: 400000, sales: 300000 },
  { month: "Feb", expenses: 700000, sales: 500000 },
  { month: "Mar", expenses: 600000, sales: 400000 },
  { month: "Apr", expenses: 900000, sales: 600000 },
  { month: "May", expenses: 800000, sales: 500000 },
  { month: "Jun", expenses: 800000, sales: 600000 },
  { month: "Jul", expenses: 900000, sales: 700000 },
  { month: "Aug", expenses: 1100000, sales: 900000 },
  { month: "Sep", expenses: 950000, sales: 800000 },
  { month: "Oct", expenses: 720000, sales: 650000 },
  { month: "Nov", expenses: 600000, sales: 500000 },
  { month: "Dec", expenses: 500000, sales: 400000 },
];

const pieData = [
  { name: "New Customers", value: 60 },
  { name: "Returning Customers", value: 40 },
];

const COLORS = ["#42A5F5", "#66BB6A"];

const ReportDashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          {['All Time', 'Today', 'This Week', 'This Month', 'This Year', 'Custom Date'].map((filter, index) => (
            <button key={index} className={`px-4 py-2 rounded-lg ${index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{filter}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
          { title: "Total Orders", value: "112", bg: "bg-green-100" },
          { title: "Total Delivered", value: "112", bg: "bg-blue-100" },
          { title: "Total Clients", value: "112", bg: "bg-yellow-100" },
          { title: "Total Expense Amount", value: "₦1,120,000", bg: "bg-red-100" },
          { title: "Total Sales Amount", value: "₦3,420,000", bg: "bg-purple-100" },
          { title: "Total Staff", value: "112", bg: "bg-teal-100" },
        ].map((card, index) => (
          <div key={index} className={`p-6 rounded-lg shadow ${card.bg}`}>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-gray-700">{card.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Statistic</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="expenses" stroke="#E91E63" strokeWidth={2} />
              <Line type="monotone" dataKey="sales" stroke="#4CAF50" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Retention Rate</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <p>{entry.name} {entry.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
