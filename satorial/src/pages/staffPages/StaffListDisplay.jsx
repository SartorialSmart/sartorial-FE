import StaffSideABrLayout from "../../components/navs/StaffSideBarLayout";
import StaffListTable from "../../components/lists/StaffListTable";
import ToolbarWithDateFilter_6 from "../../components/toolbars/ToolBarwithDateFilter_6";

const StaffListDisplay = () => {
  
  return (
    <StaffSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <ToolbarWithDateFilter_6 />

        <StaffListTable />
      </div>
    </StaffSideABrLayout>
  );
};

export default StaffListDisplay;
