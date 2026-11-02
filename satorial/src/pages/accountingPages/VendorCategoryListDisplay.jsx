import AccountingSideBarLayout from "../../components/navs/AccountingSideBarLayout";
import VendorCategoryListTable from "../../components/lists/VendorCategoryListTable";
import ToolbarWithDateFilter_5 from "../../components/toolbars/ToolBarwithDateFilter_5";
import { useState } from "react";

const VendorCategoryListDisplay = () => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <AccountingSideBarLayout>
      <div className="space-y-6">
        <ToolbarWithDateFilter_5
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <VendorCategoryListTable searchTerm={searchQuery} />
      </div>
    </AccountingSideBarLayout>
  );
};

export default VendorCategoryListDisplay;
