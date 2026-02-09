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

  return (
    <div className="bg-gray-100 px-6 py-4">

      <div className="flex items-center text-sm text-gray-500 mb-3">
        <a href="/dashboard" className="text-blue-500 hover:underline">
          Dashboard
        </a>
        <span className="mx-1">›</span>
        <span>Clients</span>
      </div>


      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Clients</h1>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50">
            <Upload size={16} />
            Upload Clients
          </button>

          <AddButton text="Add Client" onClick={() => setIsModalOpen(true)} />
        </div>
      </div>


      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="client-filter" className="text-sm text-gray-600">Filter:</label>
          <select
            id="client-filter"
            className="px-3 py-2 border rounded-lg bg-white border-gray-300 text-sm"
            value={filterBy}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            {(filterOptions ?? [
              { value: "all", label: "All" },
              { value: "withAddress", label: "With address" },
              { value: "withoutAddress", label: "Without address" },
            ]).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center px-4 py-2 border rounded-lg bg-white border-gray-300 w-full sm:w-64">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search here..."
            className="ml-2 outline-none w-full bg-transparent"
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
