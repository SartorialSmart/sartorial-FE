import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import StaffPerformanceReport from "../../components/report/StaffPerformanceReport";

const StaffPerformanceReportDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <StaffPerformanceReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default StaffPerformanceReportDisplay;
