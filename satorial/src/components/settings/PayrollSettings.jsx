import { useState } from "react";
import { motion } from "framer-motion";
import PayComponentsSettings from "./PayComponentsSettings";
import PayDeductionsSettings from "./PayDeductionsSettings";
import BonusRulesSettings from "./BonusRulesSettings";

const PayrollSettings = () => {
  const [activeTab, setActiveTab] = useState("components");

  const tabs = [
    { id: "components", label: "Pay Components" },
    { id: "deductions", label: "Deductions" },
    { id: "bonus-rules", label: "Bonus Rules" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "components":
        return <PayComponentsSettings />;
      case "deductions":
        return <PayDeductionsSettings />;
      case "bonus-rules":
        return <BonusRulesSettings />;
      default:
        return <PayComponentsSettings />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payroll Configuration</h2>
        <p className="text-gray-600 mt-1">
          Configure allowances, deductions, and performance-based bonus rules
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="payrollActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default PayrollSettings;
