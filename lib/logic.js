/**
 * Dependency-free core logic for dsh-usage-deepseek.
 *
 * The DeepSeek official API does not expose rolling/weekly/monthly quota
 * windows like the OpenCode Go subscription API. The provider's billing
 * endpoint is `GET /user/balance`; it reports whether the account is
 * available and the balance records in each currency, split into granted and
 * topped-up amounts. That is the provider-visible "usage/allowance" surface,
 * so this plugin renders those figures.
 *
 * Everything here resolves only against Web/Node platform globals (fetch,
 * AbortSignal), so it can be imported from plain Node tooling and smoke tests
 * without the DSH packages.
 */

/** Official DeepSeek platform base URL. */
export const DEFAULT_BASE_URL = "https://api.deepseek.com";
/** DeepSeek platform billing/usage page (the readout's click target). */
export const PLATFORM_URL = "https://platform.deepseek.com/usage";
/** Credential reference resolved through the harness credentials seam. */
export const API_KEY_REF = "DEEPSEEK_API_KEY";
/** Hard network ceiling so an unresponsive endpoint cannot hang a turn. */
export const TIMEOUT_MS = 20000;

/** Currency symbols for the currencies DeepSeek is known to bill in. */
export const CURRENCY_SYMBOLS = {
  CNY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£"
};

/** DeepSeek pricing windows are defined in Beijing time (UTC+8). */
export const BEIJING_TIME_ZONE = "Asia/Shanghai";
/** Peak windows as minute-of-day [start, end) intervals. */
export const PEAK_WINDOWS = [
  { start: 9 * 60, end: 12 * 60 },
  { start: 14 * 60, end: 18 * 60 }
];
/** Human-readable peak schedule used by /usage-deepseek and the readout title. */
export const PEAK_WINDOW_LABEL = "Beijing 09:00-12:00, 14:00-18:00";

/** Current minute-of-day in Beijing time (0-1439). */
export function beijingMinutesNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BEIJING_TIME_ZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour").value);
  const minute = Number(parts.find((part) => part.type === "minute").value);
  return hour * 60 + minute;
}

/** True while Beijing time is inside a peak window. */
export function isPeakTime(date = new Date()) {
  const minutes = beijingMinutesNow(date);
  return PEAK_WINDOWS.some(({ start, end }) => minutes >= start && minutes < end);
}

/** One-line pricing window status for the /usage-deepseek report. */
export function formatPricingWindow(date = new Date()) {
  return isPeakTime(date)
    ? `Peak · ${PEAK_WINDOW_LABEL}`
    : "Off-peak (50% of peak price)";
}

/**
 * Resolve the DeepSeek API base URL. The official public base URL is the
 * default; `DEEPSEEK_BASE_URL` (the same environment variable honored by
 * dsh-llm-deepseek) overrides it for gateways/proxies.
 */
export function resolveBaseUrl() {
  const env = globalThis.process?.env?.DEEPSEEK_BASE_URL;
  if (typeof env === "string" && env.length > 0) return env.replace(/\/+$/, "");
  return DEFAULT_BASE_URL;
}

