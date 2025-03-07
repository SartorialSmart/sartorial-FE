import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import LOGO from "../../../assets/images/logo.svg";
import PATTERN from "../../../assets/images/pattern-1.svg";

const Sidebar = ({ isOpen, toggleSidebar, sidebarItems }) => {
  return (
    <div
      className={`bg-white h-screen p-4 shadow-lg fixed z-30 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } md:w-64`}
    >
      <div className="flex items-center mb-6">
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
  );
};

export default Sidebar;
