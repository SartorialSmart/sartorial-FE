import SettingsSideBarLayout from "../../components/navs/SettingsSideBarLayout";
import RoleManagement from "../../components/settings/RoleManagement";

const RoleSettingsDisplay = () => {
  return (
    <SettingsSideBarLayout>
      <div className="space-y-6">
        <RoleManagement />
      </div>
    </SettingsSideBarLayout>
  );
};

export default RoleSettingsDisplay;
