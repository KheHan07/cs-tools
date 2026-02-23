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
  Card,
  Box,
  Typography,
  TextField,
  InputAdornment,
} from "@wso2/oxygen-ui";
import { Calendar } from "@wso2/oxygen-ui-icons-react";
import { type JSX } from "react";

export interface TimeCardsDateFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  shownCount: number;
  totalCount: number;
  isLoading?: boolean;
}

/**
 * TimeCardsDateFilter provides date range filters for time cards and shows count summary.
 *
 * @param {TimeCardsDateFilterProps} props - Date values, handlers, and counts.
 * @returns {JSX.Element} The rendered filter card.
 */
export default function TimeCardsDateFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  shownCount,
  totalCount,
  isLoading = false,
}: TimeCardsDateFilterProps): JSX.Element {
  return (
    <Card
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Calendar size={16} style={{ color: "var(--oxygen-palette-text-secondary)" }} />
          <Typography
            variant="body2"
            component="label"
            sx={{ fontWeight: 500, color: "text.secondary" }}
          >
            Filter by Date Range:
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              component="label"
              sx={{ fontWeight: 500, color: "text.secondary", whiteSpace: "nowrap" }}
            >
              From:
            </Typography>
            <TextField
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Calendar size={16} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              component="label"
              sx={{ fontWeight: 500, color: "text.secondary", whiteSpace: "nowrap" }}
            >
              To:
            </Typography>
            <TextField
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Calendar size={16} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", ml: "auto" }}
          >
            {isLoading
              ? "Loading..."
              : `Showing ${shownCount} of ${totalCount} time logs`}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
