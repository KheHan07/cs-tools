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

import type { ProjectDeploymentItem } from "@models/responses";
import { displayValue, formatProjectDate } from "@utils/projectDetails";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Divider,
  Link,
  Typography,
} from "@wso2/oxygen-ui";
import { Activity, Calendar, ChevronDown } from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";
import ErrorIndicator from "@components/common/error-indicator/ErrorIndicator";
import DeploymentDocumentList from "./DeploymentDocumentList";
import DeploymentProductList from "./DeploymentProductList";

export interface DeploymentCardProps {
  deployment: ProjectDeploymentItem;
}

/**
 * Renders a single deployment environment card with products and documents.
 *
 * @param {DeploymentCardProps} props - Props containing the deployment data.
 * @returns {JSX.Element} The deployment card.
 */
export default function DeploymentCard({
  deployment,
}: DeploymentCardProps): JSX.Element {
  const { name, url, description, createdOn } = deployment;

  const deployedAtStr = formatProjectDate(createdOn);

  return (
    <Card>
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 0.5,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {displayValue(name)}
                </Typography>
                <ErrorIndicator
                  entityName="status and version"
                  size="small"
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {url ? (
                  <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{ color: "text.secondary" }}
                  >
                    {url}
                  </Link>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {displayValue(url)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails
          sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Divider />
          <Typography variant="body2" color="text.secondary">
            {displayValue(description)}
          </Typography>
          <Divider />

          <DeploymentProductList deploymentId={deployment.id} />

          <Divider />

          <DeploymentDocumentList hasError />

          <Divider />
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
                flexShrink: 0,
                fontSize: "0.75rem",
              }}
            >
              <Calendar
                size={14}
                style={{ verticalAlign: "middle", display: "inline-block" }}
              />
              <span style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}>
                Deployed on {deployedAtStr} •{" "}
                <ErrorIndicator entityName="version" size="small" />
              </span>
            </Box>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
                fontSize: "0.75rem",
              }}
            >
              <Activity
                size={14}
                style={{ verticalAlign: "middle", display: "inline-block" }}
              />
              <span style={{ verticalAlign: "middle" }}>Uptime: </span>
              <ErrorIndicator entityName="uptime" size="small" />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}
