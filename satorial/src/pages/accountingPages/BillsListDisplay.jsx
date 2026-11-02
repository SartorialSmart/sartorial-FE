import AccountingSideBarLayout from "../../components/navs/AccountingSideBarLayout";
import BillsList from "../../components/lists/BillsListTable";
import ToolbarWithDateFilter_3 from "../../components/toolbars/ToolBarwithDateFilter_3";

const BillsListDisplay = () => {
  
  return (
    <AccountingSideBarLayout>
      <div className="space-y-6">
        <ToolbarWithDateFilter_3 />

        <BillsList />
      </div>
    </AccountingSideBarLayout>
  );
};

export default BillsListDisplay;
