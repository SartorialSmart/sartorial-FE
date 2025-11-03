import ToolbarWithDateFilter_7 from "../../components/toolbars/ToolBarwithDateFilter_7";
import SettingsSideBarLayout from "../../components/navs/SettingsSideBarLayout";
import MonthlyDataReport from "../../components/report/MonthlyDataReport";
import SettingsProfile from "../../components/settings/SettingsProfile";

const ProfileSettingsDisplay = () => {
  return (
    <SettingsSideBarLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <SettingsProfile />
      </div>
    </SettingsSideBarLayout>
  );
};

export default ProfileSettingsDisplay;
