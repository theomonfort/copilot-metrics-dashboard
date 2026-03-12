// =============================================================================
// Copilot Metrics API — TypeScript Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// API Response Envelopes
// -----------------------------------------------------------------------------

/** Response from multi-day report endpoints (e.g. organization-28-day). */
export interface MetricsReportResponse {
  download_links: string[];
  report_start_day: string;
  report_end_day: string;
}

/** Response from single-day report endpoints. */
export interface MetricsReportDayResponse {
  download_links: string[];
  report_day: string;
}

// -----------------------------------------------------------------------------
// Shared / Reusable Building Blocks
// -----------------------------------------------------------------------------

/** Token usage breakdown for CLI interactions. */
export interface TokenUsage {
  avg_tokens_per_request: number;
  output_tokens_sum: number;
  prompt_tokens_sum: number;
}

/** Pull-request activity totals for a single day. */
export interface PullRequestTotals {
  median_minutes_to_merge: number;
  median_minutes_to_merge_copilot_authored: number;
  total_applied_suggestions: number;
  total_copilot_applied_suggestions: number;
  total_copilot_suggestions: number;
  total_created: number;
  total_created_by_copilot: number;
  total_merged: number;
  total_merged_created_by_copilot: number;
  total_reviewed: number;
  total_reviewed_by_copilot: number;
  total_suggestions: number;
}

/** Code-activity metrics shared across several "totals_by_*" objects. */
export interface CodeActivityMetrics {
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
}

// -----------------------------------------------------------------------------
// "totals_by_*" Breakdown Types (org-level day totals)
// -----------------------------------------------------------------------------

/** Aggregate CLI totals (org-level — no version info). */
export interface OrgCliTotals {
  prompt_count: number;
  request_count: number;
  session_count: number;
  token_usage: TokenUsage;
}

/** Per-feature breakdown. */
export interface FeatureTotals extends CodeActivityMetrics {
  feature: string;
  user_initiated_interaction_count: number;
}

/** Per-IDE breakdown. */
export interface IdeTotals extends CodeActivityMetrics {
  ide: string;
  user_initiated_interaction_count: number;
}

/** Per-language + feature breakdown. */
export interface LanguageFeatureTotals extends CodeActivityMetrics {
  feature: string;
  language: string;
}

/** Per-language + model breakdown. */
export interface LanguageModelTotals {
  language: string;
  model: string;
  [key: string]: unknown;
}

/** Per-model + feature breakdown. */
export interface ModelFeatureTotals {
  model: string;
  feature: string;
  [key: string]: unknown;
}

// -----------------------------------------------------------------------------
// Organization-Level Day Totals (one entry per day in the NDJSON payload)
// -----------------------------------------------------------------------------

export interface OrgDayTotals {
  day: string;
  enterprise_id: string;

  // Top-level activity counts
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  user_initiated_interaction_count: number;

  // LOC metrics
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;

  // Active-user gauges
  daily_active_users: number;
  daily_active_cli_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  monthly_active_chat_users: number;
  monthly_active_agent_users: number;

  // Sub-totals
  pull_requests: PullRequestTotals;
  totals_by_cli: OrgCliTotals;
  totals_by_feature: FeatureTotals[];
  totals_by_ide: IdeTotals[];
  totals_by_language_feature: LanguageFeatureTotals[];
  totals_by_language_model: LanguageModelTotals[];
  totals_by_model_feature: ModelFeatureTotals[];
}

/** Top-level org metrics object parsed from a single NDJSON line. */
export interface OrgMetricsReport {
  enterprise_id: string;
  report_start_day: string;
  report_end_day: string;
  day_totals: OrgDayTotals[];
}

// -----------------------------------------------------------------------------
// User-Level Types (one NDJSON line per user per day)
// -----------------------------------------------------------------------------

/** Timestamped version snapshot. */
export interface VersionSnapshot {
  sampled_at: string;
}

