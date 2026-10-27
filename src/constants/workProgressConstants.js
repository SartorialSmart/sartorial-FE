/**
 * Canonical work-progress parameters ("progress of work" indicators).
 *
 * Mirrors common.work_progress.WORK_PARAMETERS on the backend — the keys are
 * the same ids as the admin Q/A checklist, so a parameter a staff member
 * reports at 100 shows up pre-checked in the admin's Q/A dialog.
 */
export const WORK_PARAMETERS = [
  {
    key: "measurements",
    label: "Measurements",
    description: "Measurements verified and match order specifications",
  },
  {
    key: "fabric",
    label: "Fabric",
    description: "Fabric inspected for quality and consistency",
  },
  {
    key: "stitching",
    label: "Stitching",
    description: "Stitching and seam quality meets standards",
  },
  {
    key: "finishing",
    label: "Finishing",
    description: "Finishing touches completed (buttons, zippers, hems)",
  },
  {
    key: "pressing",
    label: "Pressing",
    description: "Garment pressed and prepared for delivery",
  },
  {
    key: "final_inspection",
    label: "Final Inspection",
    description: "Final quality inspection passed",
  },
];

/** Overall completion across the full catalog; unreported parameters count as 0. */
export const computeOverallPercent = (parameters) => {
  if (!Array.isArray(parameters) || !parameters.length) return null;
  if (parameters.every((p) => p.progress === null || p.progress === undefined)) return null;
  const total = parameters.reduce((sum, p) => sum + (Number(p.progress) || 0), 0);
  return Math.round(total / parameters.length);
};

/** Tailwind classes for a progress value. */
export const progressTone = (value) => {
  if (value >= 100) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (value >= 60) return { bar: "bg-blue-500", text: "text-blue-600" };
  if (value > 0) return { bar: "bg-amber-500", text: "text-amber-600" };
  return { bar: "bg-gray-300", text: "text-gray-400" };
};
