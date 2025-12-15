import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import ClientData from "../../components/entityData/ClientDataTabs";




const ClientDataDisplay = () => {
  return (
    <ClientSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm min-h-screen ">
        <ClientData />
      </div>
    </ClientSideABrLayout>
  );
};

export default ClientDataDisplay;
