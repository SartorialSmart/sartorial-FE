import { useState } from "react";
import { MoreVertical } from "lucide-react";

const StaffListTable = () => {
  const columns = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phone" },
    { label: "Role", key: "role" },
    { label: "Employment Date", key: "employmentDate" },
  ];

  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffList, setStaffList] = useState([
    {
      name: "Tunde Bakare",
      email: "tunde@gmail.com",
      phone: "08022336587",
      role: "Tailor",
      employmentDate: "12/05/2024",
    },
    {
      name: "Tunde Bakare",
      email: "tunde@gmail.com",
      phone: "08022336587",
      role: "Tailor",
      employmentDate: "12/05/2024",
    },
    {
      name: "Tunde Bakare",
      email: "tunde@gmail.com",
      phone: "08022336587",
      role: "Tailor",
      employmentDate: "12/05/2024",
    },
    {
      name: "Tunde Bakare",
      email: "tunde@gmail.com",
      phone: "08022336587",
      role: "Tailor",
      employmentDate: "12/05/2024",
    },
    {
      name: "Tunde Bakare",
      email: "tunde@gmail.com",
      phone: "08022336587",
      role: "Tailor",
      employmentDate: "12/05/2024",
    },
    {
      name: "Tunde Bakare",
      email: "tunde@gmail.com",
      phone: "08022336587",
      role: "Tailor",
      employmentDate: "12/05/2024",
    },
  ]);

  const handleSelectAll = (e) => {
    setSelectedStaff(e.target.checked ? staffList.map((s) => s.email) : []);
  };

  const handleSelect = (email) => {
    setSelectedStaff((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Staff List</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 text-left text-sm sm:text-base">
              <th className="p-3 sm:p-4 w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onChange={handleSelectAll}
                  checked={selectedStaff.length === staffList.length}
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
            {staffList.map((staff, index) => (
              <tr key={index} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 sm:p-4 w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedStaff.includes(staff.email)}
                    onChange={() => handleSelect(staff.email)}
                  />
                </td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-3 sm:p-4 text-sm sm:text-base">
                    {staff[col.key]}
                  </td>
                ))}
                <td className="sm:p-4 w-10 text-gray-600">
                  <div className="border-[1px] border-[#9e9e9e] rounded-md">
                    <MoreVertical
                      size={18}
                      className="cursor-pointer hover:text-gray-800 text-[#9e9e9e] transition m-1"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffListTable;
