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

import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  type InfiniteData,
} from "@tanstack/react-query";
import { useAsgardeo } from "@asgardeo/react";
import { ApiQueryKeys } from "@constants/apiConstants";
import { useLogger } from "@hooks/useLogger";
import { useAuthApiClient } from "@context/AuthApiContext";
import type { CallRequestsResponse } from "@models/responses";

const LIMIT = 10;

/**
 * Hook to fetch call requests for a specific case using infinite query.
 * Uses POST /cases/:caseId/call-requests/search with pagination (max limit 10).
 *
 * @param {string} projectId - The ID of the project (used for query key only).
 * @param {string} caseId - The ID of the case.
 * @returns {UseInfiniteQueryResult<InfiniteData<CallRequestsResponse>, Error>} Infinite query result.
 */
export function useInfiniteCallRequests(
  projectId: string,
  caseId: string,
): UseInfiniteQueryResult<InfiniteData<CallRequestsResponse>, Error> {
  const logger = useLogger();
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();
  const fetchFn = useAuthApiClient();

  return useInfiniteQuery<CallRequestsResponse, Error>({
    queryKey: [ApiQueryKeys.CASE_CALL_REQUESTS, projectId, caseId],
    queryFn: async ({ pageParam = 0 }): Promise<CallRequestsResponse> => {
      logger.debug(
        `[useInfiniteCallRequests] Fetching call requests for case: ${caseId}, offset: ${pageParam}`,
      );

      try {
        if (!isSignedIn || isAuthLoading) {
          throw new Error("User must be signed in to fetch call requests");
        }

        const baseUrl = window.config?.CUSTOMER_PORTAL_BACKEND_BASE_URL;
        if (!baseUrl) {
          throw new Error("CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured");
        }

        const requestUrl = `${baseUrl}/cases/${caseId}/call-requests/search`;
        const body = JSON.stringify({
          pagination: { limit: LIMIT, offset: pageParam as number },
        });

        const response = await fetchFn(requestUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        logger.debug(
          `[useInfiniteCallRequests] Response status: ${response.status}`,
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
        logger.error("[useInfiniteCallRequests] Error:", error);
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const offset = lastPage.offset ?? 0;
      const limit = lastPage.limit ?? LIMIT;
      const total = lastPage.totalRecords ?? 0;
      const nextOffset = offset + limit;
      return nextOffset < total ? nextOffset : undefined;
    },
    enabled: !!caseId && !isAuthLoading && isSignedIn,
    staleTime: 5 * 60 * 1000,
  });
}
