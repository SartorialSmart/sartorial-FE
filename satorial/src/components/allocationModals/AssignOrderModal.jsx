import { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { X, Search, ChevronDown } from "lucide-react";
import StaffService from "../../services/staffServices/StaffService";
import SettingsService from "../../services/settings";
import Avatar from "../avatar/Avatar";

const AssignOrderModal = ({
  isOpen,
  onClose,
  order,
  mode = "assign",
  onSuccess,
  onAssign,
  showDepartmentFilter = false,
}) => {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedStaff(null);
    setRole("");
    setDepartment("");
    setReason("");
    setSearchQuery("");
    setSelectedDepartment("");
    setError("");
    setIsLoadingStaff(true);

    if (showDepartmentFilter) {
      SettingsService.Departments.getDepartments()
        .then((data) => {
          const deptData = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
          setDepartments(deptData);
        })
        .catch(() => setDepartments([]));
    }

    StaffService.listStaff()
      .then((data) => {
        const staffData = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        setStaffList(staffData);
      })
      .catch((error) => {
        console.error("Error loading staff:", error);
        setError("Failed to load staff members");
        setStaffList([]);
      })
      .finally(() => {
        setIsLoadingStaff(false);
      });
  }, [isOpen, showDepartmentFilter]);

  useEffect(() => {
    if (selectedStaff) {
      setRole(selectedStaff.staff_role || selectedStaff.role || "");
      setDepartment(selectedStaff.department || "");
    } else {
      setRole("");
      setDepartment("");
    }
  }, [selectedStaff]);

  const filteredStaff = useMemo(() => {
    let result = staffList;

    if (selectedDepartment) {
      result = result.filter(
        (s) => s.department?.toLowerCase() === selectedDepartment.toLowerCase()
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (staff) =>
          (staff.first_name && staff.first_name.toLowerCase().includes(query)) ||
          (staff.last_name && staff.last_name.toLowerCase().includes(query)) ||
          (staff.email && staff.email.toLowerCase().includes(query)) ||
          (staff.staff_role && staff.staff_role.toLowerCase().includes(query)) ||
          (staff.department && staff.department.toLowerCase().includes(query))
      );
    }

    return result;
  }, [staffList, selectedDepartment, searchQuery]);

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
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );
      await onAssign(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Assignment error:", err);
      setError("Failed to assign order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {mode === "assign" ? "Assign to Tailor" : "Reassign Order"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 pb-0 flex-shrink-0 space-y-3">
            {showDepartmentFilter && departments.length > 0 && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Department
                </label>
                <div className="relative">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => { setSelectedDepartment(e.target.value); setSelectedStaff(null); }}
                    className="w-full border rounded-md px-3 py-2 appearance-none bg-white pr-8"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name} {dept.staff_count != null ? `(${dept.staff_count})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
              </div>
            )}

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search staff by name, email or role"
                className="w-full border rounded-md pl-10 pr-3 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="px-6 flex-1 overflow-y-auto">
            {isLoadingStaff ? (
              <div className="text-center py-4 text-gray-500">
                Loading staff members...
              </div>
            ) : (
              <div className="mb-6">
                {filteredStaff.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    {searchQuery || selectedDepartment
                      ? "No staff members found"
                      : "No staff members available"}
                  </div>
                ) : (
                  filteredStaff.map((staff) => (
                    <label
                      key={staff.id || staff.email}
                      className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-gray-50 px-2 rounded border-b border-gray-50 last:border-0"
                    >
                      <input
                        type="radio"
                        name="staff"
                        checked={selectedStaff?.id === staff.id}
                        onChange={() => setSelectedStaff(staff)}
                        className="accent-blue-600 shrink-0"
                      />
                      <Avatar src={staff.avatar_url} alt={staff.first_name + " " + staff.last_name} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {(staff.first_name || "") + " " + (staff.last_name || "") || "Unknown"}
                        </div>
                        <div className="text-gray-500 text-sm truncate">
                          {staff.email || "No email"}
                        </div>
                        <div className="text-xs text-gray-400 flex gap-2">
                          {staff.staff_role && <span>{staff.staff_role}</span>}
                          {staff.department && (
                            <span>• {staff.department}</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    disabled={!selectedStaff}
                    placeholder="Role"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    disabled={!selectedStaff}
                    placeholder="Department"
                  />
                </div>
              </div>
              {mode === "reassign" && (
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Reason for reassigning{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows={3}
                    placeholder="Explain why this order is being reassigned..."
                  />
                </div>
              )}
              {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2.5 rounded-md mt-1 disabled:opacity-50 font-medium"
                disabled={loading || !selectedStaff}
              >
                {loading
                  ? "Assigning..."
                  : mode === "assign"
                  ? "Assign Tailor"
                  : "Reassign"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

AssignOrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  mode: PropTypes.oneOf(["assign", "reassign"]),
  onSuccess: PropTypes.func,
  onAssign: PropTypes.func.isRequired,
  showDepartmentFilter: PropTypes.bool,
};

export default AssignOrderModal;