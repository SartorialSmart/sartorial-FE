import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Bell, X, Clock, AlertTriangle, Package, Cake, Gauge } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../avatar/Avatar";
import LogoutButton from "../buttons/LogoutButton";
import logo from "../../assets/images/Logo.png";
import NotificationService from "../../services/NotificationService";

const NOTIFICATION_ICONS = {
  due_order: Clock,
  overdue_order: AlertTriangle,
  low_stock: Package,
  birthday: Cake,
  order_limit: Gauge,
};

const NOTIFICATION_COLORS = {
  due_order: "text-yellow-600 bg-yellow-50",
  overdue_order: "text-red-600 bg-red-50",
  low_stock: "text-orange-600 bg-orange-50",
  birthday: "text-pink-600 bg-pink-50",
  order_limit: "text-purple-600 bg-purple-50",
};

const Navbar = () => {
  const { user } = useAuth();
    const location = useLocation();
    const isDashboard = location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard");
  const navPadding = isDashboard ? "py-0 px-3" : "p-3";
  const navHeight = isDashboard ? "h-16" : "h-12";
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await NotificationService.getSummary();
      setNotifications(data.items || []);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
  <nav className={`flex justify-between items-center ${navPadding} border-b shadow-sm bg-white`}>
      <div className="flex items-center space-x-1">
      <img
        src={logo}
        alt="logo"
        className={isDashboard ? "h-10 w-auto" : "h-8 w-auto"}
        style={{ objectFit: 'contain' }}
      />
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative p-1"
          >
            <Bell className="w-8 h-8 text-gray-600 cursor-pointer" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
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

        <div className="flex items-center space-x-2">
          <Avatar
            src={user?.avatar || null}
            alt="User"
          />
          <span className="text-gray-700 font-medium">
            {user?.first_name || "User"}
          </span>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
};

export default Navbar;
