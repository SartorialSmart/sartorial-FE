import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import ExitStaffFormModal from "../modals/formModals/ExitStaffFormModal";
import AddButton from "../buttons/AddButton";

const ToolbarWithDateFilter_8 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-between py-4 px-6 rounded-lg shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold mb-8">Dashboard</h2>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white border-gray-300">
          Status <ChevronDown size={16} />
        </button>
      </div>

      <div className="">
        <div className="flex items-center space-x-2 mb-6">
          <Link to="/staff/generate-payroll" text="Compute Payroll" className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition`} />
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="text"
            placeholder="Search here..."
            className="border border-gray-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <ExitStaffFormModal className="-z-50" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ToolbarWithDateFilter_8;
