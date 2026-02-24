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

/** Account nested in project details response. */
export interface ProjectDetailsAccount {
  id: string;
  name: string;
  activationDate: string;
  deactivationDate: string;
  supportTier: string;
  region: string;
}

/** Detailed project information including account/subscription details. */
export interface ProjectDetails {
  type: string;
  sfId?: string;
  account: ProjectDetailsAccount;
  id: string;
  name: string;
  key: string;
  createdOn: string;
  description: string;
  hasSR: boolean;
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

// Project contact from GET /projects/:projectId/contacts.
export interface ProjectContact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isCsAdmin: boolean;
  isCsIntegrationUser: boolean;
  isSecurityContact: boolean;
  membershipStatus: string;
  account?: {
    id: string;
    domainList?: string[] | null;
    classification: string;
    isPartner: boolean;
  };
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
    pastThirtyDays?: number;
  };
  /** Percentage change vs last period for trend display. */
  changeRate?: {
    resolvedEngagements?: number;
    averageResponseTime?: number;
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
  /** Case type from API (type or caseTypes). */
  type?: { id: string; label: string } | null;
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

// Id-label reference used across case details response.
export interface IdLabelRef {
  id: string;
  label: string;
}

// Case details
export interface CaseDetailsAccount {
  type: string | null;
  id: string;
  label: string;
}

export interface CaseDetailsProject {
  id: string;
  label: string;
}

export interface CaseDetailsClosedBy {
  id: string;
  label?: string | null;
  name?: string | null;
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
  product: IdLabelRef | null;
  account: CaseDetailsAccount | null;
  csManager: IdLabelRef | string | null;
  assignedEngineer:
    | string
    | { id: string; label?: string; name?: string }
    | null;
  project: CaseDetailsProject | null;
  type: IdLabelRef | null;
  deployedProduct: IdLabelRef | null;
  parentCase: IdLabelRef | null;
  conversation: unknown;
  issueType: IdLabelRef | null;
  deployment: IdLabelRef | null;
  severity: IdLabelRef | null;
  status: IdLabelRef | null;
  closedOn: string | null;
  closedBy: CaseDetailsClosedBy | null;
  closeNotes: string | null;
  hasAutoClosed: boolean | null;
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
    systemHealth?: string;
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
  caseStates?: MetadataItem[];
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

// Conversation from POST /projects/:projectId/conversations/search.
export interface Conversation {
  id: string;
  number: string;
  initialMessage: string;
  messageCount: number;
  createdOn: string;
  createdBy: string;
  project: { id: string; label: string };
  case: { id: string; number: string; label: string } | null;
  state: { id: string; label: string };
}

// Response for conversations search.
export interface ConversationSearchResponse {
  conversations: Conversation[];
  totalRecords: number;
  offset: number;
  limit: number;
}

// Filter values for conversations search (state filter uses statuses from filters API).
export interface AllConversationsFilterValues {
  stateId?: string;
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

// Time card from projects/:projectId/time-cards/search.
export interface TimeCard {
  id: string;
  totalTime: number;
  createdOn: string;
  hasBillable: boolean;
  state: string;
  approvedBy: { id: string; label: string } | null;
  project: { id: string; label: string };
  case: {
    number: string;
    id: string;
    label: string;
  };
}

// Response for project time cards search.
export interface TimeCardSearchResponse {
  timeCards: TimeCard[];
  totalRecords: number;
  offset: number;
  limit: number;
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

/** Response for GET /deployments/:deploymentId/attachments. */
export interface DeploymentAttachmentsResponse {
  limit: number;
  offset: number;
  attachments: DeploymentDocument[];
  totalRecords: number;
}

// Document attached to a deployment.
export interface DeploymentDocument {
  id: string;
  name: string;
  category?: string;
  sizeBytes?: number;
  size?: number;
  uploadedAt?: string;
  createdOn?: string;
  uploadedBy?: string;
  createdBy?: string;
  downloadUrl?: string;
}

// Response for POST /deployments/:deploymentId/attachments.
export interface PostDeploymentAttachmentResponse {
  id: string;
  createdBy: string;
  createdOn: string;
  downloadUrl: string;
  size: number;
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

// Response for GET /projects/:projectId/deployments (real API).
export interface ProjectDeploymentsListResponse {
  deployments: ProjectDeploymentItem[];
}

// Product from GET /products.
export interface ProductItem {
  id: string;
  label?: string;
  name?: string;
}

// Product version from POST /products/:productId/versions/search.
export interface ProductVersionItem {
  id: string;
  version: string;
  currentSupportStatus?: string | null;
  releaseDate?: string;
  supportEolDate?: string;
  earliestPossibleSupportEolDate?: string;
  product?: { id: string; label: string };
}

// Response for GET /products.
export interface ProductsResponse {
  products?: ProductItem[];
  totalRecords?: number;
  offset?: number;
  limit?: number;
}

// Response for POST /products/:productId/versions/search.
export interface ProductVersionsSearchResponse {
  versions: ProductVersionItem[];
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
  version?: string | null;
  cores?: number | null;
  tps?: number | null;
  releasedOn?: string | null;
  endOfLifeOn?: string | null;
  updateLevel?: string | null;
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

/** Response from POST /projects/:projectId/conversations (Novera chat). */
export interface ConversationResponse {
  message: string;
  sessionId: string;
  conversationId: string;
  intent: unknown;
  slotState: unknown;
  actions: unknown;
  recommendations?: {
    query: string;
    recommendations: Array<{ title: string; articleId: string; score: number }>;
  } | null;
  resolved: unknown;
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
  severity: { id: string | number; label: string };
  componentName: string;
  version: string;
  type: string;
  useCase: string | null;
  justification: string | null;
  resolution: string | null;
  componentType?: string;
  updateLevel?: string;
  /** Optional status/state if returned by API. */
  status?: { id: string | number; label: string } | null;
}

// Response for product vulnerabilities metadata (GET /products/vulnerabilities/meta).
export interface VulnerabilitiesMetaResponse {
  severities: { id: string; label: string }[];
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

// Call request structure (from POST /cases/:caseId/call-requests/search).
export interface CallRequest {
  id: string;
  case: { id: string; label: string };
  reason: string;
  preferredTimes: string[];
  durationMin?: number | null;
  scheduleTime: string;
  createdOn: string;
  updatedOn: string;
  state: { id: string; label: string };
}

// Response for case call requests list (POST /cases/:caseId/call-requests/search).
export interface CallRequestsResponse {
  callRequests: CallRequest[];
  totalRecords?: number;
  offset?: number;
  limit?: number;
}

// Response for creating or updating a call request (POST/PATCH).
export interface CreateCallResponse {
  id: string;
}

/** Alias for create/update call request response (shared shape). */
export type CallRequestResponse = CreateCallResponse;

// Security advisory item inside an update description level.
export interface SecurityAdvisory {
  id: string;
  overview: string;
  severity: string;
  description: string;
  impact: string;
  solution: string;
  notes: string;
  credits: string;
}

// Single update description entry within an update level.
export interface UpdateDescriptionLevel {
  updateLevel: number;
  productName: string;
  productVersion: string;
  channel: string;
  updateType: string;
  updateNumber: number;
  description: string;
  instructions: string;
  bugFixes: string;
  filesAdded: string;
  filesModified: string;
  filesRemoved: string;
  bundlesInfoChanges: string | null;
  dependantReleases: string | null;
  timestamp: number;
  securityAdvisories: SecurityAdvisory[];
}

// Entry for a single update level key from POST /updates/levels/search.
export interface UpdateLevelEntry {
  updateType: string;
  updateDescriptionLevels: UpdateDescriptionLevel[];
}

// Response for POST /updates/levels/search (map keyed by update level string).
export type UpdateLevelsSearchResponse = Record<string, UpdateLevelEntry>;
