import { useEffect, useState } from "react";
import { MoreVertical, Search, Plus } from "lucide-react";
import AddExpensesCategoryFormModal from "../modals/formModals/AddExpensesCategoryFormModal";
import ExpensescategoryService from "../../services/expensesServices/ExpensesCategoryService";

const ExpensesCategoryList = ({ searchTerm = "", setSearchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownIndex, setDropdownIndex] = useState(null);

  const fetchExpenseCategories = async () => {
    try {
      const response = await ExpensescategoryService.getExpenseCategoriesList();
      setExpenseCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch expense categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownToggle = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleEdit = (id) => {
    console.log("Editing category with id:", id);
  };

  const handleDelete = (id) => {
    console.log("Deleting category with id:", id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownIndex(null);
    };

    if (dropdownIndex !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [dropdownIndex]);

  useEffect(() => {
    fetchExpenseCategories();
  }, []);

  // Filter categories based on search term
  const normalized = (searchTerm || "").toString().trim().toLowerCase();
  const filteredCategories = (expenseCategories || []).filter((row) => {
    if (!normalized) return true;
    const name = (row.name || "").toString().toLowerCase();
    const expenseCount = (row.expense_count ?? "").toString().toLowerCase();
    return name.includes(normalized) || expenseCount.includes(normalized);
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Expense Categories
        </h2>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search categories..."
              className="pl-10 pr-4 py-2 border rounded-md w-60 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            />
          </div>

          {/* Create Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-all"
          >
            <Plus size={16} />
            Create Expense Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
            Loading categories...
          </div>
        ) : (
          <>
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-600">
                  <th className="p-4">
                    <input type="checkbox" />
                  </th>
                  {["Category", "No of Expense", "Actions"].map(
                    (header, idx) => (
                      <th
                        key={idx}
                        className="p-4 font-medium text-sm text-gray-700"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((expense, index) => (
                    <tr
                      key={expense.id || index}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <input type="checkbox" />
                      </td>
                      <td className="p-4">{expense.name}</td>
                      <td className="p-4">{expense.expense_count || 0}</td>
                      <td className="p-4 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownToggle(index);
                          }}
                          className="p-2 rounded-full hover:bg-gray-200"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {dropdownIndex === index && (
                          <div className="absolute bg-white shadow-lg rounded-md mt-2 w-40 z-30 right-0">
                            <button
                              onClick={() => handleEdit(expense.id)}
                              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      {normalized
                        ? `No categories found matching "${searchTerm}"`
                        : "No expense categories found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Results summary */}
            {normalized && (
              <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
                Showing {filteredCategories.length} of{" "}
                {expenseCategories.length} categories
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AddExpensesCategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchExpenseCategories(); // Refresh after modal close
        }}
      />
    </div>
  );
};

export default ExpensesCategoryList;
