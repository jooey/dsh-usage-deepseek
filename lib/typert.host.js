/* Host-face Typert manifest for dsh-usage-deepseek (hand-written). */
import z from "zod";

const deepseekBalanceSnapshotResult$schema = z.object({
  available: z.boolean().nullable(),
  balances: z.array(z.object({
    currency: z.string(),
    total_balance: z.string().nullable(),
    granted_balance: z.string().nullable(),
    topped_up_balance: z.string().nullable()
  }))
});

export const TYPERT = {
  package: "dsh-usage-deepseek",
  face: "host",
  schemas: [],
  invocations: [
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
  ],
  model: {
    services: [],
    events: [],
    objects: []
  }
};

export default TYPERT;
