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

import { useGetDeployments } from "@api/useGetDeployments";
import EmptyState from "@components/common/empty-state/EmptyState";
import ErrorStateIcon from "@components/common/error-state/ErrorStateIcon";
import ErrorBanner from "@components/common/error-banner/ErrorBanner";
import SuccessBanner from "@components/common/success-banner/SuccessBanner";
import AddDeploymentModal from "@components/project-details/deployments/AddDeploymentModal";
import DeploymentCard from "@components/project-details/deployments/DeploymentCard";
import DeploymentCardSkeleton from "@components/project-details/deployments/DeploymentCardSkeleton";
import DeploymentHeader from "@components/project-details/deployments/DeploymentHeader";
import { Box, Grid, Typography } from "@wso2/oxygen-ui";
import { useCallback, useState, type JSX } from "react";

export interface ProjectDeploymentsProps {
  projectId: string;
}

/**
 * Displays deployment environments for a project.
 *
 * @param {ProjectDeploymentsProps} props - Props including projectId.
 * @returns {JSX.Element} The project deployments section.
 */
export default function ProjectDeployments({
  projectId,
}: ProjectDeploymentsProps): JSX.Element {
  const { data, isLoading, isPending, isError } = useGetDeployments(projectId);
  const showLoading = isLoading || isPending;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deployments = data?.deployments ?? [];

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSuccess = useCallback(
    () => setSuccessMessage("Deployment created successfully."),
    [],
  );
  const handleError = useCallback(
    (message: string) => setErrorMessage(message),
    [],
  );

  if (!projectId) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">Invalid Project ID.</Typography>
      </Box>
    );
  }

  const banners = (
    <>
      {successMessage && (
        <SuccessBanner
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <ErrorBanner
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </>
  );

  const renderContent = () => {
    if (showLoading) {
      return (
        <>
          <DeploymentHeader
            count={0}
            onAddClick={handleOpenModal}
            isLoading
          />
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid key={i} size={12}>
                <DeploymentCardSkeleton />
              </Grid>
            ))}
          </Grid>
        </>
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
        <>
          <DeploymentHeader count={0} onAddClick={handleOpenModal} />
          <EmptyState description="It seems there are no deployments associated with this project." />
        </>
      );
    }

    return (
      <>
        <DeploymentHeader
          count={deployments.length}
          onAddClick={handleOpenModal}
        />
        <Grid container spacing={3}>
          {deployments.map((deployment) => (
            <Grid key={deployment.id} size={12}>
              <DeploymentCard deployment={deployment} />
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  return (
    <Box>
      {banners}
      {renderContent()}
      <AddDeploymentModal
        open={isModalOpen}
        projectId={projectId}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </Box>
  );
}
