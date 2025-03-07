import { useState } from "react";
import { Calendar, Plus, ChevronDown } from "lucide-react";


const ToolbarWithDateFilter_4 = () => {
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

      <div className="">
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

          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-600 text-sm font-medium">
            <Calendar className="w-4 h-4 mr-2" />
            Custom Date
          </button>

        </div>

        <div className="flex items-start space-x-3">
          <input
            type="text"
            placeholder="Search here..."
            className="border border-gray-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
     
    </div>
  );
};

export default ToolbarWithDateFilter_4;
