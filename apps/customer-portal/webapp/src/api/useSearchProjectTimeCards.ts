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
import type { TimeCardSearchResponse } from "@models/responses";
import type { TimeCardSearchRequest } from "@models/requests";

export interface UseSearchProjectTimeCardsParams {
  projectId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Custom hook to search project time cards with date range filters.
 *
 * @param {UseSearchProjectTimeCardsParams} params - Project ID and filters.
 * @returns {UseQueryResult<TimeCardSearchResponse, Error>} The query result object.
 */
export default function useSearchProjectTimeCards({
  projectId,
  startDate,
  endDate,
  limit = 10,
  offset = 0,
}: UseSearchProjectTimeCardsParams): UseQueryResult<
  TimeCardSearchResponse,
  Error
> {
  const logger = useLogger();
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();
  const fetchFn = useAuthApiClient();

  return useQuery<TimeCardSearchResponse, Error>({
    queryKey: [
      ApiQueryKeys.TIME_CARDS_SEARCH,
      projectId,
      startDate,
      endDate,
      limit,
      offset,
    ],
    queryFn: async (): Promise<TimeCardSearchResponse> => {
      logger.debug(
        `Searching time cards for project ID: ${projectId}, start: ${startDate}, end: ${endDate}`,
      );

      try {
        const baseUrl = window.config?.CUSTOMER_PORTAL_BACKEND_BASE_URL;

        if (!baseUrl) {
          throw new Error("CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured");
        }

        const requestUrl = `${baseUrl}/projects/${projectId}/time-cards/search`;
        const body: TimeCardSearchRequest = {
          filters: {
            startDate,
            endDate,
          },
          pagination: { limit, offset },
        };

        const response = await fetchFn(requestUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        logger.debug(
          `[useSearchProjectTimeCards] Response status for ${projectId}: ${response.status}`,
        );

        if (!response.ok) {
          throw new Error(
            `Error searching time cards: ${response.statusText}`,
          );
        }

        const data: TimeCardSearchResponse = await response.json();
        logger.debug("[useSearchProjectTimeCards] Data received:", data);
        return data;
      } catch (error) {
        logger.error("[useSearchProjectTimeCards] Error:", error);
        throw error;
      }
    },
    enabled:
      !!projectId && !!startDate && !!endDate && isSignedIn && !isAuthLoading,
    staleTime: 5 * 60 * 1000,
  });
}
