import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import StaffService from "../../services/staffServices/StaffService";
import Avatar from "../avatar/Avatar";

const AssignOrderModal = ({
  isOpen,
  onClose,
  order,
  mode = "assign",
  onSuccess,
  onAssign,
}) => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    StaffService.listStaff().then((data) => {
      setStaffList(Array.isArray(data.results) ? data.results : data);
    });
  }, [isOpen]);

  useEffect(() => {
    if (selectedStaff) {
      setRole(selectedStaff.role || "");
      setDepartment(selectedStaff.department || "");
    } else {
      setRole("");
      setDepartment("");
    }
  }, [selectedStaff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedStaff ||
      !role ||
      !department ||
      (mode === "reassign" && !reason)
    ) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        staff: selectedStaff.id,
        order: order.id,
        role,
        department,
        reason: mode === "reassign" ? reason : undefined,
        is_reassigned: mode === "reassign",
      };
      // Remove undefined fields
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );
      await onAssign(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      setError("Failed to assign order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative flex flex-col max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <div className="p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6">
            {mode === "assign" ? "Assign project" : "Reassign project"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6 max-h-40 overflow-y-auto">
              {staffList.map((staff) => (
                <label
                  key={staff.id}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="staff"
                    checked={selectedStaff?.id === staff.id}
                    onChange={() => setSelectedStaff(staff)}
                    className="accent-blue-600"
                  />
                  <Avatar src={staff.avatar} alt={staff.name} />
                  <div>
                    <div className="font-medium">{staff.name}</div>
                    <div className="text-gray-500 text-sm">{staff.email}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={!selectedStaff}
                placeholder="Select role"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                disabled={!selectedStaff}
                placeholder="Select department"
              />
            </div>
            {mode === "reassign" && (
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Reason for reassigning <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Enter reason"
                />
              </div>
            )}
            {error && <div className="mb-2 text-red-600">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md mt-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

AssignOrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object.isRequired,
  mode: PropTypes.oneOf(["assign", "reassign"]),
  onSuccess: PropTypes.func,
  onAssign: PropTypes.func.isRequired,
};

export default AssignOrderModal;
