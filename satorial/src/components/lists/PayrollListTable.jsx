import { useState, useEffect } from "react";
import PayRollService from "../../services/staffServices/PayRolService";
import StaffService from "../../services/staffServices/StaffService";
import SettingsService from "../../services/settings";

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

  // Resolve a department value (name or legacy ID) to its display name.
  const resolveDepartment = (value, departmentMap) => {
    if (!value) return "N/A";
    const match =
      departmentMap[value] ||
      departmentMap[String(value).toLowerCase()];
    return match?.name || value;
  };

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const [payrollData, staffData, deptData] = await Promise.allSettled([
          PayRollService.listPayrolls(),
          StaffService.listStaff(),
          SettingsService.Departments.getDepartments(),
        ]);

        // Backend returns employee as an ID; join against the staff list.
        const staffList = Array.isArray(staffData.value?.results)
          ? staffData.value.results
          : Array.isArray(staffData.value)
            ? staffData.value
            : [];
        const staffMap = {};
        staffList.forEach((s) => {
          if (s.id) staffMap[String(s.id)] = s;
          if (s.slug) staffMap[s.slug] = s;
        });

        const deptList = Array.isArray(deptData.value)
          ? deptData.value
          : deptData.value?.results || [];
        const departmentMap = {};
        deptList.forEach((d) => {
          departmentMap[d.id] = d;
          if (d.name) departmentMap[String(d.name).toLowerCase()] = d;
        });

        const payrolls = Array.isArray(payrollData.value)
          ? payrollData.value
          : payrollData.value?.results || [];

        const formattedData = payrolls.map((item) => {
          const employee = staffMap[String(item.employee)] || {};
          return {
            name:
              employee.full_name ||
              `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
              "N/A",
            base_salary: `₦${Number(item.base_salary).toLocaleString()}`,
            role: employee.staff_role || employee.role || "N/A",
            department: resolveDepartment(employee.department, departmentMap),
          };
        });
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
