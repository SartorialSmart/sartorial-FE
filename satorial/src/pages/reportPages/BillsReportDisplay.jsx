import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import BillsReport from "../../components/report/BillsReport";

const BillsReportDisplay = () => {
  return (
    <ReportSideABrLayout>
      <div className="space-y-6">
        <BillsReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default BillsReportDisplay;
