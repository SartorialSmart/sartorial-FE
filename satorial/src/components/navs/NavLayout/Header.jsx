import { useState } from "react";
import { Bell, Search, ChevronDown, User, Settings, LogOut } from "lucide-react";
import DFAULT_AVATAR from "../../../assets/images/default_avatar.svg";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-4 border-b border-gray-200/60 w-full fixed md:relative z-30 shadow-sm">
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors md:hidden"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients, orders, staff..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors relative group">
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
              2
            </span>
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className="relative">
              <img 
                src={user?.avatar || DFAULT_AVATAR} 
                alt="User" 
                className="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-blue-300 transition-colors" 
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden md:block text-left">
              <span className="text-sm font-semibold text-gray-900 block leading-tight">
                {user?.first_name || "Guest"}
              </span>
              <span className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() || "user"}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200/60 py-2 z-50 backdrop-blur-sm">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <img 
                    src={user?.avatar || DFAULT_AVATAR} 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-blue-100"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[160px]">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <Link 
                to="/profile" 
                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </Link>
              
              <Link 
                to="/settings" 
                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Preferences</span>
              </Link>

              {/* Logout */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;