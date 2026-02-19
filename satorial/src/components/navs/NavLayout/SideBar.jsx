import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Menu, ChevronLeft, Home } from "lucide-react";
import LOGO from "../../../assets/images/Logo.png";
import PATTERN from "../../../assets/images/pattern-1.svg";

const Sidebar = ({ isOpen, toggleSidebar, sidebarItems }) => {
  const location = useLocation();

  return (
    <div
      className={`bg-white h-screen p-4 shadow-sm border-r border-gray-200 fixed z-30 transition-all duration-300 flex flex-col ${
        isOpen ? "w-64" : "w-20"
      } md:w-64`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center gap-3 transition-all duration-300 ${!isOpen && "justify-center"}`}>
          <img
            src={LOGO}
            alt="Sartorial Logo"
            className={`transition-all duration-300 ${isOpen ? "w-[120px] h-[60px]" : "w-10 h-10"}`}
          />
        </div>
        <button
          onClick={toggleSidebar}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${!isOpen && "rotate-180"}`} />
        </button>
        <button onClick={toggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Home Card */}
      <div className="relative rounded-xl overflow-hidden mb-4 group cursor-pointer transition-all duration-200 hover:shadow-md">
        <Link to="/dashboard" className="block relative">
          <img
            src={PATTERN}
            alt="Pattern"
            className="w-full h-12 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-700/90 flex items-center justify-center">
            <div className="flex items-center gap-2 text-white">
              <Home className="w-4 h-4" />
              {isOpen && <span className="font-semibold text-sm">Home</span>}
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {sidebarItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              } ${!isOpen && "justify-center"}`}
            >
              <div className={`flex-shrink-0 ${
                isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
              }`}>
                {item.icon}
              </div>
              {isOpen && (
                <span className={`text-sm font-medium truncate ${
                  isActive ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                }`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`pt-4 border-t border-gray-100 transition-all duration-300 ${!isOpen && "hidden"}`}>
        <div className="text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Sartorial
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  toggleSidebar: PropTypes.func,
  sidebarItems: PropTypes.array
};

export default Sidebar;
