import { useEffect, useState } from "react";
import { Table, Modal, Button, Tag, Select, Input, Segmented, message, Tooltip } from "antd";
import { toast } from "react-toastify";
import { UserPlus, ShieldCheck, Send, Ban } from "lucide-react";
import StaffSideBarLayout from "../../components/navs/StaffSideBarLayout";
import PermissionPicker from "../../components/permissions/PermissionPicker";
import StaffService from "../../services/staffServices/StaffService";
import StaffPermissionsService from "../../services/staffServices/StaffPermissionsService";
import { extractErrorMessage } from "../../../utils/errorUtils";

const STAFF_ROLES = ["Tailor", "Designer", "Driver", "Accountant", "Procurement_Manager"];

// Two ways to add a user: invite someone new by email, or promote a staff member
// who is already on the books.
const MODE_NEW = "Someone new";
const MODE_EXISTING = "Existing staff";

function fullName(row) {
  return row.full_name || `${row.first_name || ""} ${row.last_name || ""}`.trim() || "—";
}

export default function TeamManagementDisplay() {
  const [staff, setStaff] = useState([]);
  const [records, setRecords] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [mode, setMode] = useState(MODE_NEW);
  const [invite, setInvite] = useState({ email: "", staff_role: undefined, permissions: [], staffId: undefined });
  const [inviting, setInviting] = useState(false);

  // Permissions editor modal
  const [permOpen, setPermOpen] = useState(false);
  const [permTarget, setPermTarget] = useState(null);
  const [permValue, setPermValue] = useState([]);
  const [savingPerms, setSavingPerms] = useState(false);

  // This page is about users of the system, so it lists only staff who can sign
  // in. `records` is the rest of the workforce — the pool you can promote from.
  const loadStaff = async () => {
    try {
      const data = await StaffService.listStaff();
      const all = Array.isArray(data) ? data : data?.results || [];
      setStaff(all.filter((s) => s.has_login_access));
      setRecords(all.filter((s) => !s.has_login_access));
    } catch {
      message.error("Failed to load team.");
    }
  };

  const resetInvite = () => {
    setInvite({ email: "", staff_role: undefined, permissions: [], staffId: undefined });
    setMode(MODE_NEW);
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
    const promoting = mode === MODE_EXISTING;
    if (promoting && !invite.staffId) return message.error("Choose a staff member to give access to.");
    if (!invite.email) return message.error("Email is required.");

    setInviting(true);
    try {
      if (promoting) {
        // Existing employee record → grant a seat and invite them to finish setup.
        await StaffService.grantLoginAccess(invite.staffId, {
          email: invite.email,
          permissions: invite.permissions,
        });
      } else {
        await StaffService.inviteStaff({
          email: invite.email,
          staff_role: invite.staff_role,
          permissions: invite.permissions,
        });
      }
      message.success("Invitation sent.");
      setInviteOpen(false);
      resetInvite();
      loadStaff();
    } catch (err) {
      if (!err?.response?.data?.upgrade_required) {
        message.error(err?.response?.data?.message || "Failed to send invitation.");
      }
    } finally {
      setInviting(false);
    }
  };

  const revokeAccess = (row) => {
    Modal.confirm({
      title: "Remove system access?",
      content: `${fullName(row)} will no longer be able to sign in. They stay on your staff list, and the seat is freed up for someone else.`,
      okText: "Remove access",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await StaffService.revokeLoginAccess(row.id);
          if (res && res.success === false) {
            throw res;
          }
          toast.success("System access removed.");
          message.success("System access removed.");
          loadStaff();
        } catch (err) {
          console.error("Revoke access error:", err);
          const errMsg = extractErrorMessage(err, "Could not remove access.");
          toast.error(errMsg);
          try {
            message.error(errMsg);
          } catch {
            // ignore
          }
        }
      },
    });
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
      const res = await StaffService.resendInvite(row.id);
      if (res && res.success === false) {
        throw res;
      }
      toast.success("Invitation resent.");
      message.success("Invitation resent.");
      loadStaff();
    } catch (err) {
      console.error("Resend invite error:", err);
      const errMsg = extractErrorMessage(err, "Could not resend invite.");
      toast.error(errMsg);
      try {
        message.error(errMsg);
      } catch {
        // ignore
      }
    }
  };

  const columns = [
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
          <Tooltip title="Remove system access (keeps their staff record)">
            <Button size="small" danger icon={<Ban size={14} />} onClick={() => revokeAccess(row)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <StaffSideBarLayout>
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-600">
            The people who can sign in to Sartorial, and what each of them may do. Staff who only need to be
            on the payroll live under <span className="font-medium">Staff</span> — they don&apos;t use a seat.
          </p>
        </div>
        <Button type="primary" icon={<UserPlus size={16} />} onClick={() => setInviteOpen(true)}>
          Add user
        </Button>
      </div>

      <Table
        rowKey={(r) => r.id || r.slug || r.email}
        dataSource={staff}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Add-user modal: invite someone new, or promote existing staff */}
      <Modal
        title="Add a user"
        open={inviteOpen}
        onCancel={() => {
          setInviteOpen(false);
          resetInvite();
        }}
        onOk={submitInvite}
        okText="Send invitation"
        confirmLoading={inviting}
        width={640}
      >
        <div className="space-y-4 pt-2">
          <Segmented
            block
            options={[MODE_NEW, MODE_EXISTING]}
            value={mode}
            onChange={(v) => {
              setMode(v);
              setInvite((s) => ({ ...s, staffId: undefined, email: "" }));
            }}
          />

          {mode === MODE_EXISTING ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Staff member</label>
                <Select
                  className="w-full"
                  showSearch
                  optionFilterProp="label"
                  placeholder={records.length ? "Select staff" : "No staff without access"}
                  disabled={!records.length}
                  value={invite.staffId}
                  onChange={(id) => {
                    const picked = records.find((r) => r.id === id);
                    // Reuse the email already on their record when there is one.
                    setInvite((s) => ({ ...s, staffId: id, email: picked?.email || "" }));
                  }}
                  options={records.map((r) => ({
                    value: r.id,
                    label: `${fullName(r)}${r.staff_role ? ` · ${String(r.staff_role).replace("_", " ")}` : ""}`,
                  }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="member@example.com"
                  value={invite.email}
                  onChange={(e) => setInvite((s) => ({ ...s, email: e.target.value }))}
                />
              </div>
            </div>
          ) : (
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
          )}

          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Permissions</p>
            <PermissionPicker
              catalog={catalog}
              value={invite.permissions}
              onChange={(perms) => setInvite((s) => ({ ...s, permissions: perms }))}
            />
          </div>
          <p className="text-xs text-slate-500">
            {mode === MODE_EXISTING
              ? "They'll get an email to set a password and confirm their details. Their staff record — payroll, orders, history — stays exactly as it is."
              : "They'll receive an email to set up their own account (password, phone, name), and a staff record is created for them."}{" "}
            This uses one of your plan&apos;s user seats.
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
