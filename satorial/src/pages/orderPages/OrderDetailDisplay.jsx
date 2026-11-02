import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import OrderDetail from "../../components/entityData/orderData.jsx/OrderDetail";


const OrderDetailDisplay = () => {
  return (
    <OrderSideABrLayout>
      <div className="space-y-6">
        <OrderDetail />
      </div>
    </OrderSideABrLayout>
  );
};

export default OrderDetailDisplay;
