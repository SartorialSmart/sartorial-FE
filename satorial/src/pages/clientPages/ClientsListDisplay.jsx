import Toolbar_1 from "../../components/toolbars/Toolbar_1";
import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import ClientsList from "../../components/lists/ClientsListTable";

const ClientsListDisplay = () => {
  
  return (
    <ClientSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <Toolbar_1 />
        <ClientsList />
      </div>
    </ClientSideABrLayout>
  );
};

export default ClientsListDisplay;
