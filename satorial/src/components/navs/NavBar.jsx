import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../avatar/Avatar";
import LogoutButton from "../buttons/LogoutButton";

const Navbar = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(2);

  return (
    <nav className="flex justify-between items-center p-4 border-b shadow-sm bg-white">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
        <span className="text-xl font-semibold text-blue-600">Sartorial</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="w-8 h-8 text-gray-600 cursor-pointer" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {notifications}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Avatar
            src={user?.avatar || "/src/assets/images/default_avatar.svg"}
            alt="User"
            fallback={user?.first_name?.[0] || "U"}
          />
          <span className="text-gray-700 font-medium">
            {user?.first_name || "User"}
          </span>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
};

export default Navbar;
