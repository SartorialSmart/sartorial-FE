import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import { usePlanNotice } from "../../hooks/usePlanNotice";

const CRITICAL = ["lapsed", "reached", "trial_ending"];

/**
 * Proactively surfaces plan-limit status instead of waiting for an action to be
 * blocked: a once-per-session modal on login for critical states, plus a
 * persistent, dismissible bottom bar. Both carry an Upgrade CTA for owners.
 * Mount once, near the app root (inside the router + subscription/auth context).
 */
export default function PlanNoticeGate() {
  const notice = usePlanNotice();
  const navigate = useNavigate();
  const [barDismissed, setBarDismissed] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!notice.show) {
      setModalOpen(false);
      setBarDismissed(true);
      return;
    }
    setBarDismissed(!!localStorage.getItem(`planNoticeBar:${notice.signature}`));
    const isCritical = CRITICAL.includes(notice.level);
    if (isCritical && !sessionStorage.getItem(`planNoticeModal:${notice.signature}`)) {
      setModalOpen(true);
    }
  }, [notice.show, notice.signature, notice.level]);

  if (!notice.show) return null;

  const critical = notice.severity === "critical";
  const goUpgrade = () => {
    sessionStorage.setItem(`planNoticeModal:${notice.signature}`, "1");
    setModalOpen(false);
    navigate("/subscriptions/pricing/plan");
  };
  const closeModal = () => {
    sessionStorage.setItem(`planNoticeModal:${notice.signature}`, "1");
    setModalOpen(false);
  };
  const dismissBar = () => {
    localStorage.setItem(`planNoticeBar:${notice.signature}`, "1");
    setBarDismissed(true);
  };

  // warning states stay calmer (blue) than blocked/critical states (amber)
  const barTone = critical
    ? "bg-amber-50 border-amber-200 text-amber-900"
    : "bg-blue-50 border-blue-200 text-blue-900";

  return (
    <>
      {/* Login / session modal for critical states */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${critical ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">{notice.title}</h2>
                <p className="mt-1 text-sm text-gray-600">{notice.message}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Later
              </button>
              {notice.isOwner ? (
                <button
                  onClick={goUpgrade}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Sparkles size={15} /> Upgrade plan
                </button>
              ) : (
                <span className="text-xs text-gray-500">Ask your organization admin to upgrade.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent, dismissible bottom bar */}
      {!barDismissed && (
        <div className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4">
          <div className={`mx-auto flex max-w-4xl items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${barTone}`}>
            <AlertTriangle size={18} className="shrink-0" />
            <p className="flex-1 text-sm">
              <span className="font-semibold">{notice.title}.</span> {notice.message}
            </p>
            {notice.isOwner && (
              <button
                onClick={goUpgrade}
                className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white ${
                  critical ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Sparkles size={14} /> Upgrade
              </button>
            )}
            <button onClick={dismissBar} aria-label="Dismiss" className="shrink-0 rounded p-1 hover:bg-black/5">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
