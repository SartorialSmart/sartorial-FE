// services/settingsServices/InvoiceSettingsService.js

import { apiGet, apiPut } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const InvoiceSettingsService = {
  /**
   * Get invoice settings
   * @returns {Promise} Invoice settings data
   */
  getSettings: () => apiGet(API.SETTINGS.INVOICE.GET),

  /**
   * Update invoice settings
   * @param {Object} payload - Invoice settings data
   * @returns {Promise} Updated settings
   */
  updateSettings: (payload) =>
    apiPut(API.SETTINGS.INVOICE.UPDATE, payload),

  /**
   * Update invoice header
   * @param {string} headerText - Header text
   * @returns {Promise} Updated settings
   */
  updateHeader: (headerText) =>
    apiPut(API.SETTINGS.INVOICE.UPDATE, { header_text: headerText }),

  /**
   * Update invoice footer
   * @param {string} footerText - Footer text
   * @returns {Promise} Updated settings
   */
  updateFooter: (footerText) =>
    apiPut(API.SETTINGS.INVOICE.UPDATE, { footer_text: footerText }),

  /**
   * Update tax settings
   * @param {Object} taxSettings - Tax configuration
   * @returns {Promise} Updated settings
   */
  updateTaxSettings: (taxSettings) =>
    apiPut(API.SETTINGS.INVOICE.UPDATE, taxSettings),

  /**
   * Update payment information
   * @param {Object} paymentInfo - Payment details
   * @returns {Promise} Updated settings
   */
  updatePaymentInfo: (paymentInfo) =>
    apiPut(API.SETTINGS.INVOICE.UPDATE, paymentInfo),
};

export default InvoiceSettingsService;
