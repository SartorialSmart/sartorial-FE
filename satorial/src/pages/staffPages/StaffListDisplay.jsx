import StaffSideABrLayout from "../../components/navs/StaffSideBarLayout";
import StaffListTable from "../../components/lists/StaffListTable";
import ToolbarWithDateFilter_6 from "../../components/toolbars/ToolBarwithDateFilter_6";
import { useState, useRef } from "react";

const StaffListDisplay = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const staffListTableRef = useRef(null);

  return (
    <StaffSideABrLayout>
      <div className="space-y-6">
        <ToolbarWithDateFilter_6
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStaffCreated={() => staffListTableRef.current?.refresh()}
        />

        <StaffListTable
          ref={staffListTableRef}
          searchTerm={searchQuery}
        />
      </div>
    </StaffSideABrLayout>
  );
};

export default StaffListDisplay;
