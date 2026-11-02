import { useState } from "react";
import { ChevronDown } from "lucide-react";
import BillsFormModal from "../modals/formModals/BillsFormModal";
import AddButton from "../buttons/AddButton";

const ToolbarWithDateFilter_3 = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filters = [
    { value: "All Time", label: "All Time" },
    { value: "Today", label: "Today" },
    { value: "This Week", label: "This Week" },
    { value: "This Month", label: "This Month" },
    { value: "This Year", label: "This Year" },
  ];

  return (
    <div className="bg-white py-4 px-6 rounded-xl shadow-sm border border-gray-100">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and track all bills</p>
            </div>
          </div>

          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            Status <ChevronDown size={16} />
          </button>
        </div>

        <AddButton text="Add Bill" onClick={() => setIsModalOpen(true)} />
      </div>

      {/* Date Filters */}
      <div className="bg-gray-50 rounded-lg p-1 border border-gray-200 inline-flex flex-wrap gap-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              selectedFilter === filter.value
                ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                : "text-gray-600 hover:text-gray-800 hover:bg-white"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <BillsFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ToolbarWithDateFilter_3;
