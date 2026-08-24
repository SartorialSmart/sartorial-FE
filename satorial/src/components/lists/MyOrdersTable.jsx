import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ClipboardList, Factory, Loader2, RefreshCw } from "lucide-react";
import OrderService from "../../services/OrderService";
import ProductionService from "../../services/ProductionService";
import WorkProgressModal from "../modals/WorkProgressModal";
import { computeOverallPercent, progressTone } from "../../constants/workProgressConstants";

const STATUS_STYLES = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Assigned: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-orange-50 text-orange-700 border-orange-200",
  Processing: "bg-cyan-50 text-cyan-700 border-cyan-200",
  "On Delivery": "bg-purple-50 text-purple-700 border-purple-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  "Not Started": "bg-gray-100 text-gray-600 border-gray-200",
  "QA Check": "bg-cyan-50 text-cyan-700 border-cyan-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border-gray-200"
    }`}
  >
    {status}
  </span>
);
StatusBadge.propTypes = { status: PropTypes.string };

const ProgressBar = ({ value }) => {
  const tone = progressTone(value || 0);
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${value || 0}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums w-9 text-right ${tone.text}`}>
        {value === null || value === undefined ? "—" : `${value}%`}
      </span>
    </div>
  );
};
ProgressBar.propTypes = { value: PropTypes.number };

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const MyOrdersTable = ({ searchTerm }) => {
  const [tab, setTab] = useState("orders");
  const [myOrders, setMyOrders] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [progressTarget, setProgressTarget] = useState(null);

  const fetchData = useCallback(async (showSpinner) => {
    if (showSpinner) setRefreshing(true);
    setError("");
    try {
      const [ordersRes, assignmentsRes] = await Promise.allSettled([
        OrderService.getMyOrders(),
        ProductionService.getMyAssignments(),
      ]);
      if (ordersRes.status === "fulfilled") {
        setMyOrders(Array.isArray(ordersRes.value) ? ordersRes.value : ordersRes.value?.results || []);
      } else {
        setMyOrders([]);
      }
      if (assignmentsRes.status === "fulfilled") {
        setAssignments(
          Array.isArray(assignmentsRes.value) ? assignmentsRes.value : assignmentsRes.value?.results || []
        );
      } else {
        setAssignments([]);
      }
      if (ordersRes.status === "rejected" && assignmentsRes.status === "rejected") {
        setError("Could not load your assigned work. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const filteredOrders = useMemo(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    if (!term) return myOrders;
    return myOrders.filter(
      (row) =>
        (row.order_title || "").toLowerCase().includes(term) ||
        (row.client_full_name || "").toLowerCase().includes(term) ||
        (row.order_category_name || "").toLowerCase().includes(term)
    );
  }, [myOrders, searchTerm]);

  const filteredAssignments = useMemo(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    if (!term) return assignments;
    return assignments.filter((row) => {
      const title = row.production_order_title || "";
      return String(title).toLowerCase().includes(term);
    });
  }, [assignments, searchTerm]);

  const stats = useMemo(() => {
    const activeOrders = myOrders.filter((o) => !["Completed", "Cancelled", "On Delivery"].includes(o.order_status));
    const doneParams = myOrders.filter((o) => o.overall_percent === 100).length;
    return {
      total: myOrders.length,
      active: activeOrders.length,
      readyForQA: doneParams,
      production: assignments.filter((a) => a.status !== "Completed").length,
    };
  }, [myOrders, assignments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading your assigned work...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Assigned Orders", value: stats.total, tone: "text-indigo-600" },
          { label: "Active", value: stats.active, tone: "text-orange-600" },
          { label: "Ready for QA", value: stats.readyForQA, tone: "text-emerald-600" },
          { label: "Production Jobs", value: stats.production, tone: "text-cyan-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm self-start">
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === "orders" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Client Orders
          </button>
          <button
            type="button"
            onClick={() => setTab("production")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === "production" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Production
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchData(true)}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
          <button onClick={() => fetchData(true)} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Client orders */}
      {tab === "orders" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No orders assigned to you yet.</p>
              <p className="text-gray-400 text-sm mt-1">When your organization assigns you an order, it appears here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Order", "Client", "Status", "Due Date", "Work Progress", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((row) => (
                    <tr key={row.allocation_id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{row.order_title}</p>
                        <p className="text-xs text-gray-500">{row.order_category_name || "Uncategorized"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{row.client_full_name || "—"}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={row.order_status} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{formatDate(row.end_date)}</td>
                      <td className="px-5 py-4">
                        <ProgressBar value={row.overall_percent} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setProgressTarget({
                              mode: "order",
                              id: row.allocation_id,
                              title: row.order_title,
                              subtitle: row.client_full_name || undefined,
                            })
                          }
                          className="px-3.5 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
                        >
                          Update Progress
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Production assignments */}
      {tab === "production" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredAssignments.length === 0 ? (
            <div className="py-16 text-center">
              <Factory className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No production assignments yet.</p>
              <p className="text-gray-400 text-sm mt-1">Production runs assigned to you will show up here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Production Order", "Units", "Assignment Status", "Work Progress", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAssignments.map((row) => {
                    const overall =
                      row.overall_percent ??
                      computeOverallPercent(row.work_progress || []);
                    return (
                      <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {row.production_order_title || "Production order"}
                          </p>
                          <p className="text-xs text-gray-500">{row.department || row.role || "General"}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700 tabular-nums">
                          {row.completed_quantity ?? 0} / {row.assigned_quantity ?? 0}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-5 py-4">
                          <ProgressBar value={overall} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setProgressTarget({
                                mode: "production",
                                id: row.id,
                                title: row.production_order_title || "Production order",
                                subtitle: `${row.completed_quantity ?? 0} of ${row.assigned_quantity ?? 0} units done`,
                              })
                            }
                            className="px-3.5 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors whitespace-nowrap"
                          >
                            Update Progress
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Work progress editor */}
      {progressTarget && (
        <WorkProgressModal
          isOpen
          mode={progressTarget.mode}
          allocationId={progressTarget.mode === "order" ? progressTarget.id : undefined}
          assignmentId={progressTarget.mode === "production" ? progressTarget.id : undefined}
          title={progressTarget.title}
          subtitle={progressTarget.subtitle}
          onClose={() => setProgressTarget(null)}
          onSuccess={() => fetchData(true)}
        />
      )}
    </div>
  );
};

MyOrdersTable.propTypes = {
  searchTerm: PropTypes.string,
};

export default MyOrdersTable;
