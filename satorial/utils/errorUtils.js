/**
 * Safely format any value into a human-readable string.
 * Never outputs "[object Object]".
 */
function safeFormatValue(val) {
  if (val === null || val === undefined || typeof val === "boolean") {
    return "";
  }
  if (typeof val === "string") {
    return val;
  }
  if (typeof val === "number") {
    return String(val);
  }
  if (Array.isArray(val)) {
    return val
      .map(safeFormatValue)
      .filter(Boolean)
      .join(", ");
  }
  if (typeof val === "object") {
    const parts = [];
    for (const [key, value] of Object.entries(val)) {
      if (key === "success" || key === "code" || key === "upgrade_required") {
        continue;
      }
      const formatted = safeFormatValue(value);
      if (formatted) {
        if (
          key === "non_field_errors" ||
          key === "detail" ||
          key === "message" ||
          key === "error"
        ) {
          parts.push(formatted);
        } else {
          parts.push(`${key}: ${formatted}`);
        }
      }
    }
    return parts.join(". ");
  }
  return String(val);
}

/**
 * Extract a human-readable error message string from any API error shape or JS error object.
 *
 * Guaranteed to return a valid, human-readable string and NEVER "[object Object]".
 */
export function extractErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (!error) return fallback;

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  try {
    const data = error?.response?.data || (error.data !== undefined ? error.data : error);

    // If data is a plain string
    if (typeof data === "string") {
      const trimmed = data.trim();
      if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html") || trimmed.includes("</html>")) {
        return fallback || "Server error. Please try again later.";
      }
      if (trimmed.length > 0) {
        return trimmed;
      }
    }

    // Direct message / detail / error string properties on data
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }

    // Standard error message on JS Error objects (when not an Axios response wrapper)
    if (
      typeof error?.message === "string" &&
      error.message.trim() &&
      !error?.response
    ) {
      return error.message;
    }

    // Format complex dictionary or nested objects safely
    const formatted = safeFormatValue(data);
    if (formatted && formatted.trim()) {
      return formatted;
    }
  } catch (err) {
    console.error("Error formatting error response:", err);
  }

  return fallback;
}

/**
 * Extract field-level errors for form display.
 *
 * Returns a normalized object like { email: ["This field is required."], ... }
 * or null if no field errors are found.
 */
export function extractFieldErrors(error) {
  if (!error) return null;
  const data = error?.response?.data || (error.data !== undefined ? error.data : error);

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  // Nested errors dict: { errors: { field: ["..."] } }
  if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    return normalizeFieldErrors(data.errors);
  }

  // Direct DRF field errors dictionary
  const rawFields = normalizeFieldErrors(data);
  return Object.keys(rawFields).length > 0 ? rawFields : null;
}

function normalizeFieldErrors(obj) {
  const result = {};
  const ignoredKeys = ["success", "message", "detail", "error", "code", "upgrade_required"];

  for (const [key, val] of Object.entries(obj)) {
    if (ignoredKeys.includes(key)) continue;

    if (Array.isArray(val)) {
      result[key] = val.map((v) => safeFormatValue(v)).filter(Boolean);
    } else if (typeof val === "string") {
      result[key] = [val];
    } else if (typeof val === "object" && val !== null) {
      const nested = normalizeFieldErrors(val);
      Object.assign(result, nested);
    }
  }

  return result;
}
