import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import StaffService from "../../services/staffServices/StaffService";

const LOAN_STATUSES = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const LoanFormModal = ({ isOpen, onClose, onSubmit, editingLoan, employees }) => {
  const [formData, setFormData] = useState({
    employee: editingLoan?.employee || "",
    total_amount: editingLoan?.total_amount || "",
    monthly_deduction: editingLoan?.monthly_deduction || "",
    description: editingLoan?.description || "",
    status: editingLoan?.status || "active",
    start_date: editingLoan?.start_date || new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.employee) errs.employee = "Employee is required";
    if (!formData.total_amount || Number(formData.total_amount) <= 0)
      errs.total_amount = "Total amount must be greater than 0";
    if (!formData.monthly_deduction || Number(formData.monthly_deduction) <= 0)
      errs.monthly_deduction = "Monthly deduction must be greater than 0";
    if (
      Number(formData.monthly_deduction) > Number(formData.total_amount)
    )
      errs.monthly_deduction = "Monthly deduction cannot exceed total amount";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      await onSubmit({
        ...formData,
        total_amount: Number(formData.total_amount),
        monthly_deduction: Number(formData.monthly_deduction),
      });
    } catch {
      // parent handles error
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingLoan ? "Edit Loan" : "Add Loan"}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              disabled={!!editingLoan}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.employee ? "border-red-500" : "border-gray-300"
              } ${editingLoan ? "bg-gray-50" : ""}`}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name ||
                    `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
                    emp.email}
                </option>
              ))}
            </select>
            {errors.employee && (
              <p className="text-sm text-red-600">{errors.employee}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Total Amount (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                placeholder="e.g., 200000"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.total_amount ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.total_amount && (
                <p className="text-sm text-red-600">{errors.total_amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Monthly Deduction (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="monthly_deduction"
                value={formData.monthly_deduction}
                onChange={handleChange}
                placeholder="e.g., 20000"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.monthly_deduction ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.monthly_deduction && (
                <p className="text-sm text-red-600">{errors.monthly_deduction}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {editingLoan && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LOAN_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Reason for the loan..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Loan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanFormModal;
