import { Menu, Bell, LogOut } from "lucide-react";
import LOGO from "../../../assets/images/logo.svg";
import DFAULT_AVATAR from "../../../assets/images/default_avatar.svg";
import { useAuth } from "../../../contexts/AuthContext";
import LogoutButton from "../../buttons/LogoutButton";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <div className="flex justify-between items-center bg-white p-4 shadow-md w-full fixed md:relative z-30">
      <div className="flex items-center space-x-4">
        
        <img src={LOGO} alt="Sartorial Logo" className="h-6 hidden md:block" />
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">2</span>
        </div>
        <div className="flex items-center space-x-6">
          <img src={user?.avatar || DFAULT_AVATAR } alt="User" className="w-8 h-8 rounded-full" />
          <span className="text-sm font-medium">{user?.first_name || "Guest"}</span>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
};

export default Header;
