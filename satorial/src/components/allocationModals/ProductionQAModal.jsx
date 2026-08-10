import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, ClipboardCheck, CheckCircle, Loader2 } from "lucide-react";
import ProductionService from "../../services/ProductionService";
import { PRODUCTION_QA_ITEMS } from "../../constants/productionConstants";

const ProductionQAModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [checks, setChecks] = useState(() =>
    PRODUCTION_QA_ITEMS.map((item) => ({ ...item, passed: false }))
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !order?.id) return;
    setError("");
    setNotes("");
    setChecks(PRODUCTION_QA_ITEMS.map((item) => ({ ...item, passed: false })));

    const loadQA = async () => {
      setFetching(true);
      try {
        const data = await ProductionService.getQA(order.id);
        const saved = data?.qa_data || data?.qa_checks || data || {};
        if (Array.isArray(saved)) {
          setChecks(
            PRODUCTION_QA_ITEMS.map((item) => {
              const found = saved.find(
                (s) => String(s.id) === String(item.id) || s.id === item.id
              );
              return { ...item, passed: found ? Boolean(found.passed) : false };
            })
          );
        } else if (saved.checks) {
          setChecks(
            PRODUCTION_QA_ITEMS.map((item) => ({
              ...item,
              passed: Boolean(saved.checks[item.id]),
            }))
          );
        }
        if (saved.notes) setNotes(saved.notes);
      } catch {
        // QA has never been saved; start fresh.
      } finally {
        setFetching(false);
      }
    };

    loadQA();
  }, [isOpen, order?.id]);

  const toggleCheck = (id) => {
    setChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, passed: !c.passed } : c))
    );
  };

  const allChecked = checks.every((c) => c.passed);
  const checkedCount = checks.filter((c) => c.passed).length;

  const handleSave = async (markComplete = false) => {
    if (!markComplete && !allChecked) {
      setError("All QA items must be passed before completing the QA step.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const qaPayload = {
        qa_data: {
          checks: checks.reduce((acc, c) => ({ ...acc, [c.id]: c.passed }), {}),
          passed: allChecked,
          notes,
        },
      };
      await ProductionService.saveQA(order.id, qaPayload);
      if (markComplete) {
        await ProductionService.completeQA(order.id, { notes });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("QA save error:", err);
      const msg = err?.response?.data?.error || err?.response?.data?.detail;
      setError(msg || "Failed to save QA checklist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ClipboardCheck size={20} className="text-cyan-600" />
                QA Check
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{order?.title || "Production order"}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {fetching ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading QA checklist...
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between text-sm text-gray-600 bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2.5">
                <span>
                  {checkedCount} of {checks.length} items passed
                </span>
                <span className="font-semibold text-cyan-700">
                  {Math.round((checkedCount / checks.length) * 100)}%
                </span>
              </div>

              <div className="space-y-2.5">
                {checks.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      item.passed
                        ? "bg-emerald-50 border-emerald-300"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.passed}
                      onChange={() => toggleCheck(item.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                    <span
                      className={`text-sm ${
                        item.passed ? "text-emerald-900 font-medium" : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.passed && (
                      <CheckCircle size={16} className="ml-auto shrink-0 text-emerald-500" />
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  QA Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about quality issues or approvals..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex-shrink-0 flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={loading || fetching}
            className="flex-1 px-4 py-2.5 border border-cyan-600 text-cyan-700 rounded-lg hover:bg-cyan-50 disabled:opacity-50 font-medium"
          >
            {loading ? "Saving..." : "Save Progress"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading || fetching || !allChecked}
            title={!allChecked ? "All QA items must be passed to complete" : undefined}
            className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            Complete QA
          </button>
        </div>
      </div>
    </div>
  );
};

ProductionQAModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
  }),
  onSuccess: PropTypes.func,
};

export default ProductionQAModal;
