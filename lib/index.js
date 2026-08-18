/**
 * dsh-usage-deepseek
 *
 * Human-facing `/usage-deepseek` command for the DeepSeek provider account,
 * plus a browser composer readout (bottom-right tool row) fed by a Typert
 * remote service.
 *
 * The DEEPSEEK_API_KEY credential is resolved through the harness credentials
 * seam on the HOST (kept server-side; never inlined into the browser), the
 * official billing API `GET https://api.deepseek.com/user/balance` is queried,
 * and the available/granted/topped-up balances are rendered inline. The
 * composer readout only renders while the selected model provider is
 * `deepseek-official` (the provider id registered by dsh-llm-deepseek).
 */

import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { API_KEY_REF, PLATFORM_URL, fetchDeepSeekBalance, formatAmount, formatDeepSeekBalance, formatPricingWindow, fetchDeepSeekBalanceSnapshot } from "./logic.js";

const name = "dsh-usage-deepseek";
const inject = ["commands", "credentials"];

/**
 * Host-side remote service exposing the latest balance snapshot to the browser.
 *
 * Mounted as a Typert remote service; the `./typert` manifest registers the
 * `deepseekUsage/snapshot` endpoint, and the client mounts it via `ctx.remote`.
 */
class DeepSeekUsageGateway extends TypertRemoteService {
  static inject = ["credentials"];

  constructor(ctx) {
    super(ctx, "deepseekUsage");
  }

  /** Latest normalized balance snapshot; throws on credential/network/API failure. */
  async snapshot() {
    return fetchDeepSeekBalanceSnapshot(this.ctx.credentials);
  }
}

/** Register the `/usage-deepseek` command and mount the browser remote gateway. */
async function apply(ctx) {
  await ctx.plugin(DeepSeekUsageGateway);
  ctx.commands.register({
    name: "usage-deepseek",
    description: "Show DeepSeek provider account balance",
    handler: async () => {
      try {
        const result = await fetchDeepSeekBalance(ctx);
        if (!result.ok) return { kind: "error", text: `DeepSeek usage: ${result.error}` };
        return { kind: "success", text: `DeepSeek (deepseek-official) usage\n\n${formatDeepSeekBalance(result.balance)}\n\nPricing: ${formatPricingWindow()}\n\nDeepSeek platform: ${PLATFORM_URL}` };
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        return { kind: "error", text: `DeepSeek usage failed: ${detail}` };
      }
    }
  });
}

// fetchDeepSeekBalance / formatDeepSeekBalance / fetchDeepSeekBalanceSnapshot
// are re-exported for standalone smoke tests; the loader only consumes the
// Cordis plugin contract ({ name, inject, apply }).
export { apply, inject, name, fetchDeepSeekBalance, formatAmount, formatDeepSeekBalance, fetchDeepSeekBalanceSnapshot, DeepSeekUsageGateway, API_KEY_REF };
