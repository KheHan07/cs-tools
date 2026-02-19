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

/** Vulnerability severity levels. */
export const VulnerabilitySeverity = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type VulnerabilitySeverity =
  (typeof VulnerabilitySeverity)[keyof typeof VulnerabilitySeverity];

/** Vulnerability status values. */
export const VulnerabilityStatus = {
  IN_PROGRESS: "in progress",
  OPEN: "open",
  RESOLVED: "resolved",
} as const;

export type VulnerabilityStatus =
  (typeof VulnerabilityStatus)[keyof typeof VulnerabilityStatus];

/**
 * Returns the Oxygen UI color path for vulnerability severity.
 *
 * @param severity - Severity label (Critical, High, Medium, Low).
 * @returns The Oxygen UI color path.
 */
export const getVulnerabilitySeverityColor = (severity?: string): string => {
  const normalized = severity?.toLowerCase().trim() || "";
  switch (normalized) {
    case VulnerabilitySeverity.CRITICAL:
      return "error.main";
    case VulnerabilitySeverity.HIGH:
      return "warning.main";
    case VulnerabilitySeverity.MEDIUM:
      return "text.disabled";
    case VulnerabilitySeverity.LOW:
      return "info.main";
    default:
      return "text.secondary";
  }
};

/**
 * Returns the Oxygen UI color path for vulnerability status.
 * Uses exact matches so "unresolved" does not match "resolved".
 *
 * @param status - Status label (In Progress, Open, Resolved).
 * @returns The Oxygen UI color path.
 */
export const getVulnerabilityStatusColor = (status?: string): string => {
  const normalized = status?.toLowerCase().trim() || "";
  switch (normalized) {
    case VulnerabilityStatus.IN_PROGRESS:
      return "warning.main";
    case VulnerabilityStatus.OPEN:
      return "info.main";
    case VulnerabilityStatus.RESOLVED:
      return "success.main";
    default:
      return "text.secondary";
  }
};
