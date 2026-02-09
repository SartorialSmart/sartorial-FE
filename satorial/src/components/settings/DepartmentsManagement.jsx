// components/settings/DepartmentsManagement.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Plus, Edit, Trash2, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { message } from "antd";
import SettingsService from "../../services/settings";
import Modal from "../common/Modal";
import Table from "../common/Table";
import { InputField, TextAreaField } from "../common/FormComponents";

const DepartmentsManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await SettingsService.Departments.getDepartmentStatistics();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      message.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || "",
      });
    } else {
      setEditingDepartment(null);
      setFormData({ name: "", description: "" });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    setFormData({ name: "", description: "" });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Department name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Department name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      if (editingDepartment) {
        await SettingsService.Departments.updateDepartment(
          editingDepartment.id,
          formData
        );
        message.success("Department updated successfully");
      } else {
        await SettingsService.Departments.createDepartment(formData);
        message.success("Department created successfully");
      }

      handleCloseModal();
      fetchDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
      const errorMsg =
        error.response?.data?.name?.[0] ||
        error.response?.data?.detail ||
        "Failed to save department";
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (department) => {
    if (department.staff_count > 0) {
      message.warning(
        `Cannot delete ${department.name}. It has ${department.staff_count} assigned staff members.`
      );
      return;
    }

    try {
      await SettingsService.Departments.deleteDepartment(department.id);
      message.success("Department deleted successfully");
      fetchDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
      message.error("Failed to delete department");
    }
  };

  const columns = [
    {
      header: "Department Name",
      key: "name",
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      header: "Description",
      key: "description",
      render: (value) => (
        <div className="text-gray-600">
          {value || <span className="text-gray-400 italic">No description</span>}
        </div>
      ),
    },
    {
      header: "Staff Count",
      key: "staff_count",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users size={16} className="text-blue-600" />
          </div>
          <span className="font-semibold text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      header: "Created",
      key: "created_at",
      render: (value) => (
        <div className="text-gray-600">
          {new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: "Edit",
      icon: Edit,
      onClick: handleOpenModal,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
      danger: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-gray-600 mt-1">
            Manage your organization&apos;s departments
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
            hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Total Departments
              </p>
              <h3 className="text-3xl font-bold mt-2">{departments.length}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Users size={24} />
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
              <p className="text-green-100 text-sm font-medium">Total Staff</p>
              <h3 className="text-3xl font-bold mt-2">
                {departments.reduce((sum, dept) => sum + dept.staff_count, 0)}
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Users size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Avg. Staff per Dept
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {departments.length > 0
                  ? Math.round(
                      departments.reduce((sum, dept) => sum + dept.staff_count, 0) /
                        departments.length
                    )
                  : 0}
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Users size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table
          columns={columns}
          data={departments}
          loading={loading}
          emptyMessage="No departments found. Create your first department to get started."
          actions={actions}
          activeAction={activeAction}
          onActionToggle={setActiveAction}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDepartment ? "Edit Department" : "Create Department"}
        loading={saving}
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
              form="department-form"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Department</>
              )}
            </button>
          </>
        }
      >
        <form id="department-form" onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Department Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Engineering, Marketing, Sales"
            required
          />

          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of this department..."
            rows={4}
          />
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsManagement;