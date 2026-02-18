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
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Divider,
  Skeleton,
} from "@wso2/oxygen-ui";
import type { JSX } from "react";

/**
 * Skeleton loader for the DeploymentCard component.
 * Mimics the structure of a deployment card with an accordion.
 *
 * @returns {JSX.Element} The DeploymentCardSkeleton component.
 */
export default function DeploymentCardSkeleton(): JSX.Element {
  return (
    <Card sx={{ mb: 2 }}>
      <Accordion defaultExpanded={false}>
        <AccordionSummary sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              width: "100%",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 0.5,
                }}
              >
                <Skeleton variant="text" width={150} height={32} />
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
              <Skeleton variant="text" width={200} height={20} />
            </Box>
            <Skeleton variant="rounded" width={60} height={24} />
          </Box>
        </AccordionSummary>
        <AccordionDetails
          sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Divider />
          <Skeleton variant="text" width="80%" height={20} />
          <Skeleton variant="text" width="60%" height={20} />
          <Divider />
          <Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width={120} height={24} />
              </Box>
              <Skeleton variant="rounded" width={100} height={32} />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[1, 2].map((i) => (
                <Skeleton key={i} variant="rounded" width="100%" height={120} />
              ))}
            </Box>
          </Box>
          <Divider />
          <Box sx={{ display: "flex", gap: 3 }}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={100} height={20} />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}
