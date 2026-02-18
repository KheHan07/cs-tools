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

import { Card, Box, Typography, Chip, useTheme, alpha } from "@wso2/oxygen-ui";
import { User, Shield, Calendar } from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";
import type { TimeTrackingLog } from "@models/responses";
import { getTimeTrackingBadgePaletteKey } from "@utils/projectDetails";
import { TIME_TRACKING_BADGE_TYPES } from "@constants/projectDetailsConstants";

interface TimeTrackingCardProps {
  log: TimeTrackingLog;
}

export default function TimeTrackingCard({
  log,
}: TimeTrackingCardProps): JSX.Element {
  const { badges, description, user, role, date, hours } = log;
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: "12px",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              mb: "8px",
            }}
          >
            {badges.map((badge, index) => {
              const paletteKey = getTimeTrackingBadgePaletteKey(badge.type);
              const mainColor = theme.palette[paletteKey].main;

              return (
                <Chip
                  key={`${badge.type}-${badge.text}-${index}`}
                  label={badge.text}
                  size="small"
                  sx={{
                    height: "auto",
                    py: "2px",
                    px: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    bgcolor: alpha(mainColor, 0.1),
                    color: mainColor,
                    border: 0,
                    "& .MuiChip-label": {
                      px: "4px",
                    },
                    ...(badge.type === TIME_TRACKING_BADGE_TYPES.CASE && {
                      cursor: "pointer",
                      "&:hover": { bgcolor: alpha(mainColor, 0.2) },
                    }),
                  }}
                />
              );
            })}
          </Box>
          <Typography
            variant="body2"
            sx={{
              mb: "8px",
              color: "text.primary",
              fontSize: "0.875rem",
            }}
          >
            {description || "--"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              color: "text.secondary",
              fontSize: "0.75rem",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <User size={12} />
              <Typography variant="caption">{user || "--"}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Shield size={12} />
              <Typography variant="caption">{role || "--"}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={12} />
              <Typography variant="caption">{date || "--"}</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 400,
              fontSize: "1.5rem",
              color: "text.primary",
            }}
          >
            {hours !== undefined && hours !== null ? `${hours}h` : "--"}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
