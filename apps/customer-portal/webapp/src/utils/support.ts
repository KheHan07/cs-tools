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
  CircleAlert,
  CircleCheck,
  CircleQuestionMark,
  CircleX,
  Clock,
  MessageCircle,
  RotateCcw,
} from "@wso2/oxygen-ui-icons-react";
import {
  ChatAction,
  ChatStatus,
  CaseStatus,
  CallRequestStatus,
  CaseSeverity,
  CaseSeverityLevel,
} from "@constants/supportConstants";
import type { CaseComment } from "@models/responses";
import type { Theme } from "@wso2/oxygen-ui";
import DOMPurify from "dompurify";
import { createElement, type ComponentType, type ReactNode } from "react";

/**
 * Formats a date string into a user-friendly date and time format.
 *
 * @param {string} dateStr - The date string to format.
 * @param {"short" | "long"} [formatStr="long"] - The format style.
 * @returns {string} The formatted date and time.
 */
export function formatDateTime(
  dateStr: string | null | undefined,
  formatStr: "short" | "long" = "long",
): string {
  if (!dateStr) {
    return "--";
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return "--";
  }

  if (formatStr === "short") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

export type ChatActionState =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error";

/** Assigned engineer from API: string or { id, label?, name? } object. */
export type AssignedEngineerValue =
  | string
  | { id: string; label?: string; name?: string }
  | null
  | undefined;

/** Extracts display string from assigned engineer object (label or name). */
function getAssignedEngineerDisplayValue(obj: {
  id: string;
  label?: string;
  name?: string;
}): string {
  return obj.label ?? obj.name ?? "";
}

/**
 * Extracts display label from assigned engineer (string or { id, label?, name? } object).
 *
 * @param value - Assigned engineer from API.
 * @returns {string} Display label or empty string if null/undefined.
 */
export function getAssignedEngineerLabel(value: AssignedEngineerValue): string {
  if (value == null || value === "") return "";
  if (typeof value === "object") return getAssignedEngineerDisplayValue(value);
  return typeof value === "string" ? value : "";
}

/**
 * Formats a value for display in case details; null/undefined/empty become "--".
 * Handles assigned engineer object: { id, label? } or { id, name? } -> display value.
 *
 * @param value - Raw value from API or state.
 * @returns {string} Display string.
 */
export function formatValue(
  value:
    | string
    | number
    | { id: string; label?: string; name?: string }
    | null
    | undefined,
): string {
  if (value == null || value === "") return "--";
  if (typeof value === "object")
    return getAssignedEngineerDisplayValue(value) || "--";
  return String(value);
}

/**
 * Derives initials from a name string or assigned engineer object (e.g. "John Doe" -> "JD").
 *
 * @param name - Full name string or { id, label?, name? } object from API.
 * @returns {string} Up to 2 uppercase initials, or "--" if empty/invalid.
 */
export function getInitials(
  name:
    | string
    | { id: string; label?: string; name?: string }
    | null
    | undefined,
): string {
  const label =
    typeof name === "object" && name
      ? getAssignedEngineerDisplayValue(name)
      : name;
  if (!label || typeof label !== "string") return "--";
  const initials = label
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return initials || "--";
}

/**
 * Formats SLA response time from milliseconds (string or number) to human-readable (e.g. "4 hours", "2 days").
 *
 * @param ms - Milliseconds as string or number from API.
 * @returns {string} Formatted string or "--" if invalid.
 */
export function formatSlaResponseTime(
  ms: string | number | null | undefined,
): string {
  const n = typeof ms === "string" ? parseInt(ms, 10) : ms;
  if (n == null || Number.isNaN(n) || n < 0) return "--";
  if (n < 60_000) {
    const seconds = Math.floor(n / 1000);
    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  }
  if (n < 3600_000) {
    const minutes = Math.floor(n / 60_000);
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  if (n < 86400_000) {
    const hours = Math.floor(n / 3600_000);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const days = Math.floor(n / 86400_000);
  return `${days} day${days === 1 ? "" : "s"}`;
}

/**
 * Formats byte count for display (e.g. 1024 -> "1 KB", 245760 -> "240 KB").
 *
 * @param bytes - Size in bytes (number or string from API).
 * @returns {string} Formatted string like "1.2 MB" or "18 KB".
 */
export function formatFileSize(
  bytes: number | string | null | undefined,
): string {
  const n = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
  if (n == null || Number.isNaN(n)) return "--";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1).replace(/\.0$/, "")} KB`;
  return `${(n / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
}

/**
 * Returns whether to show View or Resume for a chat status.
 *
 * @param status - Chat status string (e.g. Resolved, Still Open, Abandoned).
 * @returns {ChatAction} "view" or "resume".
 */
export function getChatStatusAction(status: string): ChatAction {
  const normalized = status?.toLowerCase() || "";

  switch (true) {
    case normalized.includes("open"):
      return ChatAction.RESUME;
    default:
      return ChatAction.VIEW;
  }
}

/**
 * Returns the color for a chat action button.
 *
 * @param action - The action type ("view" or "resume").
 * @returns {ChatActionState} Palette color path.
 */
export function getChatActionColor(action: ChatAction): ChatActionState {
  switch (action) {
    case ChatAction.RESUME:
      return "info";
    default:
      return "primary";
  }
}

/**
 * Returns the color path for a chat status.
 *
 * @param status - Chat status string.
 * @returns {string} Palette color path.
 */
export function getChatStatusColor(status: string): string {
  const normalized = status?.toLowerCase() || "";

  switch (true) {
    case normalized.includes(ChatStatus.RESOLVED.toLowerCase()):
      return "success.main";
    case normalized.includes(ChatStatus.STILL_OPEN.toLowerCase()):
      return "info.main";
    case normalized.includes(ChatStatus.ABANDONED.toLowerCase()):
      return "error.main";
    default:
      return "secondary.main";
  }
}

/**
 * Resolves a color from the theme palette for the alpha() utility.
 *
 * @param path - Color path.
 * @param theme - Oxygen UI theme.
 * @returns {string} The resolved color string.
 */
export function resolveColorFromTheme(path: string, theme: Theme): string {
  return (
    (path
      .split(".")
      .reduce<unknown>(
        (acc, part) =>
          (acc as Record<string, unknown> | null | undefined)?.[part],
        theme.palette as unknown,
      ) as string) || path
  );
}

/**
 * Formats a date string or Date object into a relative time (e.g., "2 days ago", "1 hour ago").
 *
 * @param date - Date string or Date object.
 * @returns {string} Human readable relative time.
 */
export function formatRelativeTime(date: string | Date | undefined): string {
  if (!date) return "--";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "--";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
}

/**
 * Derives the label and pluralized "all" label from a filter ID.
 *
 * @param id - The filter ID (e.g., "status").
 * @returns { label: string; allLabel: string } The derived labels.
 */
export function deriveFilterLabels(id: string): {
  label: string;
  allLabel: string;
} {
  const label = id.charAt(0).toUpperCase() + id.slice(1);
  const allLabel = `All ${
    label.endsWith("s")
      ? `${label}es`
      : label.endsWith("y")
        ? `${label.slice(0, -1)}ies`
        : `${label}s`
  }`;

  return { allLabel, label };
}

/** Attachment file category for icon selection. TODO: Replace with enum in a later PR. */
export type AttachmentFileCategory =
  | "image"
  | "pdf"
  | "archive"
  | "text"
  | "file";

/**
 * Returns the file category for attachment icon/display (image, pdf, archive, text, file).
 *
 * @param fileName - File name.
 * @param type - MIME type.
 * @returns {AttachmentFileCategory} The category.
 */
export function getAttachmentFileCategory(
  fileName: string,
  type: string,
): AttachmentFileCategory {
  const n = fileName.toLowerCase();
  const t = type.toLowerCase();
  if (
    /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(n) ||
    t.startsWith("image/")
  ) {
    return "image";
  }
  if (/\.pdf$/i.test(n) || t.includes("pdf")) return "pdf";
  if (
    /\.(zip|rar|7z|tar|gz)$/i.test(n) ||
    t.includes("zip") ||
    t.includes("archive")
  ) {
    return "archive";
  }
  if (/\.(log|txt)$/i.test(n) || t.startsWith("text/")) return "text";
  return "file";
}

/**
 * Returns the icon component for a given case status label.
 *
 * @param statusLabel - The case status label.
 * @returns {ComponentType<{ size?: number }>} The icon component.
 */
export function getStatusIcon(
  statusLabel?: string,
): ComponentType<{ size?: number }> {
  const normalized = statusLabel?.toLowerCase() || "";

  switch (true) {
    case normalized === CaseStatus.OPEN.toLowerCase():
      return CircleAlert;
    case normalized === CaseStatus.WORK_IN_PROGRESS.toLowerCase():
      return Clock;
    case normalized === CaseStatus.AWAITING_INFO.toLowerCase():
      return MessageCircle;
    case normalized === CaseStatus.WAITING_ON_WSO2.toLowerCase():
      return CircleQuestionMark;
    case normalized === CaseStatus.SOLUTION_PROPOSED.toLowerCase():
      return CircleCheck;
    case normalized === CaseStatus.CLOSED.toLowerCase():
      return CircleX;
    case normalized === CaseStatus.REOPENED.toLowerCase():
      return RotateCcw;
    default:
      return CircleAlert;
  }
}

/**
 * Returns the Oxygen UI color path for a given call request status label.
 *
 * @param status - The call request status (e.g., "SCHEDULED", "PENDING").
 * @returns {string} The Oxygen UI color path.
 */
export function getCallRequestStatusColor(status?: string): string {
  const normalized = status?.toLowerCase() || "";

  switch (true) {
    case normalized.includes(CallRequestStatus.SCHEDULED.toLowerCase()):
      return "info.main";
    case normalized.includes(CallRequestStatus.PENDING.toLowerCase()):
      return "warning.main";
    case normalized.includes(CallRequestStatus.COMPLETED.toLowerCase()):
      return "success.main";
    case normalized.includes(CallRequestStatus.CANCELLED.toLowerCase()):
    case normalized.includes(CallRequestStatus.REJECTED.toLowerCase()):
      return "error.main";
    default:
      return "text.secondary";
  }
}

/**
 * Returns the Oxygen UI color path for a given severity label.
 *
 * @param {string} label - The severity label (e.g., "Critical (P1)", "S1").
 * @returns {string} The Oxygen UI color path.
 */
export function getSeverityColor(label?: string): string {
  switch (label) {
    case CaseSeverity.CATASTROPHIC:
    case CaseSeverityLevel.S0:
      return "error.main";
    case CaseSeverity.CRITICAL:
    case CaseSeverityLevel.S1:
      return "warning.main";
    case CaseSeverity.HIGH:
    case CaseSeverityLevel.S2:
      return "info.main";
    case CaseSeverity.MEDIUM:
    case CaseSeverityLevel.S3:
      return "secondary.main";
    case CaseSeverity.LOW:
    case CaseSeverityLevel.S4:
      return "success.main";
    default:
      return "text.primary";
  }
}

/**
 * Returns the Oxygen UI color path for a given case status label.
 *
 * @param {string} label - The case status label.
 * @returns {string} The Oxygen UI color path.
 */
export function getStatusColor(label?: string): string {
  switch (label) {
    case CaseStatus.OPEN:
      return "info.main";
    case CaseStatus.WORK_IN_PROGRESS:
      return "warning.main";
    case CaseStatus.AWAITING_INFO:
      return "text.secondary";
    case CaseStatus.WAITING_ON_WSO2:
      return "success.main";
    case CaseStatus.SOLUTION_PROPOSED:
      return "text.disabled";
    case CaseStatus.CLOSED:
      return "error.main";
    case CaseStatus.REOPENED:
      return "secondary.main";
    default:
      return "text.secondary";
  }
}

/**
 * Returns the icon element for a given case status label (avoids creating a component during render).
 *
 * @param statusLabel - The case status label.
 * @param size - Icon size in pixels.
 * @returns {ReactNode} The icon element.
 */
export function getStatusIconElement(
  statusLabel: string | null | undefined,
  size = 12,
): ReactNode {
  const Icon = getStatusIcon(statusLabel ?? undefined);
  return createElement(Icon, { size });
}

/**
 * Strips the [code]...[/code] wrapper from comment content.
 *
 * @param content - Raw content string.
 * @returns {string} Content without the code wrapper.
 */
export function stripCodeWrapper(content: string): string {
  if (!content || typeof content !== "string") return "";
  const trimmed = content.trim();
  if (trimmed.startsWith("[code]") && trimmed.endsWith("[/code]")) {
    return trimmed.slice(6, -7).trim();
  }
  return content;
}

/**
 * Strips "Customer comment added" label from comment content.
 * The backend may append this; we hide it from the activity timeline.
 *
 * @param html - HTML content string.
 * @returns {string} Content without the label.
 */
export function stripCustomerCommentAddedLabel(html: string): string {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<p>\s*Customer comment added\s*<\/p>/gi, "")
    .replace(/Customer comment added/gi, "")
    .trim();
}

/**
 * Returns true if the comment has content worth displaying (after stripping code wrapper and
 * "Customer comment added" label). Used to hide backend entries that render as empty bubbles.
 *
 * @param comment - Case comment from API.
 * @returns {boolean} True when comment has non-empty displayable content.
 */
export function hasDisplayableContent(comment: CaseComment): boolean {
  const raw = comment.content ?? "";
  const stripped = stripCodeWrapper(raw);
  const withoutLabel = stripCustomerCommentAddedLabel(stripped);
  const textOnly = withoutLabel.replace(/<[^>]+>/g, "").trim();
  return textOnly.length > 0;
}

/** Inline attachment item for image src replacement (supports API id/downloadUrl or legacy sys_id/url). */
export interface InlineAttachment {
  id?: string;
  downloadUrl?: string;
  sys_id?: string;
  url?: string;
}

/**
 * Replaces inline image sources in HTML (e.g. /sys_id.iix or /id.iix) with URLs from attachments.
 * Matches by id or sys_id; uses downloadUrl or url for the replacement.
 * Sanitizes the result with DOMPurify to prevent XSS.
 *
 * @param html - HTML string with img tags.
 * @param inlineAttachments - Optional list of attachments (id/downloadUrl or sys_id/url).
 * @returns {string} Sanitized HTML with img src replaced where matching.
 */
export function replaceInlineImageSources(
  html: string,
  inlineAttachments?: InlineAttachment[] | null,
): string {
  if (!html || typeof html !== "string") return "";
  if (!inlineAttachments?.length) {
    return DOMPurify.sanitize(html);
  }

  const replaced = html.replace(
    /<img([^>]*?)\s+src\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))([^>]*)>/gi,
    (_match, before, doubleSrc, singleSrc, bareSrc, after) => {
      const src = (doubleSrc ?? singleSrc ?? bareSrc ?? "") as string;
      const refId = src
        .replace(/^\//, "")
        .replace(/\.iix$/i, "")
        .trim();
      const attachment = inlineAttachments.find(
        (a) =>
          a.id === refId ||
          a.sys_id === refId ||
          (a?.id && src.includes(a.id)) ||
          (a?.sys_id && src.includes(a.sys_id)),
      );
      const newSrc = attachment?.downloadUrl ?? attachment?.url ?? src;
      const quote =
        doubleSrc !== undefined ? '"' : singleSrc !== undefined ? "'" : '"';
      return `<img${before} src=${quote}${newSrc}${quote}${after}>`;
    },
  );
  return DOMPurify.sanitize(replaced);
}

/**
 * Normalizes ServiceNow-style timestamp "YYYY-MM-DD HH:MM:SS" to ISO UTC for parsing.
 *
 * @param dateStr - Raw date string (ISO, ServiceNow, or parseable).
 * @returns {string} Normalized string for Date constructor.
 */
function normalizeCommentDateString(dateStr: string): string {
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed.replace(" ", "T") + "Z";
  }
  return trimmed;
}

