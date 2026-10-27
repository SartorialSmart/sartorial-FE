import StaffSideBarLayout from "../../components/navs/StaffSideBarLayout";
import Breadcrumbs from "../../components/navs/NavLayout/Breadcrumbs";
import StaffDetail from "../../components/entityData/staffData/StaffDetail";

const StaffDetailDisplay = () => {
  return (
    <StaffSideBarLayout>
      <div className="space-y-6">
        <Breadcrumbs /> {/* Add Breadcrumbs here */}

        <StaffDetail />
      </div>
    </StaffSideBarLayout>
  );
};

export default StaffDetailDisplay;
