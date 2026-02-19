import { useState } from "react";
import { Upload, Search } from "lucide-react";
import PropTypes from "prop-types";
import AddButton from "../buttons/AddButton";
import ClientFormModal from "../modals/formModals/ClientFormModal";

const Toolbar_1 = ({
  searchQuery = "",
  onSearchChange = () => {},
  filterBy = "all",
  onFilterChange = () => {},
  filterOptions,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultFilterOptions = [
    { value: "all", label: "All" },
    { value: "withAddress", label: "With address" },
    { value: "withoutAddress", label: "Without address" },
  ];

  return (
    <div className="bg-white py-4 px-6 rounded-xl shadow-sm border border-gray-100">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-600 mb-4">
        <span className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">Dashboard</span>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Clients</span>
      </nav>

      {/* Main Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* Title Section */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and view all client records</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Upload size={16} />
            Upload Clients
          </button>
          <AddButton text="Add Client" onClick={() => setIsModalOpen(true)} />
        </div>
      </div>

      {/* Filter & Search Row */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="client-filter" className="text-sm text-gray-600 font-medium">Filter:</label>
          <select
            id="client-filter"
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={filterBy}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            {(filterOptions ?? defaultFilterOptions).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <ClientFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

Toolbar_1.propTypes = {
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  filterBy: PropTypes.string,
  onFilterChange: PropTypes.func,
  filterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
};

export default Toolbar_1;
