// components/modals/GrantLoginAccessModal.jsx
//
// Promotes an existing staff *record* into a user of the system. The staff
// member is already on the books (payroll, orders, performance) — this only
// gives them a way in, and picks what they may do once inside.

import { useEffect, useState } from "react";
import { Modal, Input, message } from "antd";
import PropTypes from "prop-types";
import PermissionPicker from "../permissions/PermissionPicker";
import StaffService from "../../services/staffServices/StaffService";
import StaffPermissionsService from "../../services/staffServices/StaffPermissionsService";

function fullName(staff) {
  return `${staff?.first_name || ""} ${staff?.last_name || ""}`.trim() || "this staff member";
}

const GrantLoginAccessModal = ({ staff, isOpen, onClose, onGranted }) => {
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setEmail(staff?.email || "");
    setPermissions([]);
    (async () => {
      try {
        const cat = await StaffPermissionsService.getPermissionsCatalog();
        setCatalog(cat?.catalog || []);
      } catch {
        setCatalog([]);
      }
    })();
  }, [isOpen, staff?.id, staff?.email]);

  const submit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      message.error("An email address is required — it's how they sign in.");
      return;
    }
    setSubmitting(true);
    try {
      await StaffService.grantLoginAccess(staff.id, { email: trimmed, permissions });
      message.success(`Invitation sent to ${trimmed}.`);
      onGranted?.();
      onClose();
    } catch (err) {
      // A 403 with upgrade_required is surfaced globally by the plan-limit
      // handler, so don't double-report it here.
      if (!err?.response?.data?.upgrade_required) {
        message.error(err?.response?.data?.message || "Could not grant system access.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Give ${fullName(staff)} system access`}
      open={isOpen}
      onCancel={onClose}
      onOk={submit}
      okText="Send invitation"
      confirmLoading={submitting}
      width={640}
    >
      <div className="space-y-4 pt-2">
        <p className="text-sm text-slate-600">
          They&apos;ll get an email to set their own password and finish their profile. This uses one of your
          plan&apos;s user seats — their staff record stays either way.
        </p>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email address</label>
          <Input
            type="email"
            placeholder="member@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-2">What can they do?</p>
          <PermissionPicker catalog={catalog} value={permissions} onChange={setPermissions} />
        </div>
      </div>
    </Modal>
  );
};

GrantLoginAccessModal.propTypes = {
  staff: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onGranted: PropTypes.func,
};

export default GrantLoginAccessModal;
