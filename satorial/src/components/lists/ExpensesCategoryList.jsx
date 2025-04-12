import { MoreVertical, Search, Plus } from "lucide-react";

const ExpensesCategoryList = () => {
  const expenseCategories = Array(10).fill({
    category: "Materials",
    count: 10,
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Expense Categories</h2>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search here..."
              className="pl-10 pr-4 py-2 border rounded-md w-60 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Create Expense Category Button */}
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
            <Plus size={16} />
            Create Expense Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-600">
              <th className="p-3">
                <input type="checkbox" />
              </th>
              {["Category", "No of Expense", "Actions"].map((header, idx) => (
                <th key={idx} className="p-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {expenseCategories.map((expense, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3">{expense.category}</td>
                <td className="p-3">{expense.count}</td>
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

export default ExpensesCategoryList;
