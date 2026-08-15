import { apiGet, apiPost } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const { PLATFORM_ACCESS } = API.STAFF_MANAGEMENT;

/**
 * Platform access for staff members: who can log in, who has been invited but
 * hasn't accepted yet, and the actions on those pending invitations.
 */
const PlatformAccessService = {
  // Every invitation this organization has issued (pending, accepted, cancelled)
  listInvitations: (params = {}) => {
    const config = Object.keys(params).length ? { params } : {};
    return apiGet(PLATFORM_ACCESS.INVITATIONS, config);
  },

  // Grant access: emails the staff member a link to set their own password
  sendInvite: (slug) => apiPost(PLATFORM_ACCESS.INVITE(slug), {}),

  // Mint a fresh link and email it again — the previous link stops working
  resendInvite: (invitationId) => apiPost(PLATFORM_ACCESS.RESEND(invitationId), {}),

  // Withdraw a pending invitation; the emailed link is invalidated immediately
  cancelInvite: (invitationId) => apiPost(PLATFORM_ACCESS.CANCEL(invitationId), {}),

  // Cut off a staff member who already logs in
  revokeAccess: (slug) => apiPost(PLATFORM_ACCESS.REVOKE(slug), {}),

  // Public — used by the invitation acceptance page
  getInvitation: (token) => apiGet(PLATFORM_ACCESS.INVITATION_BY_TOKEN(token)),

  acceptInvitation: (payload) => apiPost(PLATFORM_ACCESS.ACCEPT, payload),
};

export default PlatformAccessService;
