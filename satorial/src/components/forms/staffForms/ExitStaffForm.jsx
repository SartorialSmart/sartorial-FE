import { useState } from "react";
import { X, Calendar } from "lucide-react";

const ExitStaffForm = ({ onClose }) => {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [exitReason, setExitReason] = useState("");

  const handleSubmit = () => {
    console.log({ selectedStaff, exitDate, exitReason });
    onClose();
  };

  return (
    <div className="bg-white w-[400px] p-6 rounded-lg ">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Exit Staff</h2>
        
      </div>


      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">Search staff</label>
        <select
          className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white focus:outline-none"
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
        >
          <option value="">Select</option>
          <option value="staff1">Kemi Johnson</option>
          <option value="staff2">John Doe</option>
        </select>
      </div>


      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">
          Exit Date <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
          />
          <Calendar size={18} className="absolute right-3 top-3 text-gray-500" />
        </div>
      </div>


      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">Reason for exit</label>
        <textarea
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none"
          placeholder="Enter reason"
          value={exitReason}
          onChange={(e) => setExitReason(e.target.value)}
          rows="3"
        />
      </div>


      <button
        className="w-full bg-blue-600 text-white font-medium p-2 rounded-md hover:bg-blue-700 transition"
        onClick={handleSubmit}
      >
        Exit
      </button>
    </div>
  );
};

export default ExitStaffForm;
