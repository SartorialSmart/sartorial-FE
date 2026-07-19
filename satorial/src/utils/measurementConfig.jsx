import {
  Ruler,
} from "lucide-react";

export const MEASUREMENT_UNIT_OPTIONS = [
  { value: "cm", label: "Centimeters (cm)" },
  { value: "in", label: "Inches (in)" },
  { value: "mm", label: "Millimeters (mm)" },
];

export const getUnitLabel = (unit) => {
  const opt = MEASUREMENT_UNIT_OPTIONS.find((o) => o.value === unit);
  return opt ? unit : "cm";
};

export const MALE_MEASUREMENTS = [
  { key: "length", label: "Length" },
  { key: "chest", label: "Chest" },
  { key: "back_shoulder", label: "Back/Shoulder" },
  { key: "sleeve_length", label: "Sleeve Length" },
  { key: "sleeve_circumference", label: "Sleeve Circumference" },
  { key: "neck", label: "Neck" },
  { key: "arm_hole", label: "Arm Hole" },
  { key: "trouser_length", label: "Trouser Length" },
  { key: "thigh", label: "Thigh" },
  { key: "hip", label: "Hip" },
  { key: "waist", label: "Waist" },
  { key: "lower_base", label: "Lower Base" },
  { key: "head_circumference", label: "Head Circumference" },
];

export const FEMALE_MEASUREMENTS = [
  { key: "chest_bust", label: "Chest/Bust" },
  { key: "centre_back_neck_to_waist", label: "Centre Back Neck to Waist" },
  { key: "cross_back", label: "Cross Back" },
  { key: "arm_length", label: "Arm Length" },
  { key: "upper_arm", label: "Upper Arm" },
  { key: "armhole_depth", label: "Armhole Depth" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "head_circumference", label: "Head Circumference" },
  { key: "thigh", label: "Thigh" },
  { key: "full_body_length", label: "Full Body Length" },
];

export const getMeasurementsForGender = (gender) => {
  if (gender === "Male") return MALE_MEASUREMENTS;
  return FEMALE_MEASUREMENTS;
};

export const getInitialMeasurements = (gender) => {
  const fields = getMeasurementsForGender(gender);
  const initial = {};
  fields.forEach((f) => {
    initial[f.key] = "";
  });
  return initial;
};

export const MeasurementPlaceholder = ({ label }) => (
  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
    <Ruler size={18} className="text-indigo-500" />
  </div>
);
