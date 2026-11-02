import { useState, useEffect } from "react";
import { Wallet, Banknote, TrendingUp, AlertCircle } from "lucide-react";
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
        const summaryRes = await ExpensesService.getExpenseSummary();
        let total = null;
        if (summaryRes) {
          total =
            summaryRes.total_expense_amount ||
            summaryRes.total ||
            summaryRes.amount ||
            0;
        }
        setTotalExpense(total);

        const catRes = await ExpensescategoryService.getExpenseCategoriesList();
        let categories = Array.isArray(catRes)
          ? catRes
          : catRes.results || [];
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
      value: `₦${Number(totalExpense || 0).toLocaleString()}`,
      icon: <Wallet size={20} />,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      description: "Sum of all recorded expenses",
    },
    {
      title: "Total Expense Categories",
      value: totalCategories || 0,
      icon: <Banknote size={20} />,
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      borderColor: "border-purple-200",
      description: "Active expense categories",
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="animate-pulse">
            <div className="h-8 w-40 bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-36 bg-gray-200 rounded-2xl"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load expenses</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-2">Track and manage all business expenses</p>
        </div>
        <AddButton
          text="Create Expense"
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold mt-1">
                ₦{Number(totalExpense || 0).toLocaleString()}
              </p>
              <p className="text-green-200 text-xs mt-2">All recorded expenses</p>
            </div>
            <TrendingUp size={24} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Categories</p>
              <p className="text-2xl font-bold mt-1">{totalCategories || 0}</p>
              <p className="text-purple-200 text-xs mt-2">Active expense categories</p>
            </div>
            <Banknote size={24} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              activeFilter === filter
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border-2 ${card.bgColor} ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-600 mt-1">{card.title}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{card.description}</p>
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
