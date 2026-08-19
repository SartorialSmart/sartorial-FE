import { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
  Landmark,
  Loader2,
} from "lucide-react";

const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank Nigeria",
  "First Bank of Nigeria",
  "First City Monument Bank",
  "Globus Bank",
  "Guaranty Trust Bank",
  "Heritage Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Opay",
  "Palmpay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa",
  "VFD Microfinance Bank",
  "Wema Bank",
  "Zenith Bank",
];

const EditVendorForm = ({ vendor, onClose, onSuccess }) => {
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
    bank_name: "",
    custom_bank_name: "",
    account_number: "",
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
        setCategories(data || []);
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

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_type: vendor.vendor_type || "Individual",
        vendor_name: vendor.vendor_name || "",
        vendor_email: vendor.vendor_email || "",
        vendor_phone: vendor.vendor_phone || "",
        vendor_address: vendor.vendor_address || "",
        vendor_city: vendor.vendor_city || "",
        vendor_state: vendor.vendor_state || "",
        vendor_country: vendor.vendor_country || "",
        vendor_postal_code: vendor.vendor_postal_code || "",
        vendor_category: vendor.vendor_category || "",
        vendor_image: null,
        bank_name: vendor.bank_name || "",
        custom_bank_name: "",
        account_number: vendor.account_number || "",
        is_active: vendor.is_active !== undefined ? vendor.is_active : true,
      });
    }
  }, [vendor]);

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
    if (
      formData.bank_name === "__other__" &&
      !formData.custom_bank_name.trim()
    ) {
      newErrors.custom_bank_name = "Please enter a custom bank name";
    }
    if (
      formData.account_number &&
      !/^\d{10}$/.test(formData.account_number)
    ) {
      newErrors.account_number = "Account number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
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
      formDataToSend.set(
        "bank_name",
        formData.bank_name === "__other__"
          ? formData.custom_bank_name.trim()
          : formData.bank_name
      );
      formDataToSend.set("account_number", formData.account_number || "");

      await VendorService.updateVendor(vendor.id, formDataToSend);
      setSuccessMessage("Vendor updated successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating vendor:", error);
      setErrors((prev) => ({
        ...prev,
        form: "Failed to update vendor. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Edit Vendor</h2>
        <p className="text-gray-600 mt-1">
          Update the vendor details below
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

          {/* Bank Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Landmark size={18} className="text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Bank Information
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              Optional — for vendor payments
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Name */}
              <div className="space-y-2">
                <label
                  htmlFor="bank_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bank Name
                </label>
                <select
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Bank</option>
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                  <option value="__other__">Other (type manually)</option>
                </select>
              </div>

              {/* Custom Bank Name (shown when "Other" is selected) */}
              {formData.bank_name === "__other__" && (
                <div className="space-y-2">
                  <label
                    htmlFor="custom_bank_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Custom Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="custom_bank_name"
                    name="custom_bank_name"
                    value={formData.custom_bank_name}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    className={`w-full px-4 py-2 border ${
                      errors.custom_bank_name
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.custom_bank_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.custom_bank_name}
                    </p>
                  )}
                </div>
              )}

              {/* Account Number */}
              <div className="space-y-2">
                <label
                  htmlFor="account_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Account Number
                </label>
                <input
                  type="text"
                  id="account_number"
                  name="account_number"
                  value={formData.account_number}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData((prev) => ({ ...prev, account_number: val }));
                    if (errors.account_number) {
                      setErrors((prev) => ({ ...prev, account_number: "" }));
                    }
                  }}
                  placeholder="0123456789"
                  maxLength={10}
                  inputMode="numeric"
                  className={`w-full px-4 py-2 border ${
                    errors.account_number
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {formData.account_number &&
                  formData.account_number.length !== 10 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Must be exactly 10 digits (
                      {formData.account_number.length}/10)
                    </p>
                  )}
                {errors.account_number && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.account_number}
                  </p>
                )}
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
            onClick={onClose}
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
                Updating...
              </>
            ) : (
              "Update Vendor"
            )}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            if (onSuccess) {
              onSuccess();
            }
          }}
        />
      )}
    </div>
  );
};

EditVendorForm.propTypes = {
  vendor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    vendor_type: PropTypes.string,
    vendor_name: PropTypes.string,
    vendor_email: PropTypes.string,
    vendor_phone: PropTypes.string,
    vendor_address: PropTypes.string,
    vendor_city: PropTypes.string,
    vendor_state: PropTypes.string,
    vendor_country: PropTypes.string,
    vendor_postal_code: PropTypes.string,
    vendor_category: PropTypes.number,
    bank_name: PropTypes.string,
    account_number: PropTypes.string,
    is_active: PropTypes.bool,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default EditVendorForm;