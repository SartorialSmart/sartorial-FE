import { useState, useEffect } from "react";
import { message } from "antd";
import temp1 from "../../assets/images/temp1.svg";
import temp2 from "../../assets/images/temp2.svg";
import SettingsService from "../../services/settings";
import { saveInvoiceSettingsLocally, getLocalInvoiceSettings } from "../../utils/localImageService";

const DEFAULT_SETTINGS = {
  emailDelivery: "no",
  smsDelivery: "no",
  autoSend: "no",
  fileFormat: "pdf",
  selectedLayout: "layout1",
  vatEnabled: false,
  vatRate: 7.5,
};

export default function InvoiceContent() {
  const [invoiceSettings, setInvoiceSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const local = getLocalInvoiceSettings();
      const data = await SettingsService.Invoice.getSettings();
      const mapped = {
        emailDelivery: data.email_delivery ?? local?.emailDelivery ?? "no",
        smsDelivery: data.sms_delivery ?? local?.smsDelivery ?? "no",
        autoSend: data.auto_send ?? local?.autoSend ?? "no",
        fileFormat: data.file_format ?? local?.fileFormat ?? "pdf",
        selectedLayout: data.selected_layout ?? local?.selectedLayout ?? "layout1",
        vatEnabled: data.vat_enabled ?? local?.vatEnabled ?? false,
        vatRate: data.vat_rate ?? local?.vatRate ?? 7.5,
      };
      setInvoiceSettings(mapped);
      saveInvoiceSettingsLocally(mapped);
    } catch (error) {
      console.error("Error fetching invoice settings:", error);
      const local = getLocalInvoiceSettings();
      if (local) {
        setInvoiceSettings(local);
      }
    } finally {
        setLoading(false);
    }
  };

  const handleSettingChange = (setting, value) => {
    setInvoiceSettings((prev) => ({ ...prev, [setting]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        email_delivery: invoiceSettings.emailDelivery,
        sms_delivery: invoiceSettings.smsDelivery,
        auto_send: invoiceSettings.autoSend,
        file_format: invoiceSettings.fileFormat,
        selected_layout: invoiceSettings.selectedLayout,
        vat_enabled: invoiceSettings.vatEnabled,
        vat_rate: Number(invoiceSettings.vatRate),
      };
      saveInvoiceSettingsLocally(invoiceSettings);
      await SettingsService.Invoice.updateSettings(payload);
      message.success("Invoice settings saved successfully");
    } catch (error) {
      console.error("Error saving invoice settings:", error);
      const errMsg = typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.detail || error.response?.data?.email_delivery?.[0] || "Failed to save invoice settings";
      message.error(errMsg);
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium">Invoice Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure how invoices and receipts are generated</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
      <hr />

      <div className="space-y-8">
        {/* Email Delivery Setting */}
        <div className="space-y-2">
          <h3 className="font-medium">Send invoice/receipt via email</h3>
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="emailDelivery"
                value="yes"
                checked={invoiceSettings.emailDelivery === "yes"}
                onChange={(e) => handleSettingChange("emailDelivery", e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="emailDelivery"
                value="no"
                checked={invoiceSettings.emailDelivery === "no"}
                onChange={(e) => handleSettingChange("emailDelivery", e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>

        {/* SMS Delivery Setting */}
        <div className="space-y-2">
          <h3 className="font-medium">Send invoice/receipt via SMS</h3>
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="smsDelivery"
                value="yes"
                checked={invoiceSettings.smsDelivery === "yes"}
                onChange={(e) => handleSettingChange("smsDelivery", e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="smsDelivery"
                value="no"
                checked={invoiceSettings.smsDelivery === "no"}
                onChange={(e) => handleSettingChange("smsDelivery", e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>

        {/* Auto Send Setting */}
        <div className="space-y-2">
          <h3 className="font-medium">Send invoice automatically</h3>
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="autoSend"
                value="yes"
                checked={invoiceSettings.autoSend === "yes"}
                onChange={(e) => handleSettingChange("autoSend", e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="autoSend"
                value="no"
                checked={invoiceSettings.autoSend === "no"}
                onChange={(e) => handleSettingChange("autoSend", e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>

        {/* VAT Charges Setting */}
        <div className="space-y-3">
          <h3 className="font-medium">Enable VAT Charges</h3>
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="vatEnabled"
                value="yes"
                checked={invoiceSettings.vatEnabled === true}
                onChange={() => handleSettingChange("vatEnabled", true)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="vatEnabled"
                value="no"
                checked={invoiceSettings.vatEnabled === false}
                onChange={() => handleSettingChange("vatEnabled", false)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
          {invoiceSettings.vatEnabled && (
            <div className="mt-2">
              <label className="block text-sm text-gray-600 mb-1">
                VAT Rate (%) <span className="text-gray-400">(1.0 - 100.0)</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                step="0.1"
                value={invoiceSettings.vatRate}
                onChange={(e) => handleSettingChange("vatRate", Math.min(100, Math.max(1, Number(e.target.value))))}
                className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-medium mb-4">Invoice Theme and Layout</h2>
        <hr className="mb-6" />

        {/* File Format Section */}
        <div className="space-y-4 mb-8">
          <h3 className="font-medium">File format for invoice/receipt</h3>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="fileFormat"
                value="pdf"
                checked={invoiceSettings.fileFormat === "pdf"}
                onChange={(e) => handleSettingChange("fileFormat", e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">PDF</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="fileFormat"
                value="excel"
                checked={invoiceSettings.fileFormat === "excel"}
                onChange={(e) => handleSettingChange("fileFormat", e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">Excel</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="fileFormat"
                value="both"
                checked={invoiceSettings.fileFormat === "both"}
                onChange={(e) => handleSettingChange("fileFormat", e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">Both</span>
            </label>
          </div>
        </div>

        {/* Layout Selection Section */}
        <div className="space-y-4">
          <h3 className="font-medium">Choose invoice/receipt layout</h3>
          <div className="grid grid-cols-2 gap-6">
            <div
              className={`relative cursor-pointer rounded-[12px] ${
                invoiceSettings.selectedLayout === "layout1"
                  ? "border-2 border-[#D83854]"
                  : "border border-gray-200"
              }`}
              onClick={() => handleSettingChange("selectedLayout", "layout1")}
            >
              <img src={temp1} alt="Invoice Layout 1" className="w-full rounded-[12px]" />
              <div className="absolute top-2 right-2">
                {invoiceSettings.selectedLayout === "layout1" && (
                  <div className="w-6 h-6 bg-[#D83854] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-2 text-center text-sm font-medium text-gray-600">Classic Layout</div>
            </div>

            <div
              className={`relative cursor-pointer rounded-[12px] ${
                invoiceSettings.selectedLayout === "layout2"
                  ? "border-2 border-[#D83854]"
                  : "border border-gray-200"
              }`}
              onClick={() => handleSettingChange("selectedLayout", "layout2")}
            >
              <img src={temp2} alt="Invoice Layout 2" className="w-full rounded-[12px]" />
              <div className="absolute top-2 right-2">
                {invoiceSettings.selectedLayout === "layout2" && (
                  <div className="w-6 h-6 bg-[#D83854] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-2 text-center text-sm font-medium text-gray-600">Modern Layout</div>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </div>
  );
}
