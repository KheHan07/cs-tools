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
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@wso2/oxygen-ui";
import type { JSX } from "react";
import type { RecommendedUpdateLevelItem } from "@models/responses";
import type { PendingUpdateLevelRow } from "@utils/updates";

export interface PendingUpdatesListProps {
  pendingRows: PendingUpdateLevelRow[];
  recommendedItem: RecommendedUpdateLevelItem | undefined;
}

/**
 * Component to display pending update levels in a table.
 *
 * @param {PendingUpdatesListProps} props - Pending rows and recommended item for summary.
 * @returns {JSX.Element} The rendered pending updates table.
 */
export function PendingUpdatesList({
  pendingRows,
  recommendedItem,
}: PendingUpdatesListProps): JSX.Element {
  const securityCount = pendingRows.filter((r) => r.updateType === "security").length;
  const regularCount = pendingRows.filter((r) => r.updateType === "regular").length;

  if (pendingRows.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No pending updates found for this product and version.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {recommendedItem && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          There are <strong>{pendingRows.length}</strong> updates with{" "}
          <strong>{securityCount}</strong> security updates and{" "}
          <strong>{regularCount}</strong> regular updates.
        </Typography>
      )}

      <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem" }}>
                  Update Level
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem" }}>
                  Update Type
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem" }}>
                  Details
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingRows.map((row) => (
                <TableRow key={row.updateLevel} hover>
                  <TableCell>{row.updateLevel}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.updateType === "security" ? "Security" : "Regular"}
                      sx={{
                        bgcolor:
                          row.updateType === "security"
                            ? "error.main"
                            : "success.main",
                        color: "white",
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      component="button"
                      sx={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "warning.main",
                        fontWeight: 500,
                        p: 0,
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      View
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </TableContainer>
    </Box>
  );
}
