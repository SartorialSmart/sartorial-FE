import { useState, useEffect } from "react";
import {
  Loader2, Calendar, Play, CheckCircle, Eye, Download,
  ChevronDown, AlertCircle, DollarSign, Users, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { message } from "antd";
import * as XLSX from "xlsx";
import PayrollPeriodService from "../../services/staffServices/PayrollPeriodService";
import PayRollService from "../../services/staffServices/PayRolService";
import StaffService from "../../services/staffServices/StaffService";
import SettingsService from "../../services/settings";
import SuccessModal from "../modals/SuccessModal";

const GeneratePayrollTable = () => {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [records, setRecords] = useState([]);
  const [staffMap, setStaffMap] = useState({});
  const [deptMap, setDeptMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [finalizing, setFinalizing] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });
  const [creatingPeriod, setCreatingPeriod] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);

  useEffect(() => {
    fetchPeriods();
    fetchStaffAndDepts();
  }, []);

  const fetchPeriods = async () => {
    try {
      const data = await PayrollPeriodService.listPeriods();
      const list = Array.isArray(data) ? data : data?.results || [];
      setPeriods(list);
      if (list.length > 0 && !selectedPeriod) {
        handleSelectPeriod(list[0]);
      }
    } catch {
      message.error("Failed to load pay periods");
    }
  };

  const fetchStaffAndDepts = async () => {
    try {
      const [staffData, deptData] = await Promise.allSettled([
        StaffService.listStaff(),
        SettingsService.Departments.getDepartments(),
      ]);

      const staffList = Array.isArray(staffData.value)
        ? staffData.value
        : staffData.value?.results || [];
      const sMap = {};
      staffList.forEach((s) => {
        if (s.id) sMap[String(s.id)] = s;
        if (s.slug) sMap[s.slug] = s;
      });
      setStaffMap(sMap);

      const deptList = Array.isArray(deptData.value)
        ? deptData.value
        : deptData.value?.results || [];
      const dMap = {};
      deptList.forEach((d) => {
        dMap[d.id] = d;
        if (d.name) dMap[String(d.name).toLowerCase()] = d;
      });
      setDeptMap(dMap);
    } catch {
      // non-critical
    }
  };

  const handleSelectPeriod = async (period) => {
    setSelectedPeriod(period);
    setSelectedRecords([]);
    if (period?.id) {
      await fetchRecords(period.id);
    }
  };

  const fetchRecords = async (periodId) => {
    try {
      setLoading(true);
      const data = await PayRollService.listRecords({ period: periodId });
      const list = Array.isArray(data) ? data : data?.results || [];
      setRecords(list);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    if (!newPeriod.name || !newPeriod.start_date || !newPeriod.end_date) {
      message.warning("Please fill all period fields");
      return;
    }
    try {
      setCreatingPeriod(true);
      const created = await PayrollPeriodService.createPeriod(newPeriod);
      message.success("Pay period created");
      setShowPeriodForm(false);
      setNewPeriod({ name: "", start_date: "", end_date: "" });
      await fetchPeriods();
      if (created?.id) {
        handleSelectPeriod(created);
      }
    } catch (error) {
      message.error(error.response?.data?.detail || "Failed to create period");
    } finally {
      setCreatingPeriod(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedPeriod) {
      message.warning("Select a pay period first");
      return;
    }
    try {
      setGenerating(true);
      await PayrollPeriodService.generatePayroll(selectedPeriod.id);
      message.success("Payroll generated successfully");
      await fetchRecords(selectedPeriod.id);
      await fetchPeriods();
    } catch (error) {
      message.error(error.response?.data?.detail || "Failed to generate payroll");
    } finally {
      setGenerating(false);
    }
  };

  const handleFinalize = async (recordId) => {
    try {
      setFinalizing(recordId);
      await PayRollService.finalizeRecord(recordId);
      message.success("Record finalized");
      await fetchRecords(selectedPeriod.id);
    } catch (error) {
      message.error(error.response?.data?.detail || "Failed to finalize");
    } finally {
      setFinalizing(null);
    }
  };

  const handleBulkFinalize = async () => {
    if (selectedRecords.length === 0) {
      message.warning("Select records to finalize");
      return;
    }
    try {
      setFinalizing("bulk");
      await PayRollService.bulkFinalize({
        record_ids: selectedRecords,
      });
      message.success(`${selectedRecords.length} records finalized`);
      setSelectedRecords([]);
      await fetchRecords(selectedPeriod.id);
    } catch (error) {
      message.error(error.response?.data?.detail || "Failed to finalize records");
    } finally {
      setFinalizing(null);
    }
  };

  const handleExport = () => {
    if (records.length === 0) {
      message.warning("No records to export");
      return;
    }
    const rows = records.map((r) => {
      const emp = staffMap[String(r.employee)] || {};
      return {
        Name: emp.full_name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "N/A",
        Department: resolveDept(emp.department),
        "Base Salary": Number(r.base_salary).toLocaleString(),
        "Total Additions": Number(r.total_additions).toLocaleString(),
        "Performance Bonus": Number(r.performance_bonus || 0).toLocaleString(),
        "Total Deductions": Number(r.total_deductions).toLocaleString(),
        "Gross Pay": Number(r.gross_pay).toLocaleString(),
        "Net Pay": Number(r.net_pay).toLocaleString(),
        Status: r.status,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");
    XLSX.writeFile(wb, `payroll_${selectedPeriod?.name || "export"}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const resolveDept = (value) => {
    if (!value) return "N/A";
    const match = deptMap[value] || deptMap[String(value).toLowerCase()];
    return match?.name || value;
  };

  const getEmpName = (record) => {
    const emp = staffMap[String(record.employee)] || {};
    return emp.full_name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "N/A";
  };

  const toggleRecordSelection = (id) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const draftRecords = records.filter((r) => r.status === "draft");
    if (selectedRecords.length === draftRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(draftRecords.map((r) => r.id));
    }
  };

  const totalGross = records.reduce((s, r) => s + Number(r.gross_pay || 0), 0);
  const totalNet = records.reduce((s, r) => s + Number(r.net_pay || 0), 0);
  const totalDeductions = records.reduce((s, r) => s + Number(r.total_deductions || 0), 0);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Payroll</h1>
          <p className="text-gray-600 mt-1">
            Create and manage pay periods, compute payroll for all staff
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPeriodForm(!showPeriodForm)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar size={18} />
            New Period
          </button>
          <button
            onClick={handleExport}
            disabled={records.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {showPeriodForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Pay Period</h3>
          <form onSubmit={handleCreatePeriod} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">Period Name</label>
              <input
                type="text"
                value={newPeriod.name}
                onChange={(e) => setNewPeriod((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., September 2026"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={newPeriod.start_date}
                onChange={(e) => setNewPeriod((p) => ({ ...p, start_date: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={newPeriod.end_date}
                onChange={(e) => setNewPeriod((p) => ({ ...p, end_date: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={creatingPeriod}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {creatingPeriod ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
              Create
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => handleSelectPeriod(period)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod?.id === period.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Calendar size={14} />
            {period.name}
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              selectedPeriod?.id === period.id
                ? "bg-blue-500 text-blue-100"
                : "bg-gray-100 text-gray-500"
            }`}>
              {period.status}
            </span>
          </button>
        ))}
      </div>

      {selectedPeriod && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{records.length}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
            </motion.div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Gross Pay</p>
                  <p className="text-2xl font-bold text-gray-900">₦{totalGross.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Deductions</p>
                  <p className="text-2xl font-bold text-red-600">₦{totalDeductions.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Net Pay</p>
                  <p className="text-2xl font-bold text-blue-600">₦{totalNet.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DollarSign size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-900">Payroll Records</h3>
                {records.some((r) => r.status === "draft") && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        selectedRecords.length ===
                        records.filter((r) => r.status === "draft").length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    Select all drafts ({records.filter((r) => r.status === "draft").length})
                  </label>
                )}
              </div>
              <div className="flex gap-2">
                {selectedRecords.length > 0 && (
                  <button
                    onClick={handleBulkFinalize}
                    disabled={finalizing === "bulk"}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {finalizing === "bulk" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Finalize Selected ({selectedRecords.length})
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={generating || selectedPeriod.status === "completed"}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {generating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Play size={16} />
                  )}
                  {records.length > 0 ? "Regenerate" : "Generate Payroll"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Loading payroll records...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <DollarSign className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">No payroll records for this period</p>
                <p className="text-sm mt-1">Click "Generate Payroll" to compute salaries</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-left">
                      <th className="px-6 py-3 w-12">
                        <input type="checkbox" className="w-4 h-4" />
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Base Salary</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Additions</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Bonus</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Deductions</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Net Pay</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((record) => {
                      const emp = staffMap[String(record.employee)] || {};
                      return (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            {record.status === "draft" && (
                              <input
                                type="checkbox"
                                checked={selectedRecords.includes(record.id)}
                                onChange={() => toggleRecordSelection(record.id)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{getEmpName(record)}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {resolveDept(emp.department)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-gray-700">
                            ₦{Number(record.base_salary).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">
                            +₦{Number(record.total_additions).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-green-700 font-medium">
                            +₦{Number(record.performance_bonus || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">
                            -₦{Number(record.total_deductions).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                            ₦{Number(record.net_pay).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : record.status === "finalized"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {record.status?.replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {record.status === "draft" && (
                              <button
                                onClick={() => handleFinalize(record.id)}
                                disabled={finalizing === record.id}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 ml-auto"
                              >
                                {finalizing === record.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={14} />
                                )}
                                Finalize
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {successModal && (
        <SuccessModal {...successModal} onClose={() => setSuccessModal(null)} />
      )}
    </div>
  );
};

export default GeneratePayrollTable;
