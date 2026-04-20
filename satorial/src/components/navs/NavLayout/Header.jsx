import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Bell, Search, ChevronDown, User, Settings, LogOut, Menu, Package, Clock, AlertTriangle, X } from "lucide-react";
import DFAULT_AVATAR from "../../../assets/images/default_avatar.svg";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import NotificationService from "../../../services/NotificationService";

const NOTIFICATION_ICONS = {
  due_order: Clock,
  overdue_order: AlertTriangle,
  low_stock: Package,
};

const NOTIFICATION_COLORS = {
  due_order: "text-yellow-600 bg-yellow-50",
  overdue_order: "text-red-600 bg-red-50",
  low_stock: "text-orange-600 bg-orange-50",
};

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const data = await NotificationService.getSummary();
      setNotifications(data.items || []);
    } catch {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Fetch on mount and every 5 minutes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
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

  return (
    <div className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-3 w-full fixed md:relative z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients, orders, staff..."
            className="w-72 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotif}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif, idx) => {
                    const Icon = NOTIFICATION_ICONS[notif.type] || Bell;
                    const colorClass = NOTIFICATION_COLORS[notif.type] || "text-blue-600 bg-blue-50";
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        <div className={`flex-shrink-0 mt-0.5 p-1.5 rounded-full ${colorClass}`}>
                          <Icon size={14} />
                        </div>
                        <p className="text-sm text-gray-700 leading-snug">{notif.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={toggleProfile}
            className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="relative">
              <img
                src={user?.avatar || DFAULT_AVATAR}
                alt="User"
                className="w-8 h-8 rounded-full border border-gray-200"
              />
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

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <img
                    src={user?.avatar || DFAULT_AVATAR}
                    alt="User"
                    className="w-9 h-9 rounded-full border border-gray-200"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Profile Settings</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Preferences</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func
};

export default Header;
