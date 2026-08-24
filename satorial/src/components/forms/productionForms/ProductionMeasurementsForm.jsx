import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Ruler, ChevronLeft, ChevronRight } from "lucide-react";
import { getMeasurementsForGender, getUnitLabel, MeasurementPlaceholder, MEASUREMENT_UNIT_OPTIONS } from "../../../utils/measurementConfig";
import { GENDER_TARGETS, SIZE_CATEGORIES } from "../../../constants/productionConstants";

const ProductionMeasurementsForm = ({ initialGender = "Unisex", initialSize = "", initialUnit = "cm", initialMeasurements = {}, onBack, onNext, loading }) => {
  const [gender, setGender] = useState(initialGender);
  const [sizeCategory, setSizeCategory] = useState(initialSize);
  const [unit, setUnit] = useState(initialUnit);
  const [measurements, setMeasurements] = useState({});
  const [errors, setErrors] = useState({});

  const fields = getMeasurementsForGender(gender === "Unisex" ? "Female" : gender);

  useEffect(() => {
    const init = {};
    fields.forEach((f) => {
      init[f.key] = initialMeasurements[f.key] ?? "";
    });
    setMeasurements(init);
  }, [gender]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeasurements((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    let ok = true;
    if (!sizeCategory) {
      newErrors.size_category = "Size category is required for e-commerce listing.";
      ok = false;
    }
    fields.forEach(({ key, label }) => {
      const v = measurements[key];
      if (v === "" || v == null) {
        newErrors[key] = `${label} is required`;
        ok = false;
      } else if (isNaN(v) || Number(v) <= 0) {
        newErrors[key] = "Enter a valid number";
        ok = false;
      }
    });
    setErrors(newErrors);
    return ok;
  };

  const handleNext = () => {
    if (!validate()) return;
    onNext({
      gender_target: gender,
      size_category: sizeCategory,
      measurement_unit: unit,
      measurements,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Ruler size={20} className="text-blue-600" />
          Measurements & Size (Step 2)
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Define the target gender and e-commerce size, then capture per-unit measurements. Lifted from client measurement flow — icons and units preserved.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender Target *</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
            {GENDER_TARGETS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size Category *</label>
          <select value={sizeCategory} onChange={(e) => setSizeCategory(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${errors.size_category ? "border-red-500" : "border-gray-300"}`}>
            <option value="">Select size (e-commerce)</option>
            {SIZE_CATEGORIES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.size_category && <p className="text-red-500 text-xs mt-1">{errors.size_category}</p>}
          <p className="text-xs text-gray-400 mt-1">For listings: S/M/L etc. Tailors use measurements.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
            {MEASUREMENT_UNIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {fields.map(({ key, label, icon }) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-20 h-20 flex-shrink-0">
              <MeasurementPlaceholder label={label} icon={icon} />
            </div>
            <div className="flex-1">
              <label className="text-gray-600 text-sm font-medium block mb-1">{label}</label>
              <div className="relative">
                <input
                  type="number"
                  name={key}
                  value={measurements[key] || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`border ${errors[key] ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 pr-10 w-full text-sm focus:outline-none focus:ring-2 ${errors[key] ? "focus:ring-red-200" : "focus:ring-blue-200"}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">{getUnitLabel(unit)}</span>
              </div>
              {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button onClick={onBack} className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-1">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={handleNext} disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium flex items-center gap-1">
          Save Measurements & Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

ProductionMeasurementsForm.propTypes = {
  initialGender: PropTypes.string,
  initialSize: PropTypes.string,
  initialUnit: PropTypes.string,
  initialMeasurements: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ProductionMeasurementsForm;
