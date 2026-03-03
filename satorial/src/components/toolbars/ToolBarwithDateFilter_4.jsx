import { useState } from "react";
import { Calendar, ChevronDown, X, Download } from "lucide-react";
import PropTypes from "prop-types";

const ToolbarWithDateFilter_4 = ({
  onSearchChange,
  onDateFilterChange,
  onCustomDateRangeChange,
}) => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });

  const filters = ["All Time", "Today", "This Week", "This Month", "This Year"];

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

  const hasActiveFilters = selectedFilter !== "All Time" || searchTerm;

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedFilter("All Time");
    setCustomDateRange({ start: "", end: "" });
    setIsCustomDateOpen(false);

    onSearchChange("");
    onDateFilterChange("All Time");
    onCustomDateRangeChange(null);
  };

  const handleExportData = () => {
    // TODO: Implement CSV/PDF export
  };

  return (
    <div className="bg-white py-4 px-6 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Payments</h2>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportData}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Date Filters */}
        <div className="flex items-center space-x-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleDateFilterChange(filter)}
              className={`px-4 py-2 border rounded-md text-sm font-medium transition ${
                selectedFilter === filter
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}

          <button
            className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium transition ${
              selectedFilter === "Custom"
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => handleDateFilterChange("Custom")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Custom Date
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search payments, clients, amounts..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-300 rounded-md py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {isCustomDateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Select Custom Date Range
            </h3>

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
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCustomDateCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomDateSubmit}
                disabled={!customDateRange.start || !customDateRange.end}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span>Active filters:</span>
          {searchTerm && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
              Search: "{searchTerm}"
            </span>
          )}
          {selectedFilter !== "All Time" && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
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
        </div>
      )}
    </div>
  );
};

ToolbarWithDateFilter_4.propTypes = {
  onSearchChange: PropTypes.func,
  onDateFilterChange: PropTypes.func,
  onCustomDateRangeChange: PropTypes.func,
};

export default ToolbarWithDateFilter_4;
