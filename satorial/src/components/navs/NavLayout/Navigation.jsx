import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Bell, Search, ChevronDown } from "lucide-react";
import LOGO from "../../../assets/images/logo.svg";
import PATTERN from "../../../assets/images/pattern-1.svg";
import DFAULT_AVATAR from "../../../assets/images/default_avatar.svg";
import { useAuth } from "../../../contexts/AuthContext";
import LogoutButton from "../../buttons/LogoutButton";

const Navigation = ({ sidebarItems }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-white to-gray-50/80 h-screen p-4 shadow-xl border-r border-gray-200/60 fixed z-50 transition-all duration-300 backdrop-blur-sm ${
          isOpen ? "w-64" : "w-20"
        } md:w-64`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center gap-3 transition-all duration-300 ${!isOpen && "justify-center"}`}>
            <img src={LOGO} alt="Sartorial Logo" className={`transition-all duration-300 ${isOpen ? "h-6" : "h-8"}`} />
          </div>
          <button onClick={toggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Home Card */}
        <div className="relative rounded-2xl overflow-hidden my-6 group cursor-pointer transition-all duration-300 hover:scale-[1.02]">
          <Link to="/dashboard" className="block relative">
            <img src={PATTERN} alt="Pattern" className="w-full h-12 object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Home</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {sidebarItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                } ${!isOpen && "justify-center"}`}
              >
                <div className={`transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600"
                }`}>
                  {item.icon}
                </div>
                {isOpen && (
                  <span className={`font-medium text-sm transition-all duration-300 ${
                    isActive ? "text-white" : "text-gray-700 group-hover:text-blue-600"
                  }`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"} md:ml-64`}>
        {/* Header */}
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-4 border-b border-gray-200/60 w-full fixed md:relative z-40 shadow-sm">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  2
                </span>
              </button>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <img 
                  src={user?.avatar || DFAULT_AVATAR} 
                  alt="User" 
                  className="w-8 h-8 rounded-full border-2 border-gray-200" 
                />
                <div className="hidden md:block text-left">
                  <span className="text-sm font-semibold text-gray-900 block">
                    {user?.first_name || "Guest"}
                  </span>
                  <span className="text-xs text-gray-500">{user?.role || "User"}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Profile Settings
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Preferences
                  </Link>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <LogoutButton className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;