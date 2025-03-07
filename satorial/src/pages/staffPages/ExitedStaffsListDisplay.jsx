import StaffSideABrLayout from "../../components/navs/StaffSideBarLayout";
import ExitedStaffsListTable from "../../components/lists/ExitedStaffsListTable";
import ToolbarWithDateFilter_7 from "../../components/toolbars/ToolBarwithDateFilter_7";

const ExitedStaffsListDisplay = () => {
  
  return (
    <StaffSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <ToolbarWithDateFilter_7 />
        <ExitedStaffsListTable />
      </div>
    </StaffSideABrLayout>
  );
};

export default ExitedStaffsListDisplay;
