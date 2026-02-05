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
import { useMockConfig } from "@providers/MockConfigProvider";
import { useLogger } from "@hooks/useLogger";
import { mockProjects } from "@models/mockData";
import { ApiQueryKeys, API_MOCK_DELAY } from "@constants/apiConstants";
import type { SearchProjectsRequest } from "@models/requests";
import type { SearchProjectsResponse } from "@models/responses";

/**
 * Custom hook to search projects.
 * This hook uses a standard query to fetch projects.
 *
 * @param {SearchProjectsRequest} searchData - The search and pagination parameters.
 * @param {boolean} fetchAll - If true, treats this as a shared "all projects" query.
 * @returns {UseQueryResult<SearchProjectsResponse, Error>} The query result object.
 */
export default function useGetProjects(
  searchData?: SearchProjectsRequest,
  fetchAll: boolean = false,
): UseQueryResult<SearchProjectsResponse, Error> {
  const logger = useLogger();
  const { getIdToken, isSignedIn, isLoading: isAuthLoading } = useAsgardeo();
  const { isMockEnabled } = useMockConfig();
  const limit = fetchAll ? 100 : searchData?.pagination?.limit || 10;
  const offset = searchData?.pagination?.offset || 0;

  // A stable key for the "all projects" query ensures cache sharing
  const queryKey = fetchAll
    ? [ApiQueryKeys.PROJECTS, "all", isMockEnabled]
    : [ApiQueryKeys.PROJECTS, searchData ?? "default", isMockEnabled];

  return useQuery<SearchProjectsResponse, Error>({
    queryKey,
    queryFn: async (): Promise<SearchProjectsResponse> => {
      logger.debug(
        `Fetching projects... offset: ${offset}, limit: ${limit}, fetchAll: ${fetchAll}, mock: ${isMockEnabled}`,
      );

      if (isMockEnabled) {
        // Mock behavior: simulate network latency for the in-memory `mockProjects` data.
        await new Promise((resolve) => setTimeout(resolve, API_MOCK_DELAY));

        const results: SearchProjectsResponse = {
          limit,
          offset,
          projects: mockProjects
            .slice(offset, offset + limit)
            .map((project) => ({
              createdOn: project.createdOn,
              description: project.description,
              id: project.id,
              key: project.key,
              name: project.name,
            })),
          totalRecords: mockProjects.length,
        };

        logger.debug("Projects fetched successfully (mock)", results);

        return results;
      }

      try {
        const idToken = await getIdToken();
        const baseUrl = window.config?.CUSTOMER_PORTAL_BACKEND_BASE_URL;

        if (!baseUrl) {
          throw new Error("CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured");
        }

        const requestUrl = `${baseUrl}/projects/search`;
        const body = {};

        const response = await fetch(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${idToken}`,
            "x-user-id-token": idToken,
          },
          body: JSON.stringify(body),
        });

        logger.debug(`[useGetProjects] Response status: ${response.status}`);

        if (!response.ok) {
          throw new Error(`Error fetching projects: ${response.statusText}`);
        }

        const data: SearchProjectsResponse = await response.json();
        logger.debug("[useGetProjects] Data received:", data);
        return data;
      } catch (error) {
        logger.error("[useGetProjects] Error:", error);
        throw error;
      }
    },
    staleTime: Infinity,
    enabled: isMockEnabled || (isSignedIn && !isAuthLoading),
  });
}
