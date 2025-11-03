import { useState } from "react";
import temp1 from "../../assets/images/temp1.svg";
import temp2 from "../../assets/images/temp2.svg";

export default function InvoiceContent() {
  // Add new state for format and layout
  const [invoiceSettings, setInvoiceSettings] = useState({
    emailDelivery: "no",
    smsDelivery: "no",
    autoSend: "no",
    fileFormat: "pdf",
    selectedLayout: "layout1",
  });

  const handleSettingChange = (setting, value) => {
    setInvoiceSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium">Invoice Settings</h2>
        <hr className="mb-6 mt-2" />

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
                  onChange={(e) =>
                    handleSettingChange("emailDelivery", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleSettingChange("emailDelivery", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleSettingChange("smsDelivery", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleSettingChange("smsDelivery", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleSettingChange("autoSend", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleSettingChange("autoSend", e.target.value)
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-medium mb-4">Invoice Theme and Layout</h2>
        <hr className="mb-6 mt-2" />

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
                onChange={(e) =>
                  handleSettingChange("fileFormat", e.target.value)
                }
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
                onChange={(e) =>
                  handleSettingChange("fileFormat", e.target.value)
                }
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
                onChange={(e) =>
                  handleSettingChange("fileFormat", e.target.value)
                }
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
                  ? `border-2 border-[#D83854]`
                  : `border border-gray-200`
              }`}
              onClick={() => handleSettingChange("selectedLayout", "layout1")}
            >
              <img
                src={temp1}
                alt="Invoice Layout 1"
                className="w-full rounded-[12px]"
              />
              <div className="absolute top-2 right-2">
                {invoiceSettings.selectedLayout === "layout1" && (
                  <div className="w-6 h-6 bg-[#D83854] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`relative cursor-pointer rounded-[12px] ${
                invoiceSettings.selectedLayout === "layout2"
                  ? `border-2 border-[#D83854]`
                  : `border border-gray-200`
              }`}
              onClick={() => handleSettingChange("selectedLayout", "layout2")}
            >
              <img
                src={temp2}
                alt="Invoice Layout 2"
                className="w-full rounded-[12px]"
              />
              <div className="absolute top-2 right-2">
                {invoiceSettings.selectedLayout === "layout2" && (
                  <div className="w-6 h-6 bg-[#D83854] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
