import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../contexts/NotificationContext";
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
  NOTIFICATION_TABS,
  NOTIFICATION_TYPE_LABELS,
} from "../../constants/notificationConstants";
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Loader2,
  ChevronDown,
} from "lucide-react";
import NotificationService from "../../services/NotificationService";
import { getNotificationRoute } from "../../utils/notificationNavigation";
import NotificationDetailModal from "../../components/modals/NotificationDetailModal";
import NotificationsSideBarLayout from "../../components/navs/NotificationsSideBarLayout";

const NotificationsListDisplay = () => {
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [detailNotifId, setDetailNotifId] = useState(null);

  const fetchPage = useCallback(async (url, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const params = {};
      if (!url) {
        if (activeTab === "unread") params.is_read = false;
        if (activeTab === "read") params.is_read = true;
      }
      const data = url
        ? await NotificationService.getNotifications({ url })
        : await NotificationService.getNotifications(params);
      const items = data.results || [];
      setNotifications((prev) => (append ? [...prev, ...items] : items));
      setNextUrl(data.next || null);
      setTotalCount(data.count ?? 0);
    } catch {
      setError("Failed to load notifications");
      if (!append) setNotifications([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleMarkAsRead = async (notifId) => {
    await markAsRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setNotifications([]);
    setNextUrl(null);
  };

  const handleNotifClick = (notif) => {
    const route = getNotificationRoute(notif);
    if (route) {
      if (!notif.is_read) handleMarkAsRead(notif.id);
      navigate(route);
    }
  };

  const handleNotifKeyDown = (e, notif) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNotifClick(notif);
    }
  };

  return (
    <NotificationsSideBarLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Bell className="text-blue-600" size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {totalCount > 0
                    ? `${totalCount} notification${totalCount !== 1 ? "s" : ""}`
                    : "No notifications"}
                  {unreadCount > 0 && (
                    <span className="ml-1.5 text-blue-600 font-medium">
                      ({unreadCount} unread)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            )}
            <button
              onClick={() => fetchPage()}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Refresh"}
            </button>
          </div>
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
          {NOTIFICATION_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`relative flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.key
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              role="tab"
              aria-selected={activeTab === tab.key}
            >
              {tab.label}
              {tab.key === "unread" && unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full min-w-[18px]">
                  {unreadCount}
                </span>
              )}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="notifTab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-16" role="status">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
                <p className="mt-3 text-sm text-gray-500">Loading notifications...</p>
              </div>
            </div>
          ) : error && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Bell className="text-red-500" size={22} />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-900">{error}</p>
                <button onClick={() => fetchPage()} className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                  Try again
                </button>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bell className="text-gray-400" size={24} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-900">No notifications</p>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === "all"
                    ? "You're all caught up!"
                    : activeTab === "unread"
                    ? "No unread notifications"
                    : "No read notifications"}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100" role="list">
                {notifications.map((notif) => {
                  const Icon = NOTIFICATION_ICONS[notif.notification_type] || Bell;
                  const colorClass = NOTIFICATION_COLORS[notif.notification_type] || "text-blue-600 bg-blue-50";
                  const label = NOTIFICATION_TYPE_LABELS[notif.notification_type] || "Notification";
                  return (
                    <div
                      key={notif.id}
                      role="listitem"
                      tabIndex={0}
                      className={`flex items-start gap-4 px-6 py-4 transition-colors cursor-pointer ${
                        !notif.is_read ? "bg-blue-50/40" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleNotifClick(notif)}
                      onKeyDown={(e) => handleNotifKeyDown(e, notif)}
                      aria-label={`${label}: ${notif.title || notif.message}${!notif.is_read ? " (unread)" : ""}`}
                    >
                      <div className={`flex-shrink-0 mt-0.5 p-2 rounded-full ${colorClass}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {label}
                          </span>
                          {!notif.is_read && (
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          )}
                        </div>
                        {notif.title && (
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                        )}
                        <p className="text-sm text-gray-700 leading-snug">{notif.message}</p>
                        {notif.created_at && (
                          <p className="text-xs text-gray-400 mt-1.5">
                            {formatRelativeTime(notif.created_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notif.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notif.id);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Mark as read"
                            aria-label="Mark as read"
                          >
                            <CheckCheck size={16} />
                          </button>
                        )}
                        <span className="text-gray-200">|</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailNotifId(notif.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View details"
                          aria-label="View notification details"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {nextUrl && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <button
                    onClick={() => fetchPage(nextUrl, true)}
                    disabled={loadingMore}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-center text-gray-400">
          Notifications update automatically every 5 minutes
        </p>
      </div>

      {detailNotifId && (
        <NotificationDetailModal
          notifId={detailNotifId}
          onClose={() => setDetailNotifId(null)}
        />
      )}
    </NotificationsSideBarLayout>
  );
};

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default NotificationsListDisplay;
