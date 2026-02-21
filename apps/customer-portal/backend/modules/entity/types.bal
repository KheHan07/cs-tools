// Copyright (c) 2025 WSO2 LLC. (https://www.wso2.com).
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
import ballerina/constraint;

# [Configurable] Client credentials grant type oauth2 configuration.
type ClientCredentialsOauth2Config record {|
    # OAuth2 token endpoint
    string tokenUrl;
    # OAuth2 client ID
    string clientId;
    # OAuth2 client secret
    string clientSecret;
    # OAuth2 scopes
    string[] scopes = [];
|};

# Valid sort order values.
public enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}

# Common ID string type with length constraint.
@constraint:String {
    length: 32,
    pattern: re `^[A-Za-z0-9]{32}$`
}
public type IdString string;

# Pagination information.
public type Pagination record {|
    # Offset for pagination
    @constraint:Int {
        minValue: 0
    }
    int offset = DEFAULT_OFFSET;
    # Limit for pagination
    @constraint:Int {
        minValue: 1,
        maxValue: 50
    }
    int 'limit = DEFAULT_LIMIT;
    json...;
|};

# User data.
public type UserResponse record {|
    # ID
    string id;
    # Email address
    string email;
    # Last name
    string lastName;
    # First name
    string? firstName;
    # Time zone
    string? timeZone;
    json...;
|};

# Project data.
public type Project record {|
    # ID
    string id;
    # Name
    string name;
    # Project key
    string key;
    # Created date and time
    string createdOn;
    # Description
    string? description;
    json...;
|};

# Payload for searching projects.
public type ProjectSearchPayload record {|
    # Pagination details
    Pagination pagination = {};
|};

# Projects response.
public type ProjectsResponse record {|
    # List of projects
    Project[] projects;
    # Total records count
    int totalRecords;
    *Pagination;
    json...;
|};

# Project information.
public type ProjectResponse record {|
    *Project;
    # Project type
    string 'type;
    # Salesforce ID
    string sfId;
    # Account information
    record {|
        # System ID of the account
        IdString id;
        # Name of the account
        string? name;
        # Activation date
        string? activationDate;
        # Deactivation date
        string? deactivationDate;
        # Support tier
        string? supportTier;
        # Region
        string? region;
        json...;
    |}? account;
    json...;
|};

# Payload for creating a case.
public type CaseCreatePayload record {|
    # Project ID
    IdString projectId;
    # Deployment ID
    IdString deploymentId;
    # Product ID
    IdString productId;
    # Case title
    @constraint:String {minLength: 1, maxLength: 500}
    string title;
    # Case description
    @constraint:String {minLength: 1}
    string description;
    # Issue type ID
    int issueTypeKey;
    # Severity key
    int severityKey;
    # Related case ID (if the case is related to an existing case)
    IdString parentCaseId?;
    # Chat ID (if the case is related to a chat)
    IdString chatId?;
|};

# Response from creating a case.
public type CaseCreateResponse record {|
    # Success message
    string message;
    # Created case details
    CreatedCase case;
|};

# Created case details.
public type CreatedCase record {|
    # System ID of the created case
    string id;
    # WSO2 internal ID of the case
    string internalId;
    # Case number
    string number;
    # User who created the case
    string createdBy;
    # Created date and time
    string createdOn;
    # Status
    ChoiceListItem state;
    # Case type information (eg: incident, query, etc.)
    ReferenceTableItem 'type;
    json...;
|};

# Request payload for updating a case.
public type CaseUpdatePayload record {|
    # State key to update
    int stateKey;
|};

# Response from updating a case.
public type CaseUpdateResponse record {|
    # Success message
    string message;
    # Updated case details
    UpdatedCase case;
|};

# Updated case details.
public type UpdatedCase record {|
    # System ID of the updated case
    string id;
    # Updated date and time
    string updatedOn;
    # User who updated the case
    string updatedBy;
    # Updated state information
    ChoiceListItem state;
    # Case type information
    ReferenceTableItem 'type;
    json...;
|};

