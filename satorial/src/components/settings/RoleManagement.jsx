import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Shield, X, Check } from "lucide-react";
import StaffRoleService from "../../services/staffServices/StaffRoleService";
import { toast } from "react-toastify";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await StaffRoleService.listRoles();
      setRoles(Array.isArray(data) ? data : data.results || []);
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openAddModal = () => {
    setEditingRole(null);
    setRoleName("");
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setShowModal(true);
  };

  const handleSave = async () => {
    const trimmed = roleName.trim();
    if (!trimmed) {
      toast.error("Role name is required");
      return;
    }
    setSaving(true);
    try {
      if (editingRole) {
        await StaffRoleService.updateRole(editingRole.id, { name: trimmed });
        toast.success("Role updated");
      } else {
        await StaffRoleService.addRole({ name: trimmed });
        toast.success("Role created");
      }
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      const msg = err?.response?.data?.name?.[0] || err?.response?.data?.detail || "Failed to save role";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    setSaving(true);
    try {
      await StaffRoleService.deleteRole(role.id);
      toast.success("Role deleted");
      setDeleteConfirm(null);
      fetchRoles();
    } catch {
      toast.error("Failed to delete role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Roles</h1>
            <p className="text-gray-600">Manage the roles available when adding or editing staff</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus size={18} />
            Add Role
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading roles...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Shield className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">No roles yet</p>
            <p className="text-sm">Click &ldquo;Add Role&rdquo; to create one</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left">
                <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Role Name</th>
                <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Created</th>
                <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Shield size={16} className="text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{role.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-gray-500">
                    {role.created_at ? new Date(role.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(role)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(role)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRole ? "Edit Role" : "Add Role"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="e.g. Seamstress"
                autoFocus
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !roleName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editingRole ? "Save Changes" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Role</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? Staff with this role will keep it but you won&apos;t be able to assign it to new staff.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
