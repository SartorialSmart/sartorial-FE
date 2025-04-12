import { useState } from "react";
import { MoreVertical, Search, Download, Plus } from "lucide-react";

const InventoryList = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Sample Inventory Data
  const inventoryItems = Array(10).fill({
    date: "14/04/2024",
    itemName: "Lace material",
    category: "Fabric",
    quantity: "100 Yards",
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Inventory</h2>
        <div className="flex items-center gap-3">
          {/* Add Inventory Button */}
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
            <Plus size={16} />
            Add Inventory
          </button>

          {/* Export Button */}
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between mb-4">
        {/* Dropdown Filter */}
        <select
          className="border rounded-md px-3 py-2 text-gray-700 bg-white"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Fabric">Fabric</option>
          <option value="Accessories">Accessories</option>
        </select>

        {/* Search Input */}
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search here..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-600">
              <th className="p-3">
                <input type="checkbox" />
              </th>
              {["Date", "Item Name", "Inventory Category", "Quantity In Stock", "Actions"].map(
                (header, idx) => (
                  <th key={idx} className="p-3 font-medium">{header}</th>
                )
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {inventoryItems.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3">{item.date}</td>
                <td className="p-3">{item.itemName}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">
                  <button className="p-2 rounded-full hover:bg-gray-200">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
