import Toolbar_1 from "../../components/toolbars/Toolbar_1";
import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import OrderListTable from "../../components/lists/OrderListTable";

const ClientOrderListDisplay = () => {
  
  return (
    <ClientSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <Toolbar_1 />
        <OrderListTable />
      </div>
    </ClientSideABrLayout>
  );
};

export default ClientOrderListDisplay;
