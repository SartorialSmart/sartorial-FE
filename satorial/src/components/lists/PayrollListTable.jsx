import { useState, useEffect } from "react";
import PayRollService from "../../services/staffServices/PayRolService";

const PayrollListTable = () => {
  const columns = [
    { label: "Name", key: "name" },
    { label: "Salary", key: "base_salary" },
    { label: "Role", key: "role" },
    { label: "Department", key: "department" },
  ];

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const data = await PayRollService.listPayrolls();
        const formattedData = data.map((item) => ({
          name: item.employee.full_name || "N/A",
          base_salary: `₦${Number(item.base_salary).toLocaleString()}`,
          role: item.employee.role || "N/A",
          department: item.employee.department || "N/A",
        }));
        setEmployees(formattedData);
      } catch (err) {
        console.error("Error loading payrolls:", err);
        setError("Failed to load payroll data.");
      }
    };

    fetchPayrolls();
  }, []);

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
                  checked={selectedEmployees.length === employees.length}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollListTable;
