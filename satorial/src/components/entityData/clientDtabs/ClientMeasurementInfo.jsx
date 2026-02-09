import { useState, useEffect } from "react";
import { Edit2, Save, X, Ruler, Check } from "lucide-react";
import PropTypes from "prop-types";
import ClientService from "../../../services/ClientService";

// Import measurement images
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

const measurementLabels = {
  length: "Length",
  shoulder: "Shoulder",
  upper_chest: "Upper Chest",
  bust: "Bust",
  waist: "Waist",
  seat: "Seat",
  armhole: "Armhole",
  sleeve_length: "Sleeve Length",
  sleeve_circumference: "Sleeve Circumference",
  front_neck_depth: "Front Neck Depth",
  back_neck_depth: "Back Neck Depth",
};

const measurementImages = {
  length: M_1,
  shoulder: M_7,
  upper_chest: M_2,
  bust: M_8,
  waist: M_3,
  seat: M_9,
  armhole: M_4,
  sleeve_length: M_10,
  sleeve_circumference: M_5,
  front_neck_depth: M_11,
  back_neck_depth: M_6,
};

const ClientMeasurementInfo = ({ clientId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [editedMeasurements, setEditedMeasurements] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!clientId) return;
      try {
        const data = await ClientService.getMeasurementById(clientId);
        console.log("Fetched measurements:", data);

        if (Array.isArray(data) && data.length > 0) {
          setMeasurements(data[0]);
          setEditedMeasurements({ ...data[0] });
        } else {
          setMeasurements(null);
        }
      } catch (error) {
        console.error("Error fetching client measurements:", error);
      }
    };
    fetchMeasurements();
  }, [clientId]);

  const handleChange = (field, value) => {
    setEditedMeasurements((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleSave = async () => {
    if (!editedMeasurements.id) return;
    setIsSaving(true);
    try {
      await ClientService.updateMeasurement(
        editedMeasurements.id,
        editedMeasurements
      );
      setMeasurements(editedMeasurements);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving measurements:", error);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditedMeasurements({ ...measurements });
    setIsEditing(false);
  };

  if (!measurements)
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
          <p className="text-green-800 font-medium">
            Measurements updated successfully!
          </p>
        </div>
      )}

      {/* Measurements Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Ruler size={20} className="mr-2" />
            Body Measurements
          </h3>
          <div className="flex space-x-3">
            {isEditing && (
              <button
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all font-medium flex items-center backdrop-blur-sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
            )}
            <button
              className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center ${
                isEditing
                  ? "bg-white text-indigo-600 hover:bg-gray-100"
                  : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
              } disabled:opacity-50`}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={isSaving}
            >
              {isEditing ? (
                isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save
                  </>
                )
              ) : (
                <>
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(measurementLabels).map((key) => (
              <div
                key={key}
                className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center p-2">
                    <img
                      src={measurementImages[key]}
                      alt={key}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {measurementLabels[key]}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={editedMeasurements[key] ?? ""}
                        readOnly={!isEditing}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className={`w-full px-3 py-2 pr-12 border rounded-lg transition-all ${
                          isEditing
                            ? "border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            : "border-gray-200 bg-gray-50 text-gray-700"
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                        cm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-blue-900 font-medium">
              Measurement Guidelines
            </p>
            <p className="text-sm text-blue-800 mt-1">
              All measurements are in centimeters (cm). Ensure accurate
              measurements for the best garment fit. Click Edit to update any
              values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

ClientMeasurementInfo.propTypes = {
  clientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ClientMeasurementInfo;