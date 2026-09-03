import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { message } from "antd";
import StaffLoanService from "../../services/staffServices/StaffLoanService";
import StaffService from "../../services/staffServices/StaffService";
import Table from "../common/Table";
import LoanFormModal from "../modals/LoanFormModal";
import SuccessModal from "../modals/SuccessModal";

const STATUS_STYLES = {
  active: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
  completed: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
  cancelled: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
};

const LoanListTable = () => {
  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loanData, staffData] = await Promise.allSettled([
        StaffLoanService.listLoans(),
        StaffService.listStaff(),
      ]);

      const loanList = Array.isArray(loanData.value)
        ? loanData.value
        : loanData.value?.results || [];
      setLoans(loanList);

      const staffList = Array.isArray(staffData.value)
        ? staffData.value
        : staffData.value?.results || [];
      setEmployees(staffList);
    } catch {
      message.error("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (loan) => {
    const emp = employees.find((e) => String(e.id) === String(loan.employee));
    if (emp) {
      return emp.full_name ||
        `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
        emp.email;
    }
    return loan.employee_name || "Unknown";
  };

  const handleAdd = () => {
    setEditingLoan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setIsModalOpen(true);
  };

  const handleDelete = async (loan) => {
    try {
      await StaffLoanService.deleteLoan(loan.id);
      setSuccessModal({
        title: "Loan Deleted",
        message: "The loan record has been deleted.",
        buttonText: "Done",
      });
      fetchData();
    } catch {
      message.error("Failed to delete loan");
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingLoan) {
        await StaffLoanService.updateLoan(editingLoan.id, data);
        setSuccessModal({
          title: "Loan Updated",
          message: "The loan has been updated successfully.",
          buttonText: "Done",
        });
      } else {
        await StaffLoanService.createLoan(data);
        setSuccessModal({
          title: "Loan Created",
          message: "The loan has been created successfully.",
          buttonText: "Done",
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.employee?.[0] ||
        "Failed to save loan";
      message.error(errorMsg);
      throw error;
    }
  };

  const filteredLoans = filterStatus === "all"
    ? loans
    : loans.filter((l) => l.status === filterStatus);

  const totalActive = loans.filter((l) => l.status === "active").length;
  const totalAmount = loans
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + (Number(l.total_amount) - Number(l.amount_repaid || 0)), 0);
  const totalCompleted = loans.filter((l) => l.status === "completed").length;

  const columns = [
    {
      header: "Employee",
      key: "employee",
      render: (_, row) => (
        <div className="font-medium text-gray-900">{getEmployeeName(row)}</div>
      ),
    },
    {
      header: "Total Amount",
      key: "total_amount",
      render: (value) => (
        <span className="font-semibold text-gray-900">
          ₦{Number(value).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Amount Repaid",
      key: "amount_repaid",
      render: (value, row) => {
        const repaid = Number(value || 0);
        const total = Number(row.total_amount);
        const pct = total > 0 ? Math.round((repaid / total) * 100) : 0;
        return (
          <div className="space-y-1">
            <span className="text-sm text-gray-700">₦{repaid.toLocaleString()}</span>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{pct}%</span>
          </div>
        );
      },
    },
    {
      header: "Monthly Deduction",
      key: "monthly_deduction",
      render: (value) => (
        <span className="text-sm text-gray-700">
          ₦{Number(value).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (value) => {
        const style = STATUS_STYLES[value] || STATUS_STYLES.active;
        const Icon = style.icon;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            <Icon size={12} />
            {value?.replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        );
      },
    },
  ];

  const actions = [
    { label: "Edit", icon: Edit, onClick: handleEdit },
    { label: "Delete", icon: Trash2, onClick: handleDelete, danger: true },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Loans</h1>
          <p className="text-gray-600 mt-1">Manage employee loan records and repayments</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Loan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Active Loans</p>
              <h3 className="text-3xl font-bold mt-2">{totalActive}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Outstanding Balance</p>
              <h3 className="text-3xl font-bold mt-2">₦{totalAmount.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <h3 className="text-3xl font-bold mt-2">{totalCompleted}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "active", "completed", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {status === "all" ? "All" : status.replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table
          columns={columns}
          data={filteredLoans}
          loading={loading}
          emptyMessage="No loans found."
          actions={actions}
          activeAction={activeAction}
          onActionToggle={setActiveAction}
        />
      </div>

      <LoanFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLoan(null);
        }}
        onSubmit={handleSubmit}
        editingLoan={editingLoan}
        employees={employees}
      />

      {successModal && (
        <SuccessModal {...successModal} onClose={() => setSuccessModal(null)} />
      )}
    </div>
  );
};

export default LoanListTable;
