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

import { type TimeTrackingBadgeType } from "@constants/projectDetailsConstants";

// Basic project definition returned in search list responses.
export interface ProjectListItem {
  id: string;
  name: string;
  key: string;
  createdOn: string;
  description: string;
}

// Detailed project information including subscription details.
export interface ProjectDetails {
  id: string;
  name: string;
  key: string;
  description: string;
  createdOn: string;
  type: string;
  subscription: {
    startDate: string | null;
    endDate: string | null;
    supportTier: string | null;
  };
}

// Project Search Response.
export interface SearchProjectsResponse {
  offset: number;
  limit: number;
  projects: ProjectListItem[];
  totalRecords: number;
}

// User profile information.
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

// User details response from API.
export interface UserDetails {
  id: string;
  email: string;
  lastName: string;
  firstName: string;
  timeZone: string;
}

// Project user (invited/registered) for project users list.
export interface ProjectUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "Invited" | "Registered";
}

// Case creation form metadata (projects, products, severity levels, conversation summary, etc.).
export interface CaseCreationMetadata {
  projects: string[];
  products: string[];
  deploymentTypes: string[];
  issueTypes: string[];
  severityLevels: {
    id: string;
    label: string;
    description: string;
  }[];
  conversationSummary: {
    messagesExchanged: number;
    troubleshootingAttempts: string;
    kbArticlesReviewed: string;
  };
}

// Project support statistics.
export interface ProjectSupportStats {
  totalCases: number;
  activeChats: number;
  sessionChats: number;
  resolvedChats: number;
}

export interface CaseSeverity {
  id: number;
  label: string;
  count: number;
}

export interface CaseState {
  id: string;
  label: string;
  count: number;
}

export interface CaseType {
  id: string;
  label: string;
  count: number;
}

export interface CasesTrendPeriod {
  period: string;
  severities: CaseSeverity[];
}

export interface ProjectCasesStats {
  totalCases: number;
  averageResponseTime: number;
  resolvedCases: {
    total: number;
    currentMonth: number;
  };
  stateCount: CaseState[];
  severityCount: CaseSeverity[];
  outstandingSeverityCount: CaseSeverity[];
  caseTypeCount: CaseType[];
  casesTrend: CasesTrendPeriod[];
}

// Project time tracking statistics.
export interface ProjectTimeTrackingStats {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
}

export interface TrendData {
  value: string;
  direction: "up" | "down";
  color: "success" | "error" | "info" | "warning";
}

export interface DashboardMockStats {
  totalCases: {
    value: number;
    trend: TrendData;
  };
  openCases: {
    value: number;
    trend: TrendData;
  };
  resolvedCases: {
    value: number;
    trend: TrendData;
  };
  avgResponseTime: {
    value: string;
    trend?: TrendData;
  };
  casesTrend: Array<{
    name: string;
    TypeA: number;
    TypeB: number;
    TypeC: number;
    TypeD: number;
  }>;
}

// Case List Item
export interface CaseListItem {
  id: string;
  internalId: string;
  number: string;
  createdOn: string;
  title: string;
  description: string;
  /** API may return string or { id, label? } or { id, name? } object. */
  assignedEngineer:
    | string
    | { id: string; label?: string; name?: string }
    | null;
  project: {
    id: string;
    label: string;
  };
  issueType: {
    id: string;
    label: string;
  } | null;
  deployedProduct: {
    id: string;
    label: string;
  } | null;
  deployment: {
    id: string;
    label: string;
  } | null;
  severity: {
    id: string;
    label: string;
  } | null;
  status: {
    id: string;
    label: string;
  } | null;
  caseTypes?: {
    id: string;
    label: string;
  } | null;
}

// Case Search Response
export interface CaseSearchResponse {
  cases: CaseListItem[];
  totalRecords: number;
  offset: number;
  limit: number;
  projects?: {
    id: string;
    label: string;
  }[];
}

// Case details
export interface CaseDetailsAccount {
  type: string | null;
  id: string;
  name: string | null;
}

