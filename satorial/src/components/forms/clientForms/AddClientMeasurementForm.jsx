import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ClientService from "@/services/ClientService";
import M_1 from "../../../assets/images/measurement/mes-1.svg";
import M_2 from "../../../assets/images/measurement/mes-2.svg";
import M_3 from "../../../assets/images/measurement/mes-3.svg";
import M_4 from "../../../assets/images/measurement/mes-4.svg";
import M_5 from "../../../assets/images/measurement/mes-5.svg";
import M_6 from "../../../assets/images/measurement/mes-6.svg";
import M_7 from "../../../assets/images/measurement/mes-7.svg";
import M_8 from "../../../assets/images/measurement/mes-8.svg";
import M_9 from "../../../assets/images/measurement/mes-9.svg";
import M_10 from "../../../assets/images/measurement/mes-10.svg";
import M_11 from "../../../assets/images/measurement/mes-11.svg";

const measurementImages = {
  length: M_1,
  upper_chest: M_2,
  waist: M_3,
  armhole: M_4,
  sleeve_circumference: M_5,
  back_neck_depth: M_6,
  shoulder: M_7,
  bust: M_8,
  seat: M_9,
  sleeve_length: M_10,
  front_neck_depth: M_11,
  hip: M_3,  // Re-uses waist silhouette (all-around measurement)
};

const AddClientMeasurementForm = ({ onClose, onBack, onNext, clientId }) => {
  const STORAGE_KEY = `client_measurements_${clientId}`;
  
  const [measurements, setMeasurements] = useState({
    length: "",
    shoulder: "",
    upper_chest: "",
    bust: "",
    waist: "",
    hip: "",
    seat: "",
    armhole: "",
    sleeve_length: "",
    sleeve_circumference: "",
    front_neck_depth: "",
    back_neck_depth: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({
    length: "",
    shoulder: "",
    upper_chest: "",
    bust: "",
    waist: "",
    hip: "",
    seat: "",
    armhole: "",
    sleeve_length: "",
    sleeve_circumference: "",
    front_neck_depth: "",
    back_neck_depth: "",
  });

  // Load stored measurements when the component mounts
  useEffect(() => {
    const savedMeasurements = localStorage.getItem(STORAGE_KEY);
    if (savedMeasurements) {
      setMeasurements(JSON.parse(savedMeasurements));
    }
  }, [clientId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedMeasurements = { ...measurements, [name]: value };
    setMeasurements(updatedMeasurements);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeasurements));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.entries(measurements).forEach(([key, value]) => {
      if (!value || value.trim() === "") {
        newErrors[key] = `${key.replace(/_/g, " ")} is required`;
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
      const measurementData = { ...measurements, client: clientId };
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
      <h2 className="text-2xl font-semibold mb-1">Client Measurements</h2>
      <p className="text-gray-500 text-sm mb-5">Enter body measurements for accurate tailoring</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {Object.keys(measurements).map((key) => (
          <div key={key} className="flex items-center gap-3">
            <img
              src={measurementImages[key]}
              alt={key}
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="flex-1">
              <label className="text-gray-600 text-sm font-medium capitalize block mb-1">
                {key.replace(/_/g, " ")}
              </label>
              <input
                type="number"
                name={key}
                value={measurements[key]}
                onChange={handleChange}
                placeholder="0.00"
                className={`border ${
                  errors[key] ? "border-red-500" : "border-gray-300"
                } rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 ${
                  errors[key] ? "focus:ring-red-200" : "focus:ring-blue-200"
                } transition-colors`}
              />
              {errors[key] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[key]}
                </p>
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
};

export default AddClientMeasurementForm;
