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

import { useAsgardeo } from "@asgardeo/react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useLogger } from "@hooks/useLogger";
import { ApiQueryKeys } from "@constants/apiConstants";
import type { DashboardMockStats } from "@models/responses";

/**
 * Custom hook to fetch dashboard statistics.
 * Real API for dashboard stats (trend) is not implemented yet; throws so UI can show error state.
 *
 * @param {string} projectId - The ID of the project.
 * @returns {UseQueryResult<DashboardMockStats, Error>} The query result object.
 */
export function useGetDashboardMockStats(
  projectId: string,
): UseQueryResult<DashboardMockStats, Error> {
  const logger = useLogger();
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();

  return useQuery<DashboardMockStats, Error>({
    queryKey: [ApiQueryKeys.DASHBOARD_STATS, projectId],
    queryFn: async (): Promise<DashboardMockStats> => {
      logger.debug(
        `Fetching dashboard stats for project ID: ${projectId}`,
      );
      throw new Error(
        "Dashboard stats API is not implemented yet.",
      );
    },
    enabled: !!projectId && isSignedIn && !isAuthLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
