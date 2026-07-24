import {
  Ruler,
} from "lucide-react";

import maleLength from "../assets/images/measurement/male-length.svg";
import maleChest from "../assets/images/measurement/male-chest.svg";
import maleBackShoulder from "../assets/images/measurement/male-back-shoulder.svg";
import maleSleeveLength from "../assets/images/measurement/male-sleeve-length.svg";
import maleSleeveCircumference from "../assets/images/measurement/male-sleeve-circumference.svg";
import maleNeck from "../assets/images/measurement/male-neck.svg";
import maleArmHole from "../assets/images/measurement/male-arm-hole.svg";
import maleTrouserLength from "../assets/images/measurement/male-trouser-length.svg";
import maleThigh from "../assets/images/measurement/male-thigh.svg";
import maleHip from "../assets/images/measurement/male-hip.svg";
import maleWaist from "../assets/images/measurement/male-waist.svg";
import maleLowerBase from "../assets/images/measurement/male-lower-base.svg";
import maleHeadCircumference from "../assets/images/measurement/male-head-circumference.svg";

import femaleChestBust from "../assets/images/measurement/female-chest-bust.svg";
import femaleCentreBackNeckToWaist from "../assets/images/measurement/female-centre-back-neck-to-waist.svg";
import femaleCrossBack from "../assets/images/measurement/female-cross-back.svg";
import femaleArmLength from "../assets/images/measurement/female-arm-length.svg";
import femaleUpperArm from "../assets/images/measurement/female-upper-arm.svg";
import femaleArmholeDepth from "../assets/images/measurement/female-armhole-depth.svg";
import femaleWaist from "../assets/images/measurement/female-waist.svg";
import femaleHip from "../assets/images/measurement/female-hip.svg";
import femaleHeadCircumference from "../assets/images/measurement/female-head-circumference.svg";
import femaleThigh from "../assets/images/measurement/female-thigh.svg";
import femaleFullBodyLength from "../assets/images/measurement/female-full-body-length.svg";

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
  { key: "length", label: "Length", icon: maleLength },
  { key: "chest", label: "Chest", icon: maleChest },
  { key: "back_shoulder", label: "Back/Shoulder", icon: maleBackShoulder },
  { key: "sleeve_length", label: "Sleeve Length", icon: maleSleeveLength },
  { key: "sleeve_circumference", label: "Sleeve Circumference", icon: maleSleeveCircumference },
  { key: "neck", label: "Neck", icon: maleNeck },
  { key: "arm_hole", label: "Arm Hole", icon: maleArmHole },
  { key: "trouser_length", label: "Trouser Length", icon: maleTrouserLength },
  { key: "thigh", label: "Thigh", icon: maleThigh },
  { key: "hip", label: "Hip", icon: maleHip },
  { key: "waist", label: "Waist", icon: maleWaist },
  { key: "lower_base", label: "Lower Base", icon: maleLowerBase },
  { key: "head_circumference", label: "Head Circumference", icon: maleHeadCircumference },
];

export const FEMALE_MEASUREMENTS = [
  { key: "chest_bust", label: "Chest/Bust", icon: femaleChestBust },
  { key: "centre_back_neck_to_waist", label: "Centre Back Neck to Waist", icon: femaleCentreBackNeckToWaist },
  { key: "cross_back", label: "Cross Back", icon: femaleCrossBack },
  { key: "arm_length", label: "Arm Length", icon: femaleArmLength },
  { key: "upper_arm", label: "Upper Arm", icon: femaleUpperArm },
  { key: "armhole_depth", label: "Armhole Depth", icon: femaleArmholeDepth },
  { key: "waist", label: "Waist", icon: femaleWaist },
  { key: "hip", label: "Hip", icon: femaleHip },
  { key: "head_circumference", label: "Head Circumference", icon: femaleHeadCircumference },
  { key: "thigh", label: "Thigh", icon: femaleThigh },
  { key: "full_body_length", label: "Full Body Length", icon: femaleFullBodyLength },
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

export const MeasurementPlaceholder = ({ label, icon }) => (
  <div className="w-full h-full bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
    {icon ? (
      <img src={icon} alt={label} className="w-full h-full object-contain" />
    ) : (
      <Ruler size={18} className="text-indigo-500" />
    )}
  </div>
);
