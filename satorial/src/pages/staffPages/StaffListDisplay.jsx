import StaffSideABrLayout from "../../components/navs/StaffSideBarLayout";
import StaffListTable from "../../components/lists/StaffListTable";
import ToolbarWithDateFilter_6 from "../../components/toolbars/ToolBarwithDateFilter_6";
import { useState } from "react";

const StaffListDisplay = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <StaffSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <ToolbarWithDateFilter_6
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <StaffListTable searchTerm={searchQuery} />
      </div>
    </StaffSideABrLayout>
  );
};

export default StaffListDisplay;
