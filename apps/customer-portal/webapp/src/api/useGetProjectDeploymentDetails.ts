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
import type { DeploymentsResponse } from "@models/responses";

const MOCK_DEPLOYMENTS: DeploymentsResponse = {
  deployments: [
    {
      id: "dep-prod-1",
      name: "Production",
      status: "Healthy",
      url: "https://api.example.com",
      version: "v2.5.1",
      description: "Primary production environment serving live traffic",
      deployedAt: "2026-01-17",
      uptimePercent: 99.98,
      products: [
        {
          id: "prod-1",
          name: "WSO2 API Manager",
          version: "4.2.0",
          supportStatus: "Active Support",
          description: "API Gateway and management platform",
          cores: 8,
          tps: 5000,
          releasedDate: "2023-05-15",
          endOfLifeDate: "2026-05-15",
          updateLevel: "U22",
        },
        {
          id: "prod-2",
          name: "WSO2 Identity Server",
          version: "6.1.0",
          supportStatus: "Active Support",
          description: "Identity and access management",
          cores: 4,
          tps: 2000,
          releasedDate: "2023-08-20",
          endOfLifeDate: "2026-08-20",
          updateLevel: "U15",
        },
      ],
      documents: [
        {
          id: "doc-1",
          name: "Production Deployment Architecture.pdf",
          category: "Architecture",
          sizeBytes: 2453504,
          uploadedAt: "2026-01-12",
          uploadedBy: "John Doe",
        },
        {
          id: "doc-2",
          name: "API Gateway Deployment Diagram.png",
          category: "Deployment Diagram",
          sizeBytes: 1236992,
          uploadedAt: "2026-01-14",
          uploadedBy: "Sarah Chen",
        },
        {
          id: "doc-3",
          name: "Production Test Cases.xlsx",
          category: "Test Case",
          sizeBytes: 987658,
          uploadedAt: "2026-01-16",
          uploadedBy: "Mike Johnson",
        },
      ],
    },
    {
      id: "dep-qa-1",
      name: "QA Environment",
      status: "Healthy",
      url: "https://qa-api.example.com",
      version: "v2.6.0-rc1",
      description: "Quality assurance and testing environment",
      deployedAt: "2026-01-18",
      uptimePercent: 99.95,
      products: [
        {
          id: "qa-1",
          name: "WSO2 API Manager",
          version: "4.2.0",
          supportStatus: "Active Support",
          description: "API Gateway for testing",
          cores: 4,
          tps: 1000,
          releasedDate: "2023-05-15",
          endOfLifeDate: "2026-05-15",
          updateLevel: "U22",
        },
      ],
      documents: [
        {
          id: "doc-4",
          name: "Production Deployment Architecture.pdf",
          category: "Architecture",
          sizeBytes: 2453504,
          uploadedAt: "2026-01-12",
          uploadedBy: "John Doe",
        },
        {
          id: "doc-5",
          name: "API Gateway Deployment Diagram.png",
          category: "Deployment Diagram",
          sizeBytes: 1236992,
          uploadedAt: "2026-01-14",
          uploadedBy: "Sarah Chen",
        },
      ],
    },
    {
      id: "dep-dev-1",
      name: "Development",
      status: "Warning",
      url: "https://dev-api.example.com",
      version: "v2.7.0-dev",
      description: "Development and integration environment",
      deployedAt: "2026-01-19",
      uptimePercent: 98.5,
      products: [],
      documents: [],
    },
  ],
};

/**
 * Fetches project deployment details. Returns mock data until backend API is available.
 *
 * @param {string} projectId - The project ID.
 * @returns {UseQueryResult<DeploymentsResponse, Error>} The query result.
 */
export function useGetProjectDeploymentDetails(
  projectId: string,
): UseQueryResult<DeploymentsResponse, Error> {
  const logger = useLogger();
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();

  return useQuery<DeploymentsResponse, Error>({
    queryKey: [ApiQueryKeys.PROJECT_DEPLOYMENT_DETAILS, projectId],
    queryFn: async (): Promise<DeploymentsResponse> => {
      logger.debug(
        `Fetching project deployment details for project ID: ${projectId}`,
      );

      await new Promise((r) => setTimeout(r, 0));

      logger.debug("[useGetProjectDeploymentDetails] Returning mock data");
      return MOCK_DEPLOYMENTS;
    },
    enabled: !!projectId && isSignedIn && !isAuthLoading,
    staleTime: 5 * 60 * 1000,
  });
}
