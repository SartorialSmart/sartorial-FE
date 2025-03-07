import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import VendorCategoryListTable from "../../components/lists/VendorCategoryListTable";
import ToolbarWithDateFilter_5 from "../../components/toolbars/ToolBarwithDateFilter_5";

const VendorCategoryListDisplay = () => {
  
  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <ToolbarWithDateFilter_5 />
        <VendorCategoryListTable />
      </div>
    </OrderSideABrLayout>
  );
};

export default VendorCategoryListDisplay;
