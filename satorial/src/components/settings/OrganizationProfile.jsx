// components/settings/OrganizationProfile.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  Upload,
  Save,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import { motion } from "framer-motion";
import { message } from "antd";
import SettingsService from "../../services/settings";
import {
  FormSection,
  InputField,
  TextAreaField,
  FileUpload,
} from "../common/FormComponents";
import SuccessModal from "../modals/SuccessModal";
import { saveImageLocally, getLocalImage, saveProfileLocally, getLocalProfile, STORAGE_KEYS } from "../../utils/localImageService";

const OrganizationProfile = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    business_name: "",
    business_email: "",
    business_phone: "",
    business_description: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    logo: null,
    logo_url: "",
    primary_color: "#3B82F6",
    secondary_color: "#10B981",
    instagram_handle: "",
    twitter_handle: "",
    facebook_handle: "",
    linkedin_handle: "",
    website_url: "",
    currency: "NGN",
    timezone: "Africa/Lagos",
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [successModal, setSuccessModal] = useState(null);

  const predefinedColors = [
    "#EF4444",
    "#10B981",
    "#8B5CF6",
    "#3B82F6",
    "#F59E0B",
    "#EC4899",
    "#14B8A6",
    "#000000",
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await SettingsService.Profile.getProfile();
      const localLogo = getLocalImage(STORAGE_KEYS.LOGO);
      const profileData = { ...data, logo_url: localLogo || data.logo_url };
      setProfile(profileData);
      setLogoPreview(localLogo || data.logo_url);
      saveProfileLocally(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      const localProfile = getLocalProfile();
      if (localProfile) {
        const localLogo = getLocalImage(STORAGE_KEYS.LOGO);
        setProfile({ ...localProfile, logo_url: localLogo || localProfile.logo_url || "" });
        setLogoPreview(localLogo || localProfile.logo_url || null);
      } else {
        message.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
      await saveImageLocally(file, STORAGE_KEYS.LOGO);
    }
  };

  const handleColorSelect = (color) => {
    setProfile((prev) => ({ ...prev, primary_color: color }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profile.business_name?.trim()) {
      newErrors.business_name = "Business name is required";
    }

    if (profile.business_email && !/\S+@\S+\.\S+/.test(profile.business_email)) {
      newErrors.business_email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Please fix the errors before saving");
      return;
    }

    try {
      setSaving(true);
      const { logo: profileLogo, ...profileForLocal } = profile;
      saveProfileLocally(profileForLocal);

      if (profileLogo && typeof profileLogo !== "string") {
        const formData = new FormData();
        Object.entries(profile).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value);
          }
        });

        await SettingsService.Profile.updateProfile(formData, true);
      } else {
        const { logo: _logo, logo_url, ...updateData } = profile;
        await SettingsService.Profile.updateProfile(updateData);
      }

      setSuccessModal({
        title: "Profile Saved",
        message: "Your organization profile has been updated successfully.",
        buttonText: "Done",
      });
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      if (import.meta.env.DEV || location.hostname === "localhost") {
        setSuccessModal({
          title: "Profile Saved Locally",
          message: "Could not reach the server, but your data has been saved locally for preview.",
          buttonText: "Done",
        });
      } else {
        message.error(error.response?.data?.detail || "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Business Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FormSection
          title="Business Information"
          description="Basic information about your organization"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Business Name"
              name="business_name"
              value={profile.business_name}
              onChange={handleChange}
              error={errors.business_name}
              icon={Building2}
              required
            />
            <InputField
              label="Business Email"
              name="business_email"
              type="email"
              value={profile.business_email}
              onChange={handleChange}
              error={errors.business_email}
              icon={Mail}
            />
            <InputField
              label="Business Phone"
              name="business_phone"
              type="tel"
              value={profile.business_phone}
              onChange={handleChange}
              icon={Phone}
            />
            <InputField
              label="Website"
              name="website_url"
              type="url"
              value={profile.website_url}
              onChange={handleChange}
              icon={Globe}
              placeholder="https://example.com"
            />
          </div>

          <TextAreaField
            label="Business Description"
            name="business_description"
            value={profile.business_description}
            onChange={handleChange}
            placeholder="Tell us about your business..."
            rows={4}
          />
        </FormSection>
      </motion.div>

      {/* Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FormSection
          title="Business Address"
          description="Physical location of your business"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <InputField
                label="Address Line 1"
                name="address_line1"
                value={profile.address_line1}
                onChange={handleChange}
                icon={MapPin}
                placeholder="Street address"
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="Address Line 2"
                name="address_line2"
                value={profile.address_line2}
                onChange={handleChange}
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>
            <InputField
              label="City"
              name="city"
              value={profile.city}
              onChange={handleChange}
              placeholder="City"
            />
            <InputField
              label="State/Province"
              name="state"
              value={profile.state}
              onChange={handleChange}
              placeholder="State"
            />
            <InputField
              label="Country"
              name="country"
              value={profile.country}
              onChange={handleChange}
              placeholder="Country"
            />
            <InputField
              label="Postal Code"
              name="postal_code"
              value={profile.postal_code}
              onChange={handleChange}
              placeholder="Postal code"
            />
          </div>
        </FormSection>
      </motion.div>

      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <FormSection
          title="Branding"
          description="Customize your organization's visual identity"
        >
          <FileUpload
            label="Company Logo"
            name="logo"
            onChange={handleLogoChange}
            accept="image/*"
            preview={logoPreview}
          />

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-4">
              <div className="flex gap-2 flex-wrap">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      profile.primary_color === color
                        ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={profile.primary_color}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <Palette
                    size={16}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white"
                  />
                </div>
              </div>
              <div
                className="w-20 h-10 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: profile.primary_color }}
              />
              <span className="text-sm font-mono text-gray-600">
                {profile.primary_color}
              </span>
            </div>
          </div>
        </FormSection>
      </motion.div>

      {/* Social Media */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <FormSection
          title="Social Media"
          description="Connect your social media accounts"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Instagram"
              name="instagram_handle"
              value={profile.instagram_handle}
              onChange={handleChange}
              icon={Instagram}
              placeholder="@username"
            />
            <InputField
              label="Twitter"
              name="twitter_handle"
              value={profile.twitter_handle}
              onChange={handleChange}
              icon={Twitter}
              placeholder="@username"
            />
            <InputField
              label="Facebook"
              name="facebook_handle"
              value={profile.facebook_handle}
              onChange={handleChange}
              icon={Facebook}
              placeholder="username or page"
            />
            <InputField
              label="LinkedIn"
              name="linkedin_handle"
              value={profile.linkedin_handle}
              onChange={handleChange}
              icon={Linkedin}
              placeholder="company-name"
            />
          </div>
        </FormSection>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg 
            hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>
      {successModal && (
        <SuccessModal
          {...successModal}
          onClose={() => setSuccessModal(null)}
        />
      )}
    </form>
  );
};

export default OrganizationProfile;
