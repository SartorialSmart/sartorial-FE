import { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Bell, X, CheckCheck, ExternalLink } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
} from "../../constants/notificationConstants";
import { getNotificationRoute } from "../../utils/notificationNavigation";
import NotificationDetailModal from "../modals/NotificationDetailModal";
import Avatar from "../avatar/Avatar";
import LogoutButton from "../buttons/LogoutButton";
import logo from "../../assets/images/Logo.png";
import SettingsService from "../../services/settings";

const Navbar = () => {
  const { user } = useAuth();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard");
  const navPadding = isDashboard ? "py-0 px-3" : "p-3";
  const navHeight = isDashboard ? "h-20" : "h-12";
  const [isOpen, setIsOpen] = useState(false);
  const [detailNotifId, setDetailNotifId] = useState(null);
  const [orgLogo, setOrgLogo] = useState(null);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    if (user?.role?.toLowerCase() === "organization") {
      SettingsService.Profile.getProfile()
        .then((data) => setOrgLogo(data?.logo_url || null))
        .catch(() => {});
    }
  }, [user?.role]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen]);

  const handleNotifClick = (notif) => {
    const route = getNotificationRoute(notif);
    if (route) {
      setIsOpen(false);
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

  return (
    <nav className={`flex justify-between items-center ${navPadding} ${navHeight} border-b shadow-sm bg-white`}>
      <div className="flex items-center space-x-1">
        <img
          src={logo}
          alt="logo"
          className={isDashboard ? "h-24 w-auto" : "h-16 w-auto"}
          style={{ objectFit: 'contain' }}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={dropdownRef}>
          <button
            ref={bellRef}
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative p-1"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Bell className="w-8 h-8 text-gray-600 cursor-pointer" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              role="menu"
              aria-label="Notifications"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close notifications">
                  <X size={14} />
                </button>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailNotifId(notif.id);
                              }}
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
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-center text-blue-600 hover:bg-blue-50 border-t border-gray-100 rounded-b-lg transition-colors"
                >
                  View All Notifications
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Avatar
            src={orgLogo || user?.avatar || null}
            alt={orgLogo ? "Organization Logo" : "User"}
          />
          <span className="text-gray-700 font-medium">
            {user?.first_name || "User"}
          </span>
        </div>
        <LogoutButton />
      </div>

      {detailNotifId && (
        <NotificationDetailModal
          notifId={detailNotifId}
          onClose={() => setDetailNotifId(null)}
        />
      )}
    </nav>
  );
};

export default Navbar;
