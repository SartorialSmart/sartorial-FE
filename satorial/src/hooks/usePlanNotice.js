import { useMemo } from "react";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useAuth } from "../contexts/AuthContext";

const RESOURCES = [
  { key: "clients", label: "clients" },
  { key: "orders", label: "orders" },
  { key: "staff", label: "team members" },
  { key: "inventory", label: "inventory items" },
];

function daysUntil(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function joinLabels(labels) {
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

/**
 * Single source of truth for the proactive plan notice. Derives a severity and
 * message from the usage the app already loads (GET /subscriptions/usage/) plus
 * the subscription — so limits are surfaced before an action is blocked.
 *
 * Priority: lapsed > limit reached > trial ending > approaching a limit > none.
 */
export function usePlanNotice() {
  const { usage, subscription } = useSubscription();
  const { user } = useAuth();

  return useMemo(() => {
    const isOwner = user?.role?.toLowerCase() === "organization";
    const none = { show: false, level: "none", isOwner };
    if (!usage) return none;

    const warnAt = usage.usage_warning_pct ?? 80;

    const reached = [];
    const approaching = [];
    for (const { key, label } of RESOURCES) {
      const limit = usage[`${key}_limit`];
      if (limit === -1 || limit === undefined) continue; // unlimited / not tracked
      const remaining = usage[`${key}_remaining`] ?? 0;
      const pct = usage[`${key}_percentage`] ?? 0;
      if (remaining <= 0) reached.push(label);
      else if (pct >= warnAt) approaching.push(label);
    }

    const trialDays =
      subscription?.status === "trialing"
        ? subscription?.days_remaining ?? daysUntil(subscription?.current_period_end)
        : null;

    let level = "none";
    let severity = "warning";
    let title = "";
    let message = "";

    if (usage.plan_active === false) {
      level = "lapsed";
      severity = "critical";
      title = "Your plan has lapsed";
      message = "You're limited to the free tier. Upgrade to restore your plan's limits and features.";
    } else if (reached.length) {
      level = "reached";
      severity = "critical";
      title = "You've reached a plan limit";
      message = `You've hit your ${joinLabels(reached)} limit. Upgrade your plan to add more.`;
    } else if (trialDays !== null && trialDays <= 3) {
      level = "trial_ending";
      severity = "critical";
      title = trialDays <= 0 ? "Your trial has ended" : "Your trial is ending soon";
      message =
        trialDays <= 0
          ? "Your free trial has ended. Upgrade to keep your current features."
          : `Your free trial ends in ${trialDays} day${trialDays === 1 ? "" : "s"}. Upgrade to keep your features.`;
    } else if (approaching.length) {
      level = "approaching";
      severity = "warning";
      title = "You're close to a plan limit";
      message = `You're approaching your ${joinLabels(approaching)} limit. Consider upgrading before you run out.`;
    } else {
      return none;
    }

    // Dismissal key: changes when the situation changes, so a dismissed notice
    // re-appears if things get worse (or a new resource is affected).
    const signature = `${level}:${[...reached, ...approaching].sort().join(",")}:${usage.plan_name || ""}`;

    return { show: true, level, severity, title, message, isOwner, signature };
  }, [usage, subscription, user]);
}
