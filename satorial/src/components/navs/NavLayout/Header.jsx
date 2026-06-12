import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Bell, Search, ChevronDown, User, Settings, LogOut, Menu, X, CheckCheck, ExternalLink } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useNotifications } from "../../../contexts/NotificationContext";
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
} from "../../../constants/notificationConstants";
import { getNotificationRoute } from "../../../utils/notificationNavigation";
import NotificationDetailModal from "../../modals/NotificationDetailModal";
import SettingsService from "../../../services/settings";

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [detailNotifId, setDetailNotifId] = useState(null);
  const [orgLogo, setOrgLogo] = useState(null);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const notifButtonRef = useRef(null);
  const navigate = useNavigate();

  const handleClickOutside = useCallback((event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setProfileOpen(false);
    }
    if (notifRef.current && !notifRef.current.contains(event.target)) {
      setNotifOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (isNotifOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isNotifOpen]);

  useEffect(() => {
    if (user?.role?.toLowerCase() === "organization") {
      SettingsService.Profile.getProfile()
        .then((data) => setOrgLogo(data?.logo_url || null))
        .catch(() => {});
    }
  }, [user?.role]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleNotif = () => {
    setNotifOpen((prev) => !prev);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen((prev) => !prev);
    setNotifOpen(false);
  };

  const handleNotifClick = (notif) => {
    const route = getNotificationRoute(notif);
    if (route) {
      setNotifOpen(false);
      if (!notif.is_read) markAsRead(notif.id);
      navigate(route);
    }
  };

  const handleNotifKeyDown = (e, notif) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNotifClick(notif);
    }
  };

  const handleViewDetails = (e, notifId) => {
    e.stopPropagation();
    setDetailNotifId(notifId);
  };

  return (
    <div className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-3 w-full fixed md:relative z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients, orders, staff..."
            className="w-72 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative" ref={notifRef}>
          <button
            ref={notifButtonRef}
            onClick={toggleNotif}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            aria-expanded={isNotifOpen}
            aria-haspopup="true"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              role="menu"
              aria-label="Notifications"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-1">
                  {notifications.some((n) => !n.is_read) && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Mark all as read"
                      aria-label="Mark all notifications as read"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    aria-label="Close notifications"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto" role="list">
                {loading ? (
                  <div className="flex items-center justify-center py-8" role="status">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span className="sr-only">Loading notifications</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500" role="status">
                    No new notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => {
                    const Icon = NOTIFICATION_ICONS[notif.type] || Bell;
                    const colorClass = NOTIFICATION_COLORS[notif.type] || "text-blue-600 bg-blue-50";
                    return (
                      <div
                        key={notif.id}
                        role="menuitem"
                        tabIndex={0}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 group cursor-pointer"
                        onClick={() => handleNotifClick(notif)}
                        onKeyDown={(e) => handleNotifKeyDown(e, notif)}
                        aria-label={`${notif.message}${!notif.is_read ? " (unread)" : ""}`}
                      >
                        <div className={`flex-shrink-0 mt-0.5 p-1.5 rounded-full ${colorClass}`}>
                          <Icon size={14} />
                        </div>
                        <p className="flex-1 text-sm text-gray-700 leading-snug min-w-0 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex-shrink-0 flex items-center gap-0.5">
                          {!notif.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.id);
                              }}
                              className="p-1 text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                              title="Mark as read"
                              aria-label="Mark notification as read"
                            >
                              <CheckCheck size={14} />
                            </button>
                          )}
                          {getNotificationRoute(notif) && (
                            <button
                              onClick={(e) => handleViewDetails(e, notif.id)}
                              className="p-1 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                              title="View details"
                              aria-label="View notification details"
                            >
                              <ExternalLink size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-center text-blue-600 hover:bg-blue-50 border-t border-gray-100 rounded-b-lg transition-colors"
                >
                  View All Notifications
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={toggleProfile}
            className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="User menu"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-200 flex items-center justify-center overflow-hidden">
                {orgLogo || user?.avatar
                  ? <img src={orgLogo || user?.avatar} alt="User" className="w-full h-full object-cover" />
                  : <User className="w-5 h-5 text-gray-500" />
                }
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden md:block text-left">
              <span className="text-sm font-medium text-gray-900 block leading-tight">
                {user?.first_name || "Guest"}
              </span>
              <span className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() || "user"}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50" role="menu">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full border border-gray-200 bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {orgLogo || user?.avatar
                      ? <img src={orgLogo || user?.avatar} alt="" className="w-full h-full object-cover" />
                      : <User className="w-5 h-5 text-gray-500" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setProfileOpen(false)}
                  role="menuitem"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Profile Settings</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setProfileOpen(false)}
                  role="menuitem"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Preferences</span>
                </Link>
              </div>

              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {detailNotifId && (
        <NotificationDetailModal
          notifId={detailNotifId}
          onClose={() => setDetailNotifId(null)}
        />
      )}
    </div>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func
};

export default Header;
