import AccountingSideBarLayout from "../../components/navs/AccountingSideBarLayout";
import BillDetail from "../../components/entityData/billData/BillDetail";

const BillDetailDisplay = () => {
  return (
    <AccountingSideBarLayout>
      <div className="space-y-6">
        <BillDetail />
      </div>
    </AccountingSideBarLayout>
  );
};

export default BillDetailDisplay;
