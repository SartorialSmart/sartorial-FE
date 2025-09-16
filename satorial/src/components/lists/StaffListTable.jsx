import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { MoreVertical } from "lucide-react";
import { Spin } from "antd";
import StaffService from "../../services/staffServices/StaffService";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";

const StaffListTable = ({ searchTerm = "" }) => {
  const navigate = useNavigate(); // ✅ Initialize navigate
  const columns = [
    { label: "Name", key: "full_name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phone_number" },
    { label: "Role", key: "role" },
    { label: "Employment Date", key: "employment_date" },
  ];

  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const dropdownRef = useRef(null);
  // For each row, create a ref for the MoreVertical icon
  const rowRefs = useRef({});

  useEffect(() => {
    const fetchStaffList = async () => {
      setLoading(true);
      try {
        const data = await StaffService.listStaff();
        if (Array.isArray(data.results)) {
          setStaffList(data.results);
        } else {
          throw new Error("Invalid data format");
        }
      } catch {
        setError("Failed to load staff list");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffList();
  }, []);

  const handleSelectAll = (e) => {
    setSelectedStaff(e.target.checked ? searchedStaffList.map((s) => s.email) : []);
  };

  const handleSelect = (email) => {
    setSelectedStaff((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleDropdownToggle = (email, e) => {
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === email ? null : email);
  };

  const handleAction = (action, staff, e) => {
    e.stopPropagation();
    if (action === "view") {
      navigate(`/staff/staff-detail/${staff.slug}`); // ✅ Proper navigation
    } else if (action === "delete") {
      setStaffToDelete(staff);
      setShowDeleteModal(true); // Show modal
    }
    setDropdownOpen(null);
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

  // DropdownMenu using portal to body for visibility
  const DropdownMenu = ({ staff, anchorRef }) => {
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    useEffect(() => {
      if (anchorRef && anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [anchorRef, dropdownOpen]);
    return createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: "absolute",
          top: coords.top,
          left: coords.left,
          minWidth: coords.width,
          zIndex: 9999,
        }}
        className="w-32 bg-white shadow-lg rounded-lg border dropdown-menu"
      >
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
          onClick={(e) => handleAction("view", staff, e)}
        >
          View
        </button>
        <button
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          onClick={(e) => handleAction("delete", staff, e)}
        >
          Delete
        </button>
      </div>,
      document.body
    );
  };

  DropdownMenu.propTypes = {
    staff: PropTypes.object.isRequired,
    anchorRef: PropTypes.object.isRequired,
  };

  // Filter out exited staff, then apply search term
  const filteredStaffList = staffList.filter((staff) => !staff.is_exited);
  const normalizedQuery = (searchTerm || "").toString().trim().toLowerCase();
  const searchedStaffList = filteredStaffList.filter((staff) => {
    if (!normalizedQuery) return true;
    const fullName = `${staff.first_name || ""} ${staff.last_name || ""}`
      .trim()
      .toLowerCase();
    const email = (staff.email || "").toLowerCase();
    const phone = (staff.phone_number || "").toLowerCase();
    const role = (staff.role || "").toLowerCase();
    return (
      fullName.includes(normalizedQuery) ||
      email.includes(normalizedQuery) ||
      phone.includes(normalizedQuery) ||
      role.includes(normalizedQuery)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Staff List</h2>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 text-left text-sm sm:text-base">
              <th className="p-3 sm:p-4 w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onChange={handleSelectAll}
                  checked={
                    searchedStaffList.length > 0 &&
                    selectedStaff.length === searchedStaffList.length
                  }
                />
              </th>
              {columns.map((col, index) => (
                <th key={index} className="p-3 sm:p-4 font-medium">
                  {col.label}
                </th>
              ))}
              <th className="p-3 sm:p-4 w-10">Actions</th>
            </tr>
          </thead>

          <tbody>
            {searchedStaffList.length > 0 ? (
              searchedStaffList.map((staff, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 sm:p-4 w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedStaff.includes(staff.email)}
                      onChange={() => handleSelect(staff.email)}
                    />
                  </td>
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-3 sm:p-4 text-sm sm:text-base"
                    >
                      {col.key === "full_name"
                        ? `${staff.first_name || ""} ${
                            staff.last_name || ""
                          }`.trim()
                        : staff[col.key]}
                    </td>
                  ))}
                  <td className="sm:p-4 w-10 text-gray-600">
                    <div className="relative">
                      <MoreVertical
                        size={18}
                        className="cursor-pointer hover:text-gray-800 text-[#9e9e9e] transition m-1"
                        onClick={(e) => handleDropdownToggle(staff.email, e)}
                        ref={(el) => {
                          if (el) rowRefs.current[staff.email] = el;
                        }}
                      />
                      {dropdownOpen === staff.email && (
                        <DropdownMenu
                          staff={staff}
                          anchorRef={{ current: rowRefs.current[staff.email] }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center p-4">
                  No staff available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <strong>
                {staffToDelete.first_name} {staffToDelete.last_name}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setShowDeleteModal(false);
                  setStaffToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded"
                onClick={async () => {
                  try {
                    await StaffService.deleteStaff(staffToDelete.slug);
                    setStaffList((prev) =>
                      prev.filter((s) => s.slug !== staffToDelete.slug)
                    );
                    setShowDeleteModal(false);
                    setStaffToDelete(null);
                  } catch (error) {
                    console.error("Failed to delete staff:", error);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffListTable;
