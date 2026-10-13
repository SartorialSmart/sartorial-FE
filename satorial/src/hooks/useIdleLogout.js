import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

/**
 * Idle-timeout configuration.
 *
 * Defaults to 15 minutes. Override with VITE_IDLE_TIMEOUT_MINUTES
 * (floats allowed, useful for testing e.g. 0.05 ~= 3s).
 */
export const getIdleTimeoutMs = () => {
  const raw = Number(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES);
  const minutes = Number.isFinite(raw) && raw > 0 ? raw : 15;
  return Math.round(minutes * 60 * 1000);
};

export const IDLE_ACTIVITY_KEY = "sartorial_last_activity";
export const IDLE_LOGOUT_REASON_KEY = "sartorial_logout_reason";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "wheel",
  "click",
];
// Re-check on this cadence so background-throttled timers and cross-tab
// activity can't leave a stale session alive (or kill an active one).
const CHECK_INTERVAL_MS = 30_000;
// Writing localStorage on every mousemove is wasteful — throttle sync writes.
const STORAGE_WRITE_THROTTLE_MS = 5_000;

const readStoredActivity = () => {
  try {
    const raw = localStorage.getItem(IDLE_ACTIVITY_KEY);
    const ts = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
};

const writeStoredActivity = (ts) => {
  try {
    localStorage.setItem(IDLE_ACTIVITY_KEY, String(ts));
  } catch {
    /* ignore storage errors (private mode, quota) */
  }
};

/**
 * Logs the user out after 15 minutes without interaction.
 *
 * Must be mounted inside <Router> (uses useNavigate). Only active while
 * authenticated — public pages are untouched. Activity is synced across tabs
 * via localStorage so working in one tab keeps the others alive.
 */
export const useIdleLogout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userRef = useRef(user);
  const logoutRef = useRef(logout);
  const navigateRef = useRef(navigate);
  const timeoutIdRef = useRef(null);
  const intervalIdRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const lastStorageWriteRef = useRef(0);
  const didTimeoutRef = useRef(false);

  userRef.current = user;
  logoutRef.current = logout;
  navigateRef.current = navigate;

  useEffect(() => {
    // Only track authenticated sessions.
    if (!userRef.current) return undefined;

    const timeoutMs = getIdleTimeoutMs();
    didTimeoutRef.current = false;

    const clearTimer = () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };

    const handleIdle = async () => {
      if (didTimeoutRef.current) return;
      if (!userRef.current) return;
      if (!localStorage.getItem("accessToken")) return;
      // Double-check elapsed time so a stale timer can't fire early.
      if (Date.now() - lastActivityRef.current < timeoutMs) return;
      didTimeoutRef.current = true;
      clearTimer();

      // Remember where the user was (mirrors ProtectedRoute) and flag the
      // reason so Login can explain the redirect.
      const from = `${window.location.pathname}${window.location.search}`;
      try {
        if (from && from !== "/login") {
          localStorage.setItem("postLoginRedirect", from);
        }
        sessionStorage.setItem(IDLE_LOGOUT_REASON_KEY, "idle");
      } catch {
        /* ignore storage errors */
      }

      try {
        await logoutRef.current();
      } catch {
        // Fall back to a hard local clear so a failing logout can't trap
        // the user on a dead session.
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch {
          /* ignore */
        }
      }
      toast.warn("You were logged out due to 15 minutes of inactivity.", {
        autoClose: 5000,
      });
      navigateRef.current("/login", {
        replace: true,
        state: { reason: "idle" },
      });
    };

    const startTimer = () => {
      clearTimer();
      timeoutIdRef.current = setTimeout(handleIdle, timeoutMs);
    };

    const recordActivity = () => {
      if (didTimeoutRef.current) return;
      const now = Date.now();
      lastActivityRef.current = now;
      if (now - lastStorageWriteRef.current >= STORAGE_WRITE_THROTTLE_MS) {
        lastStorageWriteRef.current = now;
        writeStoredActivity(now);
      }
      startTimer();
    };

    // Re-check elapsed time (covers throttled background tabs and return visits).
    const checkIdle = () => {
      if (didTimeoutRef.current || !userRef.current) return;
      if (Date.now() - lastActivityRef.current >= timeoutMs) {
        handleIdle();
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") checkIdle();
    };

    const handleStorage = (event) => {
      // Another tab saw activity — stay alive and resync the timer.
      if (event.key === IDLE_ACTIVITY_KEY && event.newValue) {
        const ts = parseInt(event.newValue, 10);
        if (Number.isFinite(ts)) {
          lastActivityRef.current = ts;
          startTimer();
        }
      }
    };

    // Seed from cross-tab activity when it's fresher than this mount.
    const stored = readStoredActivity();
    const now = Date.now();
    if (stored && stored <= now && now - stored < timeoutMs) {
      lastActivityRef.current = stored;
    } else {
      lastActivityRef.current = now;
      lastStorageWriteRef.current = now;
      writeStoredActivity(now);
    }
    startTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, recordActivity, { passive: true });
    }
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);
    intervalIdRef.current = setInterval(checkIdle, CHECK_INTERVAL_MS);

    return () => {
      clearTimer();
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, recordActivity);
      }
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
    // Re-arm when the authenticated user changes. logout/navigate flow
    // through refs so listener churn doesn't reset the countdown.
  }, [user]);
};

export default useIdleLogout;
