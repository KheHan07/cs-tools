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
  SUBSCRIPTION_STATUS,
  type SubscriptionStatus,
  SLA_STATUS,
  SUPPORT_TIER,
  PROJECT_TYPE,
  SYSTEM_HEALTH,
  PROJECT_USER_STATUSES,
  TIME_TRACKING_BADGE_TYPES,
  type TimeTrackingBadgeType,
  DEPLOYMENT_STATUS,
  PRODUCT_SUPPORT_STATUS,
  type ProjectStatusChipColor,
} from "@constants/projectDetailsConstants";

/**
 * Get the palette color key for a time tracking badge type.
 *
 * @param {TimeTrackingBadgeType | string} type - The badge type.
 * @returns {"warning" | "success" | "info" | "secondary" | "primary"} The palette color key.
 */
export const getTimeTrackingBadgePaletteKey = (
  type: TimeTrackingBadgeType | string,
): ProjectStatusChipColor => {
  const normalizedType = type?.toLowerCase();

  switch (normalizedType) {
    case TIME_TRACKING_BADGE_TYPES.SUPPORT:
      return "warning";
    case TIME_TRACKING_BADGE_TYPES.BILLABLE:
    case TIME_TRACKING_BADGE_TYPES.CONSULTATION:
      return "success";
    case TIME_TRACKING_BADGE_TYPES.MAINTENANCE:
      return "secondary";
    case TIME_TRACKING_BADGE_TYPES.CASE:
      return "info";
    default:
      return "primary";
  }
};

/** Value that may be a string, number, or {id, label} object from API. */
export type DisplayableValue =
  | string
  | number
  | null
  | undefined
  | { id?: string; label?: string };

/**
 * Returns the value or "--" for null/undefined/empty string.
 * Handles API objects with {id, label} by extracting label.
 *
 * @param {DisplayableValue} value - The value to display.
 * @returns {string} The value or "--".
 */
export const displayValue = (value: DisplayableValue): string => {
  if (value === null || value === undefined) {
    return "--";
  }
  if (typeof value === "object" && "label" in value) {
    const label = (value as { label?: string }).label;
    return label === null || label === undefined || label === ""
      ? "--"
      : label;
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string" && value === "") {
    return "--";
  }
  return typeof value === "string" ? value : "--";
};

/**
 * Formats a date string into "MMM DD, YYYY" format.
 * Example: "Jan 15, 2024"
 *
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
export const formatProjectDate = (dateString: string): string => {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Determines the color of the SLA status chip based on the status string.
 *
 * @param {string} status - The SLA status string (e.g., "Good", "Bad", "Met", "Breached").
 * @returns {"success" | "error" | "default" | "warning"} The color for the Chip component.
 */
export const getSLAStatusColor = (status: string): ProjectStatusChipColor => {
  const normalizedStatus = status?.toLowerCase();
  const goodValue = SLA_STATUS.GOOD.toLowerCase();

  switch (normalizedStatus) {
    case goodValue:
    case "good":
      return "success";
    case SLA_STATUS.BAD.toLowerCase():
      return "error";
    default:
      return "default";
  }
};

/**
 * Determines the color of the Support Tier chip based on the tier string.
 *
 * @param {string} tier - The support tier string (e.g., "Enterprise", "Standard").
 * @returns {"primary" | "info" | "default" | "success" | "warning" | "error"} The color for the Chip component.
 */
export const getSupportTierColor = (tier: string): ProjectStatusChipColor => {
  const normalizedTier = tier?.toLowerCase();

  switch (normalizedTier) {
    case SUPPORT_TIER.ENTERPRISE.toLowerCase():
      return "warning";
    case SUPPORT_TIER.STANDARD.toLowerCase():
      return "info";
    default:
      return "default";
  }
};

/**
 * Determines the color of the Project Type chip based on the type string.
 *
 * @param {string} type - The project type string (e.g., "Free", "Subscription").
 * @returns {"primary" | "info" | "default" | "success" | "warning" | "error"} The color for the Chip component.
 */
export const getProjectTypeColor = (type: string): ProjectStatusChipColor => {
  const normalizedType = type?.toLowerCase();

  switch (normalizedType) {
    case PROJECT_TYPE.SUBSCRIPTION.toLowerCase():
      return "info";
    case PROJECT_TYPE.FREE.toLowerCase():
      return "warning";
    default:
      return "default";
  }
};

/**
 * Determines the color of the System Health chip based on the status string.
 *
 * @param {string} status - The system health status string (e.g., "Critical", "Healthy").
 * @returns {"primary" | "info" | "default" | "success" | "warning" | "error"} The color for the Chip component.
 */
