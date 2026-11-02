import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Factory, Ruler, AlertCircle } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import ProductionService from "../../../services/ProductionService";
import InventoryService from "../../../services/InventoryService";
import LocationService from "../../../services/LocationService";
import { extractErrorMessage } from "../../../../utils/errorUtils";
import { isAdminRole } from "../../../utils/permissions";
import {
  PRODUCTION_PRIORITIES,
  GENDER_TARGETS,
  SIZE_CATEGORIES,
} from "../../../constants/productionConstants";
import {
  getMeasurementsForGender,
  getUnitLabel,
  MeasurementPlaceholder,
  MEASUREMENT_UNIT_OPTIONS,
} from "../../../utils/measurementConfig";
import PropTypes from "prop-types";

const toInputDate = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

const EditProductionOrderModal = ({ isOpen, onClose, order, onSuccess }) => {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  const [formData, setFormData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [gender, setGender] = useState("Unisex");
  const [sizeCategory, setSizeCategory] = useState("");
  const [unit, setUnit] = useState("cm");
  const [measurements, setMeasurements] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !order) return;

    const initGender = order.gender_target || "Unisex";
    const initUnit = order.measurement_unit || "cm";
    const initFields = getMeasurementsForGender(initGender === "Unisex" ? "Female" : initGender);
    const initMeasurements = {};
    initFields.forEach((f) => {
      initMeasurements[f.key] = order.measurements?.[f.key] ?? "";
    });

    setFormData({
      title: order.title || "",
      description: order.description || "",
      category: order.category?.id ?? order.category ?? "",
      priority: order.priority || "medium",
      location: isAdmin ? order.location?.id ?? order.location ?? "" : user?.location || "",
      total_quantity: order.total_quantity || "",
      target_completion_date: toInputDate(order.target_completion_date),
    });
    setSelectedCategory(order.category?.id ?? order.category ?? null);
    setGender(initGender);
    setSizeCategory(order.size_category || "");
    setUnit(initUnit);
    setMeasurements(initGender === "Unisex" ? {} : initMeasurements);
    setErrors({});

    const fetchCategories = async () => {
      try {
        const response = await InventoryService.listInventoryCategory();
        setCategories(Array.isArray(response) ? response : response?.results || []);
      } catch {
        // Non-blocking
      }
    };
    const fetchLocations = async () => {
      try {
        const response = await LocationService.listLocations();
        setLocations(Array.isArray(response) ? response : response?.results || []);
      } catch {
        // Non-blocking
      }
    };
    fetchCategories();
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, order]);

  const showMeasurements = gender !== "Unisex";
  const fields = showMeasurements ? getMeasurementsForGender(gender) : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setMeasurements((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = "Production title is required.";
    if (!selectedCategory) newErrors.category = "Please select a production category.";
    if (!formData.total_quantity || String(formData.total_quantity).trim() === "") {
      newErrors.total_quantity = "Total quantity is required.";
    } else if (Number(formData.total_quantity) <= 0) {
      newErrors.total_quantity = "Total quantity must be greater than 0.";
    }
    if (isAdmin && !formData.location) newErrors.location = "Please select a location.";

    if (showMeasurements) {
      fields.forEach(({ key }) => {
        const v = measurements[key];
        if (v !== "" && v != null && v !== undefined) {
          if (isNaN(v) || Number(v) <= 0) newErrors[key] = "Enter a valid number";
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await ProductionService.patchOrder(order.id, {
        title: formData.title.trim(),
        description: formData.description,
        category: selectedCategory,
        priority: formData.priority,
        location: formData.location,
        total_quantity: Number(formData.total_quantity),
        target_completion_date: formData.target_completion_date,
      });
      await ProductionService.updateMeasurements(order.id, {
        gender_target: gender,
        size_category: sizeCategory,
        measurement_unit: unit,
        measurements: showMeasurements ? measurements : {},
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: extractErrorMessage(err, "Failed to update the production order. Please try again."),
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Factory size={20} className="text-blue-600" />
                Edit Production Order
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {errors.form && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    {isAdmin ? (
                      <select
                        name="location"
                        value={formData.location || ""}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                          errors.location ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Location</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={
                          locations.find(
                            (loc) => String(loc.id) === String(user?.location)
                          )?.name ||
                          user?.location ||
                          "Your location"
                        }
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
                      />
                    )}
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority || "medium"}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {PRODUCTION_PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Category *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setErrors((prev) =>
                            prev.category ? { ...prev, category: undefined } : prev
                          );
                        }}
                        className={`px-3 py-1.5 border rounded-lg text-sm font-medium ${
                          selectedCategory === category.id
                            ? "bg-blue-600 text-white border-blue-600"
                            : errors.category
                            ? "border-red-400 text-gray-600"
                            : "border-gray-300 text-gray-600"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Quantity *
                    </label>
                    <input
                      type="number"
                      name="total_quantity"
                      min="1"
                      value={formData.total_quantity || ""}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                        errors.total_quantity ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.total_quantity && (
                      <p className="text-red-500 text-xs mt-1">{errors.total_quantity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Completion *
                    </label>
                    <input
                      type="date"
                      name="target_completion_date"
                      value={formData.target_completion_date || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Gender / Size / Measurements */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Ruler size={16} className="text-indigo-600" />
                    Measurements & Size
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender Target *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => {
                          const g = e.target.value;
                          setGender(g);
                          if (g === "Unisex") {
                            setMeasurements({});
                          } else {
                            const f = getMeasurementsForGender(g);
                            const init = {};
                            f.forEach((fld) => {
                              init[fld.key] = order.measurements?.[fld.key] ?? "";
                            });
                            setMeasurements(init);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {GENDER_TARGETS.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size Category *
                      </label>
                      <select
                        value={sizeCategory}
                        onChange={(e) => setSizeCategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select size (e-commerce)</option>
                        {SIZE_CATEGORIES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {MEASUREMENT_UNIT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {showMeasurements ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                      {fields.map(({ key, label, icon }) => (
                        <div key={key} className="flex items-center gap-3">
                          <div className="w-16 h-16 flex-shrink-0">
                            <MeasurementPlaceholder label={label} icon={icon} />
                          </div>
                          <div className="flex-1">
                            <label className="text-gray-600 text-sm font-medium block mb-1">
                              {label}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                name={key}
                                value={measurements[key] || ""}
                                onChange={handleMeasurementChange}
                                placeholder="0.00"
                                className={`border ${errors[key] ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 pr-10 w-full text-sm focus:outline-none focus:ring-2 ${errors[key] ? "focus:ring-red-200" : "focus:ring-blue-200"}`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                                {getUnitLabel(unit)}
                              </span>
                            </div>
                            {errors[key] && (
                              <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-2 mt-4">
                      <Ruler size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-500">
                        Measurements are optional for{" "}
                        <span className="font-semibold text-gray-700">Unisex</span> items
                        (e.g. caps, custom handbags). None will be stored.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

EditProductionOrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default EditProductionOrderModal;
