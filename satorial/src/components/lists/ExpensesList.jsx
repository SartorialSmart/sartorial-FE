import { useState, useEffect } from "react";
import { MoreVertical, Search, Download, Loader2 } from "lucide-react";
import ExpensesService from "../../services/expensesServices/ExpensesService";

const ExpensesList = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Update the fetchExpenses function
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await ExpensesService.getExpenseList();
      console.log("Expenses data:", data); // Debug log

      // Check if data has results property
      const expensesList = data.results || data || [];
      setExpenses(expensesList);
      setError(null);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setError("Failed to load expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between mb-4">
        {/* Dropdown */}
        <select
          className="border rounded-md px-3 py-2 text-gray-700 bg-white"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Materials">Materials</option>
          <option value="Labor">Labor</option>
        </select>

        {/* Search Bar */}
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search here..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Export Button */}
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-600">
              <th className="p-3">
                <input type="checkbox" />
              </th>
              {[
                "Date/Time",
                "Category",
                "Amount",
                "Created by",
                "Paid to",
                "Actions",
              ].map((header, idx) => (
                <th key={idx} className="p-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No expenses found
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="border-t">
                  <td className="p-3">
                    <input type="checkbox" />
                  </td>
                  <td className="p-3">
                    {expense.created_at
                      ? new Date(expense.created_at).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="p-3">{expense.category?.name || "N/A"}</td>
                  <td className="p-3">
                    ₦
                    {expense.amount
                      ? Number(expense.amount).toLocaleString()
                      : "0"}
                  </td>
                  <td className="p-3">{expense.created_by}</td>
                  <td className="p-3">{expense.paid_to}</td>
                  <td className="p-3">
                    <button className="p-2 rounded-full hover:bg-gray-200">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensesList;
