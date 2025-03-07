import { useState } from "react";
import { Calendar } from "lucide-react";
import AddButton from "../buttons/AddButton";
import AddOrderFormModal from "../modals/formModals/AddOrderFormModal";

const ToolbarWithDateFilter_1 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Time");

  const filters = ["All Time", "Today", "This Week", "This Month", "This Year"];

  return (
    <div className="p-4 shadow-sm flex flex-col gap-4 bg-white rounded-md">

      <nav className="text-sm text-gray-500">
        <span className="text-blue-500 cursor-pointer">Dashboard</span> &gt; Orders
      </nav>


      <div className="flex flex-wrap justify-between items-center gap-4">

        <h2 className="text-2xl font-semibold">Orders</h2>


        <div className="flex gap-2">

          <div className="flex border rounded-md overflow-hidden">
            {filters.map((label) => (
              <button
                key={label}
                onClick={() => setSelectedFilter(label)}
                className={`px-4 py-2 text-sm ${
                  selectedFilter === label ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>


          <button className="flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-100">
            <Calendar size={16} />
            Custom Date
          </button>

        </div>
        <AddButton text="Create Order" onClick={() => setIsModalOpen(true)} />
      </div>


      {isModalOpen && <AddOrderFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default ToolbarWithDateFilter_1