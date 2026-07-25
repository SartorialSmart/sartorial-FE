
import SubscriptionSideBarLayout from "../../components/navs/SubscriptionSideBarLayout";
import SubscriptionPanel from "../../components/Subscriptions/SubscriptionPanel";
import UsageMeter from "../../components/Subscriptions/UsageMeter";

const SubscriptionPanelDisplay = () => {
  return (
    <SubscriptionSideBarLayout>
      <div className="space-y-6">
        <SubscriptionPanel />
        <UsageMeter />
      </div>
    </SubscriptionSideBarLayout>
  );
};

export default SubscriptionPanelDisplay;
