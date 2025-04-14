import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import ExitStaffService from "../../../services/staffServices/ExitStaffSrvice";
import StaffService from "../../../services/staffServices/StaffService";

const ExitStaffForm = ({ onClose }) => {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [exitReason, setExitReason] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Fetch the staff list on component mount
  useEffect(() => {
    const fetchStaffList = async () => {
      setLoading(true);
      try {
        const data = await StaffService.listStaff();
        setStaffList(data.results); // Assuming the response contains a 'results' field with the list of staff
      } catch (error) {
        setError("Failed to load staff list.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffList();
  }, []);

  const handleSubmit = async () => {
    // Reset form errors
    setFormErrors({});

    // Validation
    const errors = {};
    if (!selectedStaff) errors.selectedStaff = "Staff selection is required.";
    if (!exitDate) errors.exitDate = "Exit date is required.";
    if (!exitReason) errors.exitReason = "Exit reason is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      await ExitStaffService.addExitedStaff(selectedStaff, exitDate, exitReason);
      onClose();
    } catch (error) {
      setError("Failed to exit staff.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-[400px] p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Exit Staff</h2>
        <button
          className="text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">Search staff</label>
        <select
          className={`w-full mt-1 p-2 border ${formErrors.selectedStaff ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
        >
          <option value="">Select</option>
          {staffList.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.first_name} {staff.last_name}
            </option>
          ))}
        </select>
        {formErrors.selectedStaff && <p className="text-red-500 text-xs mt-1">{formErrors.selectedStaff}</p>}
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">
          Exit Date <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <input
            type="date"
            className={`w-full p-2 border ${formErrors.exitDate ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
          />
          <Calendar size={18} className="absolute right-3 top-3 text-gray-500" />
        </div>
        {formErrors.exitDate && <p className="text-red-500 text-xs mt-1">{formErrors.exitDate}</p>}
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">Reason for exit</label>
        <textarea
          className={`w-full mt-1 p-2 border ${formErrors.exitReason ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
          placeholder="Enter reason"
          value={exitReason}
          onChange={(e) => setExitReason(e.target.value)}
          rows="3"
        />
        {formErrors.exitReason && <p className="text-red-500 text-xs mt-1">{formErrors.exitReason}</p>}
      </div>

      <button
        className="w-full bg-blue-600 text-white font-medium p-2 rounded-md hover:bg-blue-700 transition"
        onClick={handleSubmit}
        disabled={loading} // Disable button while loading
      >
        {loading ? "Exiting..." : "Exit"}
      </button>
    </div>
  );
};

export default ExitStaffForm;
