import { useState } from "react";
import { MoreVertical, Search, Plus } from "lucide-react";

const InventoryCategoryList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample Inventory Category Data
  const categories = Array(10).fill({
    category: "Fabric",
    itemCount: 10,
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Inventory Category</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
          <Plus size={16} />
          Add Inventory Category
        </button>
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

      {/* Inventory Category Table */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-600">
              <th className="p-3">
                <input type="checkbox" />
              </th>
              {["Category", "No of Items", "Actions"].map((header, idx) => (
                <th key={idx} className="p-3 font-medium">{header}</th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {categories.map((category, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3">{category.category}</td>
                <td className="p-3">{category.itemCount}</td>
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

export default InventoryCategoryList;