# Base case.
public type Case record {|
    # Case ID
    string id;
    # Internal ID of the case
    string internalId;
    # Case number
    string number;
    # Created date and time
    string createdOn;
    # Case title
    string? title;
    # Case description
    string? description;
    # Assigned engineer
    ReferenceTableItem? assignedEngineer;
    # Associated project
    ReferenceTableItem? project;
    # Associated case type
    ReferenceTableItem? caseType;
    # Deployment information
    ReferenceTableItem? deployment;
    # Deployed product information
    ReferenceTableItem? deployedProduct;
    # Related case information (if the case is related to an existing case)
    ReferenceTableItem? parentCase;
    # Related chat information (if the case is related to a chat)
    ReferenceTableItem? chat;
    # issue type of the case
    ChoiceListItem? issueType;
    # Status information
    ChoiceListItem? state;
    # Severity information
    ChoiceListItem? severity;
    json...;
|};

# Choice list item information.
public type ChoiceListItem record {|
    # Choice list item value
    int id;
    # Choice list item label
    string label;
    # Count
    int count?;
    json...;
|};

# Basic table information.
public type ReferenceTableItem record {|
    # ID
    string id;
    # Display name
    string name;
    # Count value
    int count?;
    json...;
|};

# Case search filters.
public type CaseSearchFilters record {|
    # List of project IDs to filter
    string[] projectIds?;
    # List of case type IDs to filter
    string[] caseTypeIds?;
    # Search query for case number, title and description
    string searchQuery?;
    # List of issue types to filter
    int[] issueTypeKeys?;
    # State key
    int[] stateKeys?;
    # Severity key
    int severityKey?;
    # Deployment ID
    string deploymentId?;
|};

# Cases list response with pagination.
public type CaseSearchResponse record {|
    # List of cases
    Case[] cases;
    # Total records count
    int totalRecords;
    *Pagination;
    json...;
|};

# Payload for case search.
public type CaseSearchPayload record {|
    # Filter criteria
    CaseSearchFilters filters?;
    # Sort configuration
    SortBy sortBy?;
    # Pagination details
    Pagination pagination?;
|};

# Case information.
public type CaseResponse record {|
    *Case;
    # Last updated date and time
    string updatedOn;
    # SLA response time
    string slaResponseTime;
    # Product information
    record {
        *ReferenceTableItem;
        # Product version
        string? version;
    }? product;
    # Account information
    record {
        *ReferenceTableItem;
        # Account type
        string? 'type;
    }? account;
    # CS Manager information
    record {
        *ReferenceTableItem;
        # Email address
        string? email;
    }? csManager;
    # Case closed date and time
    string? closedOn?;
    # User who closed the case
    ReferenceTableItem? closedBy?;
    # Close notes for the case closure
    string? closeNotes?;
    # Indicates if the case is auto closed
    boolean? hasAutoClosed?;
    json...;
|};

# Sort configuration.
public type SortBy record {|
    # Field to sort by
    CaseSortField 'field;
    # Sort order
    SortOrder 'order;
    json...;
|};

# Project metadata response.
public type ProjectMetadataResponse record {|
    # List of available case states (eg: Open, Closed, etc.)
    ChoiceListItem[] caseStates;
    # List of available case severities (eg: S0, S1, etc.)
    ChoiceListItem[] severities;
    # List of available issue types (eg: Error, Total Outage, etc.)
    ChoiceListItem[] issueTypes;
    # List of available deployment types (eg: Development, QA, etc.)
    ChoiceListItem[] deploymentTypes;
    # List of available call request states
    ChoiceListItem[] callRequestStates;
    # List of available change request states
    ChoiceListItem[] changeRequestStates;
    # List of available change request impacts
    ChoiceListItem[] changeRequestImpacts;
    # List of available case types
    ReferenceTableItem[] caseTypes;
    # Severity based allocation time mapping (severity ID to allocation time in minutes)
    map<int> severityBasedAllocationTime;
    json...;
|};

