import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useSubscription } from "../../contexts/SubscriptionContext";

const RESOURCES = [
  { key: "clients", label: "Clients" },
  { key: "orders", label: "Orders" },
  // The plan meters logins, not headcount — staff records are unlimited.
  { key: "staff", label: "User logins" },
  { key: "inventory", label: "Inventory items" },
];

function barColor(pct, atLimit, warnAt) {
  if (atLimit) return "bg-red-500";
  if (pct >= warnAt) return "bg-amber-500";
  return "bg-indigo-500";
}

/**
 * Live plan-usage countdown (count vs limit, remaining, % bar) driven by the
 * subscription context's `usage` (GET /subscriptions/usage/). Shows a warning +
 * upgrade CTA when any resource is at its limit or the plan has lapsed.
 */
export default function UsageMeter({ compact = false }) {
  const { usage } = useSubscription();
  if (!usage) return null;

  // Warning threshold is admin-configurable (PlatformConfig.usage_warning_pct).
  const warnAt = usage.usage_warning_pct ?? 80;

  const anyAtLimit = RESOURCES.some(({ key }) => {
    const limit = usage[`${key}_limit`];
    return limit !== -1 && (usage[`${key}_remaining`] ?? 0) <= 0;
  });

  return (
    <div className={compact ? "space-y-3" : "rounded-xl border border-slate-200 bg-white p-5 space-y-4"}>
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Plan usage</h3>
          <span className="text-xs text-slate-500">
            {usage.plan_name}
            {usage.plan_active === false ? " · lapsed" : ""}
          </span>
        </div>
      )}

      {RESOURCES.map(({ key, label }) => {
        const count = usage[`${key}_count`] ?? 0;
        const limit = usage[`${key}_limit`];
        const unlimited = limit === -1;
        const pct = unlimited ? 0 : usage[`${key}_percentage`] ?? 0;
        const remaining = usage[`${key}_remaining`];
        const atLimit = !unlimited && (remaining ?? 0) <= 0;
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600">{label}</span>
              <span className={atLimit ? "font-semibold text-red-600" : "font-medium text-slate-700"}>
                {count} / {unlimited ? "∞" : limit}
                {!unlimited && !atLimit && <span className="text-slate-400"> · {remaining} left</span>}
                {atLimit && <span> · limit reached</span>}
              </span>
            </div>
            {!unlimited && (
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${barColor(pct, atLimit, warnAt)}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            )}
            {/* Make it obvious the limit is on logins, not on how many people
                you employ — hitting it never blocks adding staff. */}
            {key === "staff" && usage.staff_records_count != null && (
              <p className="mt-1 text-[11px] text-slate-400">
                {usage.staff_records_count} staff on record · records are unlimited
              </p>
            )}
          </div>
        );
      })}

      {(anyAtLimit || usage.plan_active === false) && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-center justify-between gap-2">
          <span>
            {usage.plan_active === false
              ? "Your plan has lapsed — you're on free-tier limits."
              : "You've hit a plan limit."}
          </span>
          <Link
            to="/subscriptions/pricing/plan"
            className="shrink-0 rounded-md bg-amber-600 px-2.5 py-1 font-medium text-white hover:bg-amber-700"
          >
            Upgrade
          </Link>
        </div>
      )}
    </div>
  );
}

UsageMeter.propTypes = { compact: PropTypes.bool };
