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
import customer_portal.entity;
import customer_portal.types;

import ballerina/http;
import ballerina/log;

configurable int stateIdOpen = 1;

# Search cases for a given project.
#
# + idToken - ID token for authorization
# + projectId - Project ID to filter cases
# + payload - Case search payload
# + return - Case search response or error
public isolated function searchCases(string idToken, string projectId, types:CaseSearchPayload payload)
    returns types:CaseSearchResponse|error {

    int? issueId = payload.filters?.issueId;
    entity:CaseSearchPayload searchPayload = {
        filters: {
            projectIds: [projectId],
            searchQuery: payload.filters?.searchQuery,
            issueTypeKeys: issueId != () ? [issueId] : (),
            severityKey: payload.filters?.severityId,
            caseTypeIds: payload.filters?.caseTypeIds,
            stateKeys: payload.filters?.statusIds,
            deploymentId: payload.filters?.deploymentId
        },
        pagination: payload.pagination,
        sortBy: payload.sortBy
    };
    entity:CaseSearchResponse casesResponse = check entity:searchCases(idToken, searchPayload);
    types:Case[] cases = from entity:Case case in casesResponse.cases
        let entity:ReferenceTableItem? project = case.project
        let entity:ReferenceTableItem? 'type = case.caseType
        let entity:ReferenceTableItem? deployedProduct = case.deployedProduct
        let entity:ChoiceListItem? issueType = case.issueType
        let entity:ReferenceTableItem? deployment = case.deployment
        let entity:ReferenceTableItem? assignedEngineer = case.assignedEngineer
        let entity:ReferenceTableItem? parentCase = case.parentCase
        let entity:ReferenceTableItem? chat = case.chat
        let entity:ChoiceListItem? severity = case.severity
        let entity:ChoiceListItem? state = case.state
        select {
            id: case.id,
            internalId: case.internalId,
            number: case.number,
            title: case.title,
            createdOn: case.createdOn,
            description: case.description,
            project: project != () ? {id: project.id, label: project.name} : (),
            'type: 'type != () ? {id: 'type.id, label: 'type.name} : (),
            deployedProduct: deployedProduct != () ? {id: deployedProduct.id, label: deployedProduct.name} : (),
            issueType: issueType != () ? {id: issueType.id.toString(), label: issueType.label} : (),
            deployment: deployment != () ? {id: deployment.id, label: deployment.name} : (),
            assignedEngineer: assignedEngineer != () ? {id: assignedEngineer.id, label: assignedEngineer.name} : (),
            parentCase: parentCase != () ? {id: parentCase.id, label: parentCase.name} : (),
            chat: chat != () ? {id: chat.id, label: chat.name} : (),
            severity: severity != () ? {id: severity.id.toString(), label: severity.label} : (),
            status: state != () ? {id: state.id.toString(), label: state.label} : ()
        };

    return {
        cases,
        totalRecords: casesResponse.totalRecords,
        'limit: casesResponse.'limit,
        offset: casesResponse.offset
    };
}

# Get project filters for a given project.
#
# + projectMetadata - Project metadata response
# + return - Project filters or error
public isolated function getProjectFilters(entity:ProjectMetadataResponse projectMetadata)
    returns types:ProjectFilterOptions {

    types:ReferenceItem[] caseStates = from entity:ChoiceListItem item in projectMetadata.caseStates
        select {id: item.id.toString(), label: item.label};
    types:ReferenceItem[] severities = from entity:ChoiceListItem item in projectMetadata.severities
        select {id: item.id.toString(), label: item.label};
    types:ReferenceItem[] issueTypes = from entity:ChoiceListItem item in projectMetadata.issueTypes
        select {id: item.id.toString(), label: item.label};
    types:ReferenceItem[] deploymentTypes = from entity:ChoiceListItem item in projectMetadata.deploymentTypes
        select {id: item.id.toString(), label: item.label};
    types:ReferenceItem[] callRequestStates = from entity:ChoiceListItem item in projectMetadata.callRequestStates
        select {id: item.id.toString(), label: item.label};
    types:ReferenceItem[] changeRequestStates = from entity:ChoiceListItem item in projectMetadata.changeRequestStates
        select {id: item.id.toString(), label: item.label};
    types:ReferenceItem[] changeRequestImpacts = from entity:ChoiceListItem item in projectMetadata.changeRequestImpacts
        select {id: item.id.toString(), label: item.label};
    types:ReferenceItem[] caseTypes = from entity:ReferenceTableItem item in projectMetadata.caseTypes
        select {id: item.id, label: item.name};

    return {
        caseStates,
        severities,
        issueTypes,
        deploymentTypes,
        callRequestStates,
        changeRequestStates,
        changeRequestImpacts,
        caseTypes,
        severityBasedAllocationTime: projectMetadata.severityBasedAllocationTime
    };
}

