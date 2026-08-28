import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Factory,
  Loader2,
  MapPin,
  Package,
  Pencil,
  PackagePlus,
  Tag,
  Target,
  UserPlus,
  Users,
  AlertCircle,
  Clock,
  TrendingUp,
  XCircle,
  X,
  Ruler,
  ShoppingBag,
  Award,
} from "lucide-react";
import ProductionService from "../../../services/ProductionService";
import AssignProductionModal from "../../allocationModals/AssignProductionModal";
import ProductionQAModal from "../../allocationModals/ProductionQAModal";
import AddProductionToInventoryModal from "../../allocationModals/AddProductionToInventoryModal";
import EditProductionOrderModal from "../../modals/formModals/EditProductionOrderModal";
import ProductionMaterialsStep from "../../forms/productionForms/ProductionMaterialsStep";
import Avatar from "../../avatar/Avatar";
import { usePermissions } from "../../../utils/permissions";
import { progressTone } from "../../../constants/workProgressConstants";
import { getMeasurementsForGender, MeasurementPlaceholder } from "../../../utils/measurementConfig";
import {
  PRODUCTION_ORDER_STATUS_FLOW,
  PRODUCTION_CANCELLED_STATUS,
  getProductionOrderStatusStyle,
  getProductionAssignmentStatusStyle,
  getStaffName,
  getProductionProgress,
} from "../../../constants/productionConstants";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toInputDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const ProductionOrderDetail = () => {
  const { productionId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [completionDrafts, setCompletionDrafts] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const { canPerform } = usePermissions();
  const canManage = canPerform("production", "manage_production");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductionService.getOrderById(productionId);
      setOrder(data);
    } catch {
      setError("Failed to load production order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productionId]);

  const status = order?.status || "Pending";
  const isCancelled = status === "Cancelled";
  const isCompleted = status === "Completed";
  const statusFlow = isCancelled
    ? [...PRODUCTION_ORDER_STATUS_FLOW, PRODUCTION_CANCELLED_STATUS]
    : PRODUCTION_ORDER_STATUS_FLOW;

  const currentStatusIndex = useMemo(() => {
    const idx = statusFlow.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const assignments = useMemo(
    () =>
      Array.isArray(order?.assignments)
        ? order.assignments
        : Array.isArray(order?.production_assignments)
        ? order.production_assignments
        : [],
    [order]
  );

  const allAssignedComplete =
    assignments.length > 0 &&
    assignments.every((a) => Number(a.completed_quantity) >= Number(a.assigned_quantity));

  const progress = getProductionProgress(order);
  const totalQuantity = Number(order?.total_quantity) || 0;
  const completedQuantity =
    order?.completed_quantity != null
      ? Number(order.completed_quantity)
      : assignments.reduce((sum, a) => sum + (Number(a.completed_quantity) || 0), 0);

  const timeline = useMemo(
    () => (Array.isArray(order?.timeline) ? order.timeline : []),
    [order]
  );

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    setError(null);
    try {
      await ProductionService.patchOrder(order.id, { status: newStatus });
      await fetchOrder();
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail;
      setError(msg || "Failed to update status. Please try again.");
      return false;
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openQACheck = async () => {
    if (status === "QA Check") {
      setShowQAModal(true);
      return;
    }
    if (status === "In Progress") {
      if (!allAssignedComplete) {
        setError("All assigned staff must complete their quotas before QA Check is enabled.");
        return;
      }
      const moved = await handleUpdateStatus("QA Check");
      if (moved) setShowQAModal(true);
    }
  };

  const logCompletion = async (assignment) => {
    const assignedQty = Number(assignment.assigned_quantity) || 0;
    const doneQty = Number(assignment.completed_quantity) || 0;
    const draft = completionDrafts[assignment.id] || {};
    const quantity = Number(draft.quantity);
    if (Number.isNaN(quantity) || quantity <= 0) {
      setError("Enter a valid number of units completed.");
      return;
    }
    const remaining = assignedQty - doneQty;
    if (quantity > remaining) {
      setError(`Completed units cannot exceed the remaining quota (${remaining} units).`);
      return;
    }
    setUpdatingId(assignment.id);
    setError(null);
    try {
      await ProductionService.logAssignmentCompletion(assignment.id, {
        quantity,
        completed_on: draft.completed_on || toInputDate(),
      });
      setCompletionDrafts((prev) => ({
        ...prev,
        [assignment.id]: { quantity: "", completed_on: toInputDate() },
      }));
      await fetchOrder();
    } catch (err) {
      const msg = err?.response?.data?.error;
      setError(msg || "Failed to log completion. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const markAssignmentComplete = async (assignment) => {
    setUpdatingId(assignment.id);
    setError(null);
    try {
      await ProductionService.completeAssignment(assignment.id);
      setCompletionDrafts((prev) => ({ ...prev, [assignment.id]: undefined }));
      await fetchOrder();
    } catch {
      setError("Failed to complete the assignment. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading production order...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="bg-white rounded-2xl shadow border border-red-200 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-900 font-semibold mb-1">Failed to load production order</p>
        <p className="text-sm text-gray-500 mb-5">{error}</p>
        <button
          onClick={fetchOrder}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && order && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <span className="flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          to="/production/orders-list"
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Production Orders
        </Link>
          <div className="flex items-center gap-3">
            {!isCompleted && !isCancelled && status === "Pending" && canManage && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  <Pencil size={16} />
                  Edit Order
                </button>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <UserPlus size={16} />
                  Assign Staff
                </button>
              </>
            )}
          {!isCompleted && !isCancelled && status === "QA Check" && canManage && (
            <button
              onClick={() => setShowQAModal(true)}
              className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 text-sm font-medium"
            >
              <ClipboardCheck size={16} />
              Run QA Check
            </button>
          )}
          {!isCompleted && !isCancelled && status === "In Progress" && canManage && (
            <button
              onClick={openQACheck}
              disabled={updatingStatus || !allAssignedComplete}
              title={
                !allAssignedComplete
                  ? "All assigned staff must complete their quotas first"
                  : "Move to QA Check and open the review"
              }
              className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClipboardCheck size={16} />
              Move to QA Check
            </button>
          )}
        </div>
      </div>

      {!isCompleted && !isCancelled && status === "In Progress" && assignments.length > 0 && !allAssignedComplete && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
          <ClipboardCheck size={16} className="mt-0.5 shrink-0" />
          <span>QA Check unlocks once every assigned staff has completed their full quota.</span>
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
              <Factory size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{order?.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getProductionOrderStatusStyle(status)}`}
                >
                  {status}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Tag size={12} />
                  {order?.category_name || order?.category || "General"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} />
                  {order?.location_name || order?.location || "No location"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={12} />
                  Created {formatDate(order?.order_created_at)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Target size={12} />
                  Target {formatDate(order?.target_completion_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="md:text-right">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-3xl font-bold text-gray-900">{progress}%</p>
            <div className="w-48 md:ml-auto mt-2 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {completedQuantity} of {totalQuantity} units completed
            </p>
          </div>
        </div>

        {order?.description && (
          <p className="text-sm text-gray-600 mt-4 border-t border-gray-100 pt-4">
            {order.description}
          </p>
        )}
      </div>

      {/* 4-Step Journey: Order → Measurements → Assign → Materials */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Factory className="text-blue-600" size={20} />
          Production Journey — 4 Steps
          <span className="text-xs font-normal text-gray-500 ml-2">(measurements lifted from client flow • assign preserved • materials from Inventory)</span>
        </h2>
        {(() => {
          const hasMeasurements = order?.measurements && Object.keys(order.measurements || {}).length > 0;
          const hasAssignments = Array.isArray(assignments) && assignments.length > 0;
          const mats = Array.isArray(order?.materials) ? order.materials : [];
          const hasMaterials = mats.length > 0;
          const hasDispensed = mats.some((m) => m.status === "dispensed");
          const steps = [
            { key: "order", label: "Order Created", icon: Factory, done: true, desc: order?.title || "Production order created" },
            { key: "measure", label: "Measurements", icon: Ruler, done: !!hasMeasurements, desc: hasMeasurements ? `${order.gender_target || "Unisex"} • ${order.size_category || "No size"} • ${Object.keys(order.measurements).length} measures` : "Measurements not yet taken" },
            { key: "assign", label: "Staff Assigned", icon: Users, done: !!hasAssignments, desc: hasAssignments ? `${assignments.length} staff • ${assignments.reduce((s,a)=>s+Number(a.assigned_quantity||0),0)} units` : "No staff assigned yet" },
            { key: "material", label: "Materials Dispensed", icon: Package, done: !!hasDispensed, desc: hasMaterials ? `${mats.length} items • ${hasDispensed ? "dispensed" : "planned"} • per-unit ₦${Number(order.material_cost_per_unit||0).toLocaleString()}` : "No materials in BOM yet" },
          ];
          return (
            <div className="flex items-center justify-between relative">
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10 hidden sm:block" />
              <div className="absolute top-6 left-6 h-0.5 bg-emerald-500 -z-10 hidden sm:block transition-all duration-700" style={{ width: `calc(${(steps.filter((s)=>s.done).length / steps.length)*100}% - 48px)` }} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                {steps.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.key} className={`flex flex-col items-center text-center p-3 rounded-xl border ${s.done ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${s.done ? "bg-emerald-500 text-white" : "bg-white text-gray-400 border border-gray-200"}`}>
                        {s.done ? <CheckCircle size={20} /> : <Icon size={20} />}
                      </div>
                      <p className={`text-sm font-semibold ${s.done ? "text-emerald-800" : "text-gray-500"}`}>{s.label}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Measurements & Gender / Size Category (Step 2, e-commerce size) */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Ruler className="text-indigo-600" size={20} />
            Measurements & Size
          </h2>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${order?.gender_target === "Male" ? "bg-blue-50 text-blue-700 border-blue-200" : order?.gender_target === "Female" ? "bg-pink-50 text-pink-700 border-pink-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}>
              {order?.gender_target || "Unisex"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Award size={12} /> {order?.size_category || "No size"}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              {order?.measurement_unit || "cm"}
            </span>
          </div>
        </div>

        {(() => {
          const meas = order?.measurements || {};
          const keys = Object.keys(meas);
          if (keys.length === 0) {
            return (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <Ruler className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">No measurements taken yet</p>
                <p className="text-xs text-gray-400 mt-1">Step 2 of the wizard — size guides e-commerce, measurements guide tailors.</p>
              </div>
            );
          }
          const genderForIcons = order?.gender_target === "Male" ? "Male" : order?.gender_target === "Female" ? "Female" : "Female";
          const cfg = getMeasurementsForGender(genderForIcons);
          const map = new Map(cfg.map((c) => [c.key, c]));
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {keys.map((k) => {
                const def = map.get(k);
                return (
                  <div key={k} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-200">
                      {def ? <MeasurementPlaceholder label={def.label} icon={def.icon} /> : <div className="w-full h-full flex items-center justify-center text-indigo-400"><Ruler size={20} /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{def ? def.label : k.replace(/_/g, " ")}</p>
                      <p className="text-lg font-bold text-gray-900">{meas[k]} <span className="text-xs font-normal text-gray-500">{order?.measurement_unit || "cm"}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
        <p className="text-xs text-gray-400 mt-4">Measurements help tailors; size category (<b>XXS → XXXXL, One Size, Custom</b>) powers e-commerce listings.</p>
      </div>

      {/* Materials & Cost per unit vs total */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-emerald-600" size={20} />
              Materials & Cost
            </h2>
            <div className="flex items-center gap-3">
              {!isCompleted && !isCancelled && canManage && (
                <button
                  onClick={() => setShowMaterialsModal(true)}
                  className="flex items-center gap-2 border border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50 text-sm font-medium"
                >
                  <PackagePlus size={16} />
                  Manage / Dispense Materials
                </button>
              )}
            <div className="text-right">
              <p className="text-xs text-gray-500">Per unit</p>
              <p className="text-sm font-bold text-indigo-700">₦{Number(order?.material_cost_per_unit || 0).toLocaleString()}</p>
            </div>
            <div className="text-gray-300">×</div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{order?.total_quantity || 0} units</p>
              <p className="text-sm font-bold text-emerald-700">₦{Number(order?.total_material_cost || 0).toLocaleString()} total</p>
            </div>
          </div>
        </div>

        {(() => {
          const mats = Array.isArray(order?.materials) ? order.materials : [];
          if (mats.length === 0) {
            return (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">No materials in BOM yet</p>
                <p className="text-xs text-gray-400 mt-1">Step 4 — dispensing deducts stock per-unit × quantity (inventory flow).</p>
              </div>
            );
          }
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Material</th>
                    <th className="py-2 pr-3 font-medium">Qty / unit</th>
                    <th className="py-2 pr-3 font-medium">Unit cost</th>
                    <th className="py-2 pr-3 font-medium">Per unit</th>
                    <th className="py-2 pr-3 font-medium">Total ({order?.total_quantity || 0}×)</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mats.map((m) => {
                    const perUnit = Number(m.line_cost || 0);
                    const total = perUnit * (Number(order?.total_quantity) || 0);
                    return (
                      <tr key={m.id}>
                        <td className="py-2.5 pr-3 font-medium text-gray-900">{m.material_name}<span className="block text-xs text-gray-400">{m.category_name}</span></td>
                        <td className="py-2.5 pr-3">{m.quantity} {m.unit_of_measurement}</td>
                        <td className="py-2.5 pr-3">₦{Number(m.unit_cost).toLocaleString()}</td>
                        <td className="py-2.5 pr-3 font-semibold text-indigo-700">₦{perUnit.toLocaleString()}</td>
                        <td className="py-2.5 pr-3 font-semibold text-emerald-700">₦{total.toLocaleString()}</td>
                        <td className="py-2.5 pr-3"><span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "dispensed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{m.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t border-gray-200 bg-gray-50/50">
                  <tr>
                    <td colSpan="3" className="py-3 pr-3 text-right text-xs font-semibold text-gray-500 uppercase">Totals</td>
                    <td className="py-3 pr-3 font-bold text-indigo-700">₦{Number(order?.material_cost_per_unit || 0).toLocaleString()} /unit</td>
                    <td className="py-3 pr-3 font-bold text-emerald-700">₦{Number(order?.total_material_cost || 0).toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })()}
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={24} />
          Production Status Timeline
        </h2>

        <div className="flex items-center justify-between relative mb-12">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10 rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCancelled
                  ? "bg-gradient-to-r from-gray-300 to-gray-400"
                  : "bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
              }`}
              style={{
                width: `${(currentStatusIndex / (statusFlow.length - 1)) * 100}%`,
              }}
            />
          </div>

          {statusFlow.map((s, index) => {
            const IconComponent = s.icon;
            const isCompletedStep = index <= currentStatusIndex;
            const isCurrent = s.key === status;
            const canOpenQA =
              s.key === "QA Check" &&
              !isCompleted &&
              !isCancelled &&
              (status === "QA Check" || (status === "In Progress" && allAssignedComplete));
            const circle = (
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-full border-4 transition-all duration-300 ${
                  isCancelled && s.key !== "Cancelled"
                    ? "border-gray-200 bg-gray-100 text-gray-400 opacity-40"
                    : isCurrent
                    ? `border-blue-600 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl scale-110 ring-4 ring-blue-100`
                    : isCompletedStep
                    ? "border-green-500 bg-green-500 text-white shadow-lg"
                    : "border-gray-300 bg-white text-gray-400"
                } ${canOpenQA ? "cursor-pointer hover:scale-105" : ""}`}
              >
                {isCompletedStep ? (
                  <CheckCircle className="w-7 h-7" />
                ) : (
                  <IconComponent className="w-7 h-7" />
                )}
              </div>
            );
            return (
              <div key={s.key} className="flex flex-col items-center relative z-10">
                {canOpenQA ? (
                  <button
                    type="button"
                    onClick={openQACheck}
                    title={
                      status === "In Progress"
                        ? "Move to QA Check and open the review"
                        : "Run the QA check"
                    }
                    aria-label={`Open QA check for ${s.label}`}
                  >
                    {circle}
                  </button>
                ) : (
                  circle
                )}
                <span
                  className={`text-sm font-semibold mt-3 text-center transition-all ${
                    isCancelled && s.key !== "Cancelled"
                      ? "text-gray-400"
                      : isCurrent
                      ? "text-blue-600"
                      : isCompletedStep
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {s.label}
                </span>
                {isCurrent && (
                  <div className="absolute -bottom-10">
                    <div className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg font-medium">
                      Current Status
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className={`mt-4 p-5 rounded-xl border-2 ${
            isCancelled
              ? "bg-red-50 border-red-200"
              : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-10 h-10 ${
                isCancelled ? "bg-red-600" : "bg-blue-600"
              } rounded-full flex items-center justify-center mt-0.5 shadow-lg`}
            >
              {isCancelled ? (
                <XCircle className="w-5 h-5 text-white" />
              ) : (
                <CheckCircle className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3
                className={`font-bold text-lg ${
                  isCancelled ? "text-red-900" : "text-blue-900"
                }`}
              >
                Current Status: {status}
              </h3>
              <p className={`${isCancelled ? "text-red-700" : "text-blue-700"} text-sm mt-1`}>
                {status === "Pending" &&
                  "Production order has been created and is awaiting assignment to staff."}
                {status === "In Progress" &&
                  "Production is actively being worked on by the assigned staff."}
                {status === "QA Check" &&
                  "Production output is complete and awaiting quality assurance sign-off."}
                {status === "Completed" &&
                  "QA passed and the finished goods have been added to inventory."}
                {isCancelled &&
                  "This production order was cancelled and will not be processed further."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              Assigned Staff
            </h2>
            {!isCompleted && !isCancelled && canManage && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <UserPlus size={16} />
                Assign more
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3" />
              <p className="font-medium text-gray-500">No staff assigned yet</p>
              <p className="text-sm">Assign this production order to staff members.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const assignedQty = Number(assignment.assigned_quantity) || 0;
                const doneQty = Number(assignment.completed_quantity) || 0;
                const completions = Array.isArray(assignment.completions) ? assignment.completions : [];
                const remaining = assignedQty - doneQty;
                const draft = completionDrafts[assignment.id] || {
                  quantity: "",
                  completed_on: toInputDate(),
                };
                const completionDays = new Set(completions.map((c) => c.completed_on)).size;
                const loggedUnits = completions.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);
                const avgPerDay = completionDays > 0 ? loggedUnits / completionDays : null;
                const avgPerDayText =
                  avgPerDay === null
                    ? "—"
                    : Number.isInteger(avgPerDay)
                    ? avgPerDay
                    : avgPerDay.toFixed(1);
                const staffProgress =
                  assignedQty > 0
                    ? Math.min(Math.round((doneQty / assignedQty) * 100), 100)
                    : 0;
                return (
                  <div
                    key={assignment.id}
                    className="bg-gray-50 border border-gray-100 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={assignment.staff_object?.avatar_url}
                        alt={getStaffName(assignment)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {getStaffName(assignment)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          {assignment.role && <span>{assignment.role}</span>}
                          {assignment.department && <span>• {assignment.department}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getProductionAssignmentStatusStyle(assignment.status)}`}
                        >
                          {assignment.status || "Not Started"}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {doneQty} / {assignedQty} done
                        </div>
                        <div
                          className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"
                          title="Average units completed per day of logged activity, on this production order"
                        >
                          <TrendingUp size={12} className="text-blue-500" />
                          Avg {avgPerDayText}/day
                        </div>
                      </div>
                      <div className="w-24 shrink-0">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${staffProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Work-progress parameters self-reported by this staff member */}
                    {Array.isArray(assignment.work_progress) &&
                      assignment.work_progress.some((p) => p.progress !== null) && (
                        <div className="mt-2.5 pt-2.5 border-t border-dashed border-gray-200 space-y-1">
                          {assignment.work_progress
                            .filter((p) => p.progress !== null)
                            .map((param) => {
                              const paramTone = progressTone(param.progress || 0);
                              return (
                                <div key={param.key} className="flex items-center gap-2">
                                  <span className="w-24 text-[11px] font-medium text-gray-600 shrink-0">
                                    {param.label}
                                  </span>
                                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${paramTone.bar}`}
                                      style={{ width: `${param.progress || 0}%` }}
                                    />
                                  </div>
                                  <span className="w-8 text-right text-[10px] font-semibold tabular-nums text-gray-500">
                                    {param.progress}%
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      )}

                    {canManage &&
                      !isCompleted &&
                      !isCancelled &&
                      assignment.status !== "Completed" && (
                        <div className="mt-2.5 pt-2.5 border-t border-dashed border-gray-200">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500">Log completion:</span>
                            <input
                              type="number"
                              min="1"
                              max={remaining}
                              placeholder="Units"
                              value={draft.quantity}
                              onChange={(e) =>
                                setCompletionDrafts((prev) => ({
                                  ...prev,
                                  [assignment.id]: { ...draft, quantity: e.target.value },
                                }))
                              }
                              disabled={updatingId === assignment.id}
                              className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm text-right disabled:opacity-50"
                            />
                            <input
                              type="date"
                              value={draft.completed_on}
                              onChange={(e) =>
                                setCompletionDrafts((prev) => ({
                                  ...prev,
                                  [assignment.id]: { ...draft, completed_on: e.target.value },
                                }))
                              }
                              disabled={updatingId === assignment.id}
                              className="border border-gray-300 rounded-md px-2 py-1 text-sm disabled:opacity-50"
                            />
                            <button
                              type="button"
                              onClick={() => logCompletion(assignment)}
                              disabled={updatingId === assignment.id || remaining <= 0}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-medium border border-blue-600 text-blue-700 rounded-md hover:bg-blue-50 disabled:opacity-50"
                            >
                              {updatingId === assignment.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                "Log Completion"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => markAssignmentComplete(assignment)}
                              disabled={updatingId === assignment.id || remaining <= 0}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {updatingId === assignment.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                "Mark Complete"
                              )}
                            </button>
                            <span className="text-xs text-gray-400">
                              {doneQty} of {assignedQty} done
                            </span>
                          </div>
                        </div>
                      )}

                    {completions.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-gray-400 uppercase tracking-wide">
                          Completion log:
                        </span>
                        {completions.map((entry) => (
                          <span
                            key={entry.id}
                            className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 text-[11px] text-gray-600"
                            title={`${entry.quantity} unit(s) completed on ${formatDate(entry.completed_on)}`}
                          >
                            <CheckCircle size={11} className="text-emerald-600" />
                            +{entry.quantity} on {formatDate(entry.completed_on)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline events */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            Activity Timeline
          </h2>

          {timeline.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3" />
              <p className="font-medium text-gray-500">No activity recorded</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id || index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-900">
                      {event.event_type || "Update"}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-600">{event.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(event.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completion action */}
      {status === "QA Check" && canManage && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
              <PackagePlus className="w-6 h-6 text-emerald-600" />
              Production Complete — Add to Inventory
            </h3>
            <p className="text-sm text-emerald-700 mt-1">
              Complete the QA check, then finalize this order and stock the {totalQuantity}{" "}
              finished units into inventory.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => setShowQAModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-cyan-600 text-cyan-700 rounded-lg hover:bg-cyan-50 text-sm font-medium"
            >
              <ClipboardCheck size={16} />
              QA Check
            </button>
            <button
              onClick={() => setShowInventoryModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
            >
              <PackagePlus size={16} />
              Complete & Add to Inventory
            </button>
          </div>
        </div>
      )}

      <AssignProductionModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        order={order}
        onSuccess={fetchOrder}
      />
      <ProductionQAModal
        isOpen={showQAModal}
        onClose={() => setShowQAModal(false)}
        order={order}
        onSuccess={fetchOrder}
      />
      <AddProductionToInventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        order={order}
        onSuccess={fetchOrder}
      />
      <EditProductionOrderModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        order={order}
        onSuccess={fetchOrder}
      />

      {showMaterialsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <PackagePlus size={20} className="text-emerald-600" />
                Manage & Dispense Materials
              </h2>
              <button
                onClick={() => {
                  setShowMaterialsModal(false);
                  fetchOrder();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ProductionMaterialsStep
                orderId={String(order.id)}
                totalQuantity={Number(order.total_quantity) || 0}
                onBack={() => {
                  setShowMaterialsModal(false);
                  fetchOrder();
                }}
                onNext={() => {
                  setShowMaterialsModal(false);
                  fetchOrder();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionOrderDetail;
