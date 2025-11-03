import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import PaymentsReport from "../../components/report/PaymentsReport";

const PaymentsReportDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <PaymentsReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default PaymentsReportDisplay;
