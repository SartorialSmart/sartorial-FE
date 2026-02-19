import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import OrderReport from "../../components/report/OrderReport";

const OrderReportDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="space-y-6">
        <OrderReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default OrderReportDisplay;
