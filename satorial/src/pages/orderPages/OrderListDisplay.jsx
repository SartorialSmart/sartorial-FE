import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import OrderListTable from "../../components/lists/OrderListTable";


const OrderListDisplay = () => {


  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm">
        <OrderListTable
        />
      </div>
    </OrderSideABrLayout>
  );
};

export default OrderListDisplay;
