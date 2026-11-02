import StaffSideABrLayout from "../../components/navs/StaffSideBarLayout";
import ExitedStaffsListTable from "../../components/lists/ExitedStaffsListTable";
import ToolbarWithDateFilter_7 from "../../components/toolbars/ToolBarwithDateFilter_7";
import { useState } from "react";

const ExitedStaffsListDisplay = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <StaffSideABrLayout>
      <div className="space-y-6">
        <ToolbarWithDateFilter_7
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <ExitedStaffsListTable searchTerm={searchQuery} />
      </div>
    </StaffSideABrLayout>
  );
};

export default ExitedStaffsListDisplay;
