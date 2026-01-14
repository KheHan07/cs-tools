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

import customer_portal.authorization;
import customer_portal.entity;

import ballerina/cache;
import ballerina/http;
import ballerina/log;

configurable CacheConfig cacheConfig = ?;

final cache:Cache userCache = new ({
    capacity: cacheConfig.capacity,
    defaultMaxAge: cacheConfig.defaultMaxAge,
    evictionFactor: cacheConfig.evictionFactor,
    cleanupInterval: cacheConfig.cleanupInterval
});

service class ErrorInterceptor {
    *http:ResponseErrorInterceptor;

    # Intercepts the response error.
    #
    # + err - The error occurred during request processing
    # + return - Bad request response or error
    remote function interceptResponseError(error err) returns http:BadRequest|error {

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

@display {
    label: "Customer Portal",
    id: "cs/customer-portal"
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
    # + return - User info object or error response
    resource function get users/me(http:RequestContext ctx) returns entity:UserResponse|http:InternalServerError {
        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: ERR_MSG_USER_INFO_HEADER_NOT_FOUND
                }
            };
        }

        string cacheKey = string `${userInfo.email}:userinfo`;
        if userCache.hasKey(cacheKey) {
            entity:UserResponse|error cachedUser = userCache.get(cacheKey).ensureType();
            if cachedUser is entity:UserResponse {
                return cachedUser;
            }
            log:printWarn(string `Unable to read cached user info for ${userInfo.email}`);
        }

        entity:UserResponse|error userDetails = entity:fetchUserBasicInfo(userInfo.email, userInfo.idToken);
        if userDetails is error {
            string customError = "Error retrieving user data from entity service";
            log:printError(customError, userDetails);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        error? cacheError = userCache.put(cacheKey, userDetails);
        if cacheError is error {
            log:printWarn("Error writing user information to cache", cacheError);
        }
        return userDetails;
    }

    # Search projects of the logged-in user.
    #
    # + payload - Project search request body
    # + return - Projects list or error response
    resource function post projects/search(http:RequestContext ctx, entity:ProjectRequest payload)
        returns entity:ProjectsResponse|http:BadRequest|http:InternalServerError {

        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: ERR_MSG_USER_INFO_HEADER_NOT_FOUND
                }
            };
        }

        entity:ProjectsResponse|error projectsList = entity:searchProjects(userInfo.idToken, payload);
        if projectsList is error {
            string customError = "Error retrieving projects list";
            log:printError(customError, projectsList);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }
        return projectsList;
    }

    # Search cases for a specific project with filters and pagination.
    #
    # + id - ID of the project
    # + payload - Case search request body
    # + return - Paginated cases or error
    resource function post projects/[string id]/cases/search(http:RequestContext ctx, CaseSearchPayload payload)
        returns CaseSearchResponse|http:BadRequest|http:InternalServerError {

        authorization:UserDataPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: ERR_MSG_USER_INFO_HEADER_NOT_FOUND
                }
            };
        }

        if id.trim().length() == 0 {
            string customError = "Project ID cannot be empty or whitespace";
            log:printError(customError);
            return <http:BadRequest>{
                body: {
                    message: customError
                }
            };
        }

        entity:CaseSearchPayload searchPayload = {
            filters: {
                projectIds: [id],
                caseTypes: payload.filters?.caseTypes,
                severityId: payload.filters?.severityId,
                stateId: payload.filters?.statusId,
                deploymentId: payload.filters?.deploymentId
            },
            pagination: payload.pagination,
            sortBy: payload.sortBy
        };
        entity:CaseSearchResponse|error casesResponse = entity:searchCases(userInfo.idToken, id, searchPayload);
        if casesResponse is error {
            string customError = "Error retrieving cases";
            log:printError(customError, casesResponse);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }
    
        Case[] cases = from entity:Case case in casesResponse.cases
            select {
                id: case.id,
                projectId: case.projectId,
                'type: case.'type,
                number: case.number,
                createdOn: case.createdOn,
                assignedEngineer: case.assignedEngineer,
                title: case.title,
                description: case.description,
                severity: case.severity,
                status: case.state,
                deploymentId: case.deploymentId
            };

        return {
            cases,
            totalRecords: casesResponse.totalRecords,
            'limit: casesResponse.'limit,
            offset: casesResponse.offset
        };
    }
}
