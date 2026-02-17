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
import { API_MOCK_DELAY, ApiQueryKeys } from "@constants/apiConstants";
import { mockCallRequests } from "@models/mockData";
import { useLogger } from "@hooks/useLogger";
import { useAuthApiClient } from "@context/AuthApiContext";
import type { CallRequestsResponse } from "@models/responses";

/**
 * Hook to fetch call requests for a specific case.
 *
 * @param {string} projectId - The ID of the project.
 * @param {string} caseId - The ID of the case.
 * @returns {UseQueryResult<CallRequestsResponse, Error>} Query result.
 */
export function useGetCallRequests(
  projectId: string,
  caseId: string,
): UseQueryResult<CallRequestsResponse, Error> {
  const logger = useLogger();
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();
  const { isMockEnabled } = useMockConfig();
  const fetchFn = useAuthApiClient();

  return useQuery<CallRequestsResponse, Error>({
    queryKey: [
      ApiQueryKeys.CASE_CALL_REQUESTS,
      projectId,
      caseId,
      isMockEnabled,
    ],
    queryFn: async (): Promise<CallRequestsResponse> => {
      logger.debug(
        `[useGetCallRequests] Fetching call requests for case: ${caseId} in project: ${projectId}, mock: ${isMockEnabled}`,
      );

      if (isMockEnabled) {
        await new Promise((resolve) => setTimeout(resolve, API_MOCK_DELAY));
        logger.debug("[useGetCallRequests] Returning mock data");
        return mockCallRequests;
      }

      try {
        if (!isSignedIn || isAuthLoading) {
          throw new Error("User must be signed in to fetch call requests");
        }

        const baseUrl = window.config?.CUSTOMER_PORTAL_BACKEND_BASE_URL;
        if (!baseUrl) {
          throw new Error("CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured");
        }

        const requestUrl = `${baseUrl}/projects/${projectId}/cases/${caseId}/call-requests`;

        const response = await fetchFn(requestUrl, { method: "GET" });

        logger.debug(
          `[useGetCallRequests] Response status: ${response.status}`,
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            `Error fetching call requests: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`,
          );
        }

        const data: CallRequestsResponse = await response.json();
        return data;
      } catch (error) {
        logger.error("[useGetCallRequests] Error:", error);
        throw error;
      }
    },
    enabled:
      !!projectId &&
      !!caseId &&
      !isAuthLoading &&
      (isSignedIn || isMockEnabled),
    staleTime: 5 * 60 * 1000,
  });
}
