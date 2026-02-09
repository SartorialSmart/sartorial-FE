import React, { useState, useEffect } from "react";
import VendorService from "../../../services/VendorService";
import VendorCategoryService from "../../../services/VendorCategoryService";
import SuccessModal from "../../modals/SuccessModal";
import {
  Upload,
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import { extractErrorMessage } from "../../../../utils/errorUtils";

const AddVendorForm = () => {
  const [formData, setFormData] = useState({
    vendor_type: "Individual",
    vendor_name: "",
    vendor_email: "",
    vendor_phone: "",
    vendor_address: "",
    vendor_city: "",
    vendor_state: "",
    vendor_country: "",
    vendor_postal_code: "",
    vendor_category: "",
    vendor_image: null,
    is_active: true,
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const data = await VendorCategoryService.getCategoriesWithBillCount();
        setCategories(data || []); // Ensure we always have an array
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoriesError(error.message || "Failed to fetch vendor categories");
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Add error boundary fallback UI
  if (categoriesError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium">Error loading form</h3>
        <p className="text-red-600">{categoriesError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  // Add loading state UI
  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-gray-600">Loading form...</span>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vendor_name.trim())
      newErrors.vendor_name = "Vendor name is required";
    if (!formData.vendor_email.trim()) {
      newErrors.vendor_email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.vendor_email)) {
      newErrors.vendor_email = "Email is invalid";
    }
    if (!formData.vendor_phone.trim())
      newErrors.vendor_phone = "Phone is required";
    if (!formData.vendor_address.trim())
      newErrors.vendor_address = "Address is required";
    if (!formData.vendor_city.trim())
      newErrors.vendor_city = "City is required";
    if (!formData.vendor_state.trim())
      newErrors.vendor_state = "State is required";
    if (!formData.vendor_country.trim())
      newErrors.vendor_country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      // 2MB limit
      setErrors((prev) => ({
        ...prev,
        vendor_image: "Image size should be less than 2MB",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      vendor_image: file,
    }));
    if (errors.vendor_image) {
      setErrors((prev) => ({ ...prev, vendor_image: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      }

      await VendorService.createVendor(formDataToSend);
      setSuccessMessage("Vendor created successfully!");
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        vendor_type: "Individual",
        vendor_name: "",
        vendor_email: "",
        vendor_phone: "",
        vendor_address: "",
        vendor_city: "",
        vendor_state: "",
        vendor_country: "",
        vendor_postal_code: "",
        vendor_category: "",
        vendor_image: null,
        is_active: true,
      });
      setErrors({});
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form: extractErrorMessage(error, "Failed to create vendor. Please try again."),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Add New Vendor</h2>
        <p className="text-gray-600 mt-1">
          Fill in the details below to register a new vendor
        </p>
      </div>

      {errors.form && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-8">
          {/* Vendor Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Vendor Type</h3>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                                    ${
                                      formData.vendor_type === "Individual"
                                        ? "border-blue-500"
                                        : "border-gray-300"
                                    }`}
                >
                  {formData.vendor_type === "Individual" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="vendor_type"
                  value="Individual"
                  checked={formData.vendor_type === "Individual"}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="flex items-center">
                  <User className="text-gray-600 mr-2" size={16} />
                  <span className="text-gray-700">Individual</span>
                </div>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                                    ${
                                      formData.vendor_type === "Company"
                                        ? "border-blue-500"
                                        : "border-gray-300"
                                    }`}
                >
                  {formData.vendor_type === "Company" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="vendor_type"
                  value="Company"
                  checked={formData.vendor_type === "Company"}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="flex items-center">
                  <Briefcase className="text-gray-600 mr-2" size={16} />
                  <span className="text-gray-700">Company</span>
                </div>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor Name */}
              <div className="space-y-2">
                <label
                  htmlFor="vendor_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="vendor_name"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.vendor_name ? "border-red-300" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.vendor_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vendor_name}
                  </p>
                )}
              </div>

              {/* Vendor Email */}
              <div className="space-y-2">
                <label
                  htmlFor="vendor_email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="vendor_email"
                    name="vendor_email"
                    value={formData.vendor_email}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-2 border ${
                      errors.vendor_email ? "border-red-300" : "border-gray-300"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.vendor_email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vendor_email}
                  </p>
                )}
              </div>

              {/* Vendor Phone */}
              <div className="space-y-2">
                <label
                  htmlFor="vendor_phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="vendor_phone"
                    name="vendor_phone"
                    value={formData.vendor_phone}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-2 border ${
                      errors.vendor_phone ? "border-red-300" : "border-gray-300"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.vendor_phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vendor_phone}
                  </p>
                )}
              </div>

              {/* Vendor Category */}
              <div className="space-y-2">
                <label
                  htmlFor="vendor_category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="vendor_category"
                  name="vendor_category"
                  value={formData.vendor_category}
                  onChange={handleChange}
                  disabled={categoriesLoading}
                  className={`w-full px-4 py-2 border ${
                    categoriesLoading ? "bg-gray-50" : "bg-white"
                  } border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select a category</option>
                  {categoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No categories available</option>
                  )}
                </select>
                {categoriesError && (
                  <p className="mt-1 text-sm text-red-600">{categoriesError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vendor Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Vendor Image</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Image (Max 2MB)
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer flex flex-col items-center justify-center w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 text-center px-2">
                      Click to upload
                    </p>
                  </div>
                  <input
                    type="file"
                    id="vendor_image"
                    name="vendor_image"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                {formData.vendor_image && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {formData.vendor_image.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, vendor_image: null }))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              {errors.vendor_image && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.vendor_image}
                </p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="vendor_address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="vendor_address"
                    name="vendor_address"
                    value={formData.vendor_address}
                    onChange={handleChange}
                    rows={3}
                    className={`pl-10 w-full px-4 py-2 border ${
                      errors.vendor_address
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.vendor_address && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vendor_address}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <label
                  htmlFor="vendor_city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="vendor_city"
                  name="vendor_city"
                  value={formData.vendor_city}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.vendor_city ? "border-red-300" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.vendor_city && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vendor_city}
                  </p>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <label
                  htmlFor="vendor_state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State/Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="vendor_state"
                  name="vendor_state"
                  value={formData.vendor_state}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.vendor_state ? "border-red-300" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.vendor_state && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vendor_state}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label
                  htmlFor="vendor_country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="vendor_country"
                  name="vendor_country"
                  value={formData.vendor_country}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.vendor_country ? "border-red-300" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.vendor_country && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vendor_country}
                  </p>
                )}
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <label
                  htmlFor="vendor_postal_code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Postal Code
                </label>
                <input
                  type="text"
                  id="vendor_postal_code"
                  name="vendor_postal_code"
                  value={formData.vendor_postal_code}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="is_active" className="font-medium text-gray-700">
                Active Vendor
              </label>
              <p className="text-gray-500">
                This vendor will be available for selection immediately
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              "Save Vendor"
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Success</h3>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">{successMessage}</p>
            </div>
            <div className="mt-5">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddVendorForm;
