import ToolbarWithDateFilter_7 from "../../components/toolbars/ToolBarwithDateFilter_7";
import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import ReportDashboard from "../../components/report/ReportDashboard";

const ReportDashboardDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <ReportDashboard />
      </div>
    </ReportSideABrLayout>
  );
};

export default ReportDashboardDisplay;
