import { apiGet, apiPatch, apiPut, apiPost } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const NotificationService = {
  getSummary: () => apiGet(API.NOTIFICATIONS.SUMMARY),

  getNotifications: (params = {}) =>
    apiGet(API.NOTIFICATIONS.LIST, { params }),

  getNotification: (notifId) => apiGet(API.NOTIFICATIONS.DETAIL(notifId)),

  getUnreadCount: () => apiGet(API.NOTIFICATIONS.UNREAD_COUNT),

  markAsRead: (notifId) =>
    apiPatch(API.NOTIFICATIONS.MARK_READ(notifId)),

  markAllAsRead: () =>
    apiPatch(API.NOTIFICATIONS.MARK_ALL_READ),

  getSettings: () => apiGet(API.NOTIFICATIONS.SETTINGS),

  updateSettings: (payload) =>
    apiPut(API.NOTIFICATIONS.SETTINGS, payload),
};

export default NotificationService;
