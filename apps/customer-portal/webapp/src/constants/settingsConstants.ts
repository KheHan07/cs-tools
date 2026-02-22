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

import { Code, Crown, ShieldCheck } from "@wso2/oxygen-ui-icons-react";

/** Placeholder for empty/null values in user management UI. */
export const NULL_PLACEHOLDER = "--";

/** Role configuration for user management: labels, icons, permissions, palette keys. */
export const ROLE_CONFIG = [
  {
    id: "admin",
    label: "Admin",
    Icon: Crown,
    paletteKey: "secondary" as const,
    permissions: [
      "Full portal access",
      "Manage users and settings",
      "View all cases and requests",
    ],
  },
  {
    id: "developer",
    label: "Developer",
    Icon: Code,
    paletteKey: "info" as const,
    permissions: [
      "Create and manage cases",
      "Access technical resources",
      "View project details",
    ],
  },
  {
    id: "security",
    label: "Security",
    Icon: ShieldCheck,
    paletteKey: "error" as const,
    permissions: [
      "Access security advisories",
      "Create security cases",
      "View vulnerability reports",
    ],
  },
] as const;
