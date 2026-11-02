export const STORAGE_KEYS = {
  LOGO: "dev_local_logo",
  PROFILE: "dev_local_profile",
  INVOICE_SETTINGS: "dev_invoice_settings",
};

const isDev = () => import.meta.env.DEV || location.hostname === "localhost" || location.hostname === "127.0.0.1";

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const saveImageLocally = async (file, key) => {
  if (!isDev()) return;
  try {
    const dataUrl = await fileToDataURL(file);
    localStorage.setItem(key, dataUrl);
    return dataUrl;
  } catch (err) {
    console.error("Failed to save image locally:", err);
  }
};

export const getLocalImage = (key) => {
  if (!isDev()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const removeLocalImage = (key) => {
  if (!isDev()) return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Failed to remove local image:", err);
  }
};

export const getLogoUrl = (remoteUrl) => {
  if (!isDev()) return remoteUrl;
  return getLocalImage(STORAGE_KEYS.LOGO) || remoteUrl;
};

export const saveProfileLocally = (profileData) => {
  if (!isDev()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
  } catch (err) {
    console.error("Failed to save profile locally:", err);
  }
};

export const saveInvoiceSettingsLocally = (settings) => {
  if (!isDev()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICE_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save invoice settings locally:", err);
  }
};

export const getLocalInvoiceSettings = () => {
  if (!isDev()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICE_SETTINGS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getLocalProfile = () => {
  if (!isDev()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
