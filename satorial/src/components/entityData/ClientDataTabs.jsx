import { useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import GeneralInfo from "./clientDtabs/ClientGeneralInfo";
import ClientMeasurementInfo from "./clientDtabs/ClientMeasurementInfo";
import ClientDesignsInfo from "./clientDtabs/ClientDesignsInfo";
import ClientOrderHistory from "./clientDtabs/ClientOrderHistory";

const tabs = [
  { id: "General", label: "General Info" },
  { id: "Measurements", label: "Measurements" },
  { id: "Clients Designs", label: "Design Gallery" },
  { id: "Order History", label: "Order History" }
];

const ClientData = () => {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState("General");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium transition-colors">
            Dashboard
          </span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium transition-colors">
            Clients
          </span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-gray-700 font-semibold">Client Details</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Client Details
          </h1>
          <p className="text-gray-600">
            Manage and view comprehensive client information
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative flex-1 min-w-[150px] px-6 py-4 font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === "General" && <GeneralInfo clientId={clientId} />}
          {activeTab === "Measurements" && (
            <ClientMeasurementInfo clientId={clientId} />
          )}
          {activeTab === "Clients Designs" && (
            <ClientDesignsInfo clientId={clientId} />
          )}
          {activeTab === "Order History" && (
            <ClientOrderHistory clientId={clientId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientData;