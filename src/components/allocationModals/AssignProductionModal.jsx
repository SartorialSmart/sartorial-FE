import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { X, Search, ChevronDown, Users, Plus, Trash2, Loader2 } from "lucide-react";
import StaffService from "../../services/staffServices/StaffService";
import SettingsService from "../../services/settings";
import Avatar from "../avatar/Avatar";
import ProductionService from "../../services/ProductionService";

const AssignProductionModal = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const totalQuantity = Number(order?.total_quantity) || 0;
  const assignedQuantity = assignments.reduce(
    (sum, a) => sum + (Number(a.quantity) || 0),
    0
  );
  const remaining = Math.max(totalQuantity - assignedQuantity, 0);
  const existingAssignments = useMemo(
    () => (Array.isArray(order?.assignments) ? order.assignments : []),
    [order]
  );
  const existingStaffIds = useMemo(
    () => new Set(existingAssignments.map((a) => String(a.staff))),
    [existingAssignments]
  );

  useEffect(() => {
    if (!isOpen) return;

    setSelectedStaff(null);
    setQuantity("");
    setAssignments([]);
    setSearchQuery("");
    setSelectedDepartment("");
    setError("");
    setFieldErrors({});
    setIsLoadingStaff(true);

    if (order?.id && existingAssignments.length > 0) {
      setIsLoadingStaff(false);
      return;
    }

    if (SettingsService?.Departments) {
      SettingsService.Departments.getDepartments()
        .then((data) => {
          const deptData = Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
            ? data.results
            : [];
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
      .catch(() => {
        setError("Failed to load staff members");
        setStaffList([]);
      })
      .finally(() => setIsLoadingStaff(false));
  }, [isOpen, existingAssignments.length, order?.id]);

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
          (staff.staff_role && staff.staff_role.toLowerCase().includes(query))
      );
    }
    return result;
  }, [staffList, selectedDepartment, searchQuery]);

  const addAssignment = () => {
    if (!selectedStaff) {
      setFieldErrors({ staff: "Please select a staff member." });
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setFieldErrors({ quantity: "Please enter a valid quantity." });
      return;
    }
    if (Number(quantity) > remaining) {
      setFieldErrors({ quantity: `Only ${remaining} units remain to be assigned.` });
      return;
    }
    if (assignments.some((a) => a.staff_id === selectedStaff.id)) {
      setFieldErrors({ staff: "This staff member is already in the assignment list." });
      return;
    }
    setAssignments((prev) => [
      ...prev,
      {
        staff_id: selectedStaff.id,
        staff: selectedStaff,
        quantity: Number(quantity),
      },
    ]);
    setSelectedStaff(null);
    setQuantity("");
    setError("");
    setFieldErrors({});
  };

  const removeAssignment = (staffId) => {
    setAssignments((prev) => prev.filter((a) => a.staff_id !== staffId));
  };

  const updateAssignmentQuantity = (staffId, value) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.staff_id === staffId ? { ...a, quantity: Number(value) || 0 } : a
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (assignments.length === 0) {
      setError("Add at least one staff assignment.");
      return;
    }
    const totalAssigned = assignments.reduce(
      (sum, a) => sum + (Number(a.quantity) || 0),
      0
    );
    if (totalAssigned > totalQuantity) {
      setError(
        `Assigned quantities (${totalAssigned}) exceed the order total (${totalQuantity}).`
      );
      return;
    }

    setLoading(true);
    setError("");
    try {
      await ProductionService.assignOrder({
        production_order: order.id,
        assignments: assignments.map((a) => ({
          staff: a.staff_id,
          quantity: a.quantity,
          role: a.staff.staff_role || a.staff.role || "",
          department: a.staff.department || "",
        })),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Production assignment error:", err);
      setError("Failed to assign production. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Assign Production</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {order?.title || "Production order"} •{" "}
                {totalQuantity} units total
                {existingAssignments.length > 0 && ` • ${existingAssignments.length} already assigned`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {existingAssignments.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              This order already has staff assigned. Use the list below to assign
              additional staff to the remaining{" "}
              <strong>{remaining}</strong> units.
            </div>
          )}

          <div className="mb-4 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{assignedQuantity}</span>{" "}
              of {totalQuantity} assigned
            </div>
            <div className="w-40">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalQuantity > 0 ? Math.min((assignedQuantity / totalQuantity) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Remaining: <span className="font-semibold text-gray-900">{remaining}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Department <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedStaff(null);
                }}
                className="w-full border rounded-md px-3 py-2 appearance-none bg-white pr-8"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>

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

            <div
              className={`border rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-50 ${
                fieldErrors.staff ? "border-red-400" : "border-gray-200"
              }`}
            >
              {isLoadingStaff ? (
                <div className="text-center py-4 text-gray-500">
                  Loading staff members...
                </div>
              ) : filteredStaff.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No staff members found
                </div>
              ) : (
                filteredStaff
                  .filter(
                    (s) =>
                      !assignments.some((a) => a.staff_id === s.id) &&
                      !existingStaffIds.has(String(s.id))
                  )
                  .map((staff) => (
                    <label
                      key={staff.id || staff.email}
                      className="flex items-center gap-3 py-2.5 px-3 cursor-pointer hover:bg-gray-50 rounded border-b border-gray-50 last:border-0"
                    >
                      <input
                        type="radio"
                        name="staff"
                        checked={selectedStaff?.id === staff.id}
                        onChange={() => {
                          setSelectedStaff(staff);
                          setError("");
                          setFieldErrors((prev) =>
                            prev.staff ? { ...prev, staff: undefined } : prev
                          );
                        }}
                        className="accent-blue-600 shrink-0"
                      />
                      <Avatar
                        src={staff.avatar_url}
                        alt={(staff.first_name || "") + " " + (staff.last_name || "")}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {(staff.first_name || "") + " " + (staff.last_name || "") ||
                            "Unknown"}
                        </div>
                        <div className="text-gray-500 text-sm truncate">
                          {staff.email || "No email"}
                        </div>
                        <div className="text-xs text-gray-400 flex gap-2">
                          {staff.staff_role && <span>{staff.staff_role}</span>}
                          {staff.department && <span>• {staff.department}</span>}
                        </div>
                      </div>
                    </label>
                  ))
              )}
            </div>
            {fieldErrors.staff && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.staff}</p>
            )}

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-gray-400">(max {remaining} remaining)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={remaining}
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setFieldErrors((prev) =>
                      prev.quantity ? { ...prev, quantity: undefined } : prev
                    );
                  }}
                  className={`w-full border rounded-md px-3 py-2 text-sm ${
                    fieldErrors.quantity ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. 20"
                />
                {fieldErrors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.quantity}</p>
                )}
              </div>
              <button
                type="button"
                onClick={addAssignment}
                disabled={!selectedStaff || !quantity || remaining <= 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>

          {assignments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                Assignment List
              </h3>
              <div className="space-y-2">
                {assignments.map((a) => (
                  <div
                    key={a.staff_id}
                    className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <Avatar
                      src={a.staff.avatar_url}
                      alt={(a.staff.first_name || "") + " " + (a.staff.last_name || "")}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm">
                        {(a.staff.first_name || "") + " " + (a.staff.last_name || "") ||
                          "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {a.staff.staff_role || "Staff"} • {a.staff.department || "No department"}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={a.quantity}
                      onChange={(e) =>
                        updateAssignmentQuantity(a.staff_id, e.target.value)
                      }
                      className="w-20 border rounded-md px-2 py-1 text-sm text-right"
                    />
                    <button
                      type="button"
                      onClick={() => removeAssignment(a.staff_id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || assignments.length === 0}
            className="w-full bg-blue-600 text-white py-2.5 rounded-md disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Users size={16} />
                Assign {assignments.length} staff member{assignments.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

AssignProductionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    total_quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    assignments: PropTypes.array,
  }),
  onSuccess: PropTypes.func,
};

export default AssignProductionModal;