export const getSystemHealthColor = (
  status: string,
): ProjectStatusChipColor => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case SYSTEM_HEALTH.HEALTHY.toLowerCase():
      return "success";
    case SYSTEM_HEALTH.CRITICAL.toLowerCase():
      return "error";
    default:
      return "default";
  }
};

/**
 * Determines the subscription status based on the end date.
 *
 * @param {string} endDateString - The subscription end date string.
 * @returns {SubscriptionStatus} The status string.
 */
export const getSubscriptionStatus = (
  endDateString: string,
): SubscriptionStatus => {
  if (!endDateString) {
    return SUBSCRIPTION_STATUS.ACTIVE;
  }

  const today = new Date();
  const endDate = new Date(endDateString);

  // Calculate difference in milliseconds
  const diffTime = endDate.getTime() - today.getTime();
  // Convert to days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return SUBSCRIPTION_STATUS.EXPIRED;
  }

  if (diffDays <= 30) {
    return SUBSCRIPTION_STATUS.EXPIRING_SOON;
  }

  return SUBSCRIPTION_STATUS.ACTIVE;
};

/**
 * Determines the color of the Subscription Status chip based on the status string.
 *
 * @param {SubscriptionStatus | string} status - The subscription status string.
 * @returns {"primary" | "info" | "default" | "success" | "warning" | "error"} The color for the Chip component.
 */
export const getSubscriptionColor = (
  status: SubscriptionStatus | string,
): ProjectStatusChipColor => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case SUBSCRIPTION_STATUS.EXPIRED.toLowerCase():
      return "error";
    case SUBSCRIPTION_STATUS.EXPIRING_SOON.toLowerCase():
      return "warning";
    case SUBSCRIPTION_STATUS.ACTIVE.toLowerCase():
      return "success";
    default:
      return "default";
  }
};

/**
 * Calculates the percentage of time elapsed between two dates.
 *
 * @param {string} start - The start date string.
 * @param {string} end - The end date string.
 * @returns {number} The progress percentage (0-100).
 */
export const calculateProgress = (start: string, end: string): number => {
  if (!start || !end) {
    return 0;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 0;
  }

  const today = new Date();
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = today.getTime() - startDate.getTime();

  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

/**
 * Get the color for a project user status chip based on the status string.
 *
 * @param {string} status - The user status.
 * @returns {"primary" | "info" | "default" | "success" | "warning" | "error"} The color for the Chip component.
 */
export const getUserStatusColor = (status: string): ProjectStatusChipColor => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case PROJECT_USER_STATUSES.REGISTERED.toLowerCase():
      return "success";
    case PROJECT_USER_STATUSES.INVITED.toLowerCase():
      return "warning";
    default:
      return "default";
  }
};

/**
 * Formats bytes into a human-readable string (KB, MB, or GB).
 *
 * @param {number} bytes - The number of bytes.
 * @returns {string} The formatted string (e.g., "1.50 MB" or "2.29 GB").
 */
export const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 ** 3) {
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
};

/**
 * Determines the color of the Deployment Status chip based on the status string.
 *
 * @param {string} status - The deployment status string (e.g., "Healthy", "Warning").
 * @returns {"success" | "warning" | "error" | "default"} The color for the Chip component.
 */
export const getDeploymentStatusColor = (
  status: string,
): ProjectStatusChipColor => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case DEPLOYMENT_STATUS.HEALTHY.toLowerCase():
      return "success";
    case DEPLOYMENT_STATUS.WARNING.toLowerCase():
      return "warning";
    case DEPLOYMENT_STATUS.ERROR.toLowerCase():
      return "error";
    default:
      return "default";
  }
};

/**
 * Determines the color of the Product Support Status chip based on the status string.
 *
 * @param {string} status - The product support status string (e.g., "Active Support", "End of Life").
 * @returns {"success" | "warning" | "error" | "default"} The color for the Chip component.
 */
export const getProductSupportStatusColor = (
  status: string,
): ProjectStatusChipColor => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case PRODUCT_SUPPORT_STATUS.ACTIVE.toLowerCase():
      return "success";
    case PRODUCT_SUPPORT_STATUS.END_OF_LIFE.toLowerCase():
    case PRODUCT_SUPPORT_STATUS.DEPRECATED.toLowerCase():
      return "error";
    case PRODUCT_SUPPORT_STATUS.LIMITED.toLowerCase():
    case PRODUCT_SUPPORT_STATUS.EXTENDED.toLowerCase():
      return "warning";
    default:
      return "default";
  }
};
