import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import OrderDetail from "../../components/entityData/orderData.jsx/OrderDetail";


const OrderDetailDisplay = () => {
  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm min-h-screen ">
        <OrderDetail />
      </div>
    </OrderSideABrLayout>
  );
};

export default OrderDetailDisplay;
