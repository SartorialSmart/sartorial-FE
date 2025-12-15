import { useState, useEffect } from "react";
import ExitStaffService from "../../services/staffServices/ExitStaffSrvice";

const ExitedStaffsListTable = ({ searchTerm = "" }) => {
  const columns = [
    { label: "Name", key: "full_name" },
    { label: "Exit Date", key: "exit_date" },
    { label: "Reason for exit", key: "reason" },
  ];

  const [selectedStaff, setSelectedStaff] = useState([]);
  const [exitedStaff, setExitedStaff] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch exited staff on component mount
  useEffect(() => {
    const fetchExitedStaff = async () => {
      setLoading(true);
      try {
        const data = await ExitStaffService.listExitedStaff();
        const searchedData = data.filter((staff) =>
          staff.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Ensure that data is available and contains the expected fields
        if (searchedData && Array.isArray(searchedData)) {
          setExitedStaff(searchedData);
        } else {
          setError("Unexpected data format.");
        }
      } catch (error) {
        setError("Failed to load exited staff.");
      } finally {
        setLoading(false);
      }
    };

    fetchExitedStaff();
  }, [searchTerm]);

  const handleSelectAll = (e) => {
    setSelectedStaff(e.target.checked ? exitedStaff.map((s) => s.id) : []);
  };

  const handleSelect = (id) => {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Exited Staff List</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 text-left text-sm sm:text-base">
              <th className="p-3 sm:p-4 w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onChange={handleSelectAll}
                  checked={selectedStaff.length === exitedStaff.length}
                />
              </th>
              {columns.map((col, index) => (
                <th key={index} className="p-3 sm:p-4 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-3 text-center">
                  Loading...
                </td>
              </tr>
            ) : exitedStaff.length > 0 ? (
              exitedStaff.map((staff, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 sm:p-4 w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedStaff.includes(staff.id)}
                      onChange={() => handleSelect(staff.id)}
                    />
                  </td>
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-3 sm:p-4 text-sm sm:text-base"
                    >
                      {staff[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-3 text-center">
                  No exited staff available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExitedStaffsListTable;
