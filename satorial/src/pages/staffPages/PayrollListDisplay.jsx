import StaffSideBarLayout from "../../components/navs/StaffSideBarLayout";
import PayrollListTable from "../../components/lists/PayrollListTable";
import ToolbarWithDateFilter_8 from "../../components/toolbars/ToolBarwithDateFilter_9";
import Breadcrumbs from "../../components/navs/NavLayout/Breadcrumbs";

const PayrollListDisplay = () => {
  return (
    <StaffSideBarLayout>
      <div className="space-y-6">
        <Breadcrumbs /> {/* Add Breadcrumbs here */}
        <ToolbarWithDateFilter_8 />
        <PayrollListTable />
      </div>
    </StaffSideBarLayout>
  );
};

export default PayrollListDisplay;