# Project statistics response.
public type ProjectStatsResponse record {|
    # Total time logged
    decimal totalTimeLogged?;
    # Billable hours
    decimal billableHours?;
    # SLA status
    string slaStatus?;
    json...;
|};

# Active case count breakdown.
public type ActiveCaseCount record {|
    # Work in progress count
    int workInProgress;
    # Waiting on client count
    int waitingOnClient;
    # Waiting on WSO2 count
    int waitingOnWso2;
    # Total active count
    int total;
    json...;
|};

# Outstanding cases count breakdown.
public type OutstandingCasesCount record {|
    # Medium severity count
    int medium;
    # High severity count
    int high;
    # Critical severity count
    int critical;
    # Total count
    int total;
    json...;
|};

# Resolved case count breakdown.
public type ResolvedCaseCount record {|
    # Total resolved count
    int total;
    # Current month resolved count
    int currentMonth;
    json...;
|};

# Cases trend by time unit.
public type CasesTrend record {|
    # Time unit identifier (e.g., "2025 - Q1", "2025 - M1")
    string period;
    # Severity breakdown for the time unit
    ChoiceListItem[] severities;
    json...;
|};

# Project cases statistics response.
public type ProjectCaseStatsResponse record {|
    # Total case count
    int totalCount;
    # Average response time
    decimal averageResponseTime;
    # Resolved case count breakdown
    ResolvedCaseCount resolvedCount;
    # Count of cases by state
    ChoiceListItem[] stateCount;
    # Count of cases by severity
    ChoiceListItem[] severityCount;
    # Outstanding cases count by severity
    ChoiceListItem[] outstandingSeverityCount;
    # Count of cases by type
    ReferenceTableItem[] caseTypeCount;
    # Cases trend
    CasesTrend[] casesTrend;
    json...;
|};

# Project chats statistics response.
public type ProjectChatStatsResponse record {|
    # Active chat count
    int activeCount;
    # Session count
    int sessionCount;
    # Resolved count
    int resolvedCount;
|};

# Project deployment statistics response.
public type ProjectDeploymentStatsResponse record {|
    # Total deployment count
    int totalCount;
    # Last deployment date
    string? lastDeploymentOn;
    json...;
|};

# Comment information.
public type Comment record {|
    # ID
    string id;
    # Reference ID associated with the comment(query ID, incident ID, service request ID, etc.)
    string referenceId;
    # Content of the comment
    string content;
    # Type of the comment
    string 'type;
    # Created date and time
    string createdOn;
    # User who created the comment
    string createdBy;
    # Indicates if the comment is escalated
    boolean isEscalated;
    # Indicates if the comment has inline attachments
    boolean hasInlineAttachments;
    # List of inline attachments
    InlineAttachment[] inlineAttachments;
    json...;
|};

# Comments response with pagination.
public type CommentsResponse record {|
    # List of comments
    Comment[] comments;
    # Total records count
    int totalRecords;
    *Pagination;
    json...;
|};

# Reference search payload to search comments, attachments, etc.
public type ReferenceSearchPayload record {|
    # Reference ID to filter related resources(query ID, incident ID, service request ID, etc.)
    string referenceId;
    # Reference type
    ReferenceType referenceType;
    # Pagination details
    Pagination pagination?;
    # Filter criteria
    record {|
        # Type filter criteria (e.g., "comments", "work_note")
        string 'type?;
    |} filters?;
|};

# Attachment data.
public type Attachment record {|
    # ID of the attachment
    string id;
    # Reference ID associated with the attachment(query ID, incident ID, service request ID, etc.)
    string referenceId;
    # File name
    string name;
    # MIME type of the file
    string 'type;
    # File size
    int sizeBytes;
    # User who created the attachment
    string createdBy;
    # Created date and time
    string createdOn;
    # Download URL
    string downloadUrl;
    json...;
|};

