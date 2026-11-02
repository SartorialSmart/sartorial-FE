import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import FinancialReport from "../../components/report/FinancialReport";

const FinancialReportDisplay = () => {
  return (
    <ReportSideABrLayout>
      <div className="space-y-6">
        <FinancialReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default FinancialReportDisplay;
