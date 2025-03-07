import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import OrderListTable from "../../components/lists/OrderListTable";
import OrderDashboardOverview from "../../components/overview/OrderDashboardOverview";
import ToolbarWithDateFilter_1 from "../../components/toolbars/ToolBarwithDateFilter_1";

const OrderDashboardDisplay = () => {
  
  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <ToolbarWithDateFilter_1 />
        <OrderDashboardOverview/>
        <OrderListTable />
      </div>
    </OrderSideABrLayout>
  );
};

export default OrderDashboardDisplay;
