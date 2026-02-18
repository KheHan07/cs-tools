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

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAsgardeo } from "@asgardeo/react";
import { ApiQueryKeys } from "@constants/apiConstants";
import { useAuthApiClient } from "@context/AuthApiContext";
import type { ProjectUser } from "@models/responses";

/**
 * Custom hook to fetch project users.
 *
 * @param {string} projectId - The project ID.
 * @returns {UseQueryResult<ProjectUser[]>} The query result containing project users.
 */
export default function useGetProjectUsers(
  projectId: string,
): UseQueryResult<ProjectUser[]> {
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();
  const fetchFn = useAuthApiClient();

  return useQuery<ProjectUser[]>({
    queryKey: [ApiQueryKeys.PROJECT_USERS, projectId],
    queryFn: async (): Promise<ProjectUser[]> => {
      const baseUrl = window.config?.CUSTOMER_PORTAL_BACKEND_BASE_URL;
      if (!baseUrl) {
        throw new Error("CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured");
      }
      const requestUrl = `${baseUrl}/projects/${projectId}/users`;
      const response = await fetchFn(requestUrl, { method: "GET" });
      if (!response.ok) {
        throw new Error(
          `Error fetching project users: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.users ?? [];
    },
    enabled: !!projectId && isSignedIn && !isAuthLoading,
  });
}
