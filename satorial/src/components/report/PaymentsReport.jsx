import {
  Mail,
  User,
  Search,
  Download,
  MoreVertical,
  CheckSquare,
} from "lucide-react";
import { useState } from "react";

const cards = [
  { title: "Fully Paid", value: "₦3,420,000", icon: <Mail />, bg: "bg-green-100" },
  { title: "Partially Paid", value: "₦3,420,000", icon: <Mail />, bg: "bg-purple-100", },
  { title: "Payment Due", value: "₦3,420,000", icon: <User />, bg: "bg-yellow-100" },
  { title: "Not Paid", value: "₦1,120,000", icon: <User />, bg: "bg-blue-100" },
];

const PaymentsReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header & Filters */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px] font-semibold text-gray-900">
          Payment Report
        </h2>

        {/* Filter Buttons */}
        <div className="flex space-x-2 bg-white p-1 rounded-lg">
          {[
            "All Time",
            "Today",
            "This Week",
            "This Month",
            "This Year",
            "Custom Date",
          ].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-[6px] text-sm rounded-md border transition ${
                selectedFilter === filter
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-white text-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-md flex flex-col ${card.bg}`}
          >
            <div className="flex items-center mb-2 text-gray-600 border border-blue-600 w-10 h-10 rounded-full justify-center">
              {card.icon}
            </div>
            <p className="my-5 font-light">{card.value}</p>
            <p className="text-gray-500">{card.title}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6 " >
        {/* Payment Filters */}
        <div className="flex space-x-2 mb-4 bg-white p-1 rounded-lg">
          {[
            "All",
            "Fully Paid",
            "Partially paid",
            "Not Paid",
            "Payment Due",
          ].map((filter) => (
            <button
              key={filter}
              className="px-4 py-[6px] text-sm rounded-md border bg-gray-200 text-gray-700"
            >
              {filter}
            </button>
          ))}
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
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-200 text-gray-700 text-left">
            <tr>
              {[
                "",
                "Client Name",
                "Order Name",
                "Amount",
                "Payment Date",
                "",
              ].map((header, index) => (
                <th key={index} className="p-3 text-sm font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {[...Array(6)].map((_, index) => (
              <tr key={index} className="border-b text-gray-700">
                <td className="p-3">
                  <CheckSquare className="w-5 h-5 text-gray-500" />
                </td>
                <td className="p-3 text-sm">Kemi Johnson</td>
                <td className="p-3 text-sm">Wedding Gown</td>
                <td className="p-3 text-sm">500,000</td>
                <td className="p-3 text-sm">14/04/2024</td>
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

export default PaymentsReport;
