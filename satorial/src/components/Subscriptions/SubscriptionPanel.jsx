import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useSubscription } from "../../contexts/SubscriptionContext";
import SubscriptionService from "../../services/SubscriptionService";
import { toast } from "react-toastify";
import {
  Crown,
  CreditCard,
  TrendingUp,
  Users,
  ShoppingBag,
  UserCheck,
  Package,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Receipt,
} from "lucide-react";

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  free: { label: "Free", color: "bg-gray-100 text-gray-700", icon: Crown },
  trialing: { label: "Trial", color: "bg-blue-100 text-blue-700", icon: Clock },
  non_renewing: { label: "Cancelling", color: "bg-amber-100 text-amber-700", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
  past_due: { label: "Past Due", color: "bg-red-100 text-red-700", icon: AlertCircle },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-600", icon: XCircle },
};

const SubscriptionPanel = () => {
  const { subscription, usage, refreshAll, loading: contextLoading } = useSubscription();
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle Paystack callback verification
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (reference) {
      verifyPayment(reference);
    }
  }, []);

  const verifyPayment = async (reference) => {
    try {
      const result = await SubscriptionService.verifyTransaction(reference);
      if (result.success) {
        toast.success("Payment verified successfully! Your subscription is now active.");
        await refreshAll();
      } else {
        toast.error("Payment verification failed. Please contact support.");
      }
    } catch (error) {
      toast.error("Unable to verify payment. It may still be processing.");
    }
    navigate("/subscriptions/panel", { replace: true });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await SubscriptionService.getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setTxLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.")) {
      return;
    }

    setActionLoading("cancel");
    try {
      const result = await SubscriptionService.cancelSubscription();
      if (result.success) {
        toast.success(result.message || "Subscription cancelled.");
        await refreshAll();
      } else {
        toast.error(result.message || "Failed to cancel subscription.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel subscription.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async () => {
    setActionLoading("reactivate");
    try {
      const result = await SubscriptionService.reactivateSubscription();
      if (result.success) {
        toast.success("Subscription reactivated!");
        await refreshAll();
      } else {
        toast.error(result.message || "Failed to reactivate subscription.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reactivate.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `\u20A6${Number(amount).toLocaleString()}`;
  };

  const statusConfig = STATUS_CONFIG[subscription?.status] || STATUS_CONFIG.free;
  const StatusIcon = statusConfig.icon;

  const usageItems = [
    {
      label: "Clients",
      icon: Users,
      count: usage?.clients_count || 0,
      limit: usage?.clients_limit ?? 50,
      percentage: usage?.clients_percentage || 0,
      color: "blue",
    },
    {
      label: "Orders",
      icon: ShoppingBag,
      count: usage?.orders_count || 0,
      limit: usage?.orders_limit ?? 20,
      percentage: usage?.orders_percentage || 0,
      color: "purple",
    },
    {
      label: "Staff",
      icon: UserCheck,
      count: usage?.staff_count || 0,
      limit: usage?.staff_limit ?? 1,
      percentage: usage?.staff_percentage || 0,
      color: "emerald",
    },
    {
      label: "Inventory",
      icon: Package,
      count: usage?.inventory_count || 0,
      limit: usage?.inventory_limit ?? 50,
      percentage: usage?.inventory_percentage || 0,
      color: "amber",
    },
  ];

  const progressPercent =
    subscription?.period_total_days > 0
      ? Math.min(100, Math.round((subscription.days_used / subscription.period_total_days) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Subscription</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your subscription, view usage, and billing history.
          </p>
        </div>
        <Link
          to="/subscriptions/pricing/plan"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <TrendingUp size={16} />
          {subscription?.status === "free" ? "Upgrade Plan" : "Change Plan"}
        </Link>
      </div>

      {/* Subscription Info + Billing Period */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Crown size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {subscription?.plan?.name || "Free"} Plan
                </h3>
                <p className="text-sm text-gray-500">
                  {subscription?.plan?.description || "Basic features"}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}
            >
              <StatusIcon size={12} />
              {statusConfig.label}
            </span>
          </div>

          {/* Price */}
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">
              {subscription?.plan?.price > 0
                ? formatCurrency(subscription.plan.price)
                : "Free"}
            </span>
            {subscription?.plan?.price > 0 && (
              <span className="text-sm text-gray-500 ml-1">
                /{subscription.plan.interval === "monthly" ? "month" : "year"}
              </span>
            )}
          </div>

          {/* Billing Period Progress */}
          {subscription?.status !== "free" && subscription?.current_period_end && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{subscription.days_used || 0} days used</span>
                <span>{subscription.days_remaining || 0} days left</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                <span>{formatDate(subscription.current_period_start)}</span>
                <span>{formatDate(subscription.current_period_end)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(subscription?.status === "active" || subscription?.status === "trialing") && (
              <button
                onClick={handleCancel}
                disabled={actionLoading === "cancel"}
                className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg px-4 py-2 transition-colors flex items-center gap-1.5"
              >
                {actionLoading === "cancel" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <XCircle size={14} />
                )}
                Cancel Subscription
              </button>
            )}
            {(subscription?.status === "non_renewing" || subscription?.status === "cancelled") && (
              <button
                onClick={handleReactivate}
                disabled={actionLoading === "reactivate"}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg px-4 py-2 transition-colors flex items-center gap-1.5"
              >
                {actionLoading === "reactivate" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Reactivate Subscription
              </button>
            )}
          </div>
        </div>

        {/* Usage Overview Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-gray-400" />
            Usage Overview
          </h3>
          <div className="space-y-4">
            {usageItems.map((item) => {
              const ItemIcon = item.icon;
              const isUnlimited = item.limit === -1;
              const barWidth = isUnlimited
                ? 0
                : Math.min(100, item.percentage);
              const isNearLimit = !isUnlimited && item.percentage >= 80;

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <ItemIcon size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        isNearLimit ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {item.count}
                      <span className="text-gray-400 font-normal">
                        {" "}
                        / {isUnlimited ? "\u221E" : item.limit}
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isNearLimit
                          ? "bg-red-500"
                          : item.percentage >= 50
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: isUnlimited ? "0%" : `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upgrade prompt if near limits */}
          {usageItems.some((i) => i.limit !== -1 && i.percentage >= 80) && (
            <Link
              to="/subscriptions/pricing/plan"
              className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowUpRight size={14} />
              Upgrade for more capacity
            </Link>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Receipt size={18} className="text-gray-400" />
          <h3 className="font-semibold text-gray-900">Billing History</h3>
        </div>

        {txLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No transactions yet.</p>
            <p className="text-gray-400 text-xs mt-1">
              Your payment history will appear here once you subscribe to a
              plan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs whitespace-nowrap">
                      {tx.paystack_reference}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap capitalize">
                      {tx.payment_method || "N/A"}
                      {tx.card_type && tx.last4 && (
                        <span className="text-gray-400 ml-1">
                          ({tx.card_type} ...{tx.last4})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold whitespace-nowrap">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tx.status === "success"
                            ? "bg-emerald-100 text-emerald-700"
                            : tx.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.status === "success" ? (
                          <CheckCircle2 size={12} />
                        ) : tx.status === "pending" ? (
                          <Clock size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPanel;