export interface CaseDetailsProject {
  id: string;
  name: string | null;
}

export interface CaseStatus {
  id: number;
  label: string | null;
}

export interface CaseDetails {
  id: string;
  internalId: string;
  number: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  title: string | null;
  description: string | null;
  slaResponseTime: string | null;
  product: string | null;
  account: CaseDetailsAccount | null;
  csManager: string | null;
  assignedEngineer:
    | string
    | { id: string; label?: string; name?: string }
    | null;
  project: CaseDetailsProject | null;
  deployment: { id: string; label: string } | null;
  deployedProduct: string | null;
  issueType: string | null;
  state: CaseStatus | null;
  severity: CaseStatus | null;
}

// Inline attachment for comment images (API shape).
export interface CaseCommentInlineAttachment {
  id: string;
  fileName: string;
  contentType: string;
  downloadUrl: string;
  createdOn: string;
  createdBy: string;
  /** Legacy: sys_id for backward compatibility with older img src format. */
  sys_id?: string;
  /** Legacy: url for backward compatibility. Prefer downloadUrl. */
  url?: string;
}

// Case comment
export interface CaseComment {
  id: string;
  content: string;
  type: string;
  createdOn: string;
  createdBy: string;
  isEscalated: boolean;
  /** Whether this comment has inline images. */
  hasInlineAttachments?: boolean;
  /** Inline attachments for images in content (img src replacement). */
  inlineAttachments?: CaseCommentInlineAttachment[];
}

// Response for case comments list
export interface CaseCommentsResponse {
  comments: CaseComment[];
  totalRecords: number;
  offset: number;
  limit: number;
}

// Project Stats Response
export interface ProjectStatsResponse {
  projectStats: {
    openCases: number;
    activeChats: number;
    deployments: number;
    slaStatus: string;
  };
  recentActivity: {
    totalTimeLogged: number;
    billableHours: number;
    lastDeploymentOn: string;
  };
}

// Metadata Item (Status, Severity, CaseType)
export interface MetadataItem {
  id: string;
  label: string;
}

// Response for case metadata (fetching possible statuses, severities, types)
export interface CaseMetadataResponse {
  statuses?: MetadataItem[];
  severities?: MetadataItem[];
  issueTypes?: MetadataItem[];
  deploymentTypes?: MetadataItem[];
  callRequestStates?: MetadataItem[];
  changeRequestStates?: MetadataItem[];
  changeRequestImpacts?: MetadataItem[];
  caseTypes?: MetadataItem[];
  severityBasedAllocationTime?: Record<string, number>;
}

// Chat history list item (support chat session summary).
export interface ChatHistoryItem {
  chatId: string;
  title: string;
  startedTime: string;
  messages: number;
  kbArticles: number;
  status: string;
}

// Response for project chat history list.
export interface ChatHistoryResponse {
  chatHistory: ChatHistoryItem[];
}

// Interface for items in the time tracking logs.
export interface TimeTrackingLogBadge {
  text: string;
  type: TimeTrackingBadgeType;
}

export interface TimeTrackingLog {
  id: string;
  badges: TimeTrackingLogBadge[];
  description: string | null;
  user: string | null;
  role: string | null;
  date: string | null;
  hours: number | null;
}

// Response for project time tracking details.
export interface TimeTrackingDetailsResponse {
  timeLogs: TimeTrackingLog[];
}

// Interface for all cases filters state
export interface AllCasesFilterValues {
  statusId?: string;
  severityId?: string;
  issueTypes?: string;
  deploymentId?: string;
  caseTypeIds?: string[];
}

// Product deployed in an environment.
export interface DeploymentProduct {
  id: string;
  name: string;
  version: string;
  supportStatus: string;
  description: string;
  cores: number;
  tps: number;
  releasedDate: string;
  endOfLifeDate: string;
  updateLevel: string;
}

// Document attached to a deployment.
export interface DeploymentDocument {
  id: string;
  name: string;
  category: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
}

