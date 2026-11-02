import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import NotificationService from "../services/NotificationService";

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [dropdownItems, setDropdownItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await NotificationService.getSummary();
      setDropdownItems(data.items || []);
    } catch {
      setError("Failed to load notifications");
      setDropdownItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await NotificationService.getUnreadCount();
      setUnreadCount(data.count ?? data.unread_count ?? 0);
    } catch {
      /* badge silently stays at previous value */
    }
  }, []);

  const markAsRead = useCallback(async (notifId) => {
    try {
      await NotificationService.markAsRead(notifId);
      setDropdownItems((prev) =>
        prev.map((n) =>
          n.id === notifId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* silently fail */
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      setDropdownItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      /* silently fail */
    }
  }, []);

  const connectSSE = useCallback(() => {
    const baseUrl = import.meta.env.VITE_BASE_URL?.replace(/\/+$/, "");
    const token = localStorage.getItem("accessToken");
    if (!baseUrl || !token) return;

    const url = `${baseUrl}${API_STREAM_PATH}?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_notification" || data.notification) {
          const notif = data.notification || data;
          fetchSummary();
          fetchUnreadCount();
          sendBrowserNotification(notif);
        }
      } catch {
        /* ignore parse errors */
      }
    };

    es.onerror = () => {
      es.close();
    };

    eventSourceRef.current = es;
  }, [fetchSummary, fetchUnreadCount]);

  useEffect(() => {
    fetchSummary();
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchSummary();
      fetchUnreadCount();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSummary, fetchUnreadCount]);

  useEffect(() => {
    connectSSE();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connectSSE]);

  return (
    <NotificationContext.Provider
      value={{
        notifications: dropdownItems,
        loading,
        error,
        unreadCount,
        fetchNotifications: fetchSummary,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node,
};

const API_STREAM_PATH = "/notifications/stream/";

function sendBrowserNotification(notif) {
  if (!("Notification" in window) || Notification.permission === "denied") return;
  if (Notification.permission === "granted") {
    navigator.serviceWorker.ready.then((reg) => {
      reg.active.postMessage({
        type: "SHOW_NOTIFICATION",
        payload: {
          title: notif.title || "New Notification",
          body: notif.message || "",
          tag: `notif-${notif.id}`,
        },
      });
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}
