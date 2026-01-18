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

# Search cases for a given project.
#
# + idToken - ID token for authorization
# + projectId - Project ID to filter cases
# + payload - Case search payload
# + return - Case search response or error
public isolated function searchCases(string idToken, string projectId, CaseSearchPayload payload)
    returns CaseSearchResponse|error {

    entity:CaseSearchPayload searchPayload = {
        filters: {
            projectIds: [projectId],
            caseTypes: payload.filters?.caseTypes,
            severityId: payload.filters?.severityId,
            stateId: payload.filters?.statusId,
            deploymentId: payload.filters?.deploymentId
        },
        pagination: payload.pagination,
        sortBy: payload.sortBy
    };
    entity:CaseSearchResponse casesResponse = check entity:searchCases(idToken, searchPayload);
    Case[] cases = from entity:Case {project, 'type, deployment, state, severity, assignedEngineer, ...rest}
        in casesResponse.cases
        let ReferenceItem? caseProject = check project.cloneWithType()
        let ReferenceItem? caseType = check 'type.cloneWithType()
        let ReferenceItem? caseAssignedEngineer = check assignedEngineer.cloneWithType()
        let ReferenceItem? caseDeployment = check deployment.cloneWithType()
        let SelectableItem? caseStatus = check state.cloneWithType()
        let SelectableItem? caseSeverity = check severity.cloneWithType()
        select {
            ...rest,
            project: caseProject,
            'type: caseType,
            deployment: caseDeployment,
            assignedEngineer: caseAssignedEngineer,
            severity: caseSeverity,
            status: caseStatus
        };

    return {
        cases,
        totalRecords: casesResponse.totalRecords,
        'limit: casesResponse.'limit,
        offset: casesResponse.offset
    };
}
