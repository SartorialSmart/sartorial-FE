// components/forms/staffForms/AddStaffForm.jsx

import { useState, useRef, useEffect } from "react";
import { X, Upload, Eye, EyeOff, Loader2 } from "lucide-react";
import StaffService from "../../../services/staffServices/StaffService";
import SettingsService from "../../../services/settings";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import SuccessModal from "../../modals/SuccessModal";

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
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [successModal, setSuccessModal] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await SettingsService.Departments.getDepartments();
      setDepartments(data);
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 
            hover:bg-gray-100 rounded-full p-2 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Staff</h2>
          <p className="text-gray-600 mt-1">
            Fill in the details to add a new staff member
          </p>
        </div>

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
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={loadingDepartments}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
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
              <select
                name="staff_role"
                value={formData.staff_role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors"
                required
              >
                <option value="">Select Role</option>
                <option value="Tailor">Tailor</option>
                <option value="Designer">Designer</option>
                <option value="Driver">Driver</option>
                <option value="Accountant">Accountant</option>
                <option value="Procurement_Manager">Procurement Manager</option>
              </select>
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
      </div>
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
    </div>
  );
};

AddStaffForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onStaffCreated: PropTypes.func,
};

export default AddStaffForm;
