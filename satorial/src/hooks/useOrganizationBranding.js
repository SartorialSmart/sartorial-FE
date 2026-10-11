import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SettingsService from "../services/settings";
import { getLogoUrl } from "../utils/localImageService";

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

/**
 * Single source of truth for organization branding in logged-in chrome.
 *
 * - Logged out (no `user`): returns nulls so callers keep the Sartorial logo.
 * - Logged in (org admin OR staff): returns the organization's logo_url /
 *   business_name when one exists, otherwise nulls (caller falls back to the
 *   Sartorial logo).
 *
 * The fresh logo comes from GET /settings/profile/ so a newly uploaded logo
 * appears without re-login. Staff accounts that lack profile-read permission
 * simply keep whatever branding was embedded in the auth payload.
 */
export const useOrganizationBranding = () => {
  const { user } = useAuth();
  const [orgLogo, setOrgLogo] = useState(null);
  const [orgName, setOrgName] = useState(null);

  const userKey = user?.email || user?.id || null;

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setOrgLogo(null);
      setOrgName(null);
      return undefined;
    }

    const embedded = getEmbeddedBranding(user);
    if (embedded.logo) setOrgLogo(getLogoUrl(embedded.logo) || embedded.logo);
    else setOrgLogo(null);
    if (embedded.name) setOrgName(embedded.name);
    else setOrgName(null);

    // Refresh from the organization profile so logo updates propagate.
    // Any authenticated member (admin or staff) may call this; a 403/404 for
    // restricted staff roles is ignored and the embedded values are kept.
    SettingsService.Profile.getProfile()
      .then((data) => {
        if (cancelled || !data) return;
        const freshLogo = data.logo_url || data.logo || null;
        if (freshLogo) setOrgLogo(getLogoUrl(freshLogo) || freshLogo);
        else if (!embedded.logo) setOrgLogo(null);
        const freshName = data.business_name || null;
        if (freshName) setOrgName(freshName);
      })
      .catch(() => {
        // Keep embedded branding (or null -> Sartorial fallback).
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey, !!user]);

  return { orgLogo, orgName, hasOrgLogo: Boolean(orgLogo) };
};

export default useOrganizationBranding;
