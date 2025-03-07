import { useState } from "react";

const ExitedStaffsListTable = () => {
  const columns = [
    { label: "Name", key: "name" },
    { label: "Date", key: "date" },
    { label: "Reason for exit", key: "reason" },
  ];

  const [selectedStaff, setSelectedStaff] = useState([]);
  const [exitedStaff, setExitedStaff] = useState([
    {
      id: 1,
      name: "Kemi Johnson",
      date: "14/04/2024",
      reason: "Pursue other personal life goals",
    },
    {
      id: 2,
      name: "Kemi Johnson",
      date: "14/04/2024",
      reason: "Pursue other personal life goals",
    },
    {
      id: 3,
      name: "Kemi Johnson",
      date: "14/04/2024",
      reason: "Pursue other personal life goals",
    },
    {
      id: 4,
      name: "Kemi Johnson",
      date: "14/04/2024",
      reason: "Pursue other personal life goals",
    },
    {
      id: 5,
      name: "Kemi Johnson",
      date: "14/04/2024",
      reason: "Pursue other personal life goals",
    },
    {
      id: 6,
      name: "Kemi Johnson",
      date: "14/04/2024",
      reason: "Pursue other personal life goals",
    },
    {
      id: 7,
      name: "Kemi Johnson",
      date: "14/04/2024",
      reason: "Pursue other personal life goals",
    },
    {
      id: 8,
      name: "Kemi Johnson",
      date: "14/04/2024",
      reason: "Pursue other personal life goals",
    },
  ]);

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
            {exitedStaff.map((staff, index) => (
              <tr key={index} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 sm:p-4 w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedStaff.includes(staff.id)}
                    onChange={() => handleSelect(staff.id)}
                  />
                </td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-3 sm:p-4 text-sm sm:text-base">
                    {staff[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExitedStaffsListTable;
