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
import type { ProjectSupportStats } from "@models/responses";

/**
 * Custom hook to fetch project support statistics by ID.
 *
 * @param {string} id - The ID of the project.
 * @returns {UseQueryResult<ProjectSupportStats, Error>} The query result object.
 */
export function useGetProjectSupportStats(
  id: string,
): UseQueryResult<ProjectSupportStats, Error> {
  const logger = useLogger();
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();
  const fetchFn = useAuthApiClient();

  return useQuery<ProjectSupportStats, Error>({
    queryKey: [ApiQueryKeys.SUPPORT_STATS, id],
    queryFn: async (): Promise<ProjectSupportStats> => {
      logger.debug(`Fetching support stats for project ID: ${id}`);

      try {
        const baseUrl = window.config?.CUSTOMER_PORTAL_BACKEND_BASE_URL;

        if (!baseUrl) {
          throw new Error("CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured");
        }

        const requestUrl = `${baseUrl}/projects/${id}/stats/support`;

        const response = await fetchFn(requestUrl, { method: "GET" });

        logger.debug(
          `[useGetProjectSupportStats] Response status: ${response.status}`,
        );

        if (!response.ok) {
          throw new Error(
            `Error fetching support stats: ${response.statusText}`,
          );
        }

        const data: ProjectSupportStats = await response.json();
        logger.debug("[useGetProjectSupportStats] Data received:", data);
        return data;
      } catch (error) {
        logger.error("[useGetProjectSupportStats] Error:", error);
        throw error;
      }
    },
    enabled: !!id && isSignedIn && !isAuthLoading,
    staleTime: 5 * 60 * 1000,
  });
}
