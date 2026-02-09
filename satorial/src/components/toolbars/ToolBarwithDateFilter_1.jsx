import { useState } from "react";
import { Calendar, Filter, Plus } from "lucide-react";
import PropTypes from "prop-types";
import AddButton from "../buttons/AddButton";
import AddOrderFormModal from "../modals/formModals/AddOrderFormModal";

const ToolbarWithDateFilter_1 = ({ onFilterChange, onDateFilterChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: ""
  });

  const filters = [
    { value: "All Time", label: "All Time" },
    { value: "Today", label: "Today" },
    { value: "This Week", label: "This Week" },
    { value: "This Month", label: "This Month" },
    { value: "This Year", label: "This Year" },
    { value: "Custom", label: "Custom Date" }
  ];

  const handleFilterSelect = (filterValue) => {
    setSelectedFilter(filterValue);
    setShowCustomDate(filterValue === "Custom");
    
    if (filterValue !== "Custom") {
      onDateFilterChange?.(filterValue, null);
    }
  };

  const handleCustomDateApply = () => {
    if (customDateRange.start && customDateRange.end) {
      onDateFilterChange?.("Custom", customDateRange);
      setShowCustomDate(false);
    }
  };

  const handleCustomDateCancel = () => {
    setShowCustomDate(false);
    setSelectedFilter("All Time");
    setCustomDateRange({ start: "", end: "" });
    onDateFilterChange?.("All Time", null);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-600 mb-4">
        <span className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">Dashboard</span>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Orders</span>
      </nav>

      {/* Main Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title Section */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date Filter Section */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Quick Date Filters */}
            <div className="bg-gray-50 rounded-lg p-1 border border-gray-200">
              <div className="flex flex-wrap gap-1">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleFilterSelect(filter.value)}
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
            </div>

            {/* Custom Date Picker */}
            {showCustomDate && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg absolute top-32 right-4 z-10 w-80">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-blue-600" />
                  <span className="font-medium text-gray-900">Select Date Range</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCustomDateApply}
                      disabled={!customDateRange.start || !customDateRange.end}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleCustomDateCancel}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Create Order Button */}
          <AddButton 
            text="Create Order" 
            onClick={() => setIsModalOpen(true)}
            icon={<Plus size={18} />}
            className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all rounded-md p-2 text-white"
          />
        </div>
      </div>

      {/* Active Filter Display */}
      {selectedFilter !== "All Time" && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Filter size={16} className="text-blue-600" />
          <span className="text-sm text-blue-700">
            Showing orders for: <strong>{selectedFilter}</strong>
            {selectedFilter === "Custom" && customDateRange.start && customDateRange.end && (
              <span> ({customDateRange.start} to {customDateRange.end})</span>
            )}
          </span>
          <button
            onClick={() => {
              setSelectedFilter("All Time");
              onDateFilterChange?.("All Time", null);
              setCustomDateRange({ start: "", end: "" });
            }}
            className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {isModalOpen && <AddOrderFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

ToolbarWithDateFilter_1.propTypes = {
  onFilterChange: PropTypes.func,
  onDateFilterChange: PropTypes.func,
};

export default ToolbarWithDateFilter_1;