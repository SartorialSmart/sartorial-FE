// services/settingsServices/OrganizationProfileService.js

import { apiGet, apiPut } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const OrganizationProfileService = {
  /**
   * Get organization profile
   * @returns {Promise} Organization profile data
   */
  getProfile: () => apiGet(API.SETTINGS.PROFILE.GET),

  /**
   * Update organization profile
   * @param {Object} payload - Profile data
   * @param {boolean} isFormData - Whether payload is FormData (for logo upload)
   * @returns {Promise} Updated profile data
   */
  updateProfile: (payload, isFormData = false) => {
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    return apiPut(API.SETTINGS.PROFILE.UPDATE, payload, config);
  },

  /**
   * Update logo only
   * @param {File} logoFile - Logo file
   * @returns {Promise} Updated profile data
   */
  updateLogo: (logoFile) => {
    const formData = new FormData();
    formData.append("logo", logoFile);
    return apiPut(API.SETTINGS.PROFILE.UPDATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Update brand colors
   * @param {Object} colors - Primary and secondary colors
   * @returns {Promise} Updated profile data
   */
  updateBrandColors: (colors) =>
    apiPut(API.SETTINGS.PROFILE.UPDATE, {
      primary_color: colors.primary,
      secondary_color: colors.secondary,
    }),

  /**
   * Update social media handles
   * @param {Object} socialMedia - Social media handles
   * @returns {Promise} Updated profile data
   */
  updateSocialMedia: (socialMedia) =>
    apiPut(API.SETTINGS.PROFILE.UPDATE, socialMedia),

  /**
   * Update business address
   * @param {Object} address - Address data
   * @returns {Promise} Updated profile data
   */
  updateAddress: (address) =>
    apiPut(API.SETTINGS.PROFILE.UPDATE, address),
};

export default OrganizationProfileService;
