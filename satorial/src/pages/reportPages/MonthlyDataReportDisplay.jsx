import ToolbarWithDateFilter_7 from "../../components/toolbars/ToolBarwithDateFilter_7";
import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import MonthlyDataReport from "../../components/report/MonthlyDataReport";

const MonthlyDataReportDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="space-y-6">
        <MonthlyDataReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default MonthlyDataReportDisplay;
