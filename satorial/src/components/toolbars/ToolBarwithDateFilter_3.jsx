import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import BillsFormModal from "../modals/formModals/BillsFormModal";
import AddButton from "../buttons/AddButton";

const ToolbarWithDateFilter_3 = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filters = ["All Time", "Today", "This Week", "This Month", "This Year"];

  return (
    <div className="flex items-center justify-between bg-white py-4 px-6 rounded-lg shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold mb-8">Orders</h2>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white border-gray-300">
          Status <ChevronDown size={16} />
        </button>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-6">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 border rounded-md text-sm font-medium ${
                selectedFilter === filter
                  ? "bg-blue-600 text-white"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {filter}
            </button>
          ))}
          <AddButton text="Add Bill" onClick={() => setIsModalOpen(true)} />
        </div>
      </div>

      <BillsFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ToolbarWithDateFilter_3;
