import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, LogOut } from "lucide-react";
import LOGO from "../../../assets/images/logo.svg";
import PATTERN from "../../../assets/images/pattern-1.svg";
import DFAULT_AVATAR from "../../../assets/images/default_avatar.svg";
import { useAuth } from "../../../contexts/AuthContext";
import LogoutButton from "../../buttons/LogoutButton";

const Navigation = ({ sidebarItems }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">

      <div
        className={`bg-white h-screen p-4 shadow-lg fixed z-50 transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        } md:w-64`}
      >
        <div className="flex items-center justify-between mb-6">
          <img src={LOGO} alt="Sartorial Logo" className="h-6" />
          <button onClick={toggleSidebar} className="md:hidden p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="relative bg-gray-200 rounded-lg overflow-hidden my-6">
          <Link to="/dashboard" className="block relative">
            <img src={PATTERN} alt="Pattern" className="w-full h-10 object-cover" />
            <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg bg-black/40">
              Home
            </span>
          </Link>
        </div>

        <nav className="space-y-4">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition"
            >
              {item.icon}
              {isOpen && <span className="font-light">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>


      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"} md:ml-64`}>

        <div className="flex justify-between items-center bg-white p-4 shadow-md w-full fixed md:relative z-40">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <img src={LOGO} alt="Sartorial Logo" className="h-6 hidden md:block" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">2</span>
            </div>
            <div className="flex items-center space-x-6">
              <img src={user?.avatar || DFAULT_AVATAR} alt="User" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium">{user?.first_name || "Guest"}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
