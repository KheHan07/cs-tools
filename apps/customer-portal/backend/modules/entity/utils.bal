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
import ballerina/time;

# Generate authorization headers.
#
# + token - ID token for authorization
# + return - Map of headers with authorization
isolated function generateHeaders(string token) returns map<string|string[]> => {"x-user-id-token": token};

# Get comments for a given entity ID with pagination.
#
# + idToken - ID token for authorization
# + id - Entity ID to filter comments
# + limit - Number of comments to retrieve
# + offset - Offset for pagination
# + return - Comments response or error
public isolated function getComments(string idToken, string id, int? 'limit, int? offset)
    returns CommentsResponse|error {

    ReferenceSearchPayload payload = {
        referenceId: id,
        referenceType: CASE,
        pagination: {
            'limit: 'limit ?: DEFAULT_LIMIT,
            offset: offset ?: DEFAULT_OFFSET
        }
    };
    return searchComments(idToken, payload);
}

# Get attachments for a given entity ID with pagination.
#
# + idToken - ID token for authorization
# + id - Entity ID to filter attachments
# + limit - Number of attachments to retrieve
# + offset - Offset for pagination
# + return - Attachments response or error
public isolated function getAttachments(string idToken, string id, int? 'limit, int? offset)
    returns AttachmentsResponse|error {

    ReferenceSearchPayload payload = {
        referenceId: id,
        referenceType: CASE,
        pagination: {
            'limit: 'limit ?: DEFAULT_LIMIT,
            offset: offset ?: DEFAULT_OFFSET
        }
    };
    return searchAttachments(idToken, payload);
}

# Validate call request update payload.
#
# + payload - Call request update payload
# + return - Error message if validation fails, nil otherwise
public isolated function validateCallRequestUpdatePayload(CallRequestUpdatePayload payload) returns string? {
    // Validate stateKey is either 2 (Pending on WSO2) or 6 (Canceled)
    if payload.stateKey != PENDING_ON_WSO2 && payload.stateKey != CANCELED {
        return "Invalid status. Allowed values are Pending on WSO2 or Canceled.";
    }

    string[]? utcTimes = payload.utcTimes;

    // If stateKey is 2 (Pending on WSO2), utcTimes is mandatory
    if payload.stateKey == PENDING_ON_WSO2 && (utcTimes is () || utcTimes.length() == 0) {
        return "At least one UTC time is required when the status is Pending on WSO2.";
    }

    // If stateKey is 6 (Canceled), utcTimes should not be present
    if payload.stateKey == CANCELED && utcTimes !is () {
        return "UTC times must not be provided when the status is Canceled.";
    }

    return ();
}

# Validate UTC times in the call request payloads.
#
# + utcTimes - Array of UTC time strings to validate
# + return - Error message if any UTC time is invalid or in the past, nil otherwise
public isolated function validateUtcTimes(Date[]? utcTimes) returns string|error? {
    if utcTimes != () {
        foreach string utcTime in utcTimes {
            time:Utc input = check time:utcFromString(utcTime);
            time:Utc now = time:utcNow();
            // TODO: Handle the timezone validation
            if input < now {
                return "UTC time cannot be in the past.";
            }
        }
    }

    return;
}

# Validate deployment update payload.
#
# + payload - Deployment update payload
# + return - Error message if validation fails, nil otherwise
public isolated function validateDeploymentUpdatePayload(DeploymentUpdatePayload payload) returns string? {
    boolean hasDeploymentFields = payload.name !is () && payload.typeKey !is ();

    // Check if payload has at least one field
    if !hasDeploymentFields && payload.active is () {
        return "At least one field (name, typeKey, or active) must be provided for update.";
    }

    // Validate that deployment fields and active field are mutually exclusive
    if hasDeploymentFields && payload.active !is () {
        return "Deployment fields (name, typeKey, description) and active field cannot be updated together.";
    }

    // Validate that active field can only be false
    if payload.active !is () {
        boolean? activeValue = payload.active;
        if activeValue is boolean && activeValue {
            return "Active field can only be set to false.";
        }
    }

    return;
}
