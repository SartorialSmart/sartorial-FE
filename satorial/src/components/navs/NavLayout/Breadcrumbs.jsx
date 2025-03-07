import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((path) => path);

  return (
    <nav className="text-sm text-gray-600 mb-4">
      <ul className="flex items-center space-x-2">
        <li>
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        </li>
        {pathnames.map((path, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={routeTo} className="flex items-center">
              <span className="mx-1">›</span>
              {isLast ? (
                <span className="text-gray-500">{formatBreadcrumbText(path)}</span>
              ) : (
                <Link to={routeTo} className="text-blue-600 hover:underline">
                  {formatBreadcrumbText(path)}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const formatBreadcrumbText = (text) => {
  const formattedText = text
    .replace(/-/g, " ") // Convert dashes to spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word

  // Custom names for specific routes
  const customNames = {
    "staff": "Staff",
    "payroll-list": "Payroll",
    "generate-payroll": "Compute Payroll",
  };

  return customNames[text] || formattedText;
};

export default Breadcrumbs;
