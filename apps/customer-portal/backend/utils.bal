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
        select {
            ...rest,
            project: project != () ? {id: project.id, label: project.name} : (),
            'type: 'type != () ? {id: 'type.id, label: 'type.name} : (),
            deployment: deployment != () ? {id: deployment.id, label: deployment.name} : (),
            assignedEngineer: assignedEngineer != () ? {id: assignedEngineer.id, label: assignedEngineer.name} : (),
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
