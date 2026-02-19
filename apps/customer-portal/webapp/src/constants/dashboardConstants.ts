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
} from "@wso2/oxygen-ui-icons-react";
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

// Configuration for Active Cases Chart data mapping.
export const ACTIVE_CASES_CHART_DATA = [
  {
    name: "Work In Progress",
    key: "workInProgress",
    color: colors.blue[500],
  },
  {
    name: "Awaiting Info",
    key: "waitingOnClient",
    color: colors.green[500],
  },
  {
    name: "Waiting On WSO2",
    key: "waitingOnWso2",
    color: colors.orange[500],
  },
] as const;

// Configuration for Outstanding Incidents Chart data mapping.
export const OUTSTANDING_INCIDENTS_CHART_DATA = [
  {
    name: "S4 - Low",
    key: "low",
    label: "Low (P4)",
    color: colors.grey[500],
  },
  {
    name: "S3 - Medium",
    key: "medium",
    label: "Medium (P3)",
    color: colors.blue[500],
  },
  {
    name: "S2 - High",
    key: "high",
    label: "High (P2)",
    color: colors.orange[500],
  },
  {
    name: "S1 - Critical",
    key: "critical",
    label: "Critical (P1)",
    color: colors.red[500],
  },
  {
    name: "S0 - Catastrophic",
    key: "catastrophic",
    label: "Catastrophic (P0)",
    color: colors.purple[500],
  }
] as const;

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

// Configuration for Cases Trend Chart data mapping.
export const CASES_TREND_CHART_DATA: CasesTrendChartDataItem[] = [
  {
    name: "Catastrophic (P0)",
    key: "catastrophic",
    color: colors.red[600],
    radius: [0, 0, 4, 4],
  },
  {
    name: "Critical (P1)",
    key: "critical",
    color: colors.blue[500],
  },
  {
    name: "High (P2)",
    key: "high",
    color: colors.green[500],
  },
  {
    name: "Medium (P3)",
    key: "medium",
    color: colors.orange[500],
  },
  {
    name: "Low (P4)",
    key: "low",
    color: colors.yellow[600],
    radius: [4, 4, 0, 0],
    border: true,
  },
];

// Placeholder data for Cases Trend Chart when in error state.
export const TREND_CHART_ERROR_PLACEHOLDER_DATA = [
  { period: "Jan", critical: 40, high: 24, medium: 24, low: 20, catastrophic: 5 },
  { period: "Feb", critical: 30, high: 13, medium: 22, low: 30, catastrophic: 2 },
  { period: "Mar", critical: 20, high: 98, medium: 22, low: 10, catastrophic: 8 },
  { period: "Apr", critical: 27, high: 39, medium: 20, low: 40, catastrophic: 3 },
  { period: "May", critical: 18, high: 48, medium: 21, low: 50, catastrophic: 6 },
  { period: "Jun", critical: 23, high: 38, medium: 25, low: 30, catastrophic: 4 },
];
