import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  X,
  Bell,
  Clock,
  Calendar,
  CheckCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import NotificationService from "../../services/NotificationService";
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
  NOTIFICATION_TYPE_LABELS,
} from "../../constants/notificationConstants";
import { useNavigate } from "react-router-dom";
import { getNotificationRoute } from "../../utils/notificationNavigation";

const NotificationDetailModal = ({ notifId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await NotificationService.getNotification(notifId);
        setDetail(data);
      } catch {
        setError("Failed to load notification details");
      } finally {
        setLoading(false);
      }
    };
    if (notifId) fetchDetail();
  }, [notifId]);

  const handleNavigate = () => {
    if (!detail) return;
    const route = getNotificationRoute(detail);
    if (route) {
      onClose();
      navigate(route);
    }
  };

  const handleMarkRead = async () => {
    try {
      await NotificationService.markAsRead(notifId);
      setDetail((prev) => (prev ? { ...prev, is_read: true } : prev));
    } catch {
      /* silently fail */
    }
  };

  const Icon = detail ? NOTIFICATION_ICONS[detail.notification_type] || Bell : Bell;
  const colorClass = detail ? NOTIFICATION_COLORS[detail.notification_type] || "text-blue-600 bg-blue-50" : "text-blue-600 bg-blue-50";
  const label = detail ? NOTIFICATION_TYPE_LABELS[detail.notification_type] || "Notification" : "";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="text-blue-600" size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Notification Details</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Close
            </button>
          </div>
        ) : detail ? (
          <div className="p-6 space-y-5">
            {/* Type badge */}
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${colorClass}`}>
                <Icon size={18} />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
                {detail.title && <p className="text-sm font-medium text-gray-900 mt-0.5">{detail.title}</p>}
              </div>
              {!detail.is_read && (
                <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Unread
                </span>
              )}
            </div>

            {/* Message */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{detail.message}</p>
            </div>

            {/* Data JSON (if present) */}
            {detail.data && Object.keys(detail.data).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Related Information</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {Object.entries(detail.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-500 capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="text-gray-900 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {detail.created_at ? new Date(detail.created_at).toLocaleString() : "N/A"}
              </span>
              {detail.read_at && (
                <span className="flex items-center gap-1">
                  <CheckCheck size={12} />
                  Read {new Date(detail.read_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div>
            {detail && !detail.is_read && (
              <button
                onClick={handleMarkRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <CheckCheck size={16} />
                Mark as read
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {detail && getNotificationRoute(detail) && (
              <button
                onClick={handleNavigate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink size={16} />
                View Details
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

NotificationDetailModal.propTypes = {
  notifId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NotificationDetailModal;
