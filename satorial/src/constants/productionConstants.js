import {
  Clock,
  Package,
  ClipboardCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";

/**
 * Production module constants shared across the module's UI.
 * Mirrors the backend contract (see ProductionService).
 */

export const PRODUCTION_ORDER_STATUS_FLOW = [
  {
    key: "Pending",
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    description: "Production order has been created and is awaiting assignment.",
  },
  {
    key: "In Progress",
    label: "In Progress",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Production is actively being worked on by assigned staff.",
  },
  {
    key: "QA Check",
    label: "QA Check",
    icon: ClipboardCheck,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    description: "Production is complete and awaiting quality assurance sign-off.",
  },
  {
    key: "Completed",
    label: "Completed",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "QA passed and finished goods have been added to inventory.",
  },
];

export const PRODUCTION_CANCELLED_STATUS = {
  key: "Cancelled",
  label: "Cancelled",
  icon: XCircle,
  color: "text-red-600",
  bgColor: "bg-red-50",
  borderColor: "border-red-200",
  description: "This production order was cancelled and will not be processed further.",
};

export const PRODUCTION_ASSIGNMENT_STATUS_FLOW = [
  { key: "Not Started", label: "Not Started", icon: Clock },
  { key: "In Progress", label: "In Progress", icon: Package },
  { key: "QA Check", label: "QA Check", icon: ClipboardCheck },
  { key: "Completed", label: "Completed", icon: CheckCircle },
];

export const PRODUCTION_ORDER_STATUSES = [
  "Pending",
  "In Progress",
  "QA Check",
  "Completed",
  "Cancelled",
];

export const PRODUCTION_ASSIGNMENT_STATUSES = [
  "Not Started",
  "In Progress",
  "QA Check",
  "Completed",
];

export const PRODUCTION_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const SIZE_CATEGORIES = [
  { value: "XXXS", label: "XXXS" },
  { value: "XXS", label: "XXS" },
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
  { value: "XXXL", label: "XXXL (3XL)" },
  { value: "XXXXL", label: "XXXXL (4XL)" },
  { value: "One Size", label: "One Size" },
  { value: "Custom", label: "Custom" },
];

export const GENDER_TARGETS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Unisex", label: "Unisex" },
];

export const PRODUCTION_PRIORITY_STYLES = {
  low: "bg-gray-50 text-gray-700 border-gray-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  urgent: "bg-red-50 text-red-700 border-red-200",
};

export const getProductionOrderStatusStyle = (status) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-800 border-amber-200",
    "In Progress": "bg-blue-50 text-blue-800 border-blue-200",
    "QA Check": "bg-cyan-50 text-cyan-800 border-cyan-200",
    Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Cancelled: "bg-red-50 text-red-800 border-red-200",
  };
  return styles[status] || "bg-gray-50 text-gray-800 border-gray-200";
};

export const getProductionAssignmentStatusStyle = (status) => {
  const styles = {
    "Not Started": "bg-gray-50 text-gray-700 border-gray-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    "QA Check": "bg-cyan-50 text-cyan-700 border-cyan-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

/**
 * QA checklist used during the production QA sign-off step.
 */
export const PRODUCTION_QA_ITEMS = [
  { id: "measurements", label: "Measurements and sizes match the production specifications" },
  { id: "fabric", label: "Fabric inspected for quality and consistency" },
  { id: "stitching", label: "Stitching and seam quality meets standards" },
  { id: "finishing", label: "Finishing touches completed (buttons, zippers, hems)" },
  { id: "pressing", label: "Garments pressed and neatly packed" },
  { id: "quantity", label: "Produced quantity matches the assigned quantities" },
  { id: "final_inspection", label: "Final quality inspection passed" },
];

export const getStaffName = (assignment) => {
  if (!assignment) return "Staff";
  const staff = assignment.staff_object || assignment.staff_detail || assignment;
  if (typeof assignment.staff_name === "string") return assignment.staff_name;
  const name =
    [staff?.first_name, staff?.last_name].filter(Boolean).join(" ").trim() ||
    staff?.name ||
    staff?.full_name ||
    assignment.staff_name ||
    "Staff";
  return name;
};

export const getProductionProgress = (order) => {
  const total = Number(order?.total_quantity) || 0;
  const completed =
    order?.completed_quantity != null
      ? Number(order.completed_quantity)
      : Number(order?.progress ?? 0);
  if (total <= 0) {
    return Number(order?.progress ?? 0);
  }
  return Math.min(Math.round((completed / total) * 100), 100);
};
