import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import PaymentsReport from "../../components/report/PaymentsReport";

const PaymentsReportDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="space-y-6">
        <PaymentsReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default PaymentsReportDisplay;
