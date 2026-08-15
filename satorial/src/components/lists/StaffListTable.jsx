// components/lists/StaffListTable.jsx

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Award, AlertTriangle, Eye, Trash2, Edit, User, Shield, KeyRound, Ban, Send } from "lucide-react";
import { Spin, Tag, Tooltip, Progress, message, Modal } from "antd";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import StaffService from "../../services/staffServices/StaffService";
import StaffReportService from "../../services/staffServices/StaffReportService";
import SettingsService from "../../services/settings";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import SuccessModal from "../modals/SuccessModal";
import PermissionsModal from "../modals/PermissionsModal";
import GrantLoginAccessModal from "../modals/GrantLoginAccessModal";
import { extractErrorMessage } from "../../../utils/errorUtils";

const StaffListTable = forwardRef(({ searchTerm = "" }, ref) => {
  const navigate = useNavigate();
  
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [permissionsModalStaff, setPermissionsModalStaff] = useState(null);
  const [departmentMap, setDepartmentMap] = useState({});
  const [grantAccessStaff, setGrantAccessStaff] = useState(null);

  const dropdownRef = useRef(null);
  const rowRefs = useRef({});

  // Build a lookup so a department value (name or stored ID) resolves to its
  // display name. Backend stores the name, but some legacy records have IDs.
  const resolveDepartment = (value) => {
    if (!value) return value;
    if (departmentMap[value]) return departmentMap[value].name;
    const lowered = String(value).toLowerCase();
    if (departmentMap[lowered]) return departmentMap[lowered].name;
    return value;
  };

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await SettingsService.Departments.getDepartments();
      const list = Array.isArray(data) ? data : data.results || [];
      const map = {};
      list.forEach((dept) => {
        map[dept.id] = dept;
        if (dept.name) map[String(dept.name).toLowerCase()] = dept;
      });
      setDepartmentMap(map);
    } catch {
      // Non-fatal: fall back to showing the raw value.
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const fetchStaffList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await StaffService.listStaff();
      if (Array.isArray(data.results)) {
        setStaffList(data.results);
        // Fetch performance for all staff
        fetchAllPerformance();
      } else {
        throw new Error("Invalid data format");
      }
    } catch {
      setError("Failed to load staff list");
      message.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllPerformance = async () => {
    setPerformanceLoading(true);
    try {
      const response = await StaffReportService.getAllStaffPerformance();
      
      // Create a map of performance data by staff_id
      const perfMap = {};
      response.data.forEach(perf => {
        perfMap[perf.staff_id] = perf;
      });
      
      setPerformanceData(perfMap);
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  useImperativeHandle(ref, () => ({
    refresh: fetchStaffList
  }));

  // Keyed by id, not email: staff without login access have no email at all, so
  // email is no longer a unique handle for a row.
  const handleSelectAll = (e) => {
    setSelectedStaff(e.target.checked ? filteredStaffList.map((s) => s.id) : []);
  };

  const handleSelect = (id) => {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedStaff.length === 0) return;

    try {
      setBulkActionLoading(true);
      const staffToDelete = filteredStaffList.filter(s => selectedStaff.includes(s.id));

      await Promise.all(
        staffToDelete.map(staff => StaffService.deleteStaff(staff.slug))
      );

      setStaffList(prev => prev.filter(s => !selectedStaff.includes(s.id)));
      const deletedCount = selectedStaff.length;
      setSelectedStaff([]);
      setSuccessModal({
        title: "Staff Deleted",
        message: `${deletedCount} staff member${deletedCount > 1 ? 's' : ''} deleted successfully.`,
        buttonText: "Done",
      });
    } catch (error) {
      console.error("Failed to delete staff:", error);
      message.error("Failed to delete staff members");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDropdownToggle = (id, e) => {
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleAction = (action, staff, e) => {
    e.stopPropagation();
    if (action === "view") {
      navigate(`/staff/staff-detail/${staff.slug}`);
    } else if (action === "edit") {
      navigate(`/staff/edit/${staff.slug}`);
    } else if (action === "delete") {
      setStaffToDelete(staff);
      setShowDeleteModal(true);
    }
    setDropdownOpen(null);
  };

  const handleDelete = async () => {
    try {
      await StaffService.deleteStaff(staffToDelete.slug);
      setStaffList((prev) => prev.filter((s) => s.slug !== staffToDelete.slug));
      setShowDeleteModal(false);
      setStaffToDelete(null);
      setSuccessModal({
        title: "Staff Deleted",
        message: "The staff member has been deleted successfully.",
        buttonText: "Done",
      });
    } catch (error) {
      console.error("Failed to delete staff:", error);
      message.error("Failed to delete staff");
    }
  };

  const handleResendInvite = async (staff) => {
    try {
      const res = await StaffService.resendInvite(staff.id);
      if (res && res.success === false) {
        throw res;
      }
      // The request succeeded, but the email itself may not have gone out —
      // reporting that as "Invitation resent." is how a failed send stayed
      // invisible.
      if (res?.email_sent === false) {
        const warning = res.message || "The invitation email could not be sent.";
        toast.warning(warning);
        message.warning(warning);
        fetchStaffList();
        return;
      }
      toast.success("Invitation resent.");
      message.success("Invitation resent.");
      fetchStaffList();
    } catch (error) {
      console.error("Failed to resend invite:", error);
      const errMsg = extractErrorMessage(error, "Could not resend invite.");
      toast.error(errMsg);
      try {
        message.error(errMsg);
      } catch {
        // ignore
      }
    }
  };

  const confirmRevokeAccess = (staff) => {
    Modal.confirm({
      title: "Remove system access?",
      content: `${staff.first_name} ${staff.last_name} will no longer be able to sign in. They stay on your staff list, and the seat is freed up for someone else.`,
      okText: "Remove access",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await StaffService.revokeLoginAccess(staff.id);
          if (res && res.success === false) {
            throw res;
          }
          toast.success("System access removed.");
          message.success("System access removed.");
          fetchStaffList();
        } catch (error) {
          console.error("Failed to revoke access:", error);
          const errMsg = extractErrorMessage(error, "Could not remove access.");
          toast.error(errMsg);
          try {
            message.error(errMsg);
          } catch {
            // ignore
          }
        }
      },
    });
  };

  const handleOutsideClick = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  // Filter out exited staff, then apply search term
  const filteredStaffList = staffList
    .filter((staff) => !staff.is_exited)
    .filter((staff) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${staff.first_name || ""} ${staff.last_name || ""}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        staff.email?.toLowerCase().includes(searchLower) ||
        staff.phone_number?.toLowerCase().includes(searchLower) ||
        staff.department?.toLowerCase().includes(searchLower) ||
        staff.staff_role?.toLowerCase().includes(searchLower)
      );
    });

  const getPerformanceBadge = (staffId) => {
    const perf = performanceData[staffId];
    if (!perf) return null;

    if (perf.completion_rate >= 80) {
      return (
        <Tooltip title={`${perf.completion_rate}% completion rate`}>
          <Award className="w-4 h-4 text-yellow-500" />
        </Tooltip>
      );
    } else if (perf.reassignment_rate > 20) {
      return (
        <Tooltip title={`${perf.reassignment_rate}% reassignment rate`}>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </Tooltip>
      );
    }
    return null;
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 80) return "text-green-600 bg-green-50";
    if (rate >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const DropdownMenu = ({ staff, anchorRef }) => {
    const [coords, setCoords] = useState({ top: 0, left: null, right: null, width: 0 });
    
    useEffect(() => {
      if (anchorRef && anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        const dropdownWidth = 200;
        const fitsRight = rect.left + dropdownWidth < window.innerWidth;
        setCoords({
          top: rect.bottom + window.scrollY,
          left: fitsRight ? rect.left + window.scrollX : null,
          right: !fitsRight ? (window.innerWidth - rect.right) : null,
          width: rect.width,
        });
      }
    }, [anchorRef, dropdownOpen]);

    return createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: coords.top,
            left: coords.left,
            right: coords.right,
            minWidth: 180,
            zIndex: 9999,
          }}
          className="bg-white shadow-lg rounded-lg border overflow-hidden"
        >
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            onClick={(e) => handleAction("view", staff, e)}
          >
            <Eye size={16} />
            View Details
          </button>
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            onClick={(e) => handleAction("edit", staff, e)}
          >
            <Edit size={16} />
            Edit Staff
          </button>
          {/* Permissions only mean something for someone who can sign in. */}
          {staff.has_login_access ? (
            <>
              <button
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setPermissionsModalStaff(staff);
                  setDropdownOpen(null);
                }}
              >
                <Shield size={16} />
                Permissions
              </button>
              {staff.is_active === false && (
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(null);
                    handleResendInvite(staff);
                  }}
                >
                  <Send size={16} />
                  Resend invite
                </button>
              )}
              <button
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(null);
                  confirmRevokeAccess(staff);
                }}
              >
                <Ban size={16} />
                Remove system access
              </button>
            </>
          ) : (
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(null);
                setGrantAccessStaff(staff);
              }}
            >
              <KeyRound size={16} />
              Give system access
            </button>
          )}
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            onClick={(e) => handleAction("delete", staff, e)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  };

  DropdownMenu.propTypes = {
    staff: PropTypes.object.isRequired,
    anchorRef: PropTypes.object.isRequired,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Bulk Actions Bar */}
      {selectedStaff.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-t-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedStaff.length} staff member{selectedStaff.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <button
                onClick={() => setSelectedStaff([])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear selection
              </button>
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkActionLoading ? (
                <Spin size="small" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Selected
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onChange={handleSelectAll}
                  checked={
                    filteredStaffList.length > 0 &&
                    selectedStaff.length === filteredStaffList.length
                  }
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                System Access
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredStaffList.length > 0 ? (
              filteredStaffList.map((staff, index) => {
                const perf = performanceData[staff.id];
                return (
                  <motion.tr
                    key={staff.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/staff/staff-detail/${staff.slug}`)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedStaff.includes(staff.id)}
                        onChange={() => handleSelect(staff.id)}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {staff.avatar_url ? (
                          <img
                            src={staff.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium ring-2 ring-white shadow-sm">
                            {staff.first_name?.[0]}{staff.last_name?.[0]}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {staff.first_name} {staff.last_name}
                            </span>
                            {getPerformanceBadge(staff.id)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {staff.staff_role}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Tag color="blue" className="font-medium">
                        {resolveDepartment(staff.department)}
                      </Tag>
                    </td>

                    <td className="px-6 py-4">
                      {performanceLoading ? (
                        <Spin size="small" />
                      ) : perf ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">Completion</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getPerformanceColor(perf.completion_rate)}`}>
                              {perf.completion_rate}%
                            </span>
                          </div>
                          <Progress
                            percent={perf.completion_rate}
                            size="small"
                            strokeColor={{
                              '0%': perf.completion_rate >= 80 ? '#87d068' : 
                                    perf.completion_rate >= 60 ? '#faad14' : '#ff4d4f',
                            }}
                            showInfo={false}
                          />
                          <div className="text-xs text-gray-500">
                            {perf.completed_orders} of {perf.total_assigned} completed
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No data</span>
                      )}
                    </td>

                    {/* Staff record vs. user of the system — three states:
                        no access, invited but not set up yet, and active user. */}
                    <td className="px-6 py-4">
                      {!staff.has_login_access ? (
                        <Tooltip title="On the books only — cannot sign in">
                          <Tag color="default">Staff record</Tag>
                        </Tooltip>
                      ) : staff.is_active === false ? (
                        <Tooltip title="Invitation sent — waiting for them to set a password">
                          <Tag color="orange">Invite pending</Tag>
                        </Tooltip>
                      ) : (
                        <Tooltip title={staff.email || "Can sign in"}>
                          <Tag color="green">User</Tag>
                        </Tooltip>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            onClick={(e) => handleDropdownToggle(staff.id, e)}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            ref={(el) => {
                              if (el) rowRefs.current[staff.id] = el;
                            }}
                          >
                            <MoreVertical size={18} />
                          </button>
                          {dropdownOpen === staff.id && (
                            <DropdownMenu
                              staff={staff}
                              anchorRef={{ current: rowRefs.current[staff.id] }}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-12">
                  <div className="text-gray-400 space-y-2">
                    <User className="w-12 h-12 mx-auto text-gray-300" />
                    <p>{searchTerm ? "No staff found matching your search" : "No staff available"}</p>
                    <p className="text-sm text-gray-400">
                      Try adding new staff members
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredStaffList.length} of {staffList.filter(s => !s.is_exited).length} active staff
          </div>
          <div className="flex items-center gap-2">
            {selectedStaff.length > 0 && (
              <span className="text-sm text-blue-600 font-medium">
                {selectedStaff.length} selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && staffToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => {
              setShowDeleteModal(false);
              setStaffToDelete(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Confirm Deletion</h3>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {staffToDelete.avatar_url ? (
                    <img
                      src={staffToDelete.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                      {staffToDelete.first_name?.[0]}{staffToDelete.last_name?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {staffToDelete.first_name} {staffToDelete.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{staffToDelete.email || staffToDelete.phone_number}</p>
                    <p className="text-sm text-gray-500">{resolveDepartment(staffToDelete.department)} • {staffToDelete.staff_role}</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Are you sure you want to delete this staff member? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setStaffToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  onClick={handleDelete}
                >
                  Delete Staff
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {successModal && (
        <SuccessModal
          {...successModal}
          onClose={() => setSuccessModal(null)}
        />
      )}
      {permissionsModalStaff && (
        <PermissionsModal
          staff={permissionsModalStaff}
          isOpen={!!permissionsModalStaff}
          onClose={() => setPermissionsModalStaff(null)}
        />
      )}
      {grantAccessStaff && (
        <GrantLoginAccessModal
          staff={grantAccessStaff}
          isOpen={!!grantAccessStaff}
          onClose={() => setGrantAccessStaff(null)}
          onGranted={fetchStaffList}
        />
      )}
    </div>
  );
});

StaffListTable.displayName = 'StaffListTable';

StaffListTable.propTypes = {
  searchTerm: PropTypes.string,
};

export default StaffListTable;
