import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import OrderListTable from "../../components/lists/OrderListTable";


const OrderListDisplay = () => {


  return (
    <OrderSideABrLayout>
      <div className="space-y-6">
        <OrderListTable
        />
      </div>
    </OrderSideABrLayout>
  );
};

export default OrderListDisplay;
