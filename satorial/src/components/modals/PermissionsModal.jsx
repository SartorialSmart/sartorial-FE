import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield } from "lucide-react";
import { Spin, message } from "antd";
import PropTypes from "prop-types";
import StaffPermissionsService from "../../services/staffServices/StaffPermissionsService";
import PermissionPicker from "../permissions/PermissionPicker";

const PermissionsModal = ({ staff, isOpen, onClose }) => {
  const [catalog, setCatalog] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && staff?.id) {
      fetchPermissions();
    }
  }, [isOpen, staff?.id]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const [perms, cat] = await Promise.all([
        StaffPermissionsService.getStaffPermissions(staff.id),
        StaffPermissionsService.getPermissionCatalog(),
      ]);
      setCatalog(cat);
      setSelectedPermissions(perms.permissions || []);
    } catch {
      setSelectedPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await StaffPermissionsService.updateStaffPermissions(
        staff.id,
        selectedPermissions
      );
      message.success("Permissions updated successfully");
      onClose();
    } catch (error) {
      const msg =
        error?.response?.data?.permissions?.[0] ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to update permissions";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Staff Permissions
                  </h3>
                  <p className="text-sm text-gray-500">
                    {staff?.first_name} {staff?.last_name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Select the modules this staff member can access:
                  </p>
                  <PermissionPicker
                    catalog={catalog}
                    value={selectedPermissions}
                    onChange={setSelectedPermissions}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? <Spin size="small" /> : null}
                Save Permissions
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

PermissionsModal.propTypes = {
  staff: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PermissionsModal;
