// components/forms/staffForms/EditStaffForm.jsx

import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, Landmark, MapPin, ChevronDown } from "lucide-react";
import StaffService from "../../../services/staffServices/StaffService";
import RolesService from "../../../services/settings/RolesService";
import SettingsService from "../../../services/settings";
import LocationService from "../../../services/LocationService";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import dayjs from "dayjs";

const EditStaffForm = ({ staff, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    department: "",
    staff_role: "",
    salary: "",
    gender: "Male",
    employment_date: "",
    birthday_date: "",
    address: "",
    bank_name: "",
    account_number: "",
    location: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!staff) return;

    setFormData({
      first_name: staff.first_name || "",
      last_name: staff.last_name || "",
      email: staff.email || "",
      phone_number: staff.phone_number || "",
      department: staff.department || "",
      staff_role: staff.staff_role || "",
      salary: staff.salary || "",
      gender: staff.gender || "Male",
      employment_date: staff.employment_date
        ? dayjs(staff.employment_date).format("YYYY-MM-DD")
        : "",
      birthday_date: staff.birthday_date
        ? dayjs(staff.birthday_date).format("YYYY-MM-DD")
        : "",
      address: staff.address || "",
      bank_name: staff.bank_name || "",
      account_number: staff.account_number || "",
      location: staff.location || null,
    });
    setAvatarPreview(staff.avatar_url || staff.avatar || null);

    Promise.allSettled([
      SettingsService.Departments.getDepartments(),
      RolesService.getRoles(),
      LocationService.listLocations(),
    ])
      .then(([deptRes, roleRes, locRes]) => {
        const deptList =
          deptRes.status === "fulfilled"
            ? Array.isArray(deptRes.value)
              ? deptRes.value
              : deptRes.value?.results || []
            : [];
        const roleList =
          roleRes.status === "fulfilled"
            ? Array.isArray(roleRes.value)
              ? roleRes.value
              : roleRes.value?.results || []
            : [];
        const locList =
          locRes.status === "fulfilled"
            ? Array.isArray(locRes.value)
              ? locRes.value
              : locRes.value?.results || []
            : [];
        setDepartments(deptList);
        setRoles(roleList);
        setLocations(locList);

        // Resolve stored department value (name or legacy ID) to its display
        // name so the select shows the correct option.
        setFormData((prev) => {
          const raw = prev.department || "";
          const match =
            deptList.find((d) => d.id === raw) ||
            deptList.find(
              (d) => d.name?.toLowerCase() === String(raw).toLowerCase()
            );
          return match ? { ...prev, department: match.name } : prev;
        });
      })
      .finally(() => setLoading(false));
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const newErrors = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.department) {
      newErrors.department = "Please select a department";
    }
    if (!formData.staff_role) {
      newErrors.staff_role = "Please select a staff role";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the highlighted required fields.");
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          payload.append(key, value);
        }
      });
      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      await StaffService.updateStaff(staff.slug, payload);

      toast.success("Staff updated successfully");
      if (onSaved) onSaved();
      onClose();
    } catch (error) {
      console.error("Error updating staff:", error.response?.data || error);
      const errData = error.response?.data;
      if (errData && typeof errData === "object") {
        Object.entries(errData).forEach(([field, msgs]) => {
          toast.error(
            `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
          );
        });
      } else {
        toast.error("Failed to update staff");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-6 pb-6 border-b">
        <div className="relative">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-gray-100">
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
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            <Upload size={18} />
            {avatarFile ? "Change Photo" : "Change Photo"}
          </button>
          <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF (Max 2MB)</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.first_name ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.last_name ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full appearance-none bg-white text-gray-900 px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer ${
                  errors.department ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="staff_role"
                value={formData.staff_role}
                onChange={handleChange}
                className={`w-full appearance-none bg-white text-gray-900 px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer ${
                  errors.staff_role ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id || role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            {errors.staff_role && (
              <p className="text-red-500 text-sm mt-1">{errors.staff_role}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary (₦)
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === "Male"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
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
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Female</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Date
            </label>
            <input
              type="date"
              name="employment_date"
              value={formData.employment_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birthday Date
            </label>
            <input
              type="date"
              name="birthday_date"
              value={formData.birthday_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
              />
              <select
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="w-full appearance-none bg-white text-gray-900 pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="">No Location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.category})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Enter staff address"
        />
      </div>

      {/* Bank Information */}
      <div className="pt-6 border-t">
        <div className="flex items-center gap-2 mb-4">
          <Landmark size={18} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Bank Information
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Optional — for salary payments
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <input
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g. Access Bank"
            />
          </div>
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
                handleChange({ target: { name: "account_number", value: val } });
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="0123456789"
              maxLength={10}
              inputMode="numeric"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>Save Changes</>
          )}
        </button>
      </div>
    </form>
  );
};

EditStaffForm.propTypes = {
  staff: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
};

export default EditStaffForm;
