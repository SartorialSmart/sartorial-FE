import StaffSideABrLayout from "../../components/navs/StaffSideBarLayout";
import StaffListTable from "../../components/lists/StaffListTable";
import ToolbarWithDateFilter_6 from "../../components/toolbars/ToolBarwithDateFilter_6";
import PricingPlans from "../../components/Subscriptions/PricingPlans";
import SubscriptionSideBarLayout from "../../components/navs/SubscriptionSideBarLayout";

const PricingPlansDisplay = () => {
  
  return (
    <SubscriptionSideBarLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">


        <PricingPlans />
      </div>
    </SubscriptionSideBarLayout>
  );
};

export default PricingPlansDisplay;
