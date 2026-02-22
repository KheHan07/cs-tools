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
// software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { colors } from "@wso2/oxygen-ui";
import type { ComponentType } from "react";
import { NULL_PLACEHOLDER } from "@constants/settingsConstants";
import type { ProjectContact } from "@models/responses";
import { Code, Crown, ShieldCheck } from "@wso2/oxygen-ui-icons-react";

/** Priority: Admin > Developer > Security. Multiple role flags collapse to first match. */

/**
 * Returns the role label for a contact (Admin, Developer, Security, or --).
 *
 * @param {ProjectContact} contact - The project contact.
 * @returns {string} The role label.
 */
export function getRoleLabel(contact: ProjectContact): string {
  if (contact.isCsAdmin) return "Admin";
  if (contact.isCsIntegrationUser) return "Developer";
  if (contact.isSecurityContact) return "Security";
  return NULL_PLACEHOLDER;
}

/**
 * Returns the role icon for a contact.
 *
 * @param {ProjectContact} contact - The project contact.
 * @returns {ComponentType<{ size?: number }> | null} The icon component or null.
 */
export function getRoleIcon(
  contact: ProjectContact,
): ComponentType<{ size?: number }> | null {
  if (contact.isCsAdmin) return Crown;
  if (contact.isCsIntegrationUser) return Code;
  if (contact.isSecurityContact) return ShieldCheck;
  return null;
}

/**
 * Returns the chip color for a contact's role (aligned with ROLE_CONFIG palette).
 *
 * @param {ProjectContact} contact - The project contact.
 * @returns {"primary" | "info" | "error" | "default"} The chip color.
 */
export function getRoleChipColor(
  contact: ProjectContact,
): "primary" | "info" | "error" | "default" {
  if (contact.isCsAdmin) return "primary";
  if (contact.isCsIntegrationUser) return "info";
  if (contact.isSecurityContact) return "error";
  return "default";
}

/**
 * Returns sx props for role chips (typography, colors).
 *
 * @param {ProjectContact} contact - The project contact.
 * @returns {object} MUI sx object for the chip.
 */
export function getRoleChipSx(contact: ProjectContact): object {
  const purple = colors.purple?.[600] ?? "#7c3aed";
  const iconPadding = {
    "& .MuiChip-icon": { ml: 0.75, mr: 0.5 },
    "& .MuiChip-label": { pl: 0.5 },
  };
  if (contact.isCsAdmin) {
    return {
      typography: "caption",
      color: purple,
      borderColor: purple,
      "& .MuiChip-icon": { ml: 0.75, mr: 0.5, color: purple },
      "& .MuiChip-label": { pl: 0.5 },
    };
  }
  return { typography: "caption", ...iconPadding };
}

/**
 * Returns initials from name or email.
 *
 * @param {string} [firstName] - First name.
 * @param {string} [lastName] - Last name.
 * @param {string} [email] - Email fallback.
 * @returns {string} 1–2 character initials.
 */
export function getInitials(
  firstName?: string,
  lastName?: string,
  email?: string,
): string {
  if (firstName || lastName) {
    const first = (firstName ?? "").charAt(0).toUpperCase();
    const last = (lastName ?? "").charAt(0).toUpperCase();
    if (first || last) return `${first}${last}`.trim() || NULL_PLACEHOLDER;
  }
  if (email) {
    const parts = email.split("@")[0];
    return parts.length >= 2 ? parts.slice(0, 2).toUpperCase() : parts.toUpperCase();
  }
  return "?";
}

const AVATAR_COLORS = [
  colors.purple?.[600] ?? "#7c3aed",
  colors.blue?.[600] ?? "#2563eb",
  colors.green?.[600] ?? "#16a34a",
  colors.orange?.[600] ?? "#ea580c",
  colors.pink?.[500] ?? "#ec4899",
] as const;

/**
 * Returns a stable avatar color from a string id (e.g. contact.id or email).
 *
 * @param {string} id - Stable identifier for the contact.
 * @returns {string} Hex color string.
 */
export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] as string;
}
