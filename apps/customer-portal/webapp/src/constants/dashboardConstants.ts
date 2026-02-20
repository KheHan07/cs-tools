// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import {
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  CalendarDays,
  FileText,
  Server,
  Shield,
} from "@wso2/oxygen-ui-icons-react";
import type { ComponentType } from "react";
import { type DashboardMockStats } from "@models/responses";
import { colors } from "@wso2/oxygen-ui";

// Valid color types for the stat card icons.
export type StatCardColor =
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success";

// Configuration for a single statistic card.
export interface StatConfigItem {
  id: Exclude<keyof DashboardMockStats, "casesTrend">;
  label: string;
  icon: any;
  iconColor: StatCardColor;
  tooltipText: string;
}

/** Case type labels to filter stats by (Incident, Query, Service Request, Security Report Analysis). */
export const DASHBOARD_CASE_TYPE_LABELS = [
  "Incident",
  "Query",
  "Service Request",
  "Security Report Analysis",
] as const;

// Dashboard statistics list.
export const DASHBOARD_STATS: StatConfigItem[] = [
  {
    id: "totalCases",
    label: "Total Engagements",
    icon: Clock,
    iconColor: "primary",
    tooltipText: "Total number of cases reported for this project",
  },
  {
    id: "openCases",
    label: "Active Engagements",
    icon: AlertCircle,
    iconColor: "warning",
    tooltipText: "Currently active and unresolved cases",
  },
  {
    id: "resolvedCases",
    label: "Resolved This Month",
    icon: CheckCircle,
    iconColor: "success",
    tooltipText: "Successfully closed and resolved cases",
  },
  {
    id: "avgResponseTime",
    label: "Avg. Response Time",
    icon: Activity,
    iconColor: "info",
    tooltipText: "Average time taken to first respond to a case",
  },
];

// Configuration for Active Cases Chart data mapping (stateCount labels, exclude Closed).
export const ACTIVE_CASES_CHART_DATA = [
  { name: "Open", key: "open", color: colors.blue[500] },
  { name: "Work In Progress", key: "workInProgress", color: colors.teal?.[600] ?? "#0D9488" },
  { name: "Awaiting Info", key: "awaitingInfo", color: colors.green[500] },
  { name: "Waiting On WSO2", key: "waitingOnWso2", color: colors.orange[500] },
  { name: "Solution Proposed", key: "solutionProposed", color: colors.grey?.[500] ?? "#9CA3AF" },
  { name: "Reopened", key: "reopened", color: colors.purple[500] },
] as const;

/** Maps severity API label to display name (S0-S4) for charts and table. */
export const SEVERITY_LABEL_TO_DISPLAY: Record<string, string> = {
  "Catastrophic (P0)": "S0",
  "Critical (P1)": "S1",
  "High (P2)": "S2",
  "Medium (P3)": "S3",
  "Low (P4)": "S4",
};

// Legend display format: "S{n} - {Severity}". Same order for Outstanding Engagements and Cases Trend.
// Order: S0 - Catastrophic (highest), S1 - Critical, S2 - High, S3 - Medium, S4 - Low (lowest).
// Matches SEVERITY_LABEL_TO_DISPLAY: Catastrophic (P0)→S0, Critical (P1)→S1, etc.
export const SEVERITY_LEGEND_ORDER = [
  { key: "catastrophic", label: "Catastrophic (P0)", displayName: "S0 - Catastrophic", color: colors.red[500] },
  { key: "critical", label: "Critical (P1)", displayName: "S1 - Critical", color: colors.orange[500] },
  { key: "high", label: "High (P2)", displayName: "S2 - High", color: colors.yellow[700] },
  { key: "medium", label: "Medium (P3)", displayName: "S3 - Medium", color: colors.blue[500] },
  { key: "low", label: "Low (P4)", displayName: "S4 - Low", color: colors.green[500] },
] as const;

export const OUTSTANDING_INCIDENTS_CHART_DATA = SEVERITY_LEGEND_ORDER;

/** API severity labels in chart order (catastrophic, critical, high, medium, low) for casesTrend mapping. */
export const SEVERITY_API_LABELS = SEVERITY_LEGEND_ORDER.map((item) => item.label);

/** Case type entries for Outstanding Engagements chart (from caseTypeCount). */
export const OUTSTANDING_CASE_TYPE_ENTRIES = [
  { key: "serviceRequest", label: "Service Request", displayName: "Service Request", color: colors.grey?.[500] ?? "#6B7280" },
  { key: "securityReportAnalysis", label: "Security Report Analysis", displayName: "Security Report Analysis", color: colors.purple[500] },
] as const;

