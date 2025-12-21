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

public isolated function fetchUserBasicInfo(string email, string idToken) returns UserResponse|error {
    map<string|string[]> headers = {
        "Authorization": ["Bearer " + idToken],
        "X-JWT-Assertion": [idToken]
    };

    UserResponse|error userInfoResponse = csEntityClient->/users/me.get(
        headers = headers
    );

    if userInfoResponse is error {
        return userInfoResponse;
    }

    return userInfoResponse;
}

# Fetch case filters for a specific project.
#
# + projectId - Unique ID of the project
# + idToken - ID token for authorization
# + return - Case filters object or error
public isolated function fetchCasesFilters(string projectId, string idToken)
    returns CaseFiltersResponse|error {

    map<string|string[]> headers = {
        "Authorization": ["Bearer " + idToken],
        "X-JWT-Assertion": [idToken]
    };

    CaseFiltersResponse|error caseFiltersResponse = csEntityClient->/projects/[projectId]/cases/filters.get(
        headers = headers
    );

    if caseFiltersResponse is error {
        return caseFiltersResponse;
    }

    return caseFiltersResponse;

}

# Fetch project overview from entity service.
#
# + projectId - Project ID to fetch overview for
# + idToken - ID token for authorization
# + return - Project overview or error
public isolated function fetchProjectOverview(string projectId, string idToken) returns ProjectOverviewResponse|error {
    map<string|string[]> headers = {
        "Authorization": ["Bearer " + idToken],
        "X-JWT-Assertion": [idToken]
    };

    ProjectOverviewResponse|error projectOverviewResponse = csEntityClient->/projects/[projectId]/overview.get(
        headers = headers
    );

    if projectOverviewResponse is error {
        return projectOverviewResponse;
    }

    return projectOverviewResponse;
}

# Fetch project details by project ID.
#
# + projectId - Unique ID of the project
# + idToken - ID token for authorization
# + return - Project details object or error
public isolated function fetchProjectDetails(string projectId, string idToken) returns ProjectDetailsResponse|error {
    map<string|string[]> headers = {
        "Authorization": ["Bearer " + idToken],
        "X-JWT-Assertion": [idToken]
    };

    ProjectDetailsResponse|error projectInformationResponse = csEntityClient->/projects/[projectId].get(
        headers = headers
    );

    if projectInformationResponse is error {
        return projectInformationResponse;
    }

    return projectInformationResponse;
}

# Fetch case details for a specific case in a project.
#
# + projectId - Unique ID of the project
# + caseId - Unique ID of the case
# + idToken - ID token for authorization
# + return - Case details object or error
public isolated function fetchCaseDetails(string projectId, string caseId, string idToken) returns CaseDetailsResponse|error {
    map<string|string[]> headers = {
        "Authorization": ["Bearer " + idToken],
        "X-JWT-Assertion": [idToken]
    };

    CaseDetailsResponse|error caseDetailsResponse = csEntityClient->/projects/[projectId]/cases/[caseId].get(
        headers = headers
    );

    if caseDetailsResponse is error {
        return caseDetailsResponse;
    }

    return caseDetailsResponse;
}

# Fetch projects of the logged-in user.
#
# + idToken - ID token for authorization
# + offset - Pagination offset
# + 'limit - Pagination limit
# + return - Projects object or error
public isolated function fetchProjects(string idToken, int offset, int 'limit) returns ProjectsResponse|error {
    map<string|string[]> headers = {
        "Authorization": ["Bearer " + idToken],
        "X-JWT-Assertion": [idToken]
    };

    ProjectsResponse|error projectsResponse = csEntityClient->/projects.get(
        headers, offset = offset, 'limit = 'limit
    );

    if projectsResponse is error {
        return projectsResponse;
    }

    return projectsResponse;
}

# Fetch cases for a specific project with pagination and filters.
#
# + idToken - ID token for authorization
# + offset - Pagination offset
# + 'limit - Pagination limit
# + projectId - Unique ID of the project
# + contact - Contact filter (optional)
# + status - Status filter (optional)
# + severity - Severity filter (optional)
# + product - Product filter (optional)
# + category - Category filter (optional)
# + return - Cases object or error
public isolated function fetchCases(
        string idToken,
        int offset,
        int 'limit,
        string projectId,
        string? contact,
        string? status,
        string? severity,
        string? product,
        string? category
) returns CasesResponse|error {

    map<string|string[]> headers = {
        "Authorization": ["Bearer " + idToken],
        "X-JWT-Assertion": [idToken]
    };

    map<string|string[]> queryParams = {
        "offset": offset.toString(),
        "limit": 'limit.toString()
    };

    if contact is string {
        queryParams["contact"] = contact;
    }
    if status is string {
        queryParams["status"] = status;
    }
    if severity is string {
        queryParams["severity"] = severity;
    }
    if product is string {
        queryParams["product"] = product;
    }
    if category is string {
        queryParams["category"] = category;
    }

    return csEntityClient->/projects/[projectId]/cases.get(
        headers = headers,
        params = {...queryParams}
    );
}
