import React, { useEffect, useState } from "react";
import AuthService from "../../services/AuthService";
import { useAuth } from "../../contexts/AuthContext";
import { message } from "antd";
import { InputField } from "../common/FormComponents";

const UserProfile = () => {
  const { user, fetchAuthenticatedUser, setUser } = useAuth();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSave = async () => {
    console.log("Saving profile...", form);
    setSaving(true);
    try {
      const updated = await AuthService.updateAuthenticatedUser({
        first_name: form.first_name,
        last_name: form.last_name,
      });
      console.log("Profile updated successfully:", updated);
      
      // Optimistically update local auth user so navbar reflects change immediately
      try {
        setUser((prev) => ({ ...(prev || {}), ...{ first_name: form.first_name, last_name: form.last_name }, ...(updated || {}) }));
      } catch (e) {
        console.log("Could not update setUser:", e);
      }

      // attempt to refresh authoritative user data
      try {
        await fetchAuthenticatedUser();
      } catch (e) {
        console.log("Could not fetch authenticated user:", e);
      }

      message.success("Profile updated");
      setErrors({});
    } catch (err) {
      console.error("Save error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      const resp = err.response?.data;
      if (resp && typeof resp === "object") {
        const fieldErrors = {};
        Object.entries(resp).forEach(([k, v]) => {
          fieldErrors[k] = Array.isArray(v) ? v.join(" ") : String(v);
        });
        setErrors(fieldErrors);
        message.error("Please fix the highlighted errors");
      } else {
        message.error(err.response?.status === 404 
          ? "Profile update endpoint not found. Please check API configuration." 
          : "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Account</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="First name"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          error={errors.first_name}
        />

        <InputField
          label="Last name"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          error={errors.last_name}
        />

        <InputField
          label="Email"
          name="email"
          value={form.email}
          onChange={() => {}}
          disabled
        />
      </div>

      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={saving || Object.keys(errors).some((k) => errors[k])}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
