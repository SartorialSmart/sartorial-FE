import { useState } from "react";
import SuccessModal from "../modals/SuccessModal";
import PayRollService from "../../services/staffServices/PayRolService";

const GeneratePayrollTable = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salary, setSalary] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const employees = [
    { id: 1, name: "Kemi Johnson", salary: 200000 },
    { id: 2, name: "John Doe", salary: 250000 },
    { id: 3, name: "Jane Smith", salary: 180000 },
    { id: 4, name: "Michael Brown", salary: 220000 },
  ];

  const handleUpdateClick = (employee) => {
    setSelectedEmployee(employee);
    setSalary(employee.salary);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    console.log(`Updated salary for ${selectedEmployee.name}: ₦${salary}`);
    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleGeneratePayroll = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee to generate payroll for.");
      return;
    }

    setIsLoading(true);

    const payrollData = {
      employee: selectedEmployee.id,
      pay_period_start: "2025-04-01",
      pay_period_end: "2025-04-30",
      base_salary: salary,
      overtime_hours: 0,
      deductions: 0,
      bonuses: 0,
    };

    try {
      const response = await PayRollService.createPayroll(payrollData);
      console.log("Payroll created successfully", response);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error generating payroll:", error);
      alert("Failed to generate payroll.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Compute Payroll</h2>
        <button
          onClick={handleGeneratePayroll}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Payroll"}
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
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 w-12">
                  <input type="checkbox" />
                </td>
                <td className="p-3">{employee.name}</td>
                <td className="p-3">₦{employee.salary.toLocaleString()}</td>
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
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-md">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <SuccessModal
          type="success"
          title="Payroll Generated"
          message={`Payroll for ${selectedEmployee.name} has been generated successfully!`}
          buttonText="Close"
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GeneratePayrollTable;
