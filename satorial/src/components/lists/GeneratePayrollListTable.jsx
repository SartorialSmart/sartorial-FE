import { useState } from "react";
import SuccessModal from "../modals/SuccessModal";
import StaffService from "../../services/staffServices/StaffService";
import { useEffect } from "react";

const GeneratePayrollTable = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salary, setSalary] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isSalaryUpdating, setIsSalaryUpdating] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await StaffService.listStaff();
        setEmployees(Array.isArray(data.results) ? data.results : []);
      } catch {
        console.error("Error fetching staff");
        setEmployees([]);
      }
    };
    fetchStaff();
  }, []);

  const handleUpdateClick = (employee) => {
    setSelectedEmployee(employee);
    setSalary(employee.salary);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;
    setIsSalaryUpdating(true);
    try {
      await StaffService.updateSalary({
        user_uuid: selectedEmployee.id,
        new_salary: salary,
      });
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployee.id
            ? { ...emp, salary: Number(salary) }
            : emp
        )
      );
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch {
      alert("Failed to update salary.");
    } finally {
      setIsSalaryUpdating(false);
    }
  };

  const getEmployeeDisplayName = (employee) => {
    return (
      employee.full_name ||
      `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
      employee.name ||
      employee.username ||
      employee.email
    );
  };

  return (
    <div className="p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Compute Payroll</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Generate Payroll
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left text-sm">
              <th className="p-3 w-12">
                <input type="checkbox" />
              </th>
              <th className="p-3">Name</th>
              <th className="p-3">Salary</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(employees) ? employees : []).map((employee) => (
              <tr
                key={employee.id || employee.slug || employee.email}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3 w-12">
                  <input type="checkbox" />
                </td>
                <td className="p-3">
                  {employee.full_name ||
                    `${employee.first_name || ""} ${
                      employee.last_name || ""
                    }`.trim() ||
                    employee.name ||
                    employee.username ||
                    employee.email}
                </td>
                <td className="p-3">
                  ₦{Number(employee.salary).toLocaleString()}
                </td>
                <td className="p-3 text-blue-600 cursor-pointer">
                  <button
                    onClick={() => handleUpdateClick(employee)}
                    className="underline"
                  >
                    Update Salary
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Update Salary for {selectedEmployee.name}
            </h3>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                disabled={isSalaryUpdating}
              >
                {isSalaryUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <SuccessModal
          type="success"
          title="Payroll Generated"
          message={`Payroll for ${getEmployeeDisplayName(
            selectedEmployee
          )} has been generated successfully!`}
          buttonText="Close"
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GeneratePayrollTable;
