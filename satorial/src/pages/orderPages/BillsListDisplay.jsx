import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import BillsList from "../../components/lists/BillsListTable";
import ToolbarWithDateFilter_3 from "../../components/toolbars/ToolBarwithDateFilter_3";

const BillsListDisplay = () => {
  
  return (
    <OrderSideABrLayout>
      <div className="space-y-6">
        <ToolbarWithDateFilter_3 />

        <BillsList />
      </div>
    </OrderSideABrLayout>
  );
};

export default BillsListDisplay;
