import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Menu, ChevronLeft, Home } from "lucide-react";
import LOGO from "../../../assets/images/Logo.png";
import PATTERN from "../../../assets/images/pattern-1.svg";

const Sidebar = ({ isOpen, toggleSidebar, sidebarItems }) => {
  const location = useLocation();

  return (
    <div
      className={`bg-gradient-to-b from-white to-gray-50/80 h-screen p-4 shadow-xl border-r border-gray-200/60 fixed z-30 transition-all duration-300 backdrop-blur-sm ${
        isOpen ? "w-64" : "w-20"
      } md:w-64`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
      <div className="relative rounded-2xl overflow-hidden my-6 group cursor-pointer transition-all duration-300 hover:scale-[1.02]">
        <Link to="/dashboard" className="block relative">
          <img
            src={PATTERN}
            alt="Pattern"
            className="w-full h-16 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 flex items-center justify-center">
            <div className="flex items-center gap-2 text-white">
              <Home className="w-5 h-5" />
              {isOpen && <span className="font-semibold text-lg">Home</span>}
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-2">
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
                <span className={`font-medium transition-all duration-300 ${
                  isActive ? "text-white" : "text-gray-700 group-hover:text-blue-600"
                }`}>
                  {item.label}
                </span>
              )}
              {!isOpen && isActive && (
                <div className="absolute right-2 w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${!isOpen && "scale-0"}`}>
        <div className="text-xs text-gray-400 text-center">
          © 2024 Sartorial
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