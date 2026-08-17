/* Client-face Typert remote manifest for dsh-usage-deepseek (hand-written).
   The schema is a minimal strict codec: the host already zod-validated its
   result, so the client only enforces the strict codec contract shape. */
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

export const TYPERT_REMOTE = {
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

export default TYPERT_REMOTE;
