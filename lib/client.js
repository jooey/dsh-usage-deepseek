window.__ModuleLoader__.load({
id: "dsh-usage-deepseek",
factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

let React = require("react");

/* Client-face Typert remote manifest (hand-written, no build step). */
const deepseekBalanceSnapshotResult$schema = {
parse(value) {
if (!value || typeof value !== "object" || Array.isArray(value)) {
throw new TypeError("expected a deepseek balance snapshot object");
}
const entry = (info) => {
if (info === null || info === undefined) return null;
if (typeof info !== "object") return null;
return {
currency: typeof info.currency === "string" ? info.currency : "unknown",
total_balance: typeof info.total_balance === "string" ? info.total_balance : null,
granted_balance: typeof info.granted_balance === "string" ? info.granted_balance : null,
topped_up_balance: typeof info.topped_up_balance === "string" ? info.topped_up_balance : null
};
};
return {
available: typeof value.available === "boolean" ? value.available : null,
balances: Array.isArray(value.balances) ? value.balances.map(entry) : []
};
}
};

/** DeepSeek platform billing/usage page (kept in sync with lib/logic.js). */
const PLATFORM_URL = "https://platform.deepseek.com/usage";
/** Provider id registered by @deepseek-ai/dsh-llm-deepseek. */
const DEEPSEEK_PROVIDER = "deepseek-official";

const TYPERT_REMOTE = {
package: "dsh-usage-deepseek",
descriptors: [
{
id: "dsh-usage-deepseek#deepseekUsage/snapshot",
service: "deepseekUsage",
namespace: "deepseekUsage",
method: "snapshot",
invocation: { kind: "direct" },
parameters: [],
result: {
mode: "strict",
typeSymbol: "dsh-usage-deepseek/types#DeepseekBalanceSnapshot",
schema: deepseekBalanceSnapshotResult$schema
},
sourceLocation: { file: "lib/index.js", line: 1, column: 1 }
}
]
};

/** Format one money amount for the compact composer readout. */
function formatAmount(value, currency) {
if (typeof value !== "string" || value.length === 0) return "n/a";
if (currency === "CNY") return "¥" + value;
if (currency === "USD") return "$" + value;
if (currency === "EUR") return "€" + value;
if (currency === "GBP") return "£" + value;
return (currency || "?") + " " + value;
}

/** Current minute-of-day in Beijing time (UTC+8), matching lib/logic.js. */
function beijingMinutesNow(date) {
const parts = new Intl.DateTimeFormat("en-GB", {
timeZone: "Asia/Shanghai",
hour12: false,
hour: "2-digit",
minute: "2-digit"
}).formatToParts(date || new Date());
const hour = Number(parts.find((part) => part.type === "hour").value);
const minute = Number(parts.find((part) => part.type === "minute").value);
return hour * 60 + minute;
}

/** True while Beijing time is inside a peak window. */
function isPeakNow(date) {
const minutes = beijingMinutesNow(date);
return (minutes >= 9 * 60 && minutes < 12 * 60) || (minutes >= 14 * 60 && minutes < 18 * 60);
}

/** Short readout label for the current pricing window. */
function peakLabel(peak) {
return peak ? "Peak" : "Off-peak 50%";
}

/** DeepSeek brand blue, used for the whale during peak pricing windows. */
const DEEPSEEK_BLUE = "#4D6BFE";

/** Upper bound for the chip at wide row widths (the original fixed cap). */
const CHIP_MAX_WIDTH = 320;
/** Below this measured width the text is useless — keep the icon only. */
const CHIP_TEXT_MIN_WIDTH = 80;

/**
 * Fit the chip to the space the composer row actually leaves over.
 *
 * The shell renders this chip as a direct item of the `.trailing` group, which
 * is `flex:none` (it hugs its content and never shrinks), while the left
 * `.tools` group (attach / "Full access" / plan) does shrink. A fixed
 * `max-width` therefore either overlaps the left group when the page narrows
 * or needlessly truncates the text when it doesn't. Instead, measure the real
 * layout — the row's inner width minus the left tools and the trailing group's
 * other items — and cap the chip at exactly the remainder. The result: the
 * chip keeps its full text whenever it fits, shrinks smoothly as the row
 * narrows, and collapses to the icon below a minimum width.
 */
function fitChipWidth(chip, onCap) {
  const slotWrapper = chip.closest("[data-slot]");
  const trailing = slotWrapper ? slotWrapper.parentElement : null;
  const row = trailing ? trailing.parentElement : null;
  if (!trailing || !row) return null;
  const tools = row.firstElementChild !== trailing ? row.firstElementChild : null;

  const fit = () => {
    if (!chip.isConnected) return;
    const cs = getComputedStyle(row);
    const inner = row.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const gap = parseFloat(cs.gap) || 0;
    const toolsWidth = tools ? tools.scrollWidth : 0;
    const othersWidth = trailing.scrollWidth - chip.offsetWidth;
    const target = inner - gap - toolsWidth - othersWidth;
    onCap(Math.max(0, Math.min(CHIP_MAX_WIDTH, target)));
  };

  fit();
  const observer = new ResizeObserver(fit);
  observer.observe(row);
  observer.observe(trailing);
  return () => observer.disconnect();
}

/** Small DeepSeek whale glyph drawn inline so it follows the active theme. */
function DeepSeekIcon(props) {
return React.createElement("svg", Object.assign({
width: 14,
height: 14,
viewBox: "0 0 50 50",
"aria-hidden": true,
focusable: false,
fill: "none"
}, props), [
React.createElement("path", {
key: "whale",
d: "M48.8354 10.0479C48.3232 9.79199 48.1025 10.2798 47.8032 10.5278C47.7007 10.6079 47.6143 10.7119 47.5273 10.8076C46.7793 11.624 45.9048 12.1597 44.7622 12.0957C43.0923 12 41.666 12.5356 40.4058 13.8398C40.1377 12.2319 39.2476 11.272 37.8926 10.6558C37.1836 10.3359 36.4668 10.0156 35.9702 9.31982C35.6235 8.82373 35.5293 8.27197 35.356 7.72754C35.2456 7.3999 35.1353 7.06396 34.7651 7.00781C34.3633 6.94385 34.2056 7.2876 34.0479 7.57568C33.418 8.75195 33.1733 10.0479 33.1973 11.3599C33.2524 14.312 34.4736 16.6641 36.8999 18.3359C37.1758 18.5278 37.2466 18.7197 37.1597 19C36.9946 19.5757 36.7974 20.1357 36.624 20.7119C36.5137 21.0801 36.3486 21.1597 35.9624 21C34.6309 20.4321 33.481 19.5918 32.4644 18.5757C30.7393 16.8721 29.1792 14.9917 27.2334 13.52C26.7764 13.1758 26.3193 12.856 25.8467 12.5518C23.8618 10.584 26.1069 8.96777 26.627 8.77588C27.1704 8.57568 26.8159 7.8877 25.0591 7.896C23.3022 7.90381 21.6953 8.50391 19.647 9.30371C19.3477 9.42383 19.0322 9.51172 18.7095 9.58398C16.8501 9.22363 14.9199 9.14355 12.9033 9.37598C9.10596 9.80762 6.07275 11.6396 3.84326 14.7681C1.16455 18.5278 0.53418 22.7998 1.30664 27.2559C2.11768 31.9521 4.46582 35.8398 8.07373 38.8799C11.8159 42.0322 16.1255 43.5762 21.041 43.2803C24.0269 43.104 27.3516 42.6963 31.1016 39.4561C32.0469 39.936 33.0396 40.1279 34.686 40.272C35.9546 40.3921 37.1758 40.208 38.1211 40.0078C39.6021 39.688 39.4995 38.2881 38.9639 38.0322C34.623 35.9678 35.5762 36.8081 34.71 36.1279C36.9155 33.4639 40.2402 30.6958 41.54 21.728C41.6426 21.0161 41.5557 20.5679 41.54 19.9917C41.5322 19.6396 41.6108 19.5039 42.0049 19.4639C43.0923 19.3359 44.1479 19.0317 45.1167 18.4878C47.9292 16.9199 49.064 14.3438 49.3315 11.2559C49.3711 10.7837 49.3237 10.2959 48.8354 10.0479ZM24.3262 37.8398C20.1196 34.4639 18.0791 33.3521 17.2358 33.3999C16.4482 33.4482 16.5898 34.3682 16.7632 34.9678C16.9443 35.5601 17.1812 35.9683 17.5117 36.4878C17.7402 36.832 17.8979 37.3442 17.2832 37.728C15.9282 38.584 13.5728 37.4399 13.4624 37.3838C10.7207 35.7358 8.42822 33.5601 6.81348 30.584C5.25342 27.7197 4.34766 24.6479 4.19775 21.3677C4.1582 20.5757 4.38672 20.2959 5.15869 20.1519C6.17529 19.96 7.22314 19.9199 8.23926 20.0718C12.5327 20.7119 16.1885 22.6719 19.2529 25.7759C21.002 27.5439 22.3252 29.6558 23.6885 31.7202C25.1377 33.9121 26.6978 36 28.6831 37.7119C29.3843 38.312 29.9434 38.7681 30.479 39.104C28.8643 39.2881 26.1699 39.3281 24.3262 37.8398ZM26.3433 24.6001C26.3433 24.248 26.6191 23.9678 26.9658 23.9678C27.0444 23.9678 27.1152 23.9839 27.1782 24.0078C27.2651 24.04 27.3438 24.0879 27.4067 24.1602C27.5171 24.272 27.5801 24.4321 27.5801 24.6001C27.5801 24.9521 27.3042 25.2319 26.9575 25.2319C26.6108 25.2319 26.3433 24.9521 26.3433 24.6001ZM32.6064 27.8799C32.2046 28.0479 31.8027 28.1919 31.4165 28.208C30.8179 28.2397 30.1641 27.9922 29.8096 27.688C29.2583 27.2158 28.8643 26.9521 28.6987 26.1279C28.6279 25.7759 28.6675 25.2319 28.7305 24.9199C28.8721 24.248 28.7144 23.8159 28.2495 23.4238C27.8716 23.104 27.3911 23.0161 26.8633 23.0161C26.666 23.0161 26.4849 22.9277 26.3511 22.856C26.1304 22.7441 25.9492 22.4639 26.1226 22.1201C26.1777 22.0078 26.4458 21.7358 26.5088 21.688C27.2256 21.272 28.0527 21.4077 28.8169 21.7197C29.5259 22.0161 30.0615 22.5601 30.834 23.3281C31.6216 24.2559 31.7632 24.5117 32.2124 25.208C32.5669 25.752 32.8901 26.312 33.1104 26.9521C33.2446 27.3521 33.0713 27.6802 32.6064 27.8799Z",
fill: "currentColor",
fillRule: "nonzero"
})
]);
}

/** Outer gate: never mount the hook-using chip unless a model directory store is available. */
function DeepSeekUsageChip(props) {
if (!props.directory) return null;
return React.createElement(DeepSeekBalanceChip, props);
}

/**
 * Composer bottom-right readout. Mounts only while the session's selected
 * provider is `deepseek-official`; any other provider renders null so the
 * readout disappears. While visible it shows:
 *   [blue whale] Balance ¥x · Peak          (Beijing peak window)
 *   [theme whale] Balance ¥x · Off-peak 50% (otherwise)
 * refreshed every 60 seconds, and links to the DeepSeek platform.
 */
function DeepSeekBalanceChip(props) {
const directory = props.directory;
const snapshot = props.snapshot;

const state = React.useSyncExternalStore(
(fn) => directory.subscribe(fn),
() => directory.getSnapshot()
);
const isDeepSeek = !!(state && state.current && state.current.provider === DEEPSEEK_PROVIDER);

const [data, setData] = React.useState(null);
const [failed, setFailed] = React.useState(false);
const [peak, setPeak] = React.useState(isPeakNow);
const chipRef = React.useRef(null);
const [chipCap, setChipCap] = React.useState(CHIP_MAX_WIDTH);

// Measure the row once the chip mounts and re-fit on every layout change.
React.useLayoutEffect(() => {
  if (!isDeepSeek) return;
  const chip = chipRef.current;
  if (!chip) return;
  return fitChipWidth(chip, setChipCap);
}, [isDeepSeek]);

React.useEffect(() => {
if (!isDeepSeek) return;
let alive = true;
const load = async () => {
try {
const result = await snapshot();
if (!alive) return;
if (result && result.ok) {
setData(result.value);
setFailed(false);
} else {
setData(null);
setFailed(true);
}
} catch {
if (alive) {
setData(null);
setFailed(true);
}
}
};
const tick = () => {
setPeak(isPeakNow());
load();
};
tick();
const timer = setInterval(tick, 60000);
return () => {
alive = false;
clearInterval(timer);
};
}, [snapshot, isDeepSeek]);

if (!isDeepSeek) return null;

const first = data && Array.isArray(data.balances) && data.balances.length > 0 ? data.balances[0] : null;
const noBalance = failed || data !== null;
const pricingText = " " + peakLabel(peak);
const balanceText = first
  ? "Balance " + formatAmount(first.total_balance, first.currency) + " ·" + pricingText
  : (noBalance ? "Balance n/a" : "Balance …");

return React.createElement(
"a",
{
ref: chipRef,
href: PLATFORM_URL,
target: "_blank",
rel: "noreferrer noopener",
title: failed ? "DeepSeek balance unavailable" : "DeepSeek (deepseek-official) balance · " + peakLabel(peak) + " · open DeepSeek platform",
style: {
display: "inline-flex",
alignItems: "center",
gap: "6px",
height: "100%",
fontSize: "12px",
fontWeight: 500,
lineHeight: 1,
color: "var(--dsw-alias-label-tertiary)",
textDecoration: "none",
cursor: "pointer",
whiteSpace: "nowrap",
minWidth: "0",
maxWidth: chipCap + "px",
overflow: "hidden"
}
},
React.createElement(DeepSeekIcon, {
style: { flex: "none", color: peak ? DEEPSEEK_BLUE : "var(--dsw-alias-label-tertiary)" }
}),
React.createElement("span", {
key: "text",
style: {
  display: chipCap < CHIP_TEXT_MIN_WIDTH ? "none" : "inline-flex",
  alignItems: "center",
  minWidth: "0",
  overflow: "hidden",
  whiteSpace: "nowrap"
}
},
React.createElement("span", {
  key: "balance",
  style: { whiteSpace: "nowrap", opacity: first ? 1 : 0.6 }
}, balanceText))
);
}

/**
 * Client body: mount the remote capability, then register the composer readout
 * through a scoped injection that exposes the session's model directory so the
 * chip can subscribe to the currently selected provider and hide itself for
 * non-DeepSeek models.
 */
async function apply(ctx) {
await ctx.remote.$mount(TYPERT_REMOTE);
// ctx.get() reads the mounted namespace service without requiring a declared
// inject edge, which would deadlock a self-mounting plugin.
const deepseekUsage = ctx.get("remote.deepseekUsage");

ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
name: "conversation.input.right",
id: "deepseek-usage",
order: 0,
inject: (sessionId) => {
let directory = null;
try {
directory = ctx.modelDirectories.directoryFor(sessionId).store;
} catch {
directory = null;
}
return {
directory,
snapshot: () => deepseekUsage.snapshot()
};
}
}, DeepSeekUsageChip));
}

const inject = ["slots", "remote", "modelDirectories"];

exports.apply = apply;
exports.inject = inject;
return module.exports;
}
});
