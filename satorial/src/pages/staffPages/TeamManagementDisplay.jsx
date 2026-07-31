import { useEffect, useMemo, useState } from "react";
import { Table, Modal, Button, Tag, Select, Input, message, Tooltip } from "antd";
import { UserPlus, ShieldCheck, Send } from "lucide-react";
import StaffSideBarLayout from "../../components/navs/StaffSideBarLayout";
import PermissionPicker from "../../components/permissions/PermissionPicker";
import StaffService from "../../services/staffServices/StaffService";
import StaffPermissionsService from "../../services/staffServices/StaffPermissionsService";

const STAFF_ROLES = ["Tailor", "Designer", "Driver", "Accountant", "Procurement_Manager"];

function fullName(row) {
  return row.full_name || `${row.first_name || ""} ${row.last_name || ""}`.trim() || "—";
}

export default function TeamManagementDisplay() {
  const [staff, setStaff] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ email: "", staff_role: undefined, permissions: [] });
  const [inviting, setInviting] = useState(false);

  // Permissions editor modal
  const [permOpen, setPermOpen] = useState(false);
  const [permTarget, setPermTarget] = useState(null);
  const [permValue, setPermValue] = useState([]);
  const [savingPerms, setSavingPerms] = useState(false);

  const loadStaff = async () => {
    try {
      const data = await StaffService.listStaff();
      setStaff(Array.isArray(data) ? data : data?.results || []);
    } catch {
      message.error("Failed to load team.");
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [, cat] = await Promise.all([loadStaff(), StaffPermissionsService.getPermissionCatalog()]);
        setCatalog(cat);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submitInvite = async () => {
    if (!invite.email) return message.error("Email is required.");
    setInviting(true);
    try {
      await StaffService.inviteStaff({
        email: invite.email,
        staff_role: invite.staff_role,
        permissions: invite.permissions,
      });
      message.success("Invitation sent.");
      setInviteOpen(false);
      setInvite({ email: "", staff_role: undefined, permissions: [] });
      loadStaff();
    } catch (err) {
      if (!err?.response?.data?.upgrade_required) {
        message.error(err?.response?.data?.message || "Failed to send invitation.");
      }
    } finally {
      setInviting(false);
    }
  };

  const openPermissions = async (row) => {
    setPermTarget(row);
    setPermOpen(true);
    setPermValue([]);
    try {
      const data = await StaffPermissionsService.getStaffPermissions(row.id);
      setPermValue(data?.permissions || []);
    } catch {
      message.error("Failed to load permissions.");
    }
  };

  const savePermissions = async () => {
    setSavingPerms(true);
    try {
      await StaffPermissionsService.updateStaffPermissions(permTarget.id, permValue);
      message.success("Permissions updated.");
      setPermOpen(false);
    } catch (err) {
      message.error(err?.response?.data?.permissions?.[0] || "Failed to update permissions.");
    } finally {
      setSavingPerms(false);
    }
  };

  const resend = async (row) => {
    try {
      await StaffService.resendInvite(row.id);
      message.success("Invitation resent.");
    } catch (err) {
      message.error(err?.response?.data?.message || "Could not resend invite.");
    }
  };

  const columns = useMemo(
    () => [
      { title: "Name", key: "name", render: (_, row) => <span className="font-medium">{fullName(row)}</span> },
      { title: "Email", dataIndex: "email", key: "email" },
      {
        title: "Role",
        dataIndex: "staff_role",
        key: "role",
        render: (r) => (r ? <span className="capitalize">{String(r).replace("_", " ")}</span> : "—"),
      },
      {
        title: "Status",
        key: "status",
        render: (_, row) =>
          row.is_active === false ? <Tag color="orange">Pending invite</Tag> : <Tag color="green">Active</Tag>,
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Tooltip title="Permissions">
              <Button size="small" icon={<ShieldCheck size={14} />} onClick={() => openPermissions(row)}>
                Permissions
              </Button>
            </Tooltip>
            {row.is_active === false && (
              <Tooltip title="Resend invite">
                <Button size="small" icon={<Send size={14} />} onClick={() => resend(row)} />
              </Tooltip>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <StaffSideBarLayout>
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Team</h1>
          <p className="text-sm text-slate-600">Invite members and control what each can access.</p>
        </div>
        <Button type="primary" icon={<UserPlus size={16} />} onClick={() => setInviteOpen(true)}>
          Invite member
        </Button>
      </div>

      <Table
        rowKey={(r) => r.id || r.slug || r.email}
        dataSource={staff}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Invite modal */}
      <Modal
        title="Invite a team member"
        open={inviteOpen}
        onCancel={() => setInviteOpen(false)}
        onOk={submitInvite}
        okText="Send invitation"
        confirmLoading={inviting}
        width={640}
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <Input
                type="email"
                placeholder="member@example.com"
                value={invite.email}
                onChange={(e) => setInvite((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
              <Select
                className="w-full"
                placeholder="Select role"
                value={invite.staff_role}
                onChange={(v) => setInvite((s) => ({ ...s, staff_role: v }))}
                options={STAFF_ROLES.map((r) => ({ value: r, label: r.replace("_", " ") }))}
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Permissions</p>
            <PermissionPicker
              catalog={catalog}
              value={invite.permissions}
              onChange={(perms) => setInvite((s) => ({ ...s, permissions: perms }))}
            />
          </div>
          <p className="text-xs text-slate-500">
            The member will receive an email to set up their own account (password, phone, name).
          </p>
        </div>
      </Modal>

      {/* Permissions editor */}
      <Modal
        title={permTarget ? `Permissions · ${fullName(permTarget)}` : "Permissions"}
        open={permOpen}
        onCancel={() => setPermOpen(false)}
        onOk={savePermissions}
        okText="Save"
        confirmLoading={savingPerms}
        width={640}
      >
        <div className="pt-2">
          <PermissionPicker catalog={catalog} value={permValue} onChange={setPermValue} />
        </div>
      </Modal>
    </div>
    </StaffSideBarLayout>
  );
}
