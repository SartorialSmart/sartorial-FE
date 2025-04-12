import { useState } from "react";
import { MoreVertical, Search, Plus, Download } from "lucide-react";

const DispenseInventoryList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample Data
  const dispensedItems = Array(10).fill({
    date: "14/04/2024",
    itemName: "Lace material",
    dispensedTo: "Kemi Johnson",
    quantity: "10 Yards",
    reason: "Sewing of aso ebi blouse",
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Dispense Inventory</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
            <Plus size={16} />
            Dispense Item
          </button>
          <button className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end mb-4">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Dispensed Inventory Table */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-600">
              <th className="p-3">
                <input type="checkbox" />
              </th>
              {["Date", "Item Name", "Dispensed to", "Quantity Dispensed", "Reason"].map(
                (header, idx) => (
                  <th key={idx} className="p-3 font-medium">{header}</th>
                )
              )}
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {dispensedItems.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3">{item.date}</td>
                <td className="p-3">{item.itemName}</td>
                <td className="p-3">{item.dispensedTo}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">{item.reason}</td>
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

export default DispenseInventoryList;
