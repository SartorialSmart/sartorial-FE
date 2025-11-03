import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import VendorsList from "../../components/lists/VendorList";

const VendorListDisplay = () => {
  
  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <VendorsList />
      </div>
    </OrderSideABrLayout>
  );
};

export default VendorListDisplay;
