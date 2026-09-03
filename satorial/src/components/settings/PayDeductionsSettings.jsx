import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, MinusCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { motion } from "framer-motion";
import { message } from "antd";
import PayDeductionService from "../../services/staffServices/PayDeductionService";
import SettingsService from "../../services/settings";
import Modal from "../common/Modal";
import Table from "../common/Table";
import { InputField, SelectField } from "../common/FormComponents";
import SuccessModal from "../modals/SuccessModal";

const DEDUCTION_CATEGORIES = [
  { value: "tax", label: "Tax" },
  { value: "loan", label: "Loan Repayment" },
  { value: "damage", label: "Damage" },
  { value: "penalty", label: "Penalty" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

const CALCULATION_TYPES = [
  { value: "fixed", label: "Fixed Amount" },
  { value: "percentage_of_base", label: "% of Base Salary" },
  { value: "percentage_of_gross", label: "% of Gross Pay" },
];

const PayDeductionsSettings = () => {
  const [deductions, setDeductions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [successModal, setSuccessModal] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other",
    calculation_type: "fixed",
    value: "",
    is_active: true,
    applies_to_departments: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dedData, deptData] = await Promise.allSettled([
        PayDeductionService.listDeductions(),
        SettingsService.Departments.getDepartments(),
      ]);

      const dedList = Array.isArray(dedData.value)
        ? dedData.value
        : dedData.value?.results || [];
      setDeductions(dedList);

      const deptList = Array.isArray(deptData.value)
        ? deptData.value
        : deptData.value?.results || [];
      setDepartments(deptList);
    } catch {
      message.error("Failed to load deductions");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        description: item.description || "",
        category: item.category || "other",
        calculation_type: item.calculation_type || "fixed",
        value: item.value ?? "",
        is_active: item.is_active !== false,
        applies_to_departments: item.applies_to_departments || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        category: "other",
        calculation_type: "fixed",
        value: "",
        is_active: true,
        applies_to_departments: [],
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDepartmentToggle = (deptId) => {
    setFormData((prev) => {
      const current = prev.applies_to_departments || [];
      const updated = current.includes(deptId)
        ? current.filter((id) => id !== deptId)
        : [...current, deptId];
      return { ...prev, applies_to_departments: updated };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.value || Number(formData.value) <= 0)
      newErrors.value = "Value must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        ...formData,
        value: Number(formData.value),
      };

      if (editingItem) {
        await PayDeductionService.updateDeduction(editingItem.id, payload);
        setSuccessModal({
          title: "Deduction Updated",
          message: "The deduction has been updated successfully.",
          buttonText: "Done",
        });
      } else {
        await PayDeductionService.createDeduction(payload);
        setSuccessModal({
          title: "Deduction Created",
          message: "The deduction has been created successfully.",
          buttonText: "Done",
        });
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      const errorMsg =
        error.response?.data?.name?.[0] ||
        error.response?.data?.detail ||
        "Failed to save deduction";
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      await PayDeductionService.deleteDeduction(item.id);
      setSuccessModal({
        title: "Deduction Deleted",
        message: "The deduction has been deleted successfully.",
        buttonText: "Done",
      });
      fetchData();
    } catch {
      message.error("Failed to delete deduction");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await PayDeductionService.updateDeduction(item.id, {
        is_active: !item.is_active,
      });
      fetchData();
    } catch {
      message.error("Failed to update status");
    }
  };

  const formatValue = (item) => {
    if (item.calculation_type === "percentage_of_base" || item.calculation_type === "percentage_of_gross") {
      return `${item.value}%`;
    }
    return `₦${Number(item.value).toLocaleString()}`;
  };

  const columns = [
    {
      header: "Name",
      key: "name",
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      header: "Category",
      key: "category",
      render: (value) => {
        const colors = {
          tax: "bg-red-100 text-red-800",
          loan: "bg-orange-100 text-orange-800",
          damage: "bg-yellow-100 text-yellow-800",
          penalty: "bg-pink-100 text-pink-800",
          insurance: "bg-indigo-100 text-indigo-800",
          other: "bg-gray-100 text-gray-800",
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[value] || "bg-gray-100 text-gray-800"}`}>
            {value?.replace("_", " ")?.replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        );
      },
    },
    {
      header: "Value",
      key: "value",
      render: (_, row) => (
        <span className="font-semibold text-red-600">{formatValue(row)}</span>
      ),
    },
    {
      header: "Applies To",
      key: "applies_to_departments",
      render: (value) => (
        <span className="text-sm text-gray-600">
          {(!value || value.length === 0) ? "All Departments" : `${value.length} dept(s)`}
        </span>
      ),
    },
    {
      header: "Status",
      key: "is_active",
      render: (value, row) => (
        <button onClick={() => handleToggleActive(row)} className="flex items-center gap-1">
          {value ? (
            <ToggleRight size={22} className="text-green-600" />
          ) : (
            <ToggleLeft size={22} className="text-gray-400" />
          )}
          <span className={`text-xs font-medium ${value ? "text-green-600" : "text-gray-400"}`}>
            {value ? "Active" : "Inactive"}
          </span>
        </button>
      ),
    },
  ];

  const actions = [
    { label: "Edit", icon: Edit, onClick: handleOpenModal },
    { label: "Delete", icon: Trash2, onClick: handleDelete, danger: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pay Deductions</h2>
          <p className="text-gray-600 mt-1">
            Manage taxes, penalties, insurance, and other deductions
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Deduction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Deductions</p>
              <h3 className="text-3xl font-bold mt-2">{deductions.length}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <MinusCircle size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active</p>
              <h3 className="text-3xl font-bold mt-2">
                {deductions.filter((d) => d.is_active).length}
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <ToggleRight size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Tax Rules</p>
              <h3 className="text-3xl font-bold mt-2">
                {deductions.filter((d) => d.category === "tax").length}
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <MinusCircle size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table
          columns={columns}
          data={deductions}
          loading={loading}
          emptyMessage="No deductions configured. Add your first deduction to get started."
          actions={actions}
          activeAction={activeAction}
          onActionToggle={setActiveAction}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Deduction" : "Add Deduction"}
        loading={saving}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="pay-deduction-form"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Deduction"
              )}
            </button>
          </>
        }
      >
        <form id="pay-deduction-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Deduction Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g., PAYE Tax"
              required
            />

            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={DEDUCTION_CATEGORIES}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Calculation Type"
              name="calculation_type"
              value={formData.calculation_type}
              onChange={handleChange}
              options={CALCULATION_TYPES}
            />

            <InputField
              label={
                formData.calculation_type?.includes("percentage")
                  ? "Percentage (%)"
                  : "Amount (₦)"
              }
              name="value"
              type="number"
              value={formData.value}
              onChange={handleChange}
              error={errors.value}
              placeholder={
                formData.calculation_type?.includes("percentage") ? "e.g., 10" : "e.g., 5000"
              }
              required
            />
          </div>

          <InputField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of this deduction..."
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Apply to Departments
            </label>
            <p className="text-xs text-gray-500">
              Leave empty to apply to all departments
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleDepartmentToggle(dept.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    (formData.applies_to_departments || []).includes(dept.id)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {dept.name}
                </button>
              ))}
              {departments.length === 0 && (
                <span className="text-sm text-gray-400 italic">No departments configured</span>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {successModal && (
        <SuccessModal {...successModal} onClose={() => setSuccessModal(null)} />
      )}
    </div>
  );
};

export default PayDeductionsSettings;
