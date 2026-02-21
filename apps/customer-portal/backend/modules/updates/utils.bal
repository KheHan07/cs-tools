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
import customer_portal.types;

# Process recommended update levels for a user.
#
# + email - Email of the user
# + return - An array of recommended update levels, or an error if the operation fails
public isolated function processRecommendedUpdateLevels(string email) returns types:RecommendedUpdateLevel[]|error {
    RecommendedUpdateLevel[] recommendedUpdateLevels = check getRecommendedUpdateLevels(email);
    return from RecommendedUpdateLevel level in recommendedUpdateLevels
        select {
            productName: level.product\-name,
            productBaseVersion: level.product\-base\-version,
            channel: level.channel,
            startingUpdateLevel: level.starting\-update\-level,
            endingUpdateLevel: level.ending\-update\-level,
            installedUpdatesCount: level.installed\-updates\-count,
            installedSecurityUpdatesCount: level.installed\-security\-updates\-count,
            timestamp: level.timestamp,
            recommendedUpdateLevel: level.recommended\-update\-level,
            availableSecurityUpdatesCount: level.available\-security\-updates\-count,
            availableUpdatesCount: level.available\-updates\-count
        };
}

# Process product update levels based on the provided parameters.
#
# + return - List of product update levels, or an error if the operation fails
public isolated function processProductUpdateLevels() returns types:ProductUpdateLevel[]|error {
    ProductUpdateLevel[] productUpdateLevels = check getProductUpdateLevels();
    return from ProductUpdateLevel level in productUpdateLevels
        select {
            productName: level.product\-name,
            productUpdateLevels: from UpdateLevel updateLevel in level.product\-update\-levels
                select {
                    productBaseVersion: updateLevel.product\-base\-version,
                    channel: updateLevel.channel,
                    updateLevels: updateLevel.update\-levels
                }
        };
}

# Process search for updates between specified update levels.
#
# + email - Email of the user
# + payload - Payload containing the update levels to search between
# + return - Update description for the specified update levels, or an error if the operation fails
public isolated function processSearchUpdatesBetweenUpdateLevels(string email, types:UpdateDescriptionPayload payload)
    returns types:UpdateDescription[]|error {

    UpdateDescriptionRequest requestPayload = {
        product\-name: payload.productName,
        product\-version: payload.productVersion,
        channel: payload.channel,
        starting\-update\-level: payload.startingUpdateLevel,
        ending\-update\-level: payload.endingUpdateLevel,
        user\-email: email
    };

    UpdateDescription[] response = check searchUpdatesBetweenUpdateLevels(email, requestPayload);
    return from UpdateDescription description in response
        let string? bundlesInfoChanges = description?.bundles\-info\-changes
        let DependantRelease[]? dependantReleases = description?.dependant\-releases
        select {
            productName: description.product\-name,
            productVersion: description.product\-version,
            channel: description.channel,
            updateLevel: description.update\-level,
            updateNumber: description.update\-number,
            description: description.description,
            instructions: description.instructions,
            bugFixes: description.bug\-fixes,
            filesAdded: description.files\-added,
            filesModified: description.files\-modified,
            filesRemoved: description.files\-removed,
            bundlesInfoChanges,
            updateType: description.update\-type,
            timestamp: description.timestamp,
            securityAdvisories: description.security\-advisories,
            dependantReleases: dependantReleases is () ? () : from DependantRelease release in dependantReleases
                    select {
                        repository: release.repository,
                        releaseVersion: release.release\-version
                    }
        };
}
