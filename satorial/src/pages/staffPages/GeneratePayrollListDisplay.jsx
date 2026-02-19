import StaffSideBarLayout from "../../components/navs/StaffSideBarLayout";
import GeneratePayrollTable from "../../components/lists/GeneratePayrollListTable";
import Breadcrumbs from "../../components/navs/NavLayout/Breadcrumbs";

const GeneratePayrollListDisplay = () => {
  return (
    <StaffSideBarLayout>
      <div className="space-y-6">
        <Breadcrumbs /> {/* Add Breadcrumbs here */}
        <GeneratePayrollTable />
      </div>
    </StaffSideBarLayout>
  );
};

export default GeneratePayrollListDisplay;