/** Combined chart data: severities + Service Request + Security Report Analysis. */
export const OUTSTANDING_ENGAGEMENTS_CHART_DATA = [
  ...OUTSTANDING_INCIDENTS_CHART_DATA,
  ...OUTSTANDING_CASE_TYPE_ENTRIES,
];

/**
 * Type definition for Cases Trend Chart data item.
 */
export interface CasesTrendChartDataItem {
  name: string;
  key: string;
  color: string;
  radius?: [number, number, number, number];
  border?: boolean;
}

// Configuration for Cases Trend Chart (same legend order as Outstanding Engagements).
export const CASES_TREND_CHART_DATA: CasesTrendChartDataItem[] =
  SEVERITY_LEGEND_ORDER.map((item, i) => ({
    name: item.displayName,
    key: item.key,
    color: item.color,
    ...(i === 0 && { radius: [0, 0, 4, 4] as [number, number, number, number] }),
    ...(i === 4 && { radius: [4, 4, 0, 0] as [number, number, number, number], border: true }),
  }));

/** Case type display config for Outstanding Engagements table Type column. */
export interface CaseTypeChipConfig {
  displayLabel: string;
  Icon: ComponentType<{ size?: number }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

/** API labels that map to "Case" (Incident + Query). */
const CASE_TYPE_LABELS = ["Incident", "Query"];

/** Resolves case type chip config from API label. Incident/Query show as "Case". */
export function getCaseTypeChipConfig(
  apiLabel: string | undefined | null,
): CaseTypeChipConfig | null {
  if (!apiLabel?.trim()) return null;
  const normalized = apiLabel.trim();
  const isCase = CASE_TYPE_LABELS.some(
    (l) => l.toLowerCase() === normalized.toLowerCase(),
  );
  if (isCase) {
    return {
      displayLabel: "Case",
      Icon: FileText,
      bgColor: colors.orange?.[100] ?? "#FFF7ED",
      textColor: colors.orange?.[800] ?? "#9A3412",
      borderColor: colors.orange?.[200] ?? "#FED7AA",
    };
  }
  if (/security\s*report\s*analysis/i.test(normalized)) {
    return {
      displayLabel: "Security Report Analysis",
      Icon: Shield,
      bgColor: colors.purple?.[100] ?? "#F3E8FF",
      textColor: colors.purple?.[800] ?? "#6B21A8",
      borderColor: colors.purple?.[200] ?? "#E9D5FF",
    };
  }
  if (/service\s*request/i.test(normalized)) {
    return {
      displayLabel: "Service Request",
      Icon: Server,
      bgColor: colors.grey?.[100] ?? "#F1F5F9", 
      textColor: colors.grey?.[800] ?? "#1E293B",
      borderColor: colors.grey?.[200] ?? "#E2E8F0",
    };
  }
  if (/change\s*request/i.test(normalized)) {
    return {
      displayLabel: "Change Request",
      Icon: CalendarDays,
      bgColor: colors.indigo?.[100] ?? colors.purple?.[100] ?? "#E0E7FF",
      textColor: colors.indigo?.[800] ?? colors.purple?.[800] ?? "#3730A3",
      borderColor: colors.indigo?.[200] ?? colors.purple?.[200] ?? "#C7D2FE",
    };
  }
  return {
    displayLabel: normalized,
    Icon: FileText,
    bgColor: colors.grey?.[100] ?? "#F3F4F6",
    textColor: colors.grey?.[800] ?? "#1F2937",
    borderColor: colors.grey?.[200] ?? "#E5E7EB",
  };
}

// Placeholder data for Cases Trend Chart when in error state.
export const TREND_CHART_ERROR_PLACEHOLDER_DATA = [
  { period: "Jan", critical: 40, high: 24, medium: 24, low: 20, catastrophic: 5 },
  { period: "Feb", critical: 30, high: 13, medium: 22, low: 30, catastrophic: 2 },
  { period: "Mar", critical: 20, high: 98, medium: 22, low: 10, catastrophic: 8 },
  { period: "Apr", critical: 27, high: 39, medium: 20, low: 40, catastrophic: 3 },
  { period: "May", critical: 18, high: 48, medium: 21, low: 50, catastrophic: 6 },
  { period: "Jun", critical: 23, high: 38, medium: 25, low: 30, catastrophic: 4 },
];