# Attachments response.
public type AttachmentsResponse record {|
    # List of attachments
    Attachment[] attachments;
    # Total records count
    int totalRecords;
    *Pagination;
|};

# Deployed product data.
public type DeployedProduct record {|
    # ID
    string id;
    # Created date and time
    string createdOn;
    # Updated date and time
    string updatedOn;
    # Description
    string? description;
    # Associated deployment
    ReferenceTableItem? deployment;
    # Product information
    ReferenceTableItem? product;
    # Product version
    ReferenceTableItem? version;
    # Cores allocated for the product
    int? cores;
    # TPS allocated for the product
    decimal? tps;
    # Release date of the product
    string? releasedOn;
    # End of life date of the product
    string? endOfLifeOn;
    # Update level of the product
    string? updateLevel;
    json...;
|};

# Deployed products response.
public type DeployedProductsResponse record {|
    # List of deployed products
    DeployedProduct[] deployedProducts;
|};

# Request payload for creating a deployed product.
public type DeployedProductCreatePayload record {|
    # Project ID
    IdString projectId;
    # Deployment ID
    IdString deploymentId;
    # Product ID
    IdString productId;
    # Product version ID
    IdString versionId;
    # Cores allocated for the product
    int? cores?;
    # TPS allocated for the product
    decimal? tps?;
|};

# Response from creating a deployed product.
public type DeployedProductCreateResponse record {|
    # Success message
    string message;
    # Created deployed product details
    CreatedDeployedProduct deployedProduct;
    json...;
|};

# Created deployed product details.
public type CreatedDeployedProduct record {|
    # ID
    string id;
    # Created date and time
    string createdOn;
    # User who created the deployed product
    string createdBy;
    json...;
|};

# Payload for updating a deployed product.
public type DeployedProductUpdatePayload record {|
    # Cores allocated for the product
    int? cores?;
    # TPS allocated for the product
    decimal? tps?;
|};

# Response from updating a deployed product.
public type DeployedProductUpdateResponse record {|
    # Success message
    string message;
    # Updated deployed product details
    UpdatedDeployedProduct deployedProduct;
    json...;
|};

# Updated deployed product details.
public type UpdatedDeployedProduct record {|
    # ID of the updated deployed product
    string id;
    # Updated date and time
    string updatedOn;
    # User who updated the deployed product
    string updatedBy;
    json...;
|};

# Deployment data.
public type Deployment record {|
    # ID
    string id;
    # Name
    string name;
    # Created date and time
    string createdOn;
    # Updated date and time
    string updatedOn;
    # Description
    string? description;
    # URL
    string? url;
    # Associated project
    ReferenceTableItem? project;
    # Type
    ChoiceListItem? 'type;
    json...;
|};

# Payload for creating a deployment.
public type DeploymentCreatePayload record {|
    # Project ID
    IdString projectId;
    # Name
    string name;
    # Type key
    int typeKey;
    # Description
    string description;
    json...;
|};

# Response from creating a deployment.
public type DeploymentCreateResponse record {|
    # Success message
    string message;
    # Created deployment details
    CreatedDeployment deployment;
|};

# Created deployment details.
public type CreatedDeployment record {|
    # ID of the created deployment
    string id;
    # Created date and time
    string createdOn;
    # User who created the deployment
    string createdBy;
    json...;
|};

# Deployments response.
public type DeploymentsResponse record {|
    # List of deployments
    Deployment[] deployments;
|};

# Valid case sort field values.
public enum CaseSortField {
    CREATED_ON = "createdOn",
    UPDATED_ON = "updatedOn",
    SEVERITY = "severity",
    STATE = "state"
}

# Valid reference type values.
public enum ReferenceType {
    CASE = "case",
    CHANGE_REQUEST = "change_request"
}

# Valid comment type values.
public enum CommentType {
    COMMENT = "comments",
    WORK_NOTE = "work_note"
}

