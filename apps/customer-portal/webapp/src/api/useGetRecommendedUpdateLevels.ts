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

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAsgardeo } from "@asgardeo/react";
import { getMockRecommendedUpdateLevels } from "@models/mockFunctions";
import { useMockConfig } from "@providers/MockConfigProvider";
import { useLogger } from "@hooks/useLogger";
import { ApiQueryKeys, API_MOCK_DELAY } from "@constants/apiConstants";
import { useAuthApiClient } from "@context/AuthApiContext";
import type { RecommendedUpdateLevelItem } from "@models/responses";

/**
 * Custom hook to fetch recommended update levels.
 *
 * @param {string} projectId - The ID of the project.
 * @returns {UseQueryResult<RecommendedUpdateLevelItem[], Error>} The query result object.
 */
export function useGetRecommendedUpdateLevels(
  projectId: string,
): UseQueryResult<RecommendedUpdateLevelItem[], Error> {
  const logger = useLogger();
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();
  const fetchFn = useAuthApiClient();
  const { isMockEnabled } = useMockConfig();

  return useQuery<RecommendedUpdateLevelItem[], Error>({
    queryKey: [
      ApiQueryKeys.RECOMMENDED_UPDATE_LEVELS,
      projectId,
      isMockEnabled,
    ],
    queryFn: async (): Promise<RecommendedUpdateLevelItem[]> => {
      logger.debug(
        `Fetching recommended update levels for project ID: ${projectId}, mock: ${isMockEnabled}`,
      );

      if (isMockEnabled) {
        await new Promise((resolve) => setTimeout(resolve, API_MOCK_DELAY));

        const data: RecommendedUpdateLevelItem[] =
          getMockRecommendedUpdateLevels();

        logger.debug(
          `Recommended update levels fetched successfully for project ID: ${projectId} (mock)`,
          data,
        );

        return data;
      }

      try {
        const baseUrl = window.config?.CUSTOMER_PORTAL_BACKEND_BASE_URL;

        if (!baseUrl) {
          throw new Error("CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured");
        }

        const requestUrl = `${baseUrl}/updates/recommended-update-levels`;

        const response = await fetchFn(requestUrl, { method: "GET" });

        logger.debug(
          `[useGetRecommendedUpdateLevels] Response status: ${response.status}`,
        );

        if (!response.ok) {
          throw new Error(
            `Error fetching updates stats: ${response.statusText}`,
          );
        }

        const data: RecommendedUpdateLevelItem[] = await response.json();
        logger.debug("[useGetRecommendedUpdateLevels] Data received:", data);
        return data;
      } catch (error) {
        logger.error("[useGetRecommendedUpdateLevels] Error:", error);
        throw error;
      }
    },
    enabled: !!projectId && (isMockEnabled || (isSignedIn && !isAuthLoading)),
    staleTime: 5 * 60 * 1000,
  });
}