export interface CliVersionSnapshot extends VersionSnapshot {
  cli_version: string;
}

export interface IdeVersionSnapshot extends VersionSnapshot {
  ide_version: string;
}

export interface PluginVersionSnapshot extends VersionSnapshot {
  plugin: string;
  plugin_version: string;
}

/** CLI totals at the user level (includes version info). */
export interface UserCliTotals {
  last_known_cli_version: CliVersionSnapshot;
  prompt_count: number;
  request_count: number;
  session_count: number;
  token_usage: TokenUsage;
}

/** Per-IDE breakdown at the user level (includes version info). */
export interface UserIdeTotals extends CodeActivityMetrics {
  ide: string;
  last_known_ide_version: IdeVersionSnapshot;
  last_known_plugin_version: PluginVersionSnapshot;
  user_initiated_interaction_count: number;
}

/** A single user's daily metrics row (parsed from NDJSON). */
export interface UserDayMetrics {
  day: string;
  enterprise_id: string;
  user_id: number;
  user_login: string;

  // Top-level activity counts
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  user_initiated_interaction_count: number;

  // LOC metrics
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;

  // Feature-usage flags
  used_agent: boolean;
  used_chat: boolean;
  used_cli: boolean;

  // Sub-totals
  totals_by_cli: UserCliTotals;
  totals_by_feature: FeatureTotals[];
  totals_by_ide: UserIdeTotals[];
  totals_by_language_feature: LanguageFeatureTotals[];
  totals_by_language_model: LanguageModelTotals[];
  totals_by_model_feature: ModelFeatureTotals[];
}

// -----------------------------------------------------------------------------
// GitHub Members API
// -----------------------------------------------------------------------------

export interface GitHubMember {
  login: string;
  id: number;
  avatar_url: string;
  type: string;
}

// -----------------------------------------------------------------------------
// Dashboard Aggregated Types
// -----------------------------------------------------------------------------

/** Per-user summary computed from one or more `UserDayMetrics` rows. */
export interface UserSummary {
  user_id: number;
  user_login: string;
  avatar_url?: string;

  // Totals across the reporting window
  total_loc_added: number;
  total_loc_deleted: number;
  total_loc_suggested_to_add: number;
  total_loc_suggested_to_delete: number;
  total_code_acceptances: number;
  total_code_generations: number;
  total_interactions: number;

  // Computed acceptance rate (acceptances / generations), 0–1
  acceptance_rate: number;

  // Feature-usage flags (true if used on any day)
  used_agent: boolean;
  used_chat: boolean;
  used_cli: boolean;

  // Number of active days in the window
  active_days: number;

  // Primary IDE & language (most frequent across the window)
  primary_ide: string | null;
  primary_language: string | null;
}

/** Organisation-wide summary computed from `OrgDayTotals[]`. */
export interface OrgSummary {
  enterprise_id: string;
  report_start_day: string;
  report_end_day: string;

  // Aggregate metrics
  total_loc_added: number;
  total_loc_deleted: number;
  total_loc_suggested_to_add: number;
  total_loc_suggested_to_delete: number;
  total_code_acceptances: number;
  total_code_generations: number;
  total_interactions: number;

  acceptance_rate: number;

  // Peak active-user counts across the window
  peak_daily_active_users: number;
  peak_weekly_active_users: number;
  peak_monthly_active_users: number;

  // Pull-request aggregates
  total_prs_created: number;
  total_prs_merged: number;
  total_prs_created_by_copilot: number;
  total_prs_merged_created_by_copilot: number;

  // Per-day data for charting
  daily_totals: OrgDayTotals[];
}

/** A single data-point for time-series charts. */
export interface DailyDataPoint {
  day: string;
  value: number;
}

/** Breakdown entry for pie / bar charts (e.g. by IDE or language). */
export interface BreakdownEntry {
  label: string;
  value: number;
}
