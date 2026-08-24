import { useState } from "react";
import PropTypes from "prop-types";
import { Factory, Ruler, Users, Package, CheckCircle } from "lucide-react";
import AddProductionOrderForm from "./AddProductionOrderForm";
import ProductionMeasurementsForm from "./ProductionMeasurementsForm";
import ProductionMaterialsStep from "./ProductionMaterialsStep";
import AssignProductionModal from "../../allocationModals/AssignProductionModal";
import ProductionService from "../../../services/ProductionService";
import { extractErrorMessage } from "../../../../utils/errorUtils";

const STEPS = [
  { id: 1, label: "Order", icon: Factory },
  { id: 2, label: "Measurements & Size", icon: Ruler },
  { id: 3, label: "Assign Staff", icon: Users },
  { id: 4, label: "Materials", icon: Package },
];

const AddProductionOrderWizard = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [orderRefreshKey, setOrderRefreshKey] = useState(0);

  const handleCreated = async (created) => {
    // AddProductionOrderForm calls onClose without payload; we need order id.
    // It creates via ProductionService.createOrder internally, but doesn't return.
    // Instead, we fetch latest orders to get the created one.
    // Better: we patch AddProductionOrderForm to call onCreated with order.
    // Fallback: fetch list and take most recent.
    try {
      const list = await ProductionService.listOrders();
      const arr = Array.isArray(list) ? list : list.results || [];
      // Assume most recent is the one we just created (sorted by created_at desc)
      const newest = arr[0];
      if (newest) {
        setOrder(newest);
        setStep(2);
      } else {
        setError("Order created but not found — please refresh the list.");
      }
    } catch (e) {
      setError(extractErrorMessage(e, "Order created but failed to load."));
    }
  };

  // Adapter for new form that provides order directly
  const handleCreatedDirect = (newOrder) => {
    setOrder(newOrder);
    setStep(2);
  };

  const handleMeasurementsNext = async ({ gender_target, size_category, measurement_unit, measurements }) => {
    if (!order?.id) return;
    setLoading(true);
    setError("");
    try {
      const updated = await ProductionService.updateMeasurements(order.id, {
        gender_target,
        size_category,
        measurement_unit,
        measurements,
      });
      setOrder(updated);
      setStep(3);
    } catch (e) {
      setError(extractErrorMessage(e, "Failed to save measurements."));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSuccess = async () => {
    setAssignOpen(false);
    // Refresh order to get new status/assignments and advance
    try {
      const refreshed = await ProductionService.getOrderById(order.id);
      setOrder(refreshed);
      setStep(4);
    } catch {
      setStep(4);
    }
  };

  const handleMaterialsNext = () => {
    // Final step — wizard complete, close and let parent refresh
    if (onClose) onClose();
  };

  const isStepDone = (id) => {
    if (id === 1) return !!order;
    if (id === 2) return !!order?.measurements && Object.keys(order.measurements || {}).length > 0;
    if (id === 3) return order?.status !== "Pending";
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const active = step === s.id;
          const done = isStepDone(s.id) || step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${active ? "bg-blue-600 border-blue-600 text-white" : done ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                {done && !active ? <CheckCircle size={16} /> : <Icon size={14} />}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${active ? "text-blue-700" : done ? "text-emerald-700" : "text-gray-500"}`}>{idx + 1}. {s.label}</span>
              {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? "bg-emerald-500" : "bg-gray-200"}`} />}
            </div>
          );
        })}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex justify-between"><span>{error}</span><button onClick={() => setError("")} className="font-semibold">Dismiss</button></div>}

      {step === 1 && (
        <AddProductionOrderForm onClose={onClose} onCreated={handleCreatedDirect} onCreatedFallback={handleCreated} />
      )}

      {step === 2 && order && (
        <ProductionMeasurementsForm
          initialGender={order.gender_target || "Unisex"}
          initialSize={order.size_category || ""}
          initialUnit={order.measurement_unit || "cm"}
          initialMeasurements={order.measurements || {}}
          onBack={() => setStep(1)}
          onNext={handleMeasurementsNext}
          loading={loading}
        />
      )}

      {step === 3 && order && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Users size={20} className="text-blue-600" /> Assign Staff (Step 3)</h3>
            <p className="text-sm text-gray-500 mt-1">Existing production assign flow — perfect, preserved. Assign quantities to staff; order moves to In Progress.</p>
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              <p className="font-medium text-gray-900">{order.title} • {order.total_quantity} units • {order.gender_target} / {order.size_category || "No size"}</p>
              <p className="text-gray-500 mt-1">Status: {order.status} • Assigned: {(order.assignments || []).length} staff</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setStep(2)} className="border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Back</button>
              <button onClick={() => setAssignOpen(true)} className="flex-1 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Users size={16} /> Assign Staff
              </button>
              <button onClick={() => setStep(4)} className="border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Skip → Materials</button>
            </div>
          </div>
          <AssignProductionModal isOpen={assignOpen} onClose={() => setAssignOpen(false)} order={order} onSuccess={handleAssignSuccess} />
        </div>
      )}

      {step === 4 && order && (
        <ProductionMaterialsStep
          orderId={String(order.id)}
          totalQuantity={Number(order.total_quantity) || 0}
          onBack={() => setStep(3)}
          onNext={handleMaterialsNext}
        />
      )}

      {step === 4 && (
        <div className="text-center">
          <button onClick={handleMaterialsNext} className="text-sm text-gray-500 hover:text-gray-700 underline">Finish & Close</button>
        </div>
      )}
    </div>
  );
};

AddProductionOrderWizard.propTypes = {
  onClose: PropTypes.func,
};

export default AddProductionOrderWizard;
