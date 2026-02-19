import { apiGet, apiPost } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const SubscriptionService = {
  // Plans
  getPlans: () => apiGet(API.SUBSCRIPTION_MANAGEMENT.PLANS.LIST),

  // Current subscription
  getSubscription: () =>
    apiGet(API.SUBSCRIPTION_MANAGEMENT.SUBSCRIPTION.DETAIL),

  // Subscribe to a plan
  subscribe: (planId, callbackUrl) =>
    apiPost(API.SUBSCRIPTION_MANAGEMENT.SUBSCRIPTION.SUBSCRIBE, {
      plan_id: planId,
      callback_url: callbackUrl,
    }),

  // Cancel subscription
  cancelSubscription: () =>
    apiPost(API.SUBSCRIPTION_MANAGEMENT.SUBSCRIPTION.CANCEL),

  // Reactivate subscription
  reactivateSubscription: () =>
    apiPost(API.SUBSCRIPTION_MANAGEMENT.SUBSCRIPTION.REACTIVATE),

  // Transactions / billing history
  getTransactions: () =>
    apiGet(API.SUBSCRIPTION_MANAGEMENT.TRANSACTIONS.LIST),

  // Verify transaction
  verifyTransaction: (reference) =>
    apiPost(API.SUBSCRIPTION_MANAGEMENT.TRANSACTIONS.VERIFY, { reference }),

  // Usage stats
  getUsage: () => apiGet(API.SUBSCRIPTION_MANAGEMENT.USAGE.STATS),
};

export default SubscriptionService;
