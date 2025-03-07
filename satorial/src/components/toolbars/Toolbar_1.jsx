import { useState } from "react";
import { Upload, ChevronDown, Search } from "lucide-react";
import AddButton from "../buttons/AddButton";
import ClientFormModal from "../modals/formModals/ClientFormModal";

const Toolbar_1 = () => {
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


      <div className="flex justify-between items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white border-gray-300">
          Filter by <ChevronDown size={16} />
        </button>

        <div className="flex items-center px-4 py-2 border rounded-lg bg-white border-gray-300 w-64">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search here..."
            className="ml-2 outline-none w-full bg-transparent"
          />
        </div>
      </div>

      <ClientFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Toolbar_1;
