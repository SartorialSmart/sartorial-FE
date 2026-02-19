import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import SalesReport from "../../components/report/SalesReport";

const SalesReportDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="space-y-6">
        <SalesReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default SalesReportDisplay;
