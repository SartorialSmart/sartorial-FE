import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import BillDetail from "../../components/entityData/billData/BillDetail";

const BillDetailDisplay = () => {
  return (
    <OrderSideABrLayout>
      <div className="space-y-6">
        <BillDetail />
      </div>
    </OrderSideABrLayout>
  );
};

export default BillDetailDisplay;
