import ToolbarWithDateFilter_7 from "../../components/toolbars/ToolBarwithDateFilter_7";
import SettingsSideBarLayout from "../../components/navs/SettingsSideBarLayout";
import MonthlyDataReport from "../../components/report/MonthlyDataReport";
import SettingsProfile from "../../components/settings/SettingsProfile";

const ProfileSettingsDisplay = () => {
  return (
    <SettingsSideBarLayout>
      <div className="space-y-6">
        <SettingsProfile />
      </div>
    </SettingsSideBarLayout>
  );
};

export default ProfileSettingsDisplay;
