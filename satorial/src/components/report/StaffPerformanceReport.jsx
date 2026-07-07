import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Download, ChevronDown, Filter, Loader2, Users, CheckCircle, Clock, RotateCcw } from "lucide-react";
import StaffReportService from "../../services/staffServices/StaffReportService";
import StaffService from "../../services/staffServices/StaffService";
import { getDateRangeISO, formatDateCaption } from "../../../utils/reportUtils";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  const fetchData = async (filter, startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const params = filter === "All Time" ? {} : (() => {
        const dr = getDateRangeISO(filter, startDate, endDate);
        return {
          start_date: dr.startDate?.split("T")[0],
          end_date: dr.endDate?.split("T")[0],
        };
      })();

      const [perfData, staffList] = await Promise.all([
        StaffReportService.getAllStaffPerformance(params),
        StaffService.listStaff(),
      ]);
      const perfArr = perfData.data || perfData.results || perfData || [];
      const staffArr = Array.isArray(staffList) ? staffList : staffList.results || staffList.staff || [];
      const staffMap = {};
      staffArr.forEach((s) => {
        staffMap[s.id] = s;
      });
      const merged = perfArr.map((p) => {
        const s = staffMap[p.staff_id] || {};
        return {
          name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.name || p.name || "Unknown",
          role: s.staff_role || s.role || p.role || "",
          assigned: p.total_assigned ?? "-",
          completed: p.completed_orders ?? "-",
          ongoing: p.in_progress_orders ?? "-",
          not_started: p.pending_orders ?? "-",
          reassigned: p.reassigned_orders ?? "-",
        };
      });
      setStaff(merged);
    } catch {
      setError("Failed to load staff performance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFilter === "Custom Date" && (!customStartDate || !customEndDate)) return;
    fetchData(selectedFilter, customStartDate, customEndDate);
  }, [selectedFilter, customStartDate, customEndDate]);

  const roles = useMemo(() => {
    const roleSet = new Set();
    staff.forEach((s) => {
      if (s.role) roleSet.add(s.role);
    });
    return ["All", ...Array.from(roleSet).sort()];
  }, [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter((person) => {
      const matchesSearch =
        searchQuery === "" ||
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRole === "All" || person.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [staff, searchQuery, selectedRole]);

  const handleExport = useCallback(() => {
    if (filteredStaff.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = ["Name", "Role", "Assigned", "Completed", "Ongoing", "Not Started", "Reassigned"];
    const csvContent = [
      headers.join(","),
      ...filteredStaff.map((p) =>
        [
          `"${p.name}"`,
          `"${p.role}"`,
          p.assigned,
          p.completed,
          p.ongoing,
          p.not_started,
          p.reassigned,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `staff_performance_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredStaff]);

  const totalAssigned = staff.reduce((sum, p) => sum + (typeof p.assigned === "number" ? p.assigned : 0), 0);
  const totalOngoing = staff.reduce((sum, p) => sum + (typeof p.ongoing === "number" ? p.ongoing : 0), 0);
  const totalReassigned = staff.reduce((sum, p) => sum + (typeof p.reassigned === "number" ? p.reassigned : 0), 0);
  const filterLabel = formatDateCaption(selectedFilter, customStartDate, customEndDate);

  const cards = [
    {
      title: "Total Staff",
      value: staff.length,
      icon: <Users className="w-6 h-6" />,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      subtitle: filterLabel,
    },
    {
      title: "Total Assigned",
      value: totalAssigned,
      icon: <CheckCircle className="w-6 h-6" />,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      subtitle: filterLabel,
    },
    {
      title: "In Progress",
      value: totalOngoing,
      icon: <Clock className="w-6 h-6" />,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      subtitle: filterLabel,
    },
    {
      title: "Reassigned",
      value: totalReassigned,
      icon: <RotateCcw className="w-6 h-6" />,
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      subtitle: filterLabel,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Report</h1>
            <p className="text-gray-600">
              Track and analyze staff performance
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {selectedFilter === "Custom Date" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
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
            <button
              onClick={() => fetchData("Custom Date", customStartDate, customEndDate)}
              disabled={!customStartDate || !customEndDate}
              className="mt-5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Apply
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border-2 ${card.bg} ${card.border} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bg} ${card.text}`}>
                  {card.icon}
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${card.text}`}>
                    {card.value}
                  </div>
                  {card.subtitle && (
                    <div className="text-sm text-gray-500 mt-1">{card.subtitle}</div>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none min-w-40"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <button
              onClick={handleExport}
              disabled={filteredStaff.length === 0}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Search: &ldquo;{searchQuery}&rdquo;
              <button onClick={() => setSearchQuery("")} className="hover:text-blue-900">
                ×
              </button>
            </span>
          )}
          {selectedRole !== "All" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Role: {selectedRole}
              <button onClick={() => setSelectedRole("All")} className="hover:text-green-900">
                ×
              </button>
            </span>
          )}
          {(searchQuery || selectedRole !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRole("All");
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredStaff.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{staff.length}</span> staff
          {selectedFilter !== "All Time" && (
            <> for <span className="font-medium text-blue-600">{filterLabel}</span></>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading staff performance...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-2">⚠️</p>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left">
                  <th className="p-6 w-12">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Name</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Role</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Assigned</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Completed</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Ongoing</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Not Started</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Reassigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Users className="w-12 h-12" />
                        <p className="text-lg font-medium">No staff found</p>
                        <p className="text-sm">
                          {searchQuery || selectedRole !== "All"
                            ? "Try adjusting your search or filters"
                            : "No staff data available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((person, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 transition-colors duration-150 group"
                    >
                      <td className="p-6 w-12">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 group-hover:border-gray-400"
                        />
                      </td>
                      <td className="p-6">
                        <div className="font-medium text-gray-900">{person.name}</div>
                      </td>
                      <td className="p-6">
                        <div className="text-sm text-gray-600">{person.role || "-"}</div>
                      </td>
                      <td className="p-6">
                        <div className="text-sm font-medium text-gray-900">{person.assigned}</div>
                      </td>
                      <td className="p-6">
                        <div className="text-sm text-green-600 font-medium">{person.completed}</div>
                      </td>
                      <td className="p-6">
                        <div className="text-sm text-yellow-600 font-medium">{person.ongoing}</div>
                      </td>
                      <td className="p-6">
                        <div className="text-sm text-gray-500">{person.not_started}</div>
                      </td>
                      <td className="p-6">
                        <div className="text-sm text-purple-600 font-medium">{person.reassigned}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPerformanceReport;
