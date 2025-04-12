import { MoreVertical, CheckSquare } from "lucide-react";

const StaffPerformanceReport = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="text-sm text-gray-500 mb-3">
        <span className="text-blue-600 cursor-pointer">Dashboard</span> &nbsp; › &nbsp;
        <span className="text-gray-800 font-medium">Performance Report</span>
      </div>

      {/* Header */}
      <h2 className="text-[22px] font-semibold text-gray-900 mb-4">
        Performance Report
      </h2>

      {/* Performance Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-200 text-gray-700 text-left">
            <tr>
              {["", "Name", "Role", "Assigned", "Completed", "Ongoing", "Not started", "Reassigned"].map((header, index) => (
                <th key={index} className="p-3 text-sm font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {[...Array(8)].map((_, index) => (
              <tr key={index} className="border-b text-gray-700">
                <td className="p-3">
                  <CheckSquare className="w-5 h-5 text-gray-500" />
                </td>
                <td className="p-3 text-sm">Kemi Johnson</td>
                <td className="p-3 text-sm">Tailor</td>
                <td className="p-3 text-sm">20</td>
                <td className="p-3 text-sm">12</td>
                <td className="p-3 text-sm">3</td>
                <td className="p-3 text-sm">2</td>
                <td className="p-3 text-sm">3</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffPerformanceReport;
