import StaffSideBarLayout from "../../components/navs/StaffSideBarLayout";
import GeneratePayrollTable from "../../components/lists/GeneratePayrollListTable";
import Breadcrumbs from "../../components/navs/NavLayout/Breadcrumbs";

const GeneratePayrollListDisplay = () => {
  return (
    <StaffSideBarLayout>
      <div className="bg-gray-100 p-6 rounded-sm">
        <Breadcrumbs /> {/* Add Breadcrumbs here */}
        <GeneratePayrollTable />
      </div>
    </StaffSideBarLayout>
  );
};

export default GeneratePayrollListDisplay;
