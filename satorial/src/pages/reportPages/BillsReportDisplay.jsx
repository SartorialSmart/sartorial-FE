import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import BillsReport from "../../components/report/BillsReport";

const BillsReportDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <BillsReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default BillsReportDisplay;
