import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Check } from "lucide-react";
import { Spin, message } from "antd";
import PropTypes from "prop-types";
import StaffPermissionsService from "../../services/staffServices/StaffPermissionsService";

const AVAILABLE_VIEWS = [
  { key: "clients", label: "Clients Management" },
  { key: "orders", label: "Orders Management" },
  { key: "staff", label: "Staff Management" },
  { key: "reports", label: "Reports & Analytics" },
  { key: "expenses", label: "Expenses" },
  { key: "inventory", label: "Inventory Management" },
  { key: "subscriptions", label: "Subscription" },
  { key: "settings", label: "Settings" },
  { key: "notifications", label: "Notifications" },
  { key: "qa_checklist", label: "Q/A Checklist" },
];

const PermissionsModal = ({ staff, isOpen, onClose }) => {
  const [selectedViews, setSelectedViews] = useState([]);
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
      const data = await StaffPermissionsService.getStaffPermissions(staff.id);
      setSelectedViews(data.permissions || []);
    } catch {
      setSelectedViews(AVAILABLE_VIEWS.map((v) => v.key));
    } finally {
      setLoading(false);
    }
  };

  const toggleView = (key) => {
    setSelectedViews((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await StaffPermissionsService.updateStaffPermissions(
        staff.id,
        selectedViews
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
                    Select the views this staff member can access:
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {AVAILABLE_VIEWS.map((view) => (
                      <label
                        key={view.key}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                            selectedViews.includes(view.key)
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                          }`}
                          onClick={() => toggleView(view.key)}
                        >
                          {selectedViews.includes(view.key) && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {view.label}
                        </span>
                      </label>
                    ))}
                  </div>
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
