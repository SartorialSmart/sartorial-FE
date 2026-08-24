import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { X, Loader2, Save, CheckCircle, Gauge } from "lucide-react";
import OrderService from "../../services/OrderService";
import ProductionService from "../../services/ProductionService";
import { WORK_PARAMETERS, computeOverallPercent, progressTone } from "../../constants/workProgressConstants";

/**
 * Per-parameter work-progress editor for one assignment.
 *
 * mode "order"      -> allocationId  (client order allocation)
 * mode "production" -> assignmentId  (production order assignment)
 *
 * Each parameter takes a 1-100 indicator (1 = just started, 100 = completed).
 * Only parameters the staff member actually moved are sent on save.
 */
const WorkProgressModal = ({
  isOpen,
  onClose,
  mode = "order",
  allocationId,
  assignmentId,
  title,
  subtitle,
  onSuccess,
}) => {
  const [values, setValues] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setSavedAt(null);
    setTouched({});

    // Prefill from the list row while the fresh copy loads.
    const prefill = {};
    WORK_PARAMETERS.forEach((p) => {
      prefill[p.key] = null;
    });
    setValues(prefill);
    setLoading(true);

    const fetchProgress =
      mode === "production" ? ProductionService.getAssignmentProgress(assignmentId) : OrderService.getAllocationProgress(allocationId);

    fetchProgress
      .then((data) => {
        const next = {};
        WORK_PARAMETERS.forEach((p) => {
          const found = (data?.parameters || []).find((row) => row.key === p.key);
          next[p.key] = found?.progress ?? null;
        });
        setValues(next);
      })
      .catch(() => {
        // No progress recorded yet — start with a clean slate.
      })
      .finally(() => setLoading(false));
  }, [isOpen, mode, allocationId, assignmentId]);

  const overall = useMemo(
    () => computeOverallPercent(WORK_PARAMETERS.map((p) => ({ progress: values[p.key] }))),
    [values]
  );

  const handleChange = (key, raw) => {
    const value = Math.max(1, Math.min(100, Number(raw)));
    setValues((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleSave = async () => {
    const progressMap = Object.fromEntries(
      Object.entries(touched)
        .filter(([, isTouched]) => isTouched)
        .map(([key]) => [key, values[key]])
    );
    if (!Object.keys(progressMap).length) {
      onClose();
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated =
        mode === "production"
          ? await ProductionService.updateAssignmentProgress(assignmentId, progressMap)
          : await OrderService.updateAllocationProgress(allocationId, progressMap);
      const next = {};
      WORK_PARAMETERS.forEach((p) => {
        const found = (updated?.parameters || []).find((row) => row.key === p.key);
        next[p.key] = found?.progress ?? values[p.key];
      });
      setValues(next);
      setTouched({});
      setSavedAt(new Date());
      if (onSuccess) onSuccess(updated);
    } catch (err) {
      console.error("Work progress save error:", err);
      const msg =
        err?.response?.data?.progress ||
        err?.response?.data?.detail ||
        "Failed to save work progress. Please try again.";
      setError(typeof msg === "string" ? msg : "Failed to save work progress. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Gauge className="w-6 h-6 text-indigo-600" />
                {title || "Work Progress"}
              </h3>
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
              <X size={20} />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${progressTone(overall || 0).bar}`}
                style={{ width: `${overall || 0}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${progressTone(overall || 0).text}`}>
              {overall === null ? "Not started" : `${overall}%`}
            </span>
          </div>
        </div>

        {/* Parameters */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading progress...
            </div>
          ) : (
            WORK_PARAMETERS.map((param) => {
              const value = values[param.key];
              const tone = progressTone(value || 0);
              return (
                <div key={param.key} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{param.label}</p>
                      <p className="text-xs text-gray-500">{param.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      {value >= 100 && <CheckCircle size={16} className="text-emerald-500" />}
                      <span className={`text-sm font-bold tabular-nums ${tone.text}`}>
                        {value === null || value === undefined ? "—" : `${value}%`}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={value ?? 1}
                    onChange={(e) => handleChange(param.key, e.target.value)}
                    className={`w-full accent-indigo-600 cursor-pointer ${value === null || value === undefined ? "opacity-40" : ""}`}
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>1 · started</span>
                    <span>100 · completed</span>
                  </div>
                </div>
              );
            })
          )}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0 flex items-center gap-3">
          {savedAt && (
            <span className="text-sm text-emerald-600 flex items-center gap-1.5 mr-auto">
              <CheckCircle size={16} />
              Progress saved
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Progress"}
          </button>
        </div>
      </div>
    </div>
  );
};

WorkProgressModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["order", "production"]),
  allocationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onSuccess: PropTypes.func,
};

export default WorkProgressModal;