/** Fetch and shape the raw balance payload without formatting it. */
export async function fetchDeepSeekBalance(ctx) {
  const credential = await ctx.credentials.resolve(API_KEY_REF);
  if (!credential || typeof credential.value !== "string" || credential.value.length === 0) {
    return { ok: false, error: `${API_KEY_REF} is not configured. Store it in ~/.dsh/.credentials.yaml or set it as an environment variable.` };
  }
  const response = await fetch(`${resolveBaseUrl()}/user/balance`, {
    headers: {
      Authorization: `Bearer ${credential.value}`,
      Accept: "application/json"
    },
    // AbortSignal.timeout is available on the Node version dsh runs on.
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) {
    return { ok: false, error: `DeepSeek balance API returned HTTP ${response.status}` };
  }
  let body;
  try {
    body = await response.json();
  } catch (error) {
    return { ok: false, error: `DeepSeek balance API returned a non-JSON response: ${error instanceof Error ? error.message : String(error)}` };
  }
  return { ok: true, balance: body };
}

/** Format one money amount with its currency symbol/code. */
export function formatAmount(value, currency) {
  if (typeof value !== "string" || value.length === 0) return "n/a";
  const symbol = CURRENCY_SYMBOLS[currency];
  if (symbol !== void 0) return `${symbol}${value}`;
  return `${currency ?? "?"} ${value}`;
}

/** Render the raw balance payload as text for the /usage-deepseek command. */
export function formatDeepSeekBalance(balance) {
  if (!balance || typeof balance !== "object") return "No balance data returned.";
  const lines = [];
  const available = typeof balance.is_available === "boolean"
    ? (balance.is_available ? "available" : "unavailable")
    : "unknown";
  lines.push(`Status: ${available}`);
  const infos = Array.isArray(balance.balance_infos) ? balance.balance_infos : [];
  let records = 0;
  for (const info of infos) {
    if (!info || typeof info !== "object") continue;
    records += 1;
    const currency = typeof info.currency === "string" && info.currency.length > 0 ? info.currency : "unknown";
    const parts = [`total ${formatAmount(info.total_balance, currency)}`];
    // granted/topped-up are only useful when they carry a non-zero amount
    // AND are not just repeating the total. When granted is 0.00,
    // total === topped-up, so repeating topped-up adds noise.
    if (isNonZeroAmount(info.granted_balance)) parts.push(`granted ${formatAmount(info.granted_balance, currency)}`);
    if (isNonZeroAmount(info.topped_up_balance) && !isSameAmount(info.topped_up_balance, info.total_balance)) {
      parts.push(`topped up ${formatAmount(info.topped_up_balance, currency)}`);
    }
    lines.push(`${currency}: ${parts.join(" · ")}`);
  }
  if (records === 0) lines.push("No balance records returned.");
  return lines.join("\n");
}

/** True when a balance string is present and represents a non-zero amount. */
export function isNonZeroAmount(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  const n = Number(value);
  return Number.isFinite(n) && n !== 0;
}

/** True when two balance strings represent the same numeric amount. */
export function isSameAmount(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const a = Number(left);
  const b = Number(right);
  return Number.isFinite(a) && Number.isFinite(b) && a === b;
}

/** Normalize one balance record for the wire; unknown/absent fields become null. */
export function normalizeBalanceInfo(info) {
  if (!info || typeof info !== "object") return null;
  return {
    currency: typeof info.currency === "string" && info.currency.length > 0 ? info.currency : "unknown",
    total_balance: typeof info.total_balance === "string" ? info.total_balance : null,
    granted_balance: typeof info.granted_balance === "string" ? info.granted_balance : null,
    topped_up_balance: typeof info.topped_up_balance === "string" ? info.topped_up_balance : null
  };
}

/** Fetch and normalize the balance snapshot, throwing a descriptive error on any failure. */
export async function fetchDeepSeekBalanceSnapshot(credentials) {
  const credential = await credentials.resolve(API_KEY_REF);
  if (!credential || typeof credential.value !== "string" || credential.value.length === 0) {
    throw new Error(`${API_KEY_REF} is not configured. Store it in ~/.dsh/.credentials.yaml or set it as an environment variable.`);
  }
  const response = await fetch(`${resolveBaseUrl()}/user/balance`, {
    headers: {
      Authorization: `Bearer ${credential.value}`,
      Accept: "application/json"
    },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) {
    throw new Error(`DeepSeek balance API returned HTTP ${response.status}`);
  }
  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`DeepSeek balance API returned a non-JSON response: ${error instanceof Error ? error.message : String(error)}`);
  }
  return {
    available: typeof body?.is_available === "boolean" ? body.is_available : null,
    balances: Array.isArray(body?.balance_infos)
      ? body.balance_infos.map(normalizeBalanceInfo).filter((entry) => entry !== null)
      : []
  };
}
