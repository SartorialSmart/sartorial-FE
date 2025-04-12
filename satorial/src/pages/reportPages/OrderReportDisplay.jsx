import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import OrderReport from "../../components/report/OrderReport";

const OrderReportDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <OrderReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default OrderReportDisplay;
