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

/** DeepSeek peak/off-peak schedule constants (Beijing time). */
export const BEIJING_TIME_ZONE: "Asia/Shanghai";
export const PEAK_WINDOWS: Array<{ start: number; end: number }>;
export const PEAK_WINDOW_LABEL: string;
/** Since 2026-08-23 weekends bill at the off-peak rate all day. */
export const WEEKEND_ALL_DAY_OFF_PEAK_SINCE: string;

/** Current minute-of-day in Beijing time (0-1439). */
export declare function beijingMinutesNow(date?: Date): number;
/** Day of week in Beijing time: 0 = Sunday … 6 = Saturday. */
export declare function beijingDayOfWeek(date?: Date): number;
/** True when Beijing time is on a Saturday or Sunday. */
export declare function isBeijingWeekend(date?: Date): boolean;
/** True while Beijing time bills at the peak rate; weekends never bill at peak. */
export declare function isPeakTime(date?: Date): boolean;
/** One-line pricing window status for the /usage-deepseek report. */
export declare function formatPricingWindow(date?: Date): string;

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
