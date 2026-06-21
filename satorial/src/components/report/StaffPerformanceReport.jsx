import { useState, useEffect, useMemo } from "react";
import { CheckSquare } from "lucide-react";
import ReportService from "../../services/ReportService";

const FILTERS = [
  "All Time",
  "Today",
  "This Week",
  "This Month",
  "This Year",
  "Custom Date",
];

const StaffPerformanceReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ReportService.getStaffPerformance();
        setStaff(Array.isArray(data) ? data : data.staff || []);
      } catch {
        setError("Failed to load staff performance.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="text-sm text-gray-500 mb-3">
        <span className="text-blue-600 cursor-pointer">Dashboard</span> &nbsp; ›
        &nbsp;
        <span className="text-gray-800 font-medium">Performance Report</span>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px] font-semibold text-gray-900">
          Performance Report
        </h2>
        <div className="flex space-x-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-[6px] text-sm rounded-md border transition ${
                selectedFilter === filter
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {selectedFilter === "Custom Date" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-3 bg-white p-3 rounded-lg shadow-sm">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 text-gray-700 text-left">
              <tr>
                {[
                  "",
                  "Name",
                  "Role",
                  "Assigned",
                  "Completed",
                  "Ongoing",
                  "Not started",
                  "Reassigned",
                ].map((header, index) => (
                  <th key={index} className="p-3 text-sm font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No staff data found.
                  </td>
                </tr>
              ) : (
                staff.map((person, index) => (
                  <tr key={index} className="border-b text-gray-700">
                    <td className="p-3">
                      <CheckSquare className="w-5 h-5 text-gray-500" />
                    </td>
                    <td className="p-3 text-sm">{person.name}</td>
                    <td className="p-3 text-sm">{person.role}</td>
                    <td className="p-3 text-sm">
                      {person.assigned === 1
                        ? "Yes"
                        : person.assigned === 0
                        ? "No"
                        : person.assigned}
                    </td>
                    <td className="p-3 text-sm">
                      {person.completed === 1
                        ? "Yes"
                        : person.completed === 0
                        ? "No"
                        : person.completed}
                    </td>
                    <td className="p-3 text-sm">
                      {person.ongoing === 1
                        ? "Yes"
                        : person.ongoing === 0
                        ? "No"
                        : person.ongoing}
                    </td>
                    <td className="p-3 text-sm">
                      {person.not_started === 1
                        ? "Yes"
                        : person.not_started === 0
                        ? "No"
                        : person.not_started}
                    </td>
                    <td className="p-3 text-sm">
                      {person.reassigned === 1
                        ? "Yes"
                        : person.reassigned === 0
                        ? "No"
                        : person.reassigned}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StaffPerformanceReport;
