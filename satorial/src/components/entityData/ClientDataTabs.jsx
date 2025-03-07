import { useState } from "react";
import { Edit } from "lucide-react";
import { useParams } from "react-router-dom";
import GeneralInfo from "./clientDtabs/ClientGeneralInfo";
import ClientMeasurementInfo from "./clientDtabs/ClientMeasurementInfo";
import ClientDesignsInfo from "./clientDtabs/ClientDesignsInfo";
import ClientOrderHistory from "./clientDtabs/ClientOrderHistory";

const tabs = ["General", "Measurements", "Clients Designs", "Order History"];

const ClientData = () => {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState("General");
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="text-sm text-gray-500 mb-4">
        <span className="text-blue-600 cursor-pointer">Dashboard</span> &gt;
        <span className="text-blue-600 cursor-pointer"> Clients</span> &gt;
        <span className="text-gray-800 font-medium"> Client Details</span>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-sm font-light">Clients Details</h2>
        
      </div>


      <div className="flex border-b mt-4 text-gray-600">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`px-4 py-2 cursor-pointer ${
              activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>


      <div className="mt-4">
        {activeTab === "General" && <GeneralInfo clientId={clientId} />}
        {activeTab === "Measurements" && <ClientMeasurementInfo clientId={clientId} />}
        {activeTab === "Clients Designs" && <ClientDesignsInfo clientId={clientId} />}
        {activeTab === "Order History" && <ClientOrderHistory />}
      </div>
    </div>
  );
};

export default ClientData;
