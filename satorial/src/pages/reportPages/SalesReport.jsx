import React from "react";

const SalesReport = () => {
  const salesData = Array(7).fill({
    clientName: "Kemi Johnson",
    orderName: "Wedding Gown",
    amount: "500,000",
    orderDate: "14/04/2024",
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">Sales Report</h1>

      {/* Sales Amount Card */}
      <div className="bg-purple-100 p-6 rounded-lg w-64 mb-6">
        <p className="text-xl font-bold">₦3,420,000</p>
        <p className="text-gray-600">Total Sales Amount</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {["All Time", "Today", "This Week", "This Month", "This Year", "Custom Date"].map((filter, index) => (
          <button key={index} className={`px-4 py-2 rounded-md border ${filter === "All Time" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border-gray-300"}`}>
            {filter}
          </button>
        ))}
      </div>

      {/* Search & Export */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search here..."
          className="px-4 py-2 border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Export</button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg shadow-lg">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-300 text-left">
              <th className="p-3"><input type="checkbox" /></th>
              <th className="p-3">Client Name</th>
              <th className="p-3">Order Name</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Order Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale, index) => (
              <tr key={index} className="border-b hover:bg-gray-100">
                <td className="p-3"><input type="checkbox" /></td>
                <td className="p-3">{sale.clientName}</td>
                <td className="p-3">{sale.orderName}</td>
                <td className="p-3">{sale.amount}</td>
                <td className="p-3">{sale.orderDate}</td>
                <td className="p-3 text-center">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;
