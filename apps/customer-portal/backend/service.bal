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

import customer_portal.authorization;
import customer_portal.entity;
import customer_portal.scim;

import ballerina/cache;
import ballerina/http;
import ballerina/log;

configurable int capacity = ?;
configurable decimal defaultMaxAge = ?;
configurable float evictionFactor = ?;
configurable decimal cleanupInterval = ?;

final cache:Cache userCache = new ({
    capacity,
    defaultMaxAge,
    evictionFactor,
    cleanupInterval
});

@display {
    label: "Customer Portal",
    id: "cs/customer-portal"
}

service class ErrorInterceptor {
    *http:ResponseErrorInterceptor;

    # Intercepts the response error.
    #
    # + err - The error occurred during request processing
    # + ctx - Request context object
    # + return - Bad request response or error
    remote function interceptResponseError(error err, http:RequestContext ctx) returns http:BadRequest|error {

        // Handle data-binding errors.
        if err is http:PayloadBindingError {
            string customError = "Payload binding failed!";
            log:printError(customError, err);
            return {
                body: {
                    message: customError
                }
            };
        }
        return err;
    }
}

service http:InterceptableService / on new http:Listener(9090) {
    public function createInterceptors() returns http:Interceptor[] =>
        [new authorization:JwtInterceptor(), new ErrorInterceptor()];

    # Service init function.
    #
    # + return - Error if initialization fails
    function init() returns error? {
        log:printInfo("Customer Portal backend started.");
    }

    # Fetch user information of the logged in user.
    #
    # + ctx - Request context object
    # + return - User info object or error response
    resource function get users/me(http:RequestContext ctx) returns entity:UserResponse|http:InternalServerError {

        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: "User information header not found!"
                }
            };
        }

        string cacheKey = string `${userInfo.email}:userinfo`;
        if userCache.hasKey(cacheKey) {
            entity:UserResponse|error cachedUser = userCache.get(cacheKey).ensureType();
            if cachedUser is entity:UserResponse {
                return cachedUser;
            }
            log:printWarn(`Unable to read cached user info for ${userInfo.email}`);
        }

        entity:UserResponse|error userDetails = entity:fetchUserBasicInfo(userInfo.email, userInfo.idToken);
        if userDetails is error {
            return <http:InternalServerError>{
                body: {
                    message: "Error retrieving user data"
                }
            };
        }

        error? cacheError = userCache.put(cacheKey, userDetails);
        if cacheError is error {
            log:printWarn("Error writing user information to cache", cacheError);
        }
        return userDetails;
    }

    # Fetch list of projects with pagination.
    #
    # + ctx - Request context object
    # + offset - Pagination offset
    # + 'limit - Pagination limit
    # + return - Projects list or error response
    resource function get projects(http:RequestContext ctx, int offset = DEFAULT_OFFSET, int 'limit = DEFAULT_LIMIT)
        returns entity:ProjectsResponse|http:BadRequest|http:InternalServerError {

        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: "User information header not found!"
                }
            };
        }

        if offset < 0 || 'limit <= 0 {
            return <http:BadRequest>{
                body: {
                    message: "Invalid pagination parameters"
                }
            };
        }

        string cacheKey = string `${userInfo.email}:projects:${offset}:${'limit}`;
        if userCache.hasKey(cacheKey) {
            entity:ProjectsResponse|error cached = userCache.get(cacheKey).ensureType();
            if cached is entity:ProjectsResponse {
                return cached;
            }
        }

        entity:ProjectsResponse|error projectsList = entity:fetchProjects(userInfo.idToken, offset, 'limit);
        if projectsList is error {
            return <http:InternalServerError>{
                body: {
                    message: "Error retrieving projects list"
                }
            };
        }

        error? cacheError = userCache.put(cacheKey, projectsList);
        if cacheError is error {
            log:printWarn("Error writing projects to cache", cacheError);
        }
        return projectsList;
    }

    # Fetch specific project details.
    #
    # + ctx - Request context object
    # + projectId - Unique identifier of the project
    # + return - Project details or error response
    resource function get projects/[string projectId](http:RequestContext ctx)
        returns entity:ProjectDetailsResponse|http:BadRequest|http:InternalServerError {

        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: "User information header not found!"
                }
            };
        }

        if projectId.trim().length() == 0 {
            return <http:BadRequest>{
                body: {
                    message: "Project ID cannot be empty or whitespace"
                }
            };
        }

        string cacheKey = string `${userInfo.email}:project:${projectId}`;
        if userCache.hasKey(cacheKey) {
            entity:ProjectDetailsResponse|error cached = userCache.get(cacheKey).ensureType();
            if cached is entity:ProjectDetailsResponse {
                return cached;
            }
        }

        entity:ProjectDetailsResponse|error projectDetails = entity:fetchProjectDetails(projectId, userInfo.idToken);
        if projectDetails is error {
            return <http:InternalServerError>{
                body: {
                    message: "Error retrieving project information"
                }
            };
        }

        error? cacheError = userCache.put(cacheKey, projectDetails);
        if cacheError is error {
            log:printWarn("Error writing project details to cache", cacheError);
        }
        return projectDetails;
    }

    # Fetch project overview.
    #
    # + ctx - Request context object
    # + projectId - Unique identifier of the project
    # + return - Project overview or error response
    resource function get projects/[string projectId]/overview(http:RequestContext ctx)
        returns entity:ProjectOverviewResponse|http:BadRequest|http:InternalServerError {

        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: "User information header not found!"
                }
            };
        }

        if projectId.trim().length() == 0 {
            return <http:BadRequest>{
                body: {
                    message: "Project ID cannot be empty or whitespace"
                }
            };
        }

        string cacheKey = string `${userInfo.email}:overview:${projectId}`;
        if userCache.hasKey(cacheKey) {
            entity:ProjectOverviewResponse|error cached = userCache.get(cacheKey).ensureType();
            if cached is entity:ProjectOverviewResponse {
                return cached;
            }
        }

        entity:ProjectOverviewResponse|error projectOverview = entity:fetchProjectOverview(projectId, userInfo.idToken);
        if projectOverview is error {
            return <http:InternalServerError>{
                body: {
                    message: "Error retrieving project overview"
                }
            };
        }

        error? cacheError = userCache.put(cacheKey, projectOverview);
        if cacheError is error {
            log:printWarn("Error writing project overview to cache", cacheError);
        }
        return projectOverview;
    }

    # Fetch case filters for a specific project.
    #
    # + ctx - Request context object
    # + projectId - Unique identifier of the project
    # + return - Case filters or error response
    resource function get projects/[string projectId]/cases/filters(http:RequestContext ctx)
        returns entity:CaseFiltersResponse|http:BadRequest|http:InternalServerError {

        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: "User information header not found!"
                }
            };
        }

        if projectId.trim().length() == 0 {
            return <http:BadRequest>{
                body: {
                    message: "Project ID cannot be empty or whitespace"
                }
            };
        }

        string cacheKey = string `${userInfo.email}:casefilters:${projectId}`;
        if userCache.hasKey(cacheKey) {
            entity:CaseFiltersResponse|error cached = userCache.get(cacheKey).ensureType();
            if cached is entity:CaseFiltersResponse {
                return cached;
            }
        }

        entity:CaseFiltersResponse|error caseFilters = entity:fetchCasesFilters(projectId, userInfo.idToken);
        if caseFilters is error {
            return <http:InternalServerError>{
                body: {
                    message: "Error retrieving case filters"
                }
            };
        }

        error? cacheError = userCache.put(cacheKey, caseFilters);
        if cacheError is error {
            log:printWarn("Error writing case filters to cache", cacheError);
        }
        return caseFilters;
    }

    # Fetch cases for a project with optional filters.
    #
    # + ctx - Request context object
    # + projectId - Project ID filter
    # + offset - Pagination offset
    # + 'limit - Pagination limit
    # + contact - Optional contact name
    # + status - Optional case status
    # + severity - Optional severity level
    # + product - Optional product name
    # + category - Optional category
    # + return - Paginated cases or error response
    resource function get projects/[string projectId]/cases(http:RequestContext ctx, int offset = DEFAULT_OFFSET,
            int 'limit = DEFAULT_LIMIT, string? contact = (), string? status = (), string? severity = (),
            string? product = (), string? category = ())
        returns entity:CasesResponse|http:BadRequest|http:InternalServerError {

        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: "User information header not found!"
                }
            };
        }

        if projectId.trim().length() == 0 {
            return <http:BadRequest>{
                body: {
                    message: "Project ID cannot be empty or whitespace"
                }
            };
        }

        // Validate Pagination
        if offset < 0 || 'limit <= 0 {
            return <http:BadRequest>{
                body: {
                    message: "Invalid pagination parameters"
                }
            };
        }

        string cacheKey = string `${userInfo.email}:cases:${projectId}:${offset}:${'limit}:${contact ?: ""}:${status ?: ""}:${severity ?: ""}:${product ?: ""}:${category ?: ""}`;

        if userCache.hasKey(cacheKey) {
            entity:CasesResponse|error cached = userCache.get(cacheKey).ensureType();
            if cached is entity:CasesResponse {
                return cached;
            }
        }

        entity:CasesResponse|error cases = entity:fetchCases(userInfo.idToken, offset, 'limit, projectId,
                contact, status, severity, product, category);
        if cases is error {
            return <http:InternalServerError>{
                body: {
                    message: "Error retrieving cases"
                }
            };
        }

        error? cacheError = userCache.put(cacheKey, cases);
        if cacheError is error {
            log:printWarn("Error writing cases to cache", cacheError);
        }
        return cases;
    }

    # Fetch details of a specific case.
    #
    # + ctx - Request context object
    # + projectId - Unique identifier of the project
    # + caseId - Unique identifier of the case
    # + return - Case details or error response
    resource function get projects/[string projectId]/cases/[string caseId](http:RequestContext ctx)
        returns entity:CaseDetailsResponse|http:BadRequest|http:InternalServerError {

        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: "User information header not found!"
                }
            };
        }

        if projectId.trim().length() == 0 || caseId.trim().length() == 0 {
            return <http:BadRequest>{
                body: {
                    message: "Project ID and Case ID cannot be empty or whitespace"
                }
            };
        }

        string cacheKey = string `${userInfo.email}:case:${projectId}:${caseId}`;
        if userCache.hasKey(cacheKey) {
            entity:CaseDetailsResponse|error cached = userCache.get(cacheKey).ensureType();
            if cached is entity:CaseDetailsResponse {
                return cached;
            }
        }

        entity:CaseDetailsResponse|error caseDetails = entity:fetchCaseDetails(projectId, caseId, userInfo.idToken);
        if caseDetails is error {
            return <http:InternalServerError>{
                body: {
                    message: "Error retrieving case details"
                }
            };
        }

        error? cacheError = userCache.put(cacheKey, caseDetails);
        if cacheError is error {
            log:printWarn("Error writing case details to cache", cacheError);
        }

        return caseDetails;
    }

    # Add users to a SCIM group.
    #
    # + ctx - Request context object
    # + group - Group name
    # + payload - List of user emails
    # + return - Created response or error
    isolated resource function post groups/[string group]/users(http:RequestContext ctx,
            @http:Payload scim:AddUsersRequest payload)
        returns http:Created|http:BadRequest|http:InternalServerError {

        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: "User information header not found!"
                }
            };
        }

        if group.trim().length() == 0 || payload.emails.length() == 0 {
            return <http:BadRequest>{
                body: {
                    message: "Invalid group or empty user list"
                }
            };
        }

        scim:AddUsersResponse|error result = scim:addUsersToGroup(group, payload);
        if result is error {
            return <http:InternalServerError>{
                body: {
                    message: "Error adding users to group"
                }
            };
        }

        return <http:Created>{
            body: {
                message: MSG_USERS_ADDED_SUCCESS,
                addedUsers: result.addedUsers,
                failedUsers: result.failedUsers
            }
        };
    }
}
