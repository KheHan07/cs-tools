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

import { useGetProjectDeploymentDetails } from "@api/useGetProjectDeploymentDetails";
import EmptyState from "@components/common/empty-state/EmptyState";
import ErrorStateIcon from "@components/common/error-state/ErrorStateIcon";
import DeploymentCard from "@components/project-details/deployments/DeploymentCard";
import DeploymentCardSkeleton from "@components/project-details/deployments/DeploymentCardSkeleton";
import DeploymentHeader from "@components/project-details/deployments/DeploymentHeader";
import { Box, Grid, Typography } from "@wso2/oxygen-ui";
import type { JSX } from "react";

export interface ProjectDeploymentsProps {
  projectId: string;
}

/**
 * Displays deployment environments for a project using mock data.
 *
 * @param {ProjectDeploymentsProps} props - Props including projectId.
 * @returns {JSX.Element} The project deployments section.
 */
export default function ProjectDeployments({
  projectId,
}: ProjectDeploymentsProps): JSX.Element {
  const { data, isLoading, isError } =
    useGetProjectDeploymentDetails(projectId);

  const deployments = data?.deployments ?? [];

  if (!projectId) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">Invalid Project ID.</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box>
        <DeploymentHeader count={0} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={12}>
              <DeploymentCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          p: 5,
        }}
      >
        <ErrorStateIcon style={{ width: 200, height: "auto" }} />
      </Box>
    );
  }

  if (deployments.length === 0) {
    return (
      <Box>
        <DeploymentHeader count={0} />
        <EmptyState description="It seems there are no deployments associated with this project." />
      </Box>
    );
  }

  return (
    <Box>
      <DeploymentHeader count={deployments.length} />
      <Grid container spacing={3}>
        {deployments.map((deployment) => (
          <Grid key={deployment.id} size={12}>
            <DeploymentCard deployment={deployment} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