# Get HTTP status code from the given error.
#
# + err - Error to handle
# + return - HTTP status code
public isolated function getStatusCode(error err) returns int {
    map<anydata|readonly> & readonly errorDetails = err.detail();
    anydata|readonly statusCodeValue = errorDetails[ERR_STATUS_CODE] ?: ();
    return statusCodeValue is int ? statusCodeValue : http:STATUS_INTERNAL_SERVER_ERROR;
}

# Get HTTP status code from the given error.
#
# + err - Error to handle
# + return - Error message
public isolated function extractErrorMessage(error err) returns string {
    map<anydata|readonly> & readonly errorDetails = err.detail();
    anydata|readonly errorMessage = errorDetails[ERR_BODY] ?: ();
    return errorMessage is string ? errorMessage : UNEXPECTED_ERROR_MSG;
}

# Log forbidden project access attempt.
#
# + id - Project ID
# + uuid - User UUID
public isolated function logForbiddenProjectAccess(string id, string uuid) =>
    log:printWarn(string `Access to project ID: ${id} is forbidden for user: ${uuid}`);

# Log forbidden case access attempt.
#
# + id - Case ID
# + uuid - User UUID
public isolated function logForbiddenCaseAccess(string id, string uuid) =>
    log:printWarn(string `Access to case ID: ${id} is forbidden for user: ${uuid}`);

# Map comments response to map to desired structure.
#
# + response - Comments response from the entity service
# + return - Map comments response
public isolated function mapCommentsResponse(entity:CommentsResponse response) returns types:CommentsResponse {
    types:Comment[] comments = from entity:Comment comment in response.comments
        select {
            id: comment.id,
            content: comment.content,
            'type: comment.'type,
            createdOn: comment.createdOn,
            createdBy: comment.createdBy,
            isEscalated: comment.isEscalated,
            hasInlineAttachments: comment.hasInlineAttachments,
            inlineAttachments: comment.inlineAttachments
        };

    return {
        comments,
        totalRecords: response.totalRecords,
        'limit: response.'limit,
        offset: response.offset
    };
}

