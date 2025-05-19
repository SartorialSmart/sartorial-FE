import ToolbarWithDateFilter_7 from "../../components/toolbars/ToolBarwithDateFilter_7";
import ReportSideABrLayout from "../../components/navs/ReportSideBarLayout";
import MonthlyDataReport from "../../components/report/MonthlyDataReport";
import SettingsProfile from "../../components/settings/SettingsProfile";

const ProfileSettingsDisplay = () => {
  
  return (
    <ReportSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <SettingsProfile />
      </div>
    </ReportSideABrLayout>
  );
};

export default ProfileSettingsDisplay;
