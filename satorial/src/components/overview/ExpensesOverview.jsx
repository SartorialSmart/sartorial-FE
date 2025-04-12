import { useState } from "react";
import { Wallet, Banknote } from "lucide-react";

const ExpensesOverview = () => {
  const [activeFilter, setActiveFilter] = useState("All Time");

  const filters = ["All Time", "Today", "This Week", "This Month", "This Year", "Custom Date"];

  const cards = [
    { title: "Total Expense Amount", value: "₦1,120,000", icon: <Wallet />, bg: "bg-green-100" },
    { title: "Total Expense Categories", value: "11", icon: <Banknote />, bg: "bg-purple-100", },
   
  ];


  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-xl font-semibold mb-4">Expenses</h2>

      <div className="flex items-center gap-2 mb-6">
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
        <button className="ml-auto px-4 py-2 text-white bg-blue-600 rounded-md text-sm">
          + Create Expense
        </button>
      </div>

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
    </div>
  );
};

export default ExpensesOverview;