# Payload for creating a comment.
public type CommentCreatePayload record {|
    # Reference ID (case or change request ID)
    IdString referenceId;
    # Reference type
    ReferenceType referenceType;
    # Comment content
    @constraint:String {minLength: 1} // TODO: Remove max length until the byte array support is added
    string content;
    # Comment type
    CommentType 'type;
|};

# Created comment details.
public type CreatedComment record {|
    # System ID of the created comment
    string id;
    # Created date and time
    string createdOn;
    # User who created the comment
    string createdBy;
    # HTML content of the comment
    string content;
    # Indicates if the comment has inline attachments
    boolean hasInlineAttachments;
    # Count of inline attachments
    int inlineImageCount;
    # List of inline attachments
    InlineAttachment[] inlineAttachments;
    json...;
|};

# Response from creating a comment.
public type CommentCreateResponse record {|
    # Success message
    string message;
    # Created comment details
    CreatedComment comment;
    json...;
|};

# Response from creating an attachment.
public type AttachmentCreateResponse record {|
    # Success message
    string message;
    # Created attachment details
    CreatedAttachment attachment;
    json...;
|};

# Created attachment details.
public type CreatedAttachment record {|
    # System ID of the created attachment
    string id;
    # File size
    int sizeBytes;
    # Created date and time
    string createdOn;
    # User who created the attachment
    string createdBy;
    # Download URL
    string downloadUrl;
    json...;
|};

# Payload for creating an attachment.
public type AttachmentPayload record {|
    # Reference ID to which the attachment is associated (e.g., query ID, incident ID, etc)
    IdString referenceId;
    # Reference type
    ReferenceType referenceType;
    # File name
    string name;
    # MIME type of the file
    string 'type;
    # Content of the file as a byte array
    string file;
|};

# Inline attachment.
public type InlineAttachment record {|
    # ID of the inline attachment
    string id;
    # File name
    string fileName;
    # Content type
    string contentType;
    # Download URL
    string downloadUrl;
    # Created date and time
    string createdOn;
    # User who created
    string createdBy;
|};

# Payload for searching product vulnerabilities.
public type ProductVulnerabilitySearchPayload record {|
    # Filter criteria
    record {
        # Search query for CVE ID, Vulnerability ID, Component Name, etc.
        string searchQuery?;
        # Status ID
        int statusId?;
        # Severity ID
        int severityId?;
    } filters?;
    # Sort configuration
    SortBy sortBy?; // TODO: Check the correct sort by fields for vulnerabilities
    # Pagination details
    Pagination pagination?;
|};

# Product vulnerability.
public type ProductVulnerability record {|
    # ID
    string id;
    # CVE identifier
    string cveId;
    # Vulnerability identifier
    string vulnerabilityId;
    # Severity level
    ChoiceListItem severity;
    # Name of the component
    string componentName;
    # Version of the component
    string version;
    # Type
    string 'type;
    # Use case description
    string? useCase;
    # Justification for the vulnerability
    string? justification;
    # Resolution details for the vulnerability
    string? resolution;
    json...;
|};

# Product vulnerability information.
public type ProductVulnerabilityResponse record {|
    *ProductVulnerability;
    # Type of the component
    string componentType?;
    # Update level for the vulnerability
    string updateLevel;
    json...;
|};

# Product vulnerabilities response with pagination.
public type ProductVulnerabilitySearchResponse record {|
    # List of product vulnerabilities
    ProductVulnerability[] productVulnerabilities;
    # Total records count
    int totalRecords;
    *Pagination;
    json...;
|};

# Vulnerability metadata response.
public type VulnerabilityMetaResponse record {|
    # List of vulnerability severities
    ChoiceListItem[] severities;
    json...;
|};

# Request payload for searching call requests.
public type CallRequestSearchPayload record {|
    # Case ID
    IdString caseId;
    # Filter criteria
    record {
        # List of state keys to filter
        int[] stateKeys?;
    } filters?;
    # Pagination details
    Pagination pagination?;
|};

