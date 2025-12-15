import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import VendorCategoryListTable from "../../components/lists/VendorCategoryListTable";
import ToolbarWithDateFilter_5 from "../../components/toolbars/ToolBarwithDateFilter_5";
import { useState } from "react";

const VendorCategoryListDisplay = () => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <ToolbarWithDateFilter_5
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <VendorCategoryListTable searchTerm={searchQuery} />
      </div>
    </OrderSideABrLayout>
  );
};

export default VendorCategoryListDisplay;
