
import SubscriptionSideBarLayout from "../../components/navs/SubscriptionSideBarLayout";
import SubscriptionPanel from "../../components/Subscriptions/SubscriptionPanel";

const SubscriptionPanelDisplay = () => {
  
  return (
    <SubscriptionSideBarLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <SubscriptionPanel />
      </div>
    </SubscriptionSideBarLayout>
  );
};

export default SubscriptionPanelDisplay;
