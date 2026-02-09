import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
}; 

const AddClientMeasurementForm = ({ onClose, onBack, onNext, clientId }) => {
  const STORAGE_KEY = `client_measurements_${clientId}`;
  
  const [measurements, setMeasurements] = useState({
    // client: "should be the client ID",
    length: "",
    shoulder: "",
    upper_chest: "",
    bust: "",
    waist: "",
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
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-4">Add Client Measurements</h2>

        {error && <p className="text-red-600">{error}</p>}

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Measurements</h3>

          <div className="grid grid-cols-2 gap-4">
            {Object.keys(measurements).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <img
                  src={measurementImages[key]}
                  alt={key}
                  className="w-12 h-12 object-contain"
                />
                <div className="flex-1 relative">
                  <label className="text-gray-600 capitalize">
                    {key.replace(/_/g, " ")}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={measurements[key]}
                    onChange={handleChange}
                    className={`border ${
                      errors[key] ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                      errors[key] ? "focus:ring-red-200" : "focus:ring-blue-200"
                    }`}
                  />
                  {errors[key] && (
                    <p className="absolute -bottom-5 left-0 text-red-500 text-xs">
                      {errors[key]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onBack}
            className="border border-gray-400 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Back: Client Details
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Saving..." : "Next: Client Designs"}
          </button>
        </div>
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
