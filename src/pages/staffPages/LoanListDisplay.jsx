import StaffSideBarLayout from "../../components/navs/StaffSideBarLayout";
import LoanListTable from "../../components/lists/LoanListTable";
import Breadcrumbs from "../../components/navs/NavLayout/Breadcrumbs";

const LoanListDisplay = () => {
  return (
    <StaffSideBarLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <LoanListTable />
      </div>
    </StaffSideBarLayout>
  );
};

export default LoanListDisplay;
