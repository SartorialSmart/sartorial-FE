
import SubscriptionSideBarLayout from "../../components/navs/SubscriptionSideBarLayout";
import SubscriptionPanel from "../../components/Subscriptions/SubscriptionPanel";

const SubscriptionPanelDisplay = () => {
  
  return (
    <SubscriptionSideBarLayout>
      <div className="space-y-6">
        <SubscriptionPanel />
      </div>
    </SubscriptionSideBarLayout>
  );
};

export default SubscriptionPanelDisplay;
