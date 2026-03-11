import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  CreditCard,
  Package,
  Building2,
  Tag,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import BillsService from "../../../services/BillsService";
import EditBillsFormModal from "../../modals/formModals/EditBillsFormModal";
import AddBillPaymentFormModal from "../../modals/formModals/AddBillPaymentFormModal";

const BillDetail = () => {
  const { billId } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchBill = async () => {
    try {
      setLoading(true);
      const data = await BillsService.getBillDetails(billId);
      setBill(data);
    } catch (err) {
      console.error("Failed to fetch bill:", err);
      setError("Failed to load bill details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billId) fetchBill();
  }, [billId]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₦0.00";
    return `₦${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPaymentStatus = (bill) => {
    const balance = Number(bill.balance);
    if (balance <= 0) return { label: "Fully Paid", color: "bg-green-100 text-green-800" };
    if (Number(bill.amount_paid) > 0) return { label: "Partially Paid", color: "bg-amber-100 text-amber-800" };
    return { label: "Unpaid", color: "bg-red-100 text-red-700" };
  };

  const getProgressPercent = (bill) => {
    const total = Number(bill.amount);
    if (!total) return 0;
    return Math.min(100, Math.round((Number(bill.amount_paid) / total) * 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="text-red-500 mb-3" size={40} />
        <p className="text-gray-700 font-medium">{error || "Bill not found."}</p>
        <button
          onClick={() => navigate("/order/bills-list")}
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Back to Bills
        </button>
      </div>
    );
  }

  const status = getPaymentStatus(bill);
  const progress = getProgressPercent(bill);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/order/bills-list")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{bill.item_name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Bill #{bill.id} · {bill.vendor_name}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Edit2 size={16} />
              Edit Bill
            </button>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <CreditCard size={16} />
              Add Payment
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Payment Summary
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(bill.amount_paid)}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Balance</p>
                <p className="text-lg font-bold text-amber-700">{formatCurrency(bill.balance)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Payment Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    progress === 100 ? "bg-green-500" : progress > 0 ? "bg-blue-500" : "bg-gray-300"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Payment History
            </h2>
            {bill.payments && bill.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">#</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.payments.map((payment, index) => (
                      <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-3 text-gray-500">{index + 1}</td>
                        <td className="py-3 px-3 text-gray-700">{formatDate(payment.created_at)}</td>
                        <td className="py-3 px-3 text-right font-medium text-green-700">
                          {formatCurrency(payment.amount_paid)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CreditCard size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No payments recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Bill Info */}
        <div className="space-y-6">
          {/* Item Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={18} className="text-blue-600" />
              Item Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Item Name</span>
                <span className="font-medium text-gray-900">{bill.item_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity</span>
                <span className="font-medium text-gray-900">{bill.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Unit Price</span>
                <span className="font-medium text-gray-900">
                  {bill.quantity ? formatCurrency(Number(bill.amount) / Number(bill.quantity)) : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              Vendor
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-0.5">Vendor Name</p>
                <p className="font-medium text-gray-900">{bill.vendor_name}</p>
              </div>
              {bill.vendor_category && (
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-gray-400" />
                  <span className="text-gray-700">{bill.vendor_category.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              Details
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-0.5">Created</p>
                <p className="font-medium text-gray-900">{formatDate(bill.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Last Updated</p>
                <p className="font-medium text-gray-900">{formatDate(bill.updated_at)}</p>
              </div>
              {bill.created_by_name && (
                <div>
                  <p className="text-gray-500 mb-0.5">Created By</p>
                  <p className="font-medium text-gray-900">{bill.created_by_name}</p>
                </div>
              )}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {Number(bill.balance) <= 0 ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-500" />
                  )}
                  <span className={`font-medium text-sm ${Number(bill.balance) <= 0 ? "text-green-700" : "text-amber-700"}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editModalOpen && (
        <EditBillsFormModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            fetchBill();
          }}
          billId={Number(billId)}
        />
      )}
      {paymentModalOpen && (
        <AddBillPaymentFormModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          bill={bill}
          onSuccess={() => {
            setPaymentModalOpen(false);
            fetchBill();
          }}
        />
      )}
    </div>
  );
};

export default BillDetail;
