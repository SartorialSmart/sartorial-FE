import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import ClientService from "../../../services/ClientService";

// Explicitly import measurement images
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
  back_neck_depth: "Back Neck Depth"
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
  back_neck_depth: M_6
};

const ClientMeasurementInfo = ({ clientId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [editedMeasurements, setEditedMeasurements] = useState({});
  const [isSaving, setIsSaving] = useState(false);

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
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    if (!editedMeasurements.id) return;
    setIsSaving(true);
    try {
      await ClientService.updateMeasurement(editedMeasurements.id, editedMeasurements);
      setMeasurements(editedMeasurements);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving measurements:", error);
    }
    setIsSaving(false);
  };

  if (!measurements) return <p>Loading measurements...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 mt-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Measurements</h3>
          <button
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving}
          >
            {isEditing ? "Save" : "Edit"}
            <Edit className="ml-2" size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(measurementLabels).map((key) => (
            <div key={key} className="flex items-center gap-4">
              <img src={measurementImages[key]} alt={key} className="w-12 h-12" />
              <div className="w-full">
                <label className="text-gray-600 block mb-1">{measurementLabels[key]}</label>
                <input
                  type="number"
                  value={editedMeasurements[key] ?? ""}
                  readOnly={!isEditing}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientMeasurementInfo;
