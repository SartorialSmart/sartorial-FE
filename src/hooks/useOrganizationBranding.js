import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SettingsService from "../services/settings";
import { getLogoUrl } from "../utils/localImageService";

const BRANDING_CACHE_TTL_MS = 5 * 60 * 1000;
const brandingCache = new Map();
const inFlightRequests = new Map();

const toLogoSrc = (logo) => (logo ? getLogoUrl(logo) || logo : null);

const getUserKey = (user) => user?.email || user?.id || null;

/**
 * Extract an embedded organization logo / name from the authenticated user
 * payload (GET /users/me/). Field names vary across backend revisions, so
 * check the known shapes before falling back to a profile fetch.
 */
const getEmbeddedBranding = (user) => {
  if (!user) return { logo: null, name: null };
  const org = user.organization || user.organisation || user.business_profile || null;
  const logo =
    org?.logo_url ||
    org?.logo ||
    user.organization_logo_url ||
    user.organization_logo ||
    user.organisation_logo_url ||
    user.logo_url ||
    user.business_logo_url ||
    null;
  const name =
    org?.business_name ||
    user.organization_name ||
    user.organisation_name ||
    user.business_name ||
    null;
  return { logo, name };
};

const buildSnapshot = (user) => {
  if (!user) return { logo: null, name: null, ready: true };

  const cached = brandingCache.get(getUserKey(user));
  const embedded = getEmbeddedBranding(user);

  return {
    logo: cached?.logo || toLogoSrc(embedded.logo),
    name: cached?.name || embedded.name || null,
    ready: Boolean(cached || embedded.logo),
  };
};

const fetchBranding = (userKey) => {
  if (inFlightRequests.has(userKey)) return inFlightRequests.get(userKey);

  const request = SettingsService.Profile.getProfile()
    .then((data) => {
      const entry = {
        logo: toLogoSrc(data?.logo_url || data?.logo || null),
        name: data?.business_name || null,
        fetchedAt: Date.now(),
      };
      brandingCache.set(userKey, entry);
      return entry;
    })
    .finally(() => {
      inFlightRequests.delete(userKey);
    });

  inFlightRequests.set(userKey, request);
  return request;
};

export const invalidateOrganizationBranding = () => {
  brandingCache.clear();
};

/**
 * Single source of truth for organization branding in logged-in chrome.
 *
 * - Logged out (no `user`): returns nulls so callers keep the Sartorial logo.
 * - Logged in (org admin OR staff): returns the organization's logo_url /
 *   business_name when one exists, otherwise nulls (caller falls back to the
 *   Sartorial logo).
 *
 * The result is cached across hook instances and hydrated synchronously from
 * the auth payload, so remounting layouts do not flash the Sartorial logo
 * before the organization logo. `isBrandingReady` stays false while the
 * organization logo is still being resolved, letting callers render a neutral
 * placeholder instead of the wrong logo.
 */
export const useOrganizationBranding = () => {
  const { user } = useAuth();
  const userKey = getUserKey(user);
  const [branding, setBranding] = useState(() => buildSnapshot(user));

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setBranding({ logo: null, name: null, ready: true });
      return undefined;
    }

    const embedded = getEmbeddedBranding(user);
    setBranding(buildSnapshot(user));

    const cached = brandingCache.get(userKey);
    const cacheIsFresh =
      cached && Date.now() - cached.fetchedAt < BRANDING_CACHE_TTL_MS;
    if (cacheIsFresh) return undefined;

    // Refresh from the organization profile so logo updates propagate.
    // Any authenticated member (admin or staff) may call this; a 403/404 for
    // restricted staff roles is ignored and the embedded values are kept.
    fetchBranding(userKey)
      .then((entry) => {
        if (cancelled || !entry) return;
        setBranding({
          logo: entry.logo || toLogoSrc(embedded.logo),
          name: entry.name || embedded.name || null,
          ready: true,
        });
      })
      .catch(() => {
        if (!cancelled) setBranding((prev) => ({ ...prev, ready: true }));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey, !!user]);

  return {
    orgLogo: branding.logo,
    orgName: branding.name,
    hasOrgLogo: Boolean(branding.logo),
    isBrandingReady: branding.ready,
  };
};

export default useOrganizationBranding;