// Single deployment environment.
export interface Deployment {
  id: string;
  name: string;
  status: "Healthy" | "Warning";
  url: string;
  version: string;
  description: string;
  products: DeploymentProduct[];
  documents: DeploymentDocument[];
  deployedAt: string;
  uptimePercent: number;
}

// Response for project deployments list.
export interface DeploymentsResponse {
  deployments: Deployment[];
}

// Single item from GET /projects/:projectId/deployments (array response).
export interface ProjectDeploymentItem {
  id: string;
  name: string;
  createdOn: string;
  updatedOn: string;
  description: string | null;
  url: string | null;
  project: { id: string; label: string };
  type: { id: string; label: string };
}

// Single item from GET /deployments/:deploymentId/products (array response).
export interface DeploymentProductItem {
  id: string;
  createdOn: string;
  updatedOn: string;
  description: string | null;
  product: { id: string; label: string };
  deployment: { id: string; label: string };
}

// Case attachment item (GET /cases/:id/attachments).
export interface CaseAttachment {
  id: string;
  name: string;
  type: string;
  size?: number;
  sizeBytes?: string;
  downloadUrl: string;
  createdOn: string;
  createdBy: string;
}

// Response for case attachments list.
export interface CaseAttachmentsResponse {
  limit: number;
  offset: number;
  totalRecords: number;
  attachments: CaseAttachment[];
}

// Updates statistics response.
export interface UpdatesStats {
  productsTracked: number | null;
  totalUpdatesInstalled: number | null;
  totalUpdatesInstalledBreakdown?: { regular: number; security: number };
  totalUpdatesPending: number | null;
  totalUpdatesPendingBreakdown?: { regular: number; security: number };
  securityUpdatesPending: number | null;
}

// Single product recommended update level item.
export interface RecommendedUpdateLevelItem {
  productName: string;
  productBaseVersion: string;
  channel: string;
  startingUpdateLevel: number;
  endingUpdateLevel: number;
  installedUpdatesCount: number;
  installedSecurityUpdatesCount: number;
  timestamp: number;
  recommendedUpdateLevel: number;
  availableUpdatesCount: number;
  availableSecurityUpdatesCount: number;
}

// Product update levels.
export interface ProductUpdateLevelEntry {
  productBaseVersion: string;
  channel: string;
  updateLevels: number[];
}

// One product's update levels.
export interface ProductUpdateLevelsItem {
  productName: string;
  productUpdateLevels: ProductUpdateLevelEntry[];
}

// Product update levels response.
export type ProductUpdateLevelsResponse = ProductUpdateLevelsItem[];

// Case classification response.
export interface CaseClassificationResponse {
  issueType: string;
  severityLevel: string;
  caseInfo: {
    description: string;
    shortDescription: string;
    productName: string;
    productVersion: string;
    environment: string;
    tier: string;
    region: string;
  };
}

// Response for creating a support case. Used to navigate to case details.
export interface CreateCaseResponse {
  id: string;
}

// Product vulnerability item from search response.
export interface ProductVulnerability {
  id: string;
  cveId: string;
  vulnerabilityId: string;
  severity: { id: number; label: string };
  componentName: string;
  version: string;
  type: string;
  useCase: string;
  justification: string;
  resolution: string;
  componentType?: string;
  updateLevel?: string;
}

// Response for product vulnerabilities search.
export interface ProductVulnerabilitiesSearchResponse {
  productVulnerabilities: ProductVulnerability[];
  totalRecords: number;
  offset: number;
  limit: number;
}

// Response for creating a deployment.
export interface CreateDeploymentResponse {
  createdBy: string;
  createdOn: string;
  id: string;
}

// Call request structure.
export interface CallRequest {
  id: string;
  type: string;
  status: string;
  requestedOn: string;
  preferredTime: {
    start: string;
    end: string;
    timezone: string;
  };
  scheduledFor: string;
  durationInMinutes: number;
  notes: string;
}

// Response for case call requests list.
export interface CallRequestsResponse {
  callRequests: CallRequest[];
}

// Response for creating a call request.
export interface CreateCallResponse {
  id: string;
}
