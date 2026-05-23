import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X, Search, Filter } from "lucide-react";
import PropTypes from "prop-types";
import AddOrderFormModal from "../modals/formModals/AddOrderFormModal";
import AddButton from "../buttons/AddButton";

const ToolbarWithDateFilter_2 = ({
  onSearchChange,
  onDateFilterChange,
  onStatusFilterChange,
  onCustomDateRangeChange,
}) => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const statusDropdownRef = useRef(null);

  const filters = [
    { value: "All Time", label: "All Time" },
    { value: "Today", label: "Today" },
    { value: "This Week", label: "This Week" },
    { value: "This Month", label: "This Month" },
    { value: "This Year", label: "This Year" },
    { value: "Custom", label: "Custom Date" },
  ];

  const statusOptions = ["All", "Pending", "In Progress", "Completed"];

  // Close status dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    if (isStatusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isStatusDropdownOpen]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleDateFilterChange = (filter) => {
    setSelectedFilter(filter);
    onDateFilterChange(filter);

    if (filter === "Custom") {
      setIsCustomDateOpen(true);
    } else {
      setIsCustomDateOpen(false);
      setCustomDateRange({ start: "", end: "" });
      onCustomDateRangeChange(null);
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setIsStatusDropdownOpen(false);
    onStatusFilterChange(status);
  };

  const handleCustomDateSubmit = () => {
    if (customDateRange.start && customDateRange.end) {
      onCustomDateRangeChange(customDateRange);
      setIsCustomDateOpen(false);
    }
  };

  const handleCustomDateCancel = () => {
    setIsCustomDateOpen(false);
    setCustomDateRange({ start: "", end: "" });
    setSelectedFilter("All Time");
    onDateFilterChange("All Time");
    onCustomDateRangeChange(null);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearchChange("");
  };

  const hasActiveFilters =
    selectedFilter !== "All Time" || selectedStatus !== "All" || searchTerm;

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedFilter("All Time");
    setSelectedStatus("All");
    setCustomDateRange({ start: "", end: "" });
    setIsCustomDateOpen(false);

    onSearchChange("");
    onDateFilterChange("All Time");
    onStatusFilterChange("All");
    onCustomDateRangeChange(null);
  };

  return (
    <div className="bg-white py-4 px-6 rounded-xl shadow-sm border border-gray-100">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          </div>

          {/* Status Filter */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              Status: {selectedStatus} <ChevronDown size={16} className={`transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px] py-1">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedStatus === status
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => handleStatusChange(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, clients..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-64 placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <AddButton text="Create Order" onClick={() => setIsModalOpen(true)} />
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-gray-50 rounded-lg p-1 border border-gray-200 inline-flex flex-wrap gap-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleDateFilterChange(filter.value)}
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

      {/* Custom Date Range Modal */}
      {isCustomDateOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={handleCustomDateCancel}>
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Select Date Range</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCustomDateCancel}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomDateSubmit}
                disabled={!customDateRange.start || !customDateRange.end}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Filter size={16} className="text-blue-600" />
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {searchTerm && (
              <span className="bg-white text-blue-700 px-2 py-1 rounded-md border border-blue-200">
                Search: &ldquo;{searchTerm}&rdquo;
              </span>
            )}
            {selectedFilter !== "All Time" && (
              <span className="bg-white text-blue-700 px-2 py-1 rounded-md border border-blue-200">
                Date: {selectedFilter}
                {selectedFilter === "Custom" &&
                  customDateRange.start &&
                  customDateRange.end && (
                    <span className="ml-1">
                      ({customDateRange.start} to {customDateRange.end})
                    </span>
                  )}
              </span>
            )}
            {selectedStatus !== "All" && (
              <span className="bg-white text-blue-700 px-2 py-1 rounded-md border border-blue-200">
                Status: {selectedStatus}
              </span>
            )}
          </div>
        </div>
      )}

      <AddOrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

ToolbarWithDateFilter_2.propTypes = {
  onSearchChange: PropTypes.func,
  onDateFilterChange: PropTypes.func,
  onStatusFilterChange: PropTypes.func,
  onCustomDateRangeChange: PropTypes.func,
};

export default ToolbarWithDateFilter_2;
