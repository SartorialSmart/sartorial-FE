import { useState } from "react";
import { MoreVertical } from "lucide-react";

const PayrollListTable = () => {
  const columns = [
    { label: "Name", key: "name" },
    { label: "Salary", key: "salary" },
    { label: "Role", key: "role" },
    { label: "Department", key: "department" },
  ];

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employees, setEmployees] = useState([
    {
      name: "Kemi Johnson",
      salary: "₦200,000",
      role: "Tailor",
      department: "Tailoring",
    },
    {
      name: "Kemi Johnson",
      salary: "₦200,000",
      role: "Tailor",
      department: "Tailoring",
    },
    {
      name: "Kemi Johnson",
      salary: "₦200,000",
      role: "Tailor",
      department: "Tailoring",
    },
    {
      name: "Kemi Johnson",
      salary: "₦200,000",
      role: "Tailor",
      department: "Tailoring",
    },
    {
      name: "Kemi Johnson",
      salary: "₦200,000",
      role: "Tailor",
      department: "Tailoring",
    },
    {
      name: "Kemi Johnson",
      salary: "₦200,000",
      role: "Tailor",
      department: "Tailoring",
    },
  ]);

  const handleSelectAll = (e) => {
    setSelectedEmployees(e.target.checked ? employees.map((e) => e.name) : []);
  };

  const handleSelect = (name) => {
    setSelectedEmployees((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Payroll List</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 text-left text-sm sm:text-base">
              <th className="p-3 sm:p-4 w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onChange={handleSelectAll}
                  checked={selectedEmployees.length === employees.length}
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
            {employees.map((employee, index) => (
              <tr key={index} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 sm:p-4 w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedEmployees.includes(employee.name)}
                    onChange={() => handleSelect(employee.name)}
                  />
                </td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-3 sm:p-4 text-sm sm:text-base">
                    {employee[col.key]}
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

export default PayrollListTable;
