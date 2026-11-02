import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import ExpensesReport from "../../components/report/ExpensesReport";

const ExpensesReportDisplay = () => {
  return (
    <ReportSideABrLayout>
      <div className="space-y-6">
        <ExpensesReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default ExpensesReportDisplay;
