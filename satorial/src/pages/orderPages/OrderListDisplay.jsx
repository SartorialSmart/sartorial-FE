import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import OrderListTable from "../../components/lists/OrderListTable";
import ToolBarwithDateFilter_2 from "../../components/toolbars/ToolBarwithDateFilter_2";

const OrderListDisplay = () => {
  
  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <ToolBarwithDateFilter_2 />
        <OrderListTable />
      </div>
    </OrderSideABrLayout>
  );
};

export default OrderListDisplay;
