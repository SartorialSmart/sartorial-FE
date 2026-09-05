import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, Zap, ToggleLeft, ToggleRight } from "lucide-react";
import { motion } from "framer-motion";
import { message } from "antd";
import BonusRuleService from "../../services/staffServices/BonusRuleService";
import SettingsService from "../../services/settings";
import Modal from "../common/Modal";
import Table from "../common/Table";
import { InputField, SelectField } from "../common/FormComponents";
import SuccessModal from "../modals/SuccessModal";

const METRICS = [
  { value: "completion_rate", label: "Completion Rate (%)" },
  { value: "reassignment_rate", label: "Reassignment Rate (%)" },
  { value: "total_orders", label: "Total Orders Completed" },
  { value: "order_value", label: "Total Order Value (₦)" },
];

const OPERATORS = [
  { value: ">=", label: "Greater or equal (>=)" },
  { value: "<=", label: "Less or equal (<=)" },
  { value: ">", label: "Greater than (>)" },
  { value: "<", label: "Less than (<)" },
  { value: "==", label: "Equal to (=)" },
];

const BONUS_TYPES = [
  { value: "fixed", label: "Fixed Amount" },
  { value: "percentage_of_base", label: "% of Base Salary" },
];

const BonusRulesSettings = () => {
  const [rules, setRules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [successModal, setSuccessModal] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    metric: "completion_rate",
    operator: ">=",
    threshold: "",
    bonus_type: "fixed",
    bonus_value: "",
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
      const [ruleData, deptData] = await Promise.allSettled([
        BonusRuleService.listRules(),
        SettingsService.Departments.getDepartments(),
      ]);

      const ruleList = Array.isArray(ruleData.value)
        ? ruleData.value
        : ruleData.value?.results || [];
      setRules(ruleList);

      const deptList = Array.isArray(deptData.value)
        ? deptData.value
        : deptData.value?.results || [];
      setDepartments(deptList);
    } catch {
      message.error("Failed to load bonus rules");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        metric: item.metric || "completion_rate",
        operator: item.operator || ">=",
        threshold: item.threshold ?? "",
        bonus_type: item.bonus_type || "fixed",
        bonus_value: item.bonus_value ?? "",
        is_active: item.is_active !== false,
        applies_to_departments: item.applies_to_departments || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        metric: "completion_rate",
        operator: ">=",
        threshold: "",
        bonus_type: "fixed",
        bonus_value: "",
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
    if (!formData.threshold || Number(formData.threshold) < 0)
      newErrors.threshold = "Threshold is required";
    if (!formData.bonus_value || Number(formData.bonus_value) <= 0)
      newErrors.bonus_value = "Bonus value must be greater than 0";
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
        threshold: Number(formData.threshold),
        bonus_value: Number(formData.bonus_value),
      };

      if (editingItem) {
        await BonusRuleService.updateRule(editingItem.id, payload);
        setSuccessModal({
          title: "Rule Updated",
          message: "The bonus rule has been updated successfully.",
          buttonText: "Done",
        });
      } else {
        await BonusRuleService.createRule(payload);
        setSuccessModal({
          title: "Rule Created",
          message: "The bonus rule has been created successfully.",
          buttonText: "Done",
        });
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      const errorMsg =
        error.response?.data?.name?.[0] ||
        error.response?.data?.detail ||
        "Failed to save bonus rule";
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      await BonusRuleService.deleteRule(item.id);
      setSuccessModal({
        title: "Rule Deleted",
        message: "The bonus rule has been deleted successfully.",
        buttonText: "Done",
      });
      fetchData();
    } catch {
      message.error("Failed to delete bonus rule");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await BonusRuleService.updateRule(item.id, {
        is_active: !item.is_active,
      });
      fetchData();
    } catch {
      message.error("Failed to update status");
    }
  };

  const formatBonusValue = (item) => {
    if (item.bonus_type === "percentage_of_base") {
      return `${item.bonus_value}% of base`;
    }
    return `₦${Number(item.bonus_value).toLocaleString()}`;
  };

  const columns = [
    {
      header: "Rule Name",
      key: "name",
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      header: "Condition",
      key: "metric",
      render: (_, row) => (
        <span className="text-sm text-gray-700">
          {METRICS.find((m) => m.value === row.metric)?.label || row.metric}
          {" "}
          <span className="font-mono text-blue-600">{row.operator}</span>
          {" "}
          {row.threshold}
          {row.metric?.includes("rate") ? "%" : ""}
        </span>
      ),
    },
    {
      header: "Bonus",
      key: "bonus_value",
      render: (_, row) => (
        <span className="font-semibold text-green-600">{formatBonusValue(row)}</span>
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
          <h2 className="text-2xl font-bold text-gray-900">Performance Bonus Rules</h2>
          <p className="text-gray-600 mt-1">
            Automatically award bonuses based on staff performance metrics
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Total Rules</p>
              <h3 className="text-3xl font-bold mt-2">{rules.length}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Zap size={24} />
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
              <p className="text-green-100 text-sm font-medium">Active Rules</p>
              <h3 className="text-3xl font-bold mt-2">
                {rules.filter((r) => r.is_active).length}
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Zap size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Completion-Based</p>
              <h3 className="text-3xl font-bold mt-2">
                {rules.filter((r) => r.metric === "completion_rate").length}
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Zap size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table
          columns={columns}
          data={rules}
          loading={loading}
          emptyMessage="No bonus rules configured. Add your first rule to get started."
          actions={actions}
          activeAction={activeAction}
          onActionToggle={setActiveAction}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Bonus Rule" : "Add Bonus Rule"}
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
              form="bonus-rule-form"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Rule"
              )}
            </button>
          </>
        }
      >
        <form id="bonus-rule-form" onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Rule Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., High Performer Bonus"
            required
          />

          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Condition
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                label="Performance Metric"
                name="metric"
                value={formData.metric}
                onChange={handleChange}
                options={METRICS}
              />
              <SelectField
                label="Operator"
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                options={OPERATORS}
              />
              <InputField
                label="Threshold"
                name="threshold"
                type="number"
                value={formData.threshold}
                onChange={handleChange}
                error={errors.threshold}
                placeholder="e.g., 80"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Bonus Type"
              name="bonus_type"
              value={formData.bonus_type}
              onChange={handleChange}
              options={BONUS_TYPES}
            />

            <InputField
              label={formData.bonus_type === "percentage_of_base" ? "Percentage (%)" : "Fixed Amount (₦)"}
              name="bonus_value"
              type="number"
              value={formData.bonus_value}
              onChange={handleChange}
              error={errors.bonus_value}
              placeholder={formData.bonus_type === "percentage_of_base" ? "e.g., 10" : "e.g., 50000"}
              required
            />
          </div>

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

export default BonusRulesSettings;