# Call request data.
public type CallRequest record {|
    # ID
    string id;
    # Associated case information
    ReferenceTableItem case;
    # Reason for the call request
    string? reason;
    # Preferred times for the call
    string[] preferredTimes;
    # Duration in minutes
    int durationMin;
    # Scheduled time for the call
    string? scheduleTime;
    # Created date and time
    string createdOn;
    # Updated date and time
    string updatedOn;
    # State information
    ChoiceListItem state;
    json...;
|};

# Call requests response.
public type CallRequestsResponse record {|
    # List of call requests
    CallRequest[] callRequests;
    json...;
|};

# Date Constraint.
@constraint:String {
    pattern: {
        value: re `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d{1,9})?)?(Z|[+-]([01]\d|2[0-3]):?[0-5]\d)$`,
        message: "Invalid date provided. Please provide a valid date value."
    }
}
public type Date string;

# Request payload for creating a call request.
public type CallRequestCreatePayload record {|
    # Case ID
    IdString caseId;
    # Reason for the call request
    string reason?;
    # Preferred UTC times for the call
    @constraint:Array {minLength: 1}
    Date[] utcTimes;
    # Duration in minutes
    @constraint:Int {minValue: 1}
    int durationInMinutes;
|};

# Created call request details.
public type CreatedCallRequest record {|
    # ID
    string id;
    # Created date and time
    string createdOn;
    # User who created the call request
    string createdBy;
    # State information
    ChoiceListItem state;
    json...;
|};

# Response from creating a call request.
public type CallRequestCreateResponse record {|
    # Success message
    string message;
    # Created call request details
    CreatedCallRequest callRequest;
    json...;
|};

# Request payload for updating a call request.
public type CallRequestUpdatePayload record {|
    # State key
    int stateKey;
    # Reason for the update
    string? reason;
    # New preferred UTC times for the call (mandatory when stateKey is 2)
    Date[] utcTimes?;
|};

# Updated call request details.
public type UpdatedCallRequest record {|
    # ID
    string id;
    # Updated date and time
    string updatedOn;
    # User who updated the call request
    string updatedBy;
    json...;
|};

# Response from updating a call request.
public type CallRequestUpdateResponse record {|
    # Success message
    string message;
    # Updated call request details
    UpdatedCallRequest callRequest;
    json...;
|};

# Request payload for updating a deployment.
public type DeploymentUpdatePayload record {|
    # Name
    string name?;
    # Type key
    int typeKey?;
    # Description of the deployment
    string? description?;
    # Active status (can only be set to false to deactivate deployment)
    boolean active?;
|};

# Response from updating a deployment.
public type DeploymentUpdateResponse record {|
    # Success message
    string message;
    # Updated deployment details
    UpdatedDeployment deployment;
|};

# Updated deployment details.
public type UpdatedDeployment record {|
    # ID of the updated deployment
    string id;
    # Updated date and time
    string updatedOn;
    # User who updated the deployment
    string updatedBy;
    json...;
|};

# Request payload for searching products.
public type ProductSearchPayload record {|
    # Pagination details
    Pagination pagination = {};
|};

# Product data.
public type Product record {|
    # ID
    string id;
    # Name
    string name;
    json...;
|};

# Products response.
public type ProductsResponse record {|
    # List of products
    Product[] products;
    json...; // TODO: Remove after adding pagination
|};

# Request payload for searching product versions.
public type ProductVersionSearchPayload record {|
    # Pagination details
    Pagination pagination = {};
|};

# Product version data.
public type ProductVersion record {|
    # ID
    string id;
    # Version number
    string version;
    # Current support status
    string? currentSupportStatus;
    # Release date
    string? releaseDate;
    # Support end of life date
    string? supportEolDate;
    # Earliest possible support end of life date
    string? earliestPossibleSupportEolDate;
    # Associated product information
    ReferenceTableItem? product;
    json...;
|};

# Product versions response.
public type ProductVersionsResponse record {|
    # List of product versions
    ProductVersion[] versions;
    json...; // TODO: Add pagination
|};
