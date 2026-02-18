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

import type { Deployment } from "@models/responses";
import {
  formatProjectDate,
  getDeploymentStatusColor,
} from "@utils/projectDetails";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Card,
  Chip,
  Divider,
  Link,
  Typography,
  useTheme,
} from "@wso2/oxygen-ui";
import {
  Activity,
  Calendar,
  ChevronDown,
  CircleAlert,
  CircleCheck,
} from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";
import DeploymentDocumentList from "./DeploymentDocumentList";
import DeploymentProductList from "./DeploymentProductList";

export interface DeploymentCardProps {
  deployment: Deployment;
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
  const {
    name,
    status,
    url,
    version,
    description,
    products,
    documents,
    deployedAt,
    uptimePercent,
  } = deployment;

  const statusColor = getDeploymentStatusColor(status);
  const StatusIcon = status === "Healthy" ? CircleCheck : CircleAlert;
  const uptimeStr = `${uptimePercent.toFixed(2)}%`;
  const theme = useTheme();

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
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {name}
                </Typography>
                <Chip
                  label={status}
                  color={statusColor}
                  icon={<StatusIcon size={14} />}
                  size="small"
                  sx={{
                    height: 24,
                    fontWeight: 600,
                    "& .MuiChip-icon": { ml: 1 },
                    ...(statusColor !== "default" && {
                      color: theme.palette[statusColor].light,
                      bgcolor: alpha(theme.palette[statusColor].light, 0.1),
                    }),
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  Deployed on {formatProjectDate(deployedAt)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Link
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
                  {url}
                </Link>
              </Box>
            </Box>
            <Chip
              label={version}
              size="small"
              variant="outlined"
              sx={{ height: 24, fontSize: "0.75rem", fontWeight: 500 }}
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails
          sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Divider />
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          <Divider />

          <DeploymentProductList products={products} />

          <Divider />

          <DeploymentDocumentList documents={documents} />

          <Divider />
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
              }}
            >
              <Calendar size={14} />
              <Typography variant="caption">
                {formatProjectDate(deployedAt)} • {version}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
              }}
            >
              <Activity size={14} />
              <Typography variant="caption">Uptime: {uptimeStr}</Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}
