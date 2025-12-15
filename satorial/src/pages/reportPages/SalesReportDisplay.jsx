import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import SalesReport from "../../components/report/SalesReport";

const SalesReportDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <SalesReport />
      </div>
    </ReportSideABrLayout>
  );
};

export default SalesReportDisplay;
