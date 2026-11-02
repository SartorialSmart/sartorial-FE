import { createContext, useContext, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";
import SubscriptionService from "../services/SubscriptionService";

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user) return;
    try {
      const data = await SubscriptionService.getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    }
  }, [user]);

  const fetchPlans = useCallback(async () => {
    try {
      const data = await SubscriptionService.getPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    }
  }, []);

  const fetchUsage = useCallback(async () => {
    if (!user) return;
    try {
      const data = await SubscriptionService.getUsage();
      setUsage(data);
    } catch (error) {
      console.error("Failed to fetch usage:", error);
    }
  }, [user]);

  const checkFeatureLimit = useCallback(
    (featureName) => {
      if (!subscription || !subscription.plan) return true;

      const plan = subscription.plan;

      // Feature flags
      const flagMap = {
        reports: plan.has_reports,
        analytics: plan.has_analytics,
        payroll: plan.has_payroll,
        vendor_management: plan.has_vendor_management,
        api_access: plan.has_api_access,
      };

      if (featureName in flagMap) {
        return flagMap[featureName];
      }

      // Count-based: check from usage
      if (usage) {
        const limit = usage[`${featureName}_limit`];
        const count = usage[`${featureName}_count`];
        if (limit === -1) return true;
        return count < limit;
      }

      return true;
    },
    [subscription, usage]
  );

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSubscription(), fetchUsage()]);
    setLoading(false);
  }, [fetchSubscription, fetchUsage]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchPlans();
      fetchUsage();
    }
  }, [user, fetchSubscription, fetchPlans, fetchUsage]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plans,
        usage,
        loading,
        fetchSubscription,
        fetchPlans,
        fetchUsage,
        checkFeatureLimit,
        refreshAll,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

SubscriptionProvider.propTypes = {
  children: PropTypes.node,
};
