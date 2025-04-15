import React, { useState, useEffect } from "react";
import VendorService from "../../../services/VendorService";
import VendorCategoryService from "../../../services/VendorCategoryService";
import SuccessModal from "../../modals/SuccessModal";
import { Upload, User, Briefcase, Mail, Phone, MapPin } from 'lucide-react';

const InputField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  icon: Icon,
  error,
  ...props 
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
      {label}
    </label>
    <div className={`relative rounded-md shadow-sm ${error ? 'border-red-500' : ''}`}>
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

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
  });

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await VendorCategoryService.getCategoriesList();
        setCategories(categoryList);
      } catch (error) {
        setMessage({ 
          type: "error", 
          text: "Failed to load categories. Please refresh the page." 
        });
        setShowModal(true);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.vendor_name.trim()) {
      newErrors.vendor_name = "Vendor name is required";
      isValid = false;
    }

    if (!formData.vendor_email) {
      newErrors.vendor_email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.vendor_email)) {
      newErrors.vendor_email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.vendor_phone) {
      newErrors.vendor_phone = "Phone number is required";
      isValid = false;
    }

    if (!formData.vendor_category) {
      newErrors.vendor_category = "Category is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    setShowModal(false);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });

    try {
      await VendorService.createVendor(data);
      setMessage({ 
        type: "success", 
        text: "Vendor created successfully! You can now add products or services for this vendor." 
      });
      setShowModal(true);

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
      });
      setImagePreview(null);
      setErrors({});
    } catch (error) {
      const errText = error.response?.data?.message || 
                     error.message || 
                     "Failed to create vendor. Please try again later.";
      setMessage({ type: "error", text: errText });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Add New Vendor</h2>
        <p className="text-gray-600 mt-1">
          Fill in the details below to register a new vendor in the system
        </p>
      </div>

      <SuccessModal
        isOpen={showModal}
        title={message.type === "success" ? "Success" : "Error"}
        message={message.text}
        onClose={() => setShowModal(false)}
        isError={message.type === "error"}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Type
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {formData.vendor_type === "Individual" ? (
                  <User className="h-5 w-5 text-gray-400" />
                ) : (
                  <Briefcase className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <select
                name="vendor_type"
                value={formData.vendor_type}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Category
            </label>
            <select
              name="vendor_category"
              value={formData.vendor_category}
              onChange={handleChange}
              className={`block w-full pl-3 pr-3 py-2 border ${errors.vendor_category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent`}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.vendor_category && (
              <p className="mt-1 text-sm text-red-600">{errors.vendor_category}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Vendor Name"
            name="vendor_name"
            value={formData.vendor_name}
            onChange={handleChange}
            icon={formData.vendor_type === "Individual" ? User : Briefcase}
            error={errors.vendor_name}
            placeholder="e.g. John Doe or Acme Corp"
          />

          <InputField
            label="Email"
            name="vendor_email"
            value={formData.vendor_email}
            onChange={handleChange}
            type="email"
            icon={Mail}
            error={errors.vendor_email}
            placeholder="vendor@example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Phone"
            name="vendor_phone"
            value={formData.vendor_phone}
            onChange={handleChange}
            icon={Phone}
            error={errors.vendor_phone}
            placeholder="+1 (555) 123-4567"
          />

          <InputField
            label="Address"
            name="vendor_address"
            value={formData.vendor_address}
            onChange={handleChange}
            icon={MapPin}
            placeholder="123 Main Street"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="City"
            name="vendor_city"
            value={formData.vendor_city}
            onChange={handleChange}
          />

          <InputField
            label="State/Province"
            name="vendor_state"
            value={formData.vendor_state}
            onChange={handleChange}
          />

          <InputField
            label="Postal Code"
            name="vendor_postal_code"
            value={formData.vendor_postal_code}
            onChange={handleChange}
          />
        </div>

        <InputField
          label="Country"
          name="vendor_country"
          value={formData.vendor_country}
          onChange={handleChange}
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vendor Image
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
                <input
                  type="file"
                  name="vendor_image"
                  onChange={handleChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
            {imagePreview && (
              <div className="flex-shrink-0">
                <div className="relative h-24 w-24 rounded-md overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Vendor preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
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
              });
              setImagePreview(null);
              setErrors({});
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Submit Vendor'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVendorForm;