import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import ClientData from "../../components/entityData/ClientDataTabs";




const ClientDataDisplay = () => {
  return (
    <ClientSideABrLayout>
      <div className="space-y-6">
        <ClientData />
      </div>
    </ClientSideABrLayout>
  );
};

export default ClientDataDisplay;
