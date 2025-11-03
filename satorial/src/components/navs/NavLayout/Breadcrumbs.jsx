import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((path) => path);

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 p-2 bg-white/50 rounded-lg backdrop-blur-sm">
      {/* Home Link */}
      <Link 
        to="/" 
        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors group"
      >
        <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="font-medium">Home</span>
      </Link>

      {/* Breadcrumb Items */}
      {pathnames.map((path, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={routeTo} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="font-semibold text-gray-900 capitalize">
                {formatBreadcrumbText(path)}
              </span>
            ) : (
              <Link 
                to={routeTo} 
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium capitalize hover:underline"
              >
                {formatBreadcrumbText(path)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

const formatBreadcrumbText = (text) => {
  const formattedText = text
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const customNames = {
    "staff": "Staff Management",
    "payroll-list": "Payroll",
    "generate-payroll": "Compute Payroll",
    "client": "Clients",
    "order": "Orders",
    "dashboard": "Dashboard",
    "settings": "Settings",
    "reports": "Reports",
    "inventory": "Inventory",
  };

  return customNames[text] || formattedText;
};

export default Breadcrumbs;