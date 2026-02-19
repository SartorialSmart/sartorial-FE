import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import VendorsList from "../../components/lists/VendorList";

const VendorListDisplay = () => {
  
  return (
    <OrderSideABrLayout>
      <div className="space-y-6">
        <VendorsList />
      </div>
    </OrderSideABrLayout>
  );
};

export default VendorListDisplay;
