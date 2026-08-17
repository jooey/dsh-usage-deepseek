/**
 * dsh-usage-deepseek host face type declaration.
 *
 * The loader consumes the Cordis plugin contract ({ name, inject, apply }).
 * Core logic re-exports are safe to import in tooling; the dependency-free
 * sources also live in ./logic (see lib/logic.js for exact behavior).
 */

import type { Context } from "@deepseek-ai/cordis";
import type { CredentialRef } from "@deepseek-ai/dsh-credentials";

export const name: string;
export const inject: string[];
export const API_KEY_REF: string;
export const DEFAULT_BASE_URL: string;
export const PLATFORM_URL: string;

export interface FetchDeepSeekBalanceResult {
  ok: boolean;
  balance?: {
    is_available?: boolean;
    balance_infos?: Array<{
      currency?: string;
      total_balance?: string;
      granted_balance?: string;
      topped_up_balance?: string;
    }>;
  };
  error?: string;
}

export interface DeepseekBalanceInfo {
  currency: string;
  total_balance: string | null;
  granted_balance: string | null;
  topped_up_balance: string | null;
}

export interface DeepseekBalanceSnapshot {
  available: boolean | null;
  balances: DeepseekBalanceInfo[];
}

export declare function apply(ctx: Context): Promise<void>;
export declare function fetchDeepSeekBalance(ctx: Context): Promise<FetchDeepSeekBalanceResult>;
export declare function formatAmount(value: unknown, currency: string | undefined): string;
export declare function formatDeepSeekBalance(balance: unknown): string;
export declare function fetchDeepSeekBalanceSnapshot(credentials: {
  resolve(ref: CredentialRef): Promise<{ value: string; source?: string } | undefined>;
}): Promise<DeepseekBalanceSnapshot>;

export declare class DeepSeekUsageGateway {
  static inject: string[];
  constructor(ctx: Context);
  snapshot(): Promise<DeepseekBalanceSnapshot>;
}
