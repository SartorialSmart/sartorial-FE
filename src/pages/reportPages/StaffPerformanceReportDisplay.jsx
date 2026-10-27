import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import StaffPerformanceReport from "../../components/report/StaffPerformanceReport";

const StaffPerformanceReportDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="space-y-6">
        <StaffPerformanceReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default StaffPerformanceReportDisplay;
