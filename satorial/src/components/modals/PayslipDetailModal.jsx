import { Printer, X, DollarSign, TrendingUp, TrendingDown, Gift, MinusCircle, Zap } from "lucide-react";

const PayslipDetailModal = ({ isOpen, onClose, record, employee, department }) => {
  if (!isOpen || !record) return null;

  const additions = record.additions || [];
  const deductions = record.deductions || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 no-print">
          <h2 className="text-xl font-semibold text-gray-900">Payslip</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6" id="payslip-content">
          <div className="text-center mb-6 border-b border-gray-200 pb-4">
            <h3 className="text-2xl font-bold text-gray-900">PAYSLIP</h3>
            <p className="text-gray-600 mt-1">
              Pay Period: <span className="font-semibold">{record.period_name || "N/A"}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Employee</p>
              <p className="font-semibold text-gray-900">{employee?.full_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Department</p>
              <p className="font-semibold text-gray-900">{department || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Role</p>
              <p className="font-semibold text-gray-900">
                {employee?.staff_role || employee?.role || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                record.status === "paid"
                  ? "bg-green-100 text-green-800"
                  : record.status === "finalized"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {record.status?.replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-gray-400" />
              Base Salary
            </h4>
            <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
              <span className="text-gray-700">Base Salary</span>
              <span className="font-bold text-blue-700 text-lg">
                ₦{Number(record.base_salary).toLocaleString()}
              </span>
            </div>
          </div>

          {additions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Gift size={16} className="text-green-500" />
                Additions
              </h4>
              <div className="bg-green-50 rounded-lg divide-y divide-green-100">
                {additions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold text-green-700">
                      +₦{Number(item.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 bg-green-100 rounded-b-lg font-semibold">
                <span className="text-green-800">Total Additions</span>
                <span className="text-green-800">
                  +₦{Number(record.total_additions).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {Number(record.performance_bonus || 0) > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                Performance Bonus
              </h4>
              <div className="bg-amber-50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-gray-700">Performance-Based Bonus</span>
                <span className="font-bold text-amber-700 text-lg">
                  +₦{Number(record.performance_bonus).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {deductions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MinusCircle size={16} className="text-red-500" />
                Deductions
              </h4>
              <div className="bg-red-50 rounded-lg divide-y divide-red-100">
                {deductions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold text-red-700">
                      -₦{Number(item.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 bg-red-100 rounded-b-lg font-semibold">
                <span className="text-red-800">Total Deductions</span>
                <span className="text-red-800">
                  -₦{Number(record.total_deductions).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="border-t-2 border-gray-300 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Gross Pay</span>
              <span className="font-bold text-gray-900 text-lg">
                ₦{Number(record.gross_pay).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Total Deductions</span>
              <span className="font-bold text-red-600 text-lg">
                -₦{Number(record.total_deductions).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between bg-blue-600 text-white rounded-lg p-4 -mx-1">
              <span className="font-bold text-lg">Net Pay</span>
              <span className="font-bold text-2xl">
                ₦{Number(record.net_pay).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailModal;
