// services/settingsServices/InvoiceSettingsService.js

import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const InvoiceSettingsService = {
  /**
   * Get invoice settings
   * @returns {Promise} Invoice settings data
   */
  getSettings: async () => {
    try {
      const response = await axiosInstance.get(API.SETTINGS.INVOICE.GET);
      return response.data;
    } catch (error) {
      console.error("Error fetching invoice settings:", error);
      throw error;
    }
  },

  /**
   * Update invoice settings
   * @param {Object} payload - Invoice settings data
   * @returns {Promise} Updated settings
   */
  updateSettings: async (payload) => {
    try {
      const response = await axiosInstance.put(
        API.SETTINGS.INVOICE.UPDATE,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating invoice settings:", error);
      throw error;
    }
  },

  /**
   * Update invoice header
   * @param {string} headerText - Header text
   * @returns {Promise} Updated settings
   */
  updateHeader: async (headerText) => {
    try {
      const response = await axiosInstance.put(API.SETTINGS.INVOICE.UPDATE, {
        header_text: headerText,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating invoice header:", error);
      throw error;
    }
  },

  /**
   * Update invoice footer
   * @param {string} footerText - Footer text
   * @returns {Promise} Updated settings
   */
  updateFooter: async (footerText) => {
    try {
      const response = await axiosInstance.put(API.SETTINGS.INVOICE.UPDATE, {
        footer_text: footerText,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating invoice footer:", error);
      throw error;
    }
  },

  /**
   * Update tax settings
   * @param {Object} taxSettings - Tax configuration
   * @returns {Promise} Updated settings
   */
  updateTaxSettings: async (taxSettings) => {
    try {
      const response = await axiosInstance.put(
        API.SETTINGS.INVOICE.UPDATE,
        taxSettings
      );
      return response.data;
    } catch (error) {
      console.error("Error updating tax settings:", error);
      throw error;
    }
  },

  /**
   * Update payment information
   * @param {Object} paymentInfo - Payment details
   * @returns {Promise} Updated settings
   */
  updatePaymentInfo: async (paymentInfo) => {
    try {
      const response = await axiosInstance.put(
        API.SETTINGS.INVOICE.UPDATE,
        paymentInfo
      );
      return response.data;
    } catch (error) {
      console.error("Error updating payment information:", error);
      throw error;
    }
  },
};

export default InvoiceSettingsService;