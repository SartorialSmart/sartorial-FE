// components/settings/SettingsProfile.jsx

import { useState } from "react";
import { motion } from "framer-motion";
import OrganizationProfile from "./OrganizationProfile";
import UserProfile from "./UserProfile";
import DepartmentsManagement from "./DepartmentsManagement";
import LocationManagement from "./LocationManagement";
import InvoiceContent from "./InvoiceContent";
import FabricsContent from "./FabricsContent";
import NotificationSettings from "./NotificationSettings";

const SettingsProfile = () => {
  const [activeTab, setActiveTab] = useState("Profile");

  const tabs = [
    { id: "Account", label: "Account" },
    { id: "Profile", label: "Organization Profile" },
    { id: "Departments", label: "Departments" },
    { id: "Locations", label: "Locations" },
    { id: "Invoice", label: "Invoice Settings" },
    { id: "Fabrics", label: "Fabrics Catalog" },
    { id: "Notifications", label: "Notifications" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Account":
        return <UserProfile />;
      case "Profile":
        return <OrganizationProfile />;
      case "Departments":
        return <DepartmentsManagement />;
      case "Locations":
        return <LocationManagement />;
      case "Invoice":
        return <InvoiceContent />;
      case "Fabrics":
        return <FabricsContent />;
      case "Notifications":
        return <NotificationSettings />;
      default:
        return <OrganizationProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your organization&apos;s settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-2">
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
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default SettingsProfile;