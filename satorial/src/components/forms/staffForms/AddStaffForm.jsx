import { useState, useRef } from "react";
import { X, Upload, Eye, EyeOff } from "lucide-react";
import StaffService from "../../../services/StaffService";
import { toast } from "react-toastify";

const AddStaffForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
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
    gender: "male",
    avatar: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone_number: formData.phone,
      department: formData.department,
      staff_role: formData.staff_role,
      password: formData.password,
      salary: formData.salary,
      employment_date: formData.employmentDate,
      birthday_date: formData.birthdayDate,
      gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1),
      avatar: formData.avatar,
    };

    try {
      const response = await StaffService.addStaff(payload);
      toast.success("Staff created successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create staff. Check input.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900">Add Staff</h2>
        <p className="text-gray-600 mb-4">Personal Details</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Avatar Upload Section */}
          <div className="col-span-2 flex items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No photo</span>
                </div>
              )}
            </div>
            <div>
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
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border rounded-md"
              >
                <Upload size={16} /> 
                {avatarPreview ? "Change Photo" : "Upload Photo"}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG (Max 2MB)
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Department</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="IT">IT</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Role *</label>
            <select
              name="staff_role"
              value={formData.staff_role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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

          <div className="relative">
            <label className="text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-8 right-3 text-blue-600"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
            <button
              type="button"
              onClick={generatePassword}
              className="absolute top-8 right-12 text-blue-600 text-sm"
            >
              Generate
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Salary *
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="200000"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Employment Date *
            </label>
            <input
              type="date"
              name="employmentDate"
              value={formData.employmentDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Birthday Date *
            </label>
            <input
              type="date"
              name="birthdayDate"
              value={formData.birthdayDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="mr-1"
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="mr-1"
                />
                Female
              </label>
            </div>
          </div>

          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffForm;