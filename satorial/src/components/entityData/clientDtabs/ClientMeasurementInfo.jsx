import { useState, useEffect } from "react";
import { Edit2, Save, X, Ruler, Check, Plus } from "lucide-react";
import PropTypes from "prop-types";
import ClientService from "../../../services/ClientService";
import {
  getMeasurementsForGender,
  getUnitLabel,
  MeasurementPlaceholder,
} from "../../../utils/measurementConfig";

const ClientMeasurementInfo = ({ clientId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [editedMeasurements, setEditedMeasurements] = useState({});
  const [createMeasurements, setCreateMeasurements] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [clientGender, setClientGender] = useState("Female");
  const [clientUnit, setClientUnit] = useState("cm");

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;
      setFetching(true);
      try {
        const [measurementData, clientData] = await Promise.all([
          ClientService.getMeasurementById(clientId),
          ClientService.getClientById(clientId),
        ]);

        if (clientData?.gender) {
          setClientGender(clientData.gender);
        }
        if (clientData?.measurement_unit) {
          setClientUnit(clientData.measurement_unit);
        }

        if (Array.isArray(measurementData) && measurementData.length > 0) {
          setMeasurements(measurementData[0]);
          setEditedMeasurements({ ...measurementData[0] });
        } else {
          setMeasurements(null);
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
        setMeasurements(null);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [clientId]);

  const measurementFields = getMeasurementsForGender(
    measurements?.gender || clientGender
  );

  const handleChange = (field, value) => {
    setEditedMeasurements((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleCreateChange = (field, value) => {
    setCreateMeasurements((prev) => ({
      ...prev,
      [field]: value,
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

  const handleCreate = async () => {
    const fields = getMeasurementsForGender(clientGender);
    const payload = { client: clientId, gender: clientGender };
    let hasError = false;

    fields.forEach(({ key }) => {
      const val = createMeasurements[key];
      if (val === "" || val === undefined || val === null) {
        hasError = true;
      } else {
        payload[key] = parseFloat(val);
      }
    });

    if (hasError) {
      return;
    }

    setIsSaving(true);
    try {
      const created = await ClientService.createMeasurement(payload);
      setMeasurements(created);
      setEditedMeasurements({ ...created });
      setIsCreating(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error creating measurements:", error);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditedMeasurements({ ...measurements });
    setIsEditing(false);
  };

  const initCreateForm = async () => {
    let gender = clientGender;
    let unit = clientUnit;
    try {
      const clientData = await ClientService.getClientById(clientId);
      if (clientData?.gender) {
        gender = clientData.gender;
        setClientGender(gender);
      }
      if (clientData?.measurement_unit) {
        unit = clientData.measurement_unit;
        setClientUnit(unit);
      }
    } catch {
      // use existing values
    }
    const fields = getMeasurementsForGender(gender);
    const initial = {};
    fields.forEach((f) => {
      initial[f.key] = "";
    });
    setCreateMeasurements(initial);
    setIsCreating(true);
  };

  if (fetching)
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!measurements && !isCreating)
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Ruler size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Measurements Yet
        </h3>
        <p className="text-gray-500 text-sm max-w-md mb-6">
          This client does not have any measurements recorded. Click the button
          below to add measurements.
        </p>
        <button
          onClick={initCreateForm}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Measurements
        </button>
      </div>
    );

  if (isCreating) {
    const fields = getMeasurementsForGender(clientGender);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Ruler size={20} className="mr-2" />
              Add {clientGender === "Male" ? "Male" : "Female"} Measurements
            </h3>
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all font-medium flex items-center backdrop-blur-sm"
                onClick={() => setIsCreating(false)}
                disabled={isSaving}
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg transition-all font-medium flex items-center disabled:opacity-50"
                onClick={handleCreate}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Measurements
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fields.map(({ key, label }) => (
                <div
                  key={key}
                  className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center p-2">
                      <MeasurementPlaceholder label={label} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={createMeasurements[key] ?? ""}
                          onChange={(e) =>
                            handleCreateChange(key, e.target.value)
                          }
                          placeholder="0.00"
                          className="w-full px-3 py-2 pr-12 border border-indigo-300 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                          {clientUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Ruler size={20} className="mr-2" />
            {measurements.gender === "Male" ? "Male" : "Female"} Body
            Measurements
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
            {measurementFields.map(({ key, label }) => (
              <div
                key={key}
                className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center p-2">
                    <MeasurementPlaceholder label={label} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
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
                        {clientUnit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              All measurements are in {getUnitLabel(clientUnit)}. Ensure accurate
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
