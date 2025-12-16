// services/settingsServices/OrganizationProfileService.js

import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const OrganizationProfileService = {
  /**
   * Get organization profile
   * @returns {Promise} Organization profile data
   */
  getProfile: async () => {
    try {
      const response = await axiosInstance.get(API.SETTINGS.PROFILE.GET);
      return response.data;
    } catch (error) {
      console.error("Error fetching organization profile:", error);
      throw error;
    }
  },

  /**
   * Update organization profile
   * @param {Object} payload - Profile data
   * @param {boolean} isFormData - Whether payload is FormData (for logo upload)
   * @returns {Promise} Updated profile data
   */
  updateProfile: async (payload, isFormData = false) => {
    try {
      const config = isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : {};

      const response = await axiosInstance.put(
        API.SETTINGS.PROFILE.UPDATE,
        payload,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error updating organization profile:", error);
      throw error;
    }
  },

  /**
   * Update logo only
   * @param {File} logoFile - Logo file
   * @returns {Promise} Updated profile data
   */
  updateLogo: async (logoFile) => {
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      const response = await axiosInstance.put(
        API.SETTINGS.PROFILE.UPDATE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating logo:", error);
      throw error;
    }
  },

  /**
   * Update brand colors
   * @param {Object} colors - Primary and secondary colors
   * @returns {Promise} Updated profile data
   */
  updateBrandColors: async (colors) => {
    try {
      const response = await axiosInstance.put(API.SETTINGS.PROFILE.UPDATE, {
        primary_color: colors.primary,
        secondary_color: colors.secondary,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating brand colors:", error);
      throw error;
    }
  },

  /**
   * Update social media handles
   * @param {Object} socialMedia - Social media handles
   * @returns {Promise} Updated profile data
   */
  updateSocialMedia: async (socialMedia) => {
    try {
      const response = await axiosInstance.put(
        API.SETTINGS.PROFILE.UPDATE,
        socialMedia
      );
      return response.data;
    } catch (error) {
      console.error("Error updating social media:", error);
      throw error;
    }
  },

  /**
   * Update business address
   * @param {Object} address - Address data
   * @returns {Promise} Updated profile data
   */
  updateAddress: async (address) => {
    try {
      const response = await axiosInstance.put(
        API.SETTINGS.PROFILE.UPDATE,
        address
      );
      return response.data;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },
};

export default OrganizationProfileService;