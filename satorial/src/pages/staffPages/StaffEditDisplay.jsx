import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import StaffService from "../../services/staffServices/StaffService";
import StaffRoleService from "../../services/staffServices/StaffRoleService";
import RolesService from "../../services/settings/RolesService";
import SettingsService from "../../services/settings";
import { extractErrorMessage } from "../../../utils/errorUtils";
import StaffSideBarLayout from "../../components/navs/StaffSideBarLayout";

const StaffEditDisplay = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    department: "",
    staff_role: "",
    salary: "",
    gender: "Male",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // allSettled so a single failing sub-request (e.g. roles/departments)
        // never blanks the whole page with "failed to load staff details".
        const [staffRes, deptRes, roleRes, usersRoleRes] = await Promise.allSettled([
          StaffService.getStaffDetail(slug),
          SettingsService.Departments.getDepartments(),
          RolesService.getRoles(),
          StaffRoleService.listRoles(),
        ]);

        const staffData = staffRes.status === "fulfilled" ? staffRes.value : null;
        if (!staffData) {
          toast.error("Failed to load staff details");
          return;
        }

        const departments = Array.isArray(deptRes.value)
          ? deptRes.value
          : deptRes.value?.results || [];
        setDepartments(departments);

        // Resolve the stored department value (name or legacy ID) to its
        // display name so the department select shows the correct option.
        let departmentValue = staffData.department || "";
        const departmentMatch =
          departments.find((d) => d.id === departmentValue) ||
          departments.find(
            (d) => d.name?.toLowerCase() === String(departmentValue).toLowerCase()
          );
        if (departmentMatch) departmentValue = departmentMatch.name;

        setFormData({
          first_name: staffData.first_name || "",
          last_name: staffData.last_name || "",
          email: staffData.email || "",
          phone_number: staffData.phone_number || "",
          department: departmentValue,
          staff_role: staffData.staff_role || "",
          salary: staffData.salary || "",
          gender: staffData.gender || "Male",
        });

        // Prefer /settings/roles (custom roles), fall back to /users/staff-roles.
        const settingsRoles =
          roleRes.status === "fulfilled"
            ? Array.isArray(roleRes.value)
              ? roleRes.value
              : roleRes.value?.results || []
            : [];
        const usersRoles =
          usersRoleRes.status === "fulfilled"
            ? Array.isArray(usersRoleRes.value)
              ? usersRoleRes.value
              : usersRoleRes.value?.results || []
            : [];
        const merged = [...settingsRoles, ...usersRoles];
        const seen = new Set();
        const uniqueRoles = merged.filter((role) => {
          const key = role.name?.toLowerCase() || role.id;
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setRoles(uniqueRoles);
      } catch (error) {
        console.error("Error loading staff:", error);
        toast.error("Failed to load staff details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        department: formData.department,
        staff_role: formData.staff_role,
        gender: formData.gender,
      };
      if (formData.salary) payload.salary = formData.salary;

      await StaffService.updateStaff(slug, payload);
      toast.success("Staff updated successfully");
      navigate(`/staff/staff-detail/${slug}`);
    } catch (error) {
      console.error("Error updating staff:", error.response?.data || error);
      toast.error(extractErrorMessage(error, "Failed to update staff"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <StaffSideBarLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        </div>
      </StaffSideBarLayout>
    );
  }

  return (
    <StaffSideBarLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Staff</h1>
            <p className="text-sm text-gray-500 mt-1">
              {formData.first_name} {formData.last_name}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Optional: staff without system access need no email at all.
                  The API refuses to clear it for someone who signs in. */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Staff Role</label>
                <select
                  name="staff_role"
                  value={formData.staff_role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id || role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary (₦)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Female</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Link to={`/staff/staff-detail/${slug}`} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : "Update Staff"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StaffSideBarLayout>
  );
};

export default StaffEditDisplay;
