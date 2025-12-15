import { useState, useEffect } from "react";
import { Wallet, Banknote } from "lucide-react";
import AddButton from "../buttons/AddButton";
import AddExpensesFormModal from "../modals/formModals/AddExpensesFormModal";
import ExpensesService from "../../services/expensesServices/ExpensesService";
import ExpensescategoryService from "../../services/expensesServices/ExpensesCategoryService";

const ExpensesOverview = () => {
  const [activeFilter, setActiveFilter] = useState("All Time");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalExpense, setTotalExpense] = useState(null);
  const [totalCategories, setTotalCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filters = [
    "All Time",
    "Today",
    "This Week",
    "This Month",
    "This Year",
    "Custom Date",
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch expense summary
        const summaryRes = await ExpensesService.getExpenseSummary();
        // Try to get total amount from common keys
        let total = null;
        if (summaryRes.data) {
          total =
            summaryRes.data.total_expense_amount ||
            summaryRes.data.total ||
            summaryRes.data.amount ||
            0;
        }
        setTotalExpense(total);

        // Fetch categories
        const catRes = await ExpensescategoryService.getExpenseCategoriesList();
        let categories = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.results || [];
        setTotalCategories(categories.length);
      } catch {
        setError("Failed to load expenses overview. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    {
      title: "Total Expense Amount",
      value: loading
        ? "Loading..."
        : error
        ? "-"
        : `₦${Number(totalExpense).toLocaleString()}`,
      icon: <Wallet />,
      bg: "bg-green-100",
    },
    {
      title: "Total Expense Categories",
      value: loading ? "Loading..." : error ? "-" : totalCategories,
      icon: <Banknote />,
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-xl font-semibold mb-4">Expenses</h2>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 text-sm rounded-md border ${
                activeFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <AddButton
          text="Create Expenses"
          onClick={() => setIsModalOpen(true)}
          className="flex justify-end items-center gap-2 px-4 py-2 border rounded-lg bg-white border-gray-300"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Add Expenses Modal */}
      <AddExpensesFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ExpensesOverview;
