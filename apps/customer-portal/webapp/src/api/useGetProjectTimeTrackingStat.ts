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
import { useLogger } from "@hooks/useLogger";
import { ApiQueryKeys } from "@constants/apiConstants";
import { useAuthApiClient } from "@context/AuthApiContext";
import type { ProjectTimeTrackingStats } from "@models/responses";

/**
 * Custom hook to fetch project time tracking statistics by project ID.
 *
 * @param {string} projectId - The ID of the project.
 * @returns {UseQueryResult<ProjectTimeTrackingStats, Error>} The query result object.
 */
export default function useGetProjectTimeTrackingStat(
  projectId: string,
): UseQueryResult<ProjectTimeTrackingStats, Error> {
  const logger = useLogger();
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();
  const fetchFn = useAuthApiClient();

  return useQuery<ProjectTimeTrackingStats, Error>({
    queryKey: [ApiQueryKeys.TIME_TRACKING_STATS, projectId],
    queryFn: async (): Promise<ProjectTimeTrackingStats> => {
      logger.debug(`Fetching time tracking stats for project ID: ${projectId}`);

      try {
        const baseUrl = window.config?.CUSTOMER_PORTAL_BACKEND_BASE_URL;

        if (!baseUrl) {
          throw new Error("CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured");
        }

        const requestUrl = `${baseUrl}/projects/${projectId}/timetracking/stats`;

        const response = await fetchFn(requestUrl, { method: "GET" });

        logger.debug(
          `[useGetProjectTimeTrackingStat] Response status for ${projectId}: ${response.status}`,
        );

        if (!response.ok) {
          throw new Error(
            `Error fetching time tracking stats: ${response.statusText}`,
          );
        }

        const data: ProjectTimeTrackingStats = await response.json();
        logger.debug("[useGetProjectTimeTrackingStat] Data received:", data);
        return data;
      } catch (error) {
        logger.error("[useGetProjectTimeTrackingStat] Error:", error);
        throw error;
      }
    },
    enabled: !!projectId && isSignedIn && !isAuthLoading,
    staleTime: 5 * 60 * 1000,
  });
}
