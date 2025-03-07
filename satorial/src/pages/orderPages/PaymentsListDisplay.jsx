import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import PaymentsListTable from "../../components/lists/PaymentListTable";
import ToolbarWithDateFilter_4 from "../../components/toolbars/ToolBarwithDateFilter_4";

const PaymentsListDisplay = () => {
  
  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <ToolbarWithDateFilter_4 />
        <PaymentsListTable />
      </div>
    </OrderSideABrLayout>
  );
};

export default PaymentsListDisplay;
