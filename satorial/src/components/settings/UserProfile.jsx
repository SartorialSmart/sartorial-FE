import React, { useEffect, useState } from "react";
import AuthService from "../../services/AuthService";
import { useAuth } from "../../contexts/AuthContext";
import { message } from "antd";
import { InputField } from "../common/FormComponents";
import { extractErrorMessage, extractFieldErrors } from "../../../utils/errorUtils";

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
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await AuthService.updateProfile(form);
      setUser(updatedUser);

      try {
        await fetchAuthenticatedUser();
      } catch (e) {
        console.log("Could not fetch authenticated user:", e);
      }

      message.success("Profile updated");
      setErrors({});
    } catch (err) {
      console.error("Save error:", err);
      const fieldErrs = extractFieldErrors(err);
      if (fieldErrs) {
        setErrors(fieldErrs);
      }
      message.error(extractErrorMessage(err, "Failed to update profile"));
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
