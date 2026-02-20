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

import type { DeploymentProductItem } from "@models/responses";
import type { CaseClassificationResponse } from "@models/responses";

// Deployment list item with id and label.
export interface DeploymentOption {
  id: string;
  label: string;
}

// Issue type with id and label.
export interface IssueTypeOption {
  id: string;
  label: string;
}

// Project deployment item.
export interface ProjectDeploymentOption {
  id: string;
  name: string;
  type?: { id: string; label: string };
}

/**
 * Normalizes a product label for comparison.
 * Replaces hyphens with spaces and collapses multiple spaces.
 *
 * @param {string | undefined} label - Raw product label.
 * @returns {string} Normalized label for deduplication and matching.
 */
export function normalizeProductLabel(label: string | undefined): string {
  if (!label || typeof label !== "string") return "";
  return label
    .trim()
    .replace(/\s*-\s*/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

/**
 * Builds the combined product label from case classification response.
 *
 * @param {Partial<Pick<CaseClassificationResponse["caseInfo"], "productName" | "productVersion">> | undefined} caseInfo - caseInfo (or subset) from classification response.
 * @returns {string} Combined label or empty string.
 */
export function buildClassificationProductLabel(
  caseInfo:
    | Partial<
        Pick<
          CaseClassificationResponse["caseInfo"],
          "productName" | "productVersion"
        >
      >
    | undefined,
): string {
  if (!caseInfo?.productName?.trim()) return "";
  const name = caseInfo.productName.trim();
  const version = caseInfo.productVersion?.trim();
  return version ? `${name} ${version}` : name;
}

/**
 * Resolves deployment ID from the selected deployment label by matching against project deployments.
 *
 * @param {string} deploymentLabel - Selected deployment name/label from the form.
 * @param {ProjectDeploymentOption[]} projectDeployments - Deployments from useGetProjectDeployments.
 * @param {DeploymentOption[]} filterDeployments - Deployments from filters.
 * @returns {{ id: string } | null} Deployment with id, or null if no match.
 */
export function resolveDeploymentMatch(
  deploymentLabel: string,
  projectDeployments: ProjectDeploymentOption[] | undefined,
  filterDeployments: DeploymentOption[] | undefined,
): { id: string } | null {
  const label = deploymentLabel?.trim();
  if (!label) return null;

  const fromProject = projectDeployments?.find(
    (d) => d.type?.label === label || d.name === label,
  );
  if (fromProject) return { id: fromProject.id };

  const fromFilters = filterDeployments?.find(
    (d) => d.id === label || d.label === label,
  );
  if (fromFilters) return { id: fromFilters.id };

  return null;
}

/**
 * Resolves product ID from the selected product label by matching against deployment products.
 *
 * @param {string} productLabel - Selected product label from the form.
 * @param {DeploymentProductItem[]} allDeploymentProducts - Flat list of deployment products.
 * @returns {string} Deployment product item id or empty string if no match.
 */
export function resolveProductId(
  productLabel: string,
  allDeploymentProducts: DeploymentProductItem[],
): string {
  const normalized = normalizeProductLabel(productLabel);
  if (!normalized) return "";

  const match = allDeploymentProducts.find(
    (item) => normalizeProductLabel(item.product?.label) === normalized,
  );
  return match?.id ?? "";
}

/**
 * Resolves issue type key (numeric id) from the selected issue type label.
 *
 * @param {string} issueTypeLabel - Selected issue type (id or label) from the form.
 * @param {IssueTypeOption[]} issueTypes - Issue types from filters.
 * @returns {number} Issue type key (parsed id) or 0.
 */
export function resolveIssueTypeKey(
  issueTypeLabel: string,
  issueTypes: IssueTypeOption[] | undefined,
): number {
  if (!issueTypeLabel?.trim()) return 0;
  const item = issueTypes?.find(
    (t) => t.id === issueTypeLabel || t.label === issueTypeLabel,
  );
  return parseInt(item?.id ?? issueTypeLabel, 10) || 0;
}

/**
 * Returns whether the classification product should be added as an extra dropdown option.
 * Returns false if it would duplicate an existing option (same normalized label).
 *
 * @param {string} classificationProduct - Combined product label from classification.
 * @param {string[]} baseProductOptions - Product labels from deployment products.
 * @returns {boolean} True if classification product should be added as extra option.
 */
export function shouldAddClassificationProductToOptions(
  classificationProduct: string,
  baseProductOptions: string[],
): boolean {
  if (!classificationProduct?.trim()) return false;
  const normalized = normalizeProductLabel(classificationProduct);
  return !baseProductOptions.some(
    (opt) => normalizeProductLabel(opt) === normalized,
  );
}

/**
 * Builds the list of unique product labels from deployment products (for dropdown).
 *
 * @param {DeploymentProductItem[]} allDeploymentProducts - Flat list of deployment products.
 * @returns {string[]} Unique non-empty product labels.
 */
export function getBaseProductOptions(
  allDeploymentProducts: DeploymentProductItem[],
): string[] {
  return Array.from(
    new Set(
      allDeploymentProducts
        .map((item) => item.product?.label?.trim())
        .filter((label): label is string => Boolean(label)),
    ),
  );
}

/**
 * Formats chat messages for the case classification API.
 *
 * @param {Array<{ text: string; sender: string }>} messages - Chat messages with text and sender.
 * @returns {string} Formatted string: "User: ...\nAssistant: ..."
 */
export function formatChatHistoryForClassification(
  messages: Array<{ text: string; sender: string }>,
): string {
  return messages
    .map((m) => {
      const text = (m.text || "").trim();
      if (!text) return "";
      const role = m.sender === "user" ? "User" : "Assistant";
      return `${role}: ${text}`;
    })
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Builds envProducts for classification from deployment products map.
 * Caller must fetch products per deployment and pass the map.
 *
 * @param {Record<string, DeploymentProductItem[]>} productsByDeploymentId - Products keyed by deployment id.
 * @param {ProjectDeploymentOption[]} projectDeployments - Deployments with id and name.
 * @returns {Record<string, string[]>} envProducts: { [deploymentName]: [productLabel, ...] }
 */
export function buildEnvProducts(
  productsByDeploymentId: Record<string, DeploymentProductItem[]>,
  projectDeployments: ProjectDeploymentOption[] | undefined,
): Record<string, string[]> {
  if (!projectDeployments?.length) return {};

  const result: Record<string, string[]> = {};

  for (const dep of projectDeployments) {
    const products = productsByDeploymentId[dep.id] ?? [];
    const labels = Array.from(
      new Set(
        products
          .map((p) => p.product?.label?.trim())
          .filter((l): l is string => Boolean(l)),
      ),
    );
    const key = dep.name ?? dep.type?.label ?? "";
    if (key) {
      result[key] = labels;
    }
  }

  return result;
}

/**
 * Builds the list of deployment names/labels from project deployments (for dropdown).
 *
 * @param {ProjectDeploymentOption[]} projectDeployments - Deployments from useGetProjectDeployments.
 * @returns {string[]} Deployment names or type labels.
 */
export function getBaseDeploymentOptions(
  projectDeployments: ProjectDeploymentOption[] | undefined,
): string[] {
  return (
    projectDeployments?.map((d) => d.name ?? d.type?.label).filter(Boolean) ??
    []
  );
}
