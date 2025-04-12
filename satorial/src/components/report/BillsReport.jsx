import { Search, Download, MoreVertical, CheckSquare } from "lucide-react";
import { useState } from "react";

const BillsReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header & Filters */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px] font-semibold text-gray-900">
          Bills Report
        </h2>

        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {["All Time", "Today", "This Week", "This Month", "This Year", "Custom Date"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-[6px] text-sm rounded-md border transition ${
                selectedFilter === filter ? "bg-blue-600 text-white font-semibold" : "bg-gray-200 text-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Export */}
      <div className="flex justify-end items-center mb-4 space-x-3">
        <div className="relative w-[300px]">
          <input
            type="text"
            placeholder="Search here..."
            className="border border-gray-300 rounded-lg px-4 py-[9px] pl-10 w-full bg-white text-sm focus:ring focus:ring-gray-200 outline-none"
          />
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        </div>
        <button className="flex items-center px-4 py-[9px] border border-gray-300 rounded-lg bg-white text-sm text-gray-700">
          <Download className="w-5 h-5 mr-2 text-gray-600" />
          Export
        </button>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-200 text-gray-700 text-left">
            <tr>
              {["", "Date", "Vendor Name", "Vendor Category", "Quantity", "Amount", "Amount Paid", "Balance", ""].map((header, index) => (
                <th key={index} className="p-3 text-sm font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {[...Array(8)].map((_, index) => (
              <tr key={index} className="border-b text-gray-700">
                <td className="p-3">
                  <CheckSquare className="w-5 h-5 text-gray-500" />
                </td>
                <td className="p-3 text-sm">14/04/2024</td>
                <td className="p-3 text-sm">Jumia</td>
                <td className="p-3 text-sm">Sewing Machines</td>
                <td className="p-3 text-sm">10</td>
                <td className="p-3 text-sm">1,500,000</td>
                <td className="p-3 text-sm">1,000,000</td>
                <td className="p-3 text-sm">500,000</td>
                <td className="p-3 text-right">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillsReport;
