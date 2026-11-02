import { useState, useEffect } from "react";
import { useSubscription } from "../../contexts/SubscriptionContext";
import SubscriptionService from "../../services/SubscriptionService";
import { toast } from "react-toastify";
import {
  Loader2,
  CheckCircle2,
  Crown,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Zap,
} from "lucide-react";

const PricingPlans = () => {
  const { plans, subscription, refreshAll } = useSubscription();
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (plans.length > 0 || subscription) {
      setPageLoading(false);
    }
    const timer = setTimeout(() => setPageLoading(false), 3000);
    return () => clearTimeout(timer);
  }, [plans, subscription]);

  const handleSubscribe = async (plan) => {
    if (plan.is_free) return;

    if (subscription?.plan?.id === plan.id && subscription?.status === "active") {
      toast.info("You are already on this plan.");
      return;
    }

    setLoadingPlanId(plan.id);
    try {
      const callbackUrl = `${window.location.origin}/subscriptions/panel`;
      const response = await SubscriptionService.subscribe(plan.id, callbackUrl);

      if (response.success && response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        toast.error(response.message || "Failed to initialize payment");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Payment initialization failed";
      toast.error(message);
    } finally {
      setLoadingPlanId(null);
    }
  };

  const currentPlanId = subscription?.plan?.id;
  const currentStatus = subscription?.status;

  const filteredPlans = plans.filter(
    (p) => p.is_free || p.interval === billingInterval
  );

  const formatPrice = (price) => {
    if (price === 0) return "Free";
    return `\u20A6${Number(price).toLocaleString()}`;
  };

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-6 h-96 animate-pulse"
            >
              <div className="h-6 w-20 bg-gray-200 rounded mb-4" />
              <div className="h-10 w-32 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-100 rounded w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Subscription Plans
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Choose the plan that fits your business. Upgrade or downgrade
            anytime.
          </p>
        </div>

        {/* Billing Interval Toggle */}
        <div className="bg-gray-100 rounded-lg p-1 flex text-sm font-medium">
          <button
            onClick={() => setBillingInterval("monthly")}
            className={`px-4 py-2 rounded-md transition-all ${
              billingInterval === "monthly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("yearly")}
            className={`px-4 py-2 rounded-md transition-all ${
              billingInterval === "yearly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Yearly
            <span className="ml-1 text-xs text-emerald-600 font-semibold">
              Save 10%
            </span>
          </button>
        </div>
      </div>

      {/* Current Plan Notice */}
      {subscription && currentStatus !== "free" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <Zap size={18} className="text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            You are currently on the{" "}
            <span className="font-semibold">{subscription.plan?.name}</span>{" "}
            plan.
            {subscription.days_remaining > 0 && (
              <span>
                {" "}
                {subscription.days_remaining} days remaining in your billing
                period.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;
          const isRecommended = plan.is_recommended;
          const isLoading = loadingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl border-2 p-6 flex flex-col transition-all hover:shadow-lg ${
                isRecommended
                  ? "border-blue-500 shadow-md"
                  : isCurrentPlan
                    ? "border-emerald-500"
                    : "border-gray-100 hover:border-gray-200"
              }`}
            >
              {/* Badges */}
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    <Sparkles size={12} />
                    Recommended
                  </span>
                </div>
              )}
              {isCurrentPlan && !isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    <Crown size={12} />
                    Current Plan
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-4 pt-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.price)}
                </span>
                {!plan.is_free && (
                  <span className="text-sm text-gray-500 ml-1">
                    /{plan.interval === "monthly" ? "mo" : "yr"}
                  </span>
                )}
              </div>

              {/* CTA Button */}
              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-gray-100 text-gray-500 cursor-not-allowed mb-6"
                >
                  Current Plan
                </button>
              ) : plan.is_free ? (
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-gray-50 text-gray-400 cursor-not-allowed mb-6"
                >
                  Free Forever
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading}
                  className={`group w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all mb-6 flex items-center justify-center gap-2 ${
                    isRecommended
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </>
                  )}
                </button>
              )}

              {/* Features List */}
              <ul className="space-y-3 flex-1">
                {(plan.features || []).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 flex-shrink-0 mt-0.5"
                    />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Trial Notice */}
              {plan.trial_days > 0 && !isCurrentPlan && (
                <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100 text-center">
                  {plan.trial_days}-day free trial included
                </p>
              )}
            </div>
          );
        })}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No plans available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default PricingPlans;