/**
 * Formats a comment date string for display (e.g. "Feb 13, 2026 3:45 PM").
 *
 * @param date - Date string from API (ISO or ServiceNow "YYYY-MM-DD HH:MM:SS").
 * @returns {string} Formatted date string.
 */
export function formatCommentDate(date: string | null | undefined): string {
  if (!date) return "--";
  const normalized = normalizeCommentDateString(date);
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Strips HTML tags from a string.
 *
 * @param html - HTML content string.
 * @returns {string} Plain text without HTML tags.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

/**
 * Returns the list of available action button labels based on the case status.
 *
 * @param status - Current status of the case.
 * @returns {string[]} Array of action button labels to display.
 */
export function getAvailableCaseActions(
  status: string | null | undefined,
): string[] {
  const normalized = status?.toLowerCase() || "";

  switch (normalized) {
    case CaseStatus.CLOSED.toLowerCase():
      return ["Open Related Case"];

    case CaseStatus.SOLUTION_PROPOSED.toLowerCase():
      return [
        "Closed",
        "Waiting on WSO2",
        "Accept Solution",
        "Reject Solution",
      ];

    case CaseStatus.AWAITING_INFO.toLowerCase():
      return ["Closed", "Waiting on WSO2"];

    default:
      // Covers Open, Work in Progress, Waiting on WSO2, Reopened.
      return ["Closed"];
  }
}
