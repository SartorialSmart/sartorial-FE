import { useState, useEffect, useCallback } from "react";
import {
  Search, Download, Loader2, Eye, Filter, ChevronDown,
  DollarSign, Users, TrendingUp, TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { message } from "antd";
import * as XLSX from "xlsx";
import PayRollService from "../../services/staffServices/PayRolService";
import PayrollPeriodService from "../../services/staffServices/PayrollPeriodService";
import StaffService from "../../services/staffServices/StaffService";
import SettingsService from "../../services/settings";
import Table from "../common/Table";
import PayslipDetailModal from "../modals/PayslipDetailModal";

const PayrollListTable = () => {
  const [records, setRecords] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [staffMap, setStaffMap] = useState({});
  const [deptMap, setDeptMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [payslipModal, setPayslipModal] = useState({ open: false, record: null });
  const [activeAction, setActiveAction] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [recordsData, periodsData, staffData, deptData] = await Promise.allSettled([
        PayRollService.listRecords(),
        PayrollPeriodService.listPeriods(),
        StaffService.listStaff(),
        SettingsService.Departments.getDepartments(),
      ]);

      const recList = Array.isArray(recordsData.value)
        ? recordsData.value
        : recordsData.value?.results || [];
      setRecords(recList);

      const periodList = Array.isArray(periodsData.value)
        ? periodsData.value
        : periodsData.value?.results || [];
      setPeriods(periodList);

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
      setDepartments(deptList);
    } catch {
      message.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resolveDept = (value) => {
    if (!value) return "N/A";
    const match = deptMap[value] || deptMap[String(value).toLowerCase()];
    return match?.name || value;
  };

  const getEmpName = (record) => {
    const emp = staffMap[String(record.employee)] || {};
    return emp.full_name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "N/A";
  };

  const getEmpDept = (record) => {
    const emp = staffMap[String(record.employee)] || {};
    return resolveDept(emp.department);
  };

  const getPeriodName = (record) => {
    const period = periods.find((p) => String(p.id) === String(record.period));
    return period?.name || record.period_name || "N/A";
  };

  const filteredRecords = records.filter((record) => {
    const empName = getEmpName(record).toLowerCase();
    const matchesSearch =
      searchQuery === "" || empName.includes(searchQuery.toLowerCase());
    const matchesPeriod =
      filterPeriod === "all" || String(record.period) === filterPeriod;
    const matchesStatus =
      filterStatus === "all" || record.status === filterStatus;
    const matchesDept =
      filterDept === "all" || getEmpDept(record) === filterDept;
    return matchesSearch && matchesPeriod && matchesStatus && matchesDept;
  });

  const handleExport = useCallback(() => {
    if (filteredRecords.length === 0) {
      message.warning("No records to export");
      return;
    }
    const rows = filteredRecords.map((r) => ({
      Name: getEmpName(r),
      Department: getEmpDept(r),
      Period: getPeriodName(r),
      "Base Salary": Number(r.base_salary).toLocaleString(),
      "Total Additions": Number(r.total_additions).toLocaleString(),
      "Performance Bonus": Number(r.performance_bonus || 0).toLocaleString(),
      "Total Deductions": Number(r.total_deductions).toLocaleString(),
      "Gross Pay": Number(r.gross_pay).toLocaleString(),
      "Net Pay": Number(r.net_pay).toLocaleString(),
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");
    XLSX.writeFile(wb, `payroll_records_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [filteredRecords, staffMap, periods]);

  const totalGross = filteredRecords.reduce((s, r) => s + Number(r.gross_pay || 0), 0);
  const totalNet = filteredRecords.reduce((s, r) => s + Number(r.net_pay || 0), 0);
  const totalDeductions = filteredRecords.reduce((s, r) => s + Number(r.total_deductions || 0), 0);

  const columns = [
    {
      header: "Employee",
      key: "employee",
      render: (_, row) => (
        <div className="font-medium text-gray-900">{getEmpName(row)}</div>
      ),
    },
    {
      header: "Department",
      key: "department",
      render: (_, row) => (
        <span className="text-sm text-gray-600">{getEmpDept(row)}</span>
      ),
    },
    {
      header: "Period",
      key: "period",
      render: (_, row) => (
        <span className="text-sm text-gray-600">{getPeriodName(row)}</span>
      ),
    },
    {
      header: "Gross Pay",
      key: "gross_pay",
      render: (value) => (
        <span className="font-semibold text-green-600">
          ₦{Number(value).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Deductions",
      key: "total_deductions",
      render: (value) => (
        <span className="font-semibold text-red-600">
          -₦{Number(value).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Net Pay",
      key: "net_pay",
      render: (value) => (
        <span className="font-bold text-gray-900">
          ₦{Number(value).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (value) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
          value === "paid"
            ? "bg-green-100 text-green-800"
            : value === "finalized"
            ? "bg-blue-100 text-blue-800"
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {value?.replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "View Payslip",
      icon: Eye,
      onClick: (row) => setPayslipModal({ open: true, record: row }),
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Records</h1>
          <p className="text-gray-600 mt-1">
            View and manage computed payroll records
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredRecords.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Download size={18} />
          Export Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Records</p>
              <h3 className="text-2xl font-bold mt-1">{filteredRecords.length}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Users size={22} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Gross</p>
              <h3 className="text-2xl font-bold mt-1">₦{totalGross.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp size={22} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Net Pay</p>
              <h3 className="text-2xl font-bold mt-1">₦{totalNet.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign size={22} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none min-w-40 bg-gray-50/50"
              >
                <option value="all">All Periods</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none min-w-32 bg-gray-50/50"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="finalized">Finalized</option>
                <option value="paid">Paid</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="relative">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none min-w-40 bg-gray-50/50"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{filteredRecords.length}</span> of{" "}
        <span className="font-semibold text-gray-900">{records.length}</span> records
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table
          columns={columns}
          data={filteredRecords}
          loading={loading}
          emptyMessage="No payroll records found. Generate payroll from the Generate Payroll page."
          actions={actions}
          activeAction={activeAction}
          onActionToggle={setActiveAction}
        />
      </div>

      <PayslipDetailModal
        isOpen={payslipModal.open}
        onClose={() => setPayslipModal({ open: false, record: null })}
        record={payslipModal.record}
        employee={payslipModal.record ? staffMap[String(payslipModal.record.employee)] : null}
        department={
          payslipModal.record
            ? resolveDept(staffMap[String(payslipModal.record.employee)]?.department)
            : null
        }
      />
    </div>
  );
};

export default PayrollListTable;
