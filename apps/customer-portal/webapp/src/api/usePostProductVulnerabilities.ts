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

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useAsgardeo } from "@asgardeo/react";
import { useLogger } from "@hooks/useLogger";
import { useAuthApiClient } from "@context/AuthApiContext";
import type { ProductVulnerabilitiesSearchRequest } from "@models/requests";
import type { ProductVulnerabilitiesSearchResponse } from "@models/responses";

/**
 * Searches product vulnerabilities (POST /products/vulnerabilities/search).
 *
 * @returns {UseMutationResult<ProductVulnerabilitiesSearchResponse, Error, ProductVulnerabilitiesSearchRequest>} Mutation result.
 */
export function usePostProductVulnerabilities(): UseMutationResult<
  ProductVulnerabilitiesSearchResponse,
  Error,
  ProductVulnerabilitiesSearchRequest
> {
  const logger = useLogger();
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();
  const fetchFn = useAuthApiClient();

  return useMutation<
    ProductVulnerabilitiesSearchResponse,
    Error,
    ProductVulnerabilitiesSearchRequest
  >({
    mutationFn: async (
      requestBody: ProductVulnerabilitiesSearchRequest,
    ): Promise<ProductVulnerabilitiesSearchResponse> => {
      logger.debug(
        "[usePostProductVulnerabilities] Request payload:",
        requestBody,
      );

      try {
        if (!isSignedIn || isAuthLoading) {
          throw new Error(
            "User must be signed in to search product vulnerabilities",
          );
        }

        const baseUrl = window.config?.CUSTOMER_PORTAL_BACKEND_BASE_URL;
        if (!baseUrl) {
          throw new Error(
            "CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured",
          );
        }

        const requestUrl = `${baseUrl}/products/vulnerabilities/search`;

        const response = await fetchFn(requestUrl, {
          method: "POST",
          body: JSON.stringify(requestBody),
        });

        logger.debug(
          `[usePostProductVulnerabilities] Response status: ${response.status}`,
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            `Error searching product vulnerabilities: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`,
          );
        }

        const data: ProductVulnerabilitiesSearchResponse =
          await response.json();
        logger.debug(
          "[usePostProductVulnerabilities] Data received:",
          data,
        );
        return data;
      } catch (error) {
        logger.error("[usePostProductVulnerabilities] Error:", error);
        throw error;
      }
    },
  });
}