# Validate limit and offset values.
#
# + limit - Limit value
# + offset - Offset value
# + return - True if invalid, else false
public isolated function isInvalidLimitOffset(int? 'limit, int? offset) returns boolean =>
    ('limit != () && ('limit < 1 || 'limit > 50)) || (offset != () && offset < 0);

# Map attachments response to map to desired structure.
#
# + response - Attachments response from the entity service
# + return - Mapped attachments response
public isolated function mapAttachmentsResponse(entity:AttachmentsResponse response) returns types:AttachmentsResponse {
    types:Attachment[] attachments = from entity:Attachment attachment in response.attachments
        select {
            id: attachment.id,
            name: attachment.name,
            'type: attachment.'type,
            size: attachment.sizeBytes,
            createdBy: attachment.createdBy,
            createdOn: attachment.createdOn,
            downloadUrl: attachment.downloadUrl
        };

    return {
        attachments,
        totalRecords: response.totalRecords,
        'limit: response.'limit,
        offset: response.offset
    };
}

# Map deployments response to the desired structure.
#
# + response - Deployments response from the entity service
# + return - Mapped deployments response
public isolated function mapDeployments(entity:DeploymentsResponse response) returns types:Deployment[] {
    return from entity:Deployment deployment in response.deployments
        let entity:ReferenceTableItem? project = deployment.project
        let entity:ChoiceListItem? 'type = deployment.'type
        select {
            id: deployment.id,
            name: deployment.name,
            createdOn: deployment.createdOn,
            updatedOn: deployment.updatedOn,
            description: deployment.description,
            url: deployment.url,
            project: project != () ? {id: project.id, label: project.name} : (),
            'type: 'type != () ? {id: 'type.id.toString(), label: 'type.label} : ()
        };
}

# Map deployed products response to the desired structure.
#
# + response - Deployed products response from the entity service
# + return - Mapped deployed products response
public isolated function mapDeployedProducts(entity:DeployedProductsResponse response)
    returns types:DeployedProduct[] {

    return from entity:DeployedProduct product in response.deployedProducts
        let entity:ReferenceTableItem? associatedProduct = product.product
        let entity:ReferenceTableItem? deployment = product.deployment
        let entity:ReferenceTableItem? version = product.version
        select {
            id: product.id,
            createdOn: product.createdOn,
            updatedOn: product.updatedOn,
            description: product.description,
            cores: product.cores,
            tps: product.tps,
            releasedOn: product.releasedOn,
            endOfLifeOn: product.endOfLifeOn,
            updateLevel: product.updateLevel,
            product: associatedProduct != () ? {id: associatedProduct.id, label: associatedProduct.name} : (),
            deployment: deployment != () ? {id: deployment.id, label: deployment.name} : (),
            version: version != () ? {id: version.id, label: version.name} : ()
        };
}

# Map created case response to the desired structure.
#
# + createdCase - Created case response from the entity service
# + return - Mapped created case response
public isolated function mapCreatedCase(entity:CreatedCase createdCase) returns types:CreatedCase {
    return {
        id: createdCase.id,
        internalId: createdCase.internalId,
        number: createdCase.number,
        createdBy: createdCase.createdBy,
        createdOn: createdCase.createdOn,
        state: {id: createdCase.state.id.toString(), label: createdCase.state.label},
        'type: {id: createdCase.'type.id.toString(), label: createdCase.'type.name}
    };
}

# Map product vulnerability search response to the desired structure.
#
# + response - Product vulnerability search response from the entity service
# + return - Mapped product vulnerability search response
public isolated function mapProductVulnerabilitySearchResponse(entity:ProductVulnerabilitySearchResponse response)
    returns types:ProductVulnerabilitySearchResponse {

    types:ProductVulnerability[] productVulnerabilities =
    from entity:ProductVulnerability vulnerability in response.productVulnerabilities
    select {
        id: vulnerability.id,
        cveId: vulnerability.cveId,
        vulnerabilityId: vulnerability.vulnerabilityId,
        severity: {id: vulnerability.severity.id.toString(), label: vulnerability.severity.label},
        componentName: vulnerability.componentName,
        version: vulnerability.version,
        'type: vulnerability.'type,
        useCase: vulnerability.useCase,
        justification: vulnerability.justification,
        resolution: vulnerability.resolution
    };
    return {
        productVulnerabilities,
        totalRecords: response.totalRecords,
        'limit: response.'limit,
        offset: response.offset
    };
}

# Map product vulnerability response to the desired structure.
#
# + response - Product vulnerability response from the entity service
# + return - Mapped product vulnerability response
public isolated function mapProductVulnerabilityResponse(entity:ProductVulnerabilityResponse response)
    returns types:ProductVulnerabilityResponse {

    return {
        id: response.id,
        cveId: response.cveId,
        vulnerabilityId: response.vulnerabilityId,
        severity: {id: response.severity.id.toString(), label: response.severity.label},
        componentName: response.componentName,
        version: response.version,
        'type: response.'type,
        useCase: response.useCase,
        justification: response.justification,
        resolution: response.resolution,
        componentType: response.componentType,
        updateLevel: response.updateLevel
    };
}

# Map product vulnerability metadata response to the desired structure.
#
# + response - Product vulnerability metadata response from the entity service
# + return - Mapped product vulnerability metadata response
public isolated function mapProductVulnerabilityMetadataResponse(entity:VulnerabilityMetaResponse response)
    returns types:ProductVulnerabilityMetaResponse {

    types:ReferenceItem[] severities = from entity:ChoiceListItem item in response.severities
        select {id: item.id.toString(), label: item.label};
    return {severities};
}

# Map project case stats response to the desired structure.
#
# + response - Project case stats response from the entity service
# + return - Mapped project case stats response
public isolated function mapCaseStats(entity:ProjectCaseStatsResponse response) returns types:ProjectCaseStats {
    types:ReferenceItem[] stateCount = from entity:ChoiceListItem item in response.stateCount
        select {id: item.id.toString(), label: item.label, count: item.count};
    types:ReferenceItem[] severityCount = from entity:ChoiceListItem item in response.severityCount
        select {id: item.id.toString(), label: item.label, count: item.count};
    types:ReferenceItem[] outstandingSeverityCount =
        from entity:ChoiceListItem item in response.outstandingSeverityCount
    select {id: item.id.toString(), label: item.label, count: item.count};
    types:ReferenceItem[] caseTypeCount = from entity:ReferenceTableItem item in response.caseTypeCount
        select {id: item.id, label: item.name, count: item.count};

    return {
        totalCases: response.totalCount,
        averageResponseTime: response.averageResponseTime,
        resolvedCases: response.resolvedCount,
        stateCount,
        severityCount,
        outstandingSeverityCount,
        caseTypeCount,
        casesTrend: response.casesTrend
    };
}

# Get open cases count from project case stats response.
#
# + response - Project case stats response from the entity service
# + return - Count of open cases, or null if not available
public isolated function getOpenCasesCountFromProjectCasesStats(entity:ProjectCaseStatsResponse response) returns int? {
    types:ProjectCaseStats stats = mapCaseStats(response);
    types:ReferenceItem[] openCases = stats.stateCount.filter(stat => stat.id == stateIdOpen.toString());
    return openCases.length() > 0 ? openCases[0].count : ();
}

# Map call requests response to the desired structure.
#
# + response - Call requests response from the entity service
# + return - Mapped call requests response
public isolated function mapSearchCallRequestResponse(entity:CallRequestsResponse response)
    returns types:CallRequestsResponse {

    types:CallRequest[] callRequests = from entity:CallRequest callRequest in response.callRequests
        let entity:ReferenceTableItem case = callRequest.case
        let entity:ChoiceListItem state = callRequest.state
        select {
            id: callRequest.id,
            reason: callRequest.reason,
            preferredTimes: callRequest.preferredTimes,
            durationMin: callRequest.durationMin,
            scheduleTime: callRequest.scheduleTime,
            createdOn: callRequest.createdOn,
            updatedOn: callRequest.updatedOn,
            case: {id: case.id, label: case.name},
            state: {id: state.id.toString(), label: state.label}
        };

    return {callRequests};
}

# Map product versions response to the desired structure.
#
# + response - Product versions response from the entity service
# + return - Mapped product versions response
public isolated function mapProductVersionsResponse(entity:ProductVersionsResponse response)
    returns types:ProductVersionsResponse {

    types:ProductVersion[] versions = from entity:ProductVersion version in response.versions
        let entity:ReferenceTableItem? product = version.product
        select {
            id: version.id,
            version: version.version,
            currentSupportStatus: version.currentSupportStatus,
            releaseDate: version.releaseDate,
            supportEolDate: version.supportEolDate,
            earliestPossibleSupportEolDate: version.earliestPossibleSupportEolDate,
            product: product != () ? {id: product.id, label: product.name} : ()
        };
    return {versions};
}
