/**
 * Extract a human-readable error message from any API error shape.
 *
 * Handles:
 *   - New standardized: { success: false, message: "...", errors: {...} }
 *   - Legacy DRF:       { detail: "..." }
 *   - Legacy custom:    { error: "..." }
 *   - Field errors:     { field: ["msg1", "msg2"] }
 *   - Plain string response data
 *   - JS Error objects
 */
export function extractErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  const data = error?.response?.data;

  // Standardized backend format
  if (data?.message) return data.message;

  // Legacy: { detail: "..." }
  if (data?.detail) return String(data.detail);

  // Legacy: { error: "..." }
  if (data?.error) return String(data.error);

  // DRF field-level validation errors: { field: ["err1", "err2"] }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const entries = Object.entries(data);
    if (entries.length > 0 && entries.some(([, v]) => Array.isArray(v) || typeof v === "string")) {
      return entries
        .map(([field, msgs]) => {
          const msg = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
          return field === "non_field_errors" ? msg : `${field}: ${msg}`;
        })
        .join(". ");
    }
  }

  // Plain string body
  if (typeof data === "string" && data.length > 0) return data;

  // JS Error object
  if (error?.message) return error.message;

  return fallback;
}

/**
 * Extract field-level errors for form display.
 *
 * Returns an object like { email: ["This field is required."], ... }
 * or null if no field errors are found.
 */
export function extractFieldErrors(error) {
  const data = error?.response?.data;

  // New standardized format with nested errors
  if (data?.errors && typeof data.errors === "object") {
    return data.errors;
  }

  // Direct DRF field errors (no wrapper)
  if (
    data &&
    typeof data === "object" &&
    !data.message &&
    !data.detail &&
    !data.error &&
    !Array.isArray(data)
  ) {
    const entries = Object.entries(data);
    if (entries.length > 0 && entries.some(([, v]) => Array.isArray(v))) {
      return data;
    }
  }

  return null;
}
