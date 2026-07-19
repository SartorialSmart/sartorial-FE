import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ClientService from "@/services/ClientService";
import { getMeasurementsForGender, getUnitLabel, MeasurementPlaceholder } from "../../../utils/measurementConfig";

const AddClientMeasurementForm = ({ onClose, onBack, onNext, clientId, gender: propGender, unit: propUnit }) => {
  const STORAGE_KEY = `client_measurements_${clientId}`;

  const gender = propGender || "Female";
  const unit = propUnit || "cm";
  const measurementFields = getMeasurementsForGender(gender);

  const buildInitial = () => {
    const initial = {};
    measurementFields.forEach((f) => {
      initial[f.key] = "";
    });
    return initial;
  };

  const [measurements, setMeasurements] = useState(buildInitial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedMeasurements = localStorage.getItem(STORAGE_KEY);
    if (savedMeasurements) {
      const parsed = JSON.parse(savedMeasurements);
      const merged = buildInitial();
      Object.keys(merged).forEach((key) => {
        if (parsed[key] !== undefined) merged[key] = parsed[key];
      });
      setMeasurements(merged);
    }
  }, [clientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedMeasurements = { ...measurements, [name]: value };
    setMeasurements(updatedMeasurements);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeasurements));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    measurementFields.forEach(({ key, label }) => {
      const value = measurements[key];
      if (!value || value.trim() === "") {
        newErrors[key] = `${label} is required`;
        isValid = false;
      } else if (isNaN(value) || parseFloat(value) <= 0) {
        newErrors[key] = `Please enter a valid measurement`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const measurementData = { client: clientId, gender };
      Object.entries(measurements).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          measurementData[key] = parseFloat(value);
        }
      });
      await ClientService.createMeasurement(measurementData);
      onNext();
    } catch (err) {
      setError("Failed to save measurements. Please try again.");
      console.error("Measurement creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-1">
        {gender === "Male" ? "Male" : "Female"} Measurements
      </h2>
      <p className="text-gray-500 text-sm mb-5">
        Enter body measurements in {getUnitLabel(unit)} for accurate tailoring ({measurementFields.length} measurements)
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {measurementFields.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <MeasurementPlaceholder label={label} />
            <div className="flex-1">
              <label className="text-gray-600 text-sm font-medium block mb-1">
                {label}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name={key}
                  value={measurements[key]}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`border ${
                    errors[key] ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 pr-10 w-full text-sm focus:outline-none focus:ring-2 ${
                    errors[key] ? "focus:ring-red-200" : "focus:ring-blue-200"
                  } transition-colors`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                  {unit}
                </span>
              </div>
              {errors[key] && (
                <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm font-medium"
          disabled={loading}
        >
          {loading ? "Saving..." : "Next: Designs"}
        </button>
      </div>
    </div>
  );
};

AddClientMeasurementForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  clientId: PropTypes.number.isRequired,
  gender: PropTypes.string,
  unit: PropTypes.string,
};

export default AddClientMeasurementForm;
