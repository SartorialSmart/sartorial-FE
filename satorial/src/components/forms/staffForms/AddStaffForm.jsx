// components/forms/staffForms/AddStaffForm.jsx

import { useState, useRef, useEffect } from "react";
import { X, Upload, Eye, EyeOff, Loader2, Landmark, MapPin, ChevronDown } from "lucide-react";
import StaffService from "../../../services/staffServices/StaffService";
import RolesService from "../../../services/settings/RolesService";
import SettingsService from "../../../services/settings";
import LocationService from "../../../services/LocationService";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import SuccessModal from "../../modals/SuccessModal";

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

const AddStaffForm = ({ onClose, onStaffCreated }) => {
  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    staff_role: "",
    password: "",
    salary: "",
    employmentDate: "",
    birthdayDate: "",
    gender: "Male",
    avatar: null,
    bank_name: "",
    custom_bank_name: "",
    account_number: "",
    location: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [successModal, setSuccessModal] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
    fetchRoles();
    fetchLocations();
  }, []);

  // The backend only accepts these staff_role values, so the dropdown must
  // always offer them regardless of what /settings/roles/ returns.
  const DEFAULT_STAFF_ROLES = [
    { name: "Tailor" },
    { name: "Designer" },
    { name: "Driver" },
    { name: "Accountant" },
    { name: "Procurement_Manager" },
  ];

  const fetchRoles = async () => {
    try {
      const data = await RolesService.getRoles();
      const fetched = Array.isArray(data) ? data : data.results || [];
      setRoles(fetched.length ? fetched : DEFAULT_STAFF_ROLES);
    } catch {
      setRoles(DEFAULT_STAFF_ROLES);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await SettingsService.Departments.getDepartments();
      setDepartments(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
      // Fallback to default departments if fetch fails
      setDepartments([
        { id: "1", name: "HR" },
        { id: "2", name: "Finance" },
        { id: "3", name: "IT" },
        { id: "4", name: "Marketing" },
        { id: "5", name: "Sales" },
      ]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const data = await LocationService.listLocations();
      setLocations(Array.isArray(data) ? data : data.results || []);
    } catch {
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Set the file in formData
      setFormData({ ...formData, avatar: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeAvatar = () => {
    setFormData({ ...formData, avatar: null });
    setAvatarPreview(null);
  };

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    setSuccessModal({
      title: "Password Generated",
      message: "A secure password has been generated for this staff member.",
      buttonText: "Done",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    // Required field checks
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }

    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Phone validation (basic)
    if (formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    // Department validation
    if (!formData.department) {
      toast.error("Please select a department");
      return false;
    }

    // Role validation
    if (!formData.staff_role) {
      toast.error("Please select a staff role");
      return false;
    }

    // Salary validation
    if (parseFloat(formData.salary) <= 0) {
      toast.error("Salary must be greater than 0");
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }

    // Bank account validation
    if (formData.bank_name === "__other__" && !formData.custom_bank_name.trim()) {
      toast.error("Please enter a custom bank name");
      return false;
    }

    if (formData.account_number && !/^\d{10}$/.test(formData.account_number)) {
      toast.error("Account number must be exactly 10 digits");
      return false;
    }

    // Date validation
    const employmentDate = new Date(formData.employmentDate);
    const birthdayDate = new Date(formData.birthdayDate);
    const today = new Date();

    if (employmentDate > today) {
      toast.error("Employment date cannot be in the future");
      return false;
    }

    if (birthdayDate > today) {
      toast.error("Birthday date cannot be in the future");
      return false;
    }

    // Age validation (must be at least 18 years old)
    const age = today.getFullYear() - birthdayDate.getFullYear();
    if (age < 18) {
      toast.error("Staff member must be at least 18 years old");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const staffData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone.trim(),
        department: formData.department,
        staff_role: formData.staff_role,
        password: formData.password,
        salary: formData.salary,
        employment_date: formData.employmentDate,
        birthday_date: formData.birthdayDate,
        gender: formData.gender,
        avatar: formData.avatar,
        bank_name: formData.bank_name === "__other__"
          ? formData.custom_bank_name.trim()
          : formData.bank_name,
        account_number: formData.account_number || "",
        location: formData.location || null,
      };

      await StaffService.addStaff(staffData);
      setSuccessModal({
        title: "Staff Created",
        message: "The staff member has been created successfully.",
        buttonText: "Done",
      });
      setFormData(initialFormData);
      setAvatarPreview(null);

      // Call the refresh function if provided
      if (onStaffCreated) {
        onStaffCreated();
      }

    } catch (error) {
      console.error("Staff creation error:", error.response?.data || error);

      if (error.response?.data) {
        const errors = error.response.data;
        
        // Handle specific field errors
        if (errors.email) {
          toast.error(`Email: ${errors.email.join(", ")}`);
        } else if (errors.phone_number) {
          toast.error(`Phone: ${errors.phone_number.join(", ")}`);
        } else {
          // Generic error handling
          const validationErrors = Object.entries(errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
            .join("\n");
          toast.error(validationErrors);
        }
      } else {
        toast.error("Failed to create staff. Please check your input.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="flex items-center gap-6 pb-6 border-b">
            <div className="relative">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 
                      hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 
                  flex items-center justify-center border-4 border-gray-100">
                  <span className="text-gray-500 text-xs">No Photo</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerFileInput}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border-2 border-blue-600 
                  rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                <Upload size={18} />
                {avatarPreview ? "Change Photo" : "Upload Photo"}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF (Max 2MB)
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors"
                placeholder="John"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors"
                placeholder="Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors"
                placeholder="john.doe@example.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors"
                placeholder="08012345678"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={loadingDepartments}
                  className="w-full appearance-none bg-white text-gray-900 px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                  required
                >
                  <option value="">
                    {loadingDepartments ? "Loading departments..." : "Select Department"}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {loadingDepartments && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Loading departments...</span>
                </div>
              )}
            </div>

            {/* Staff Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="staff_role"
                  value={formData.staff_role}
                  onChange={handleChange}
                  className="w-full appearance-none bg-white text-gray-900 px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id || role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 pr-24 border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
                    hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                type="button"
                onClick={generatePassword}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Generate Strong Password
              </button>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors"
                placeholder="200000"
                min="0"
                step="1000"
                required
              />
            </div>

            {/* Employment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="employmentDate"
                value={formData.employmentDate}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors"
                required
              />
            </div>

            {/* Birthday Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birthday Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="birthdayDate"
                value={formData.birthdayDate}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors"
                required
              />
            </div>

            {/* Gender */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="text-gray-700">Male</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="text-gray-700">Female</span>
                </label>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loadingLocations}
                  className="w-full appearance-none bg-white text-gray-900 pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">
                    {loadingLocations
                      ? "Loading locations..."
                      : locations.length === 0
                        ? "No locations yet — add one under Inventory"
                        : "Select Location"}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.category})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {loadingLocations && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Loading locations...</span>
                </div>
              )}
            </div>
          </div>

          {/* Bank Information Section */}
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Landmark size={18} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Bank Information</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Optional — for salary payments</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <select
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-colors"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="custom_bank_name"
                    value={formData.custom_bank_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      transition-colors"
                    placeholder="Enter bank name"
                  />
                </div>
              )}

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, account_number: val });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-colors"
                  placeholder="0123456789"
                  maxLength={10}
                  inputMode="numeric"
                />
                {formData.account_number && formData.account_number.length !== 10 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Must be exactly 10 digits ({formData.account_number.length}/10)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 
                hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingDepartments}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>Save Staff</>
              )}
            </button>
          </div>
        </form>
      {successModal && (
        <SuccessModal
          {...successModal}
          onClose={() => {
            setSuccessModal(null);
            if (successModal.title === "Staff Created") {
              onClose();
            }
          }}
        />
      )}
    </>
  );
};

AddStaffForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onStaffCreated: PropTypes.func,
};

export default AddStaffForm;
