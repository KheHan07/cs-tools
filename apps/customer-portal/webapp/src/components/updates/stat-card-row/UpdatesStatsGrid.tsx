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

import { Badge, Box, Grid, Skeleton, Typography } from "@wso2/oxygen-ui";
import { type JSX } from "react";
import { UPDATES_STATS } from "@constants/updatesConstants";
import type {
  RecommendedUpdateLevelItem,
  UpdatesStats,
} from "@models/responses";
import {
  aggregateUpdateStats,
  getStatTooltipText,
  getStatValue,
} from "@utils/updates";
import { StatCard } from "@components/updates/stat-card-row/StatCard";

export interface UpdatesStatsGridProps {
  data: RecommendedUpdateLevelItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Grid of stat cards for Overall Update Status.
 *
 * @param {UpdatesStatsGridProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function UpdatesStatsGrid({
  data,
  isLoading,
  isError,
}: UpdatesStatsGridProps): JSX.Element {
  const aggregatedData = aggregateUpdateStats(data);
  const isEffectiveLoading = isLoading || (!data && !isError);

  const renderCountWithSkeleton = (
    count: number | undefined,
    width: number = 24,
  ): JSX.Element | number => {
    if (isEffectiveLoading || count === undefined) {
      return (
        <Skeleton
          variant="text"
          width={width}
          height={16}
          sx={{ display: "inline-block", verticalAlign: "middle", mx: 0.5 }}
        />
      );
    }
    return count;
  };

  const renderExtraContent = (
    stat: (typeof UPDATES_STATS)[number],
  ): JSX.Element | undefined => {
    if (isError) {
      return undefined;
    }

    if (
      stat.id === "totalUpdatesInstalled" &&
      (isEffectiveLoading || aggregatedData?.totalUpdatesInstalledBreakdown)
    ) {
      const { regular, security } =
        aggregatedData?.totalUpdatesInstalledBreakdown || {};
      return (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            {renderCountWithSkeleton(regular)} Regular •{" "}
            {renderCountWithSkeleton(security)} Security
          </Typography>
        </Box>
      );
    }

    if (
      stat.id === "totalUpdatesPending" &&
      (isEffectiveLoading || aggregatedData?.totalUpdatesPendingBreakdown)
    ) {
      const { regular, security } =
        aggregatedData?.totalUpdatesPendingBreakdown || {};
      return (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            {renderCountWithSkeleton(regular)} Regular •{" "}
            {renderCountWithSkeleton(security)} Security
          </Typography>
        </Box>
      );
    }

    if (stat.id === "securityUpdatesPending") {
      const securityPending = aggregatedData?.securityUpdatesPending;

      if (isEffectiveLoading) {
        return (
          <Skeleton
            variant="rectangular"
            width={90}
            height={20}
            sx={{ borderRadius: 1, mt: 0.5 }}
          />
        );
      }

      if (securityPending && securityPending > 0) {
        return (
          <Badge
            color="error"
            badgeContent="Action Required"
            sx={{
              "& .MuiBadge-badge": {
                position: "static",
                transform: "none",
                fontSize: "0.65rem",
                height: "20px",
                padding: "0 6px",
                fontWeight: 500,
              },
            }}
          />
        );
      }
    }

    return undefined;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Overall Update Status
      </Typography>
      <Grid container spacing={2}>
        {UPDATES_STATS.map((stat) => {
          const Icon = stat.icon;
          const value = getStatValue(
            aggregatedData,
            stat.id as keyof UpdatesStats,
          );

          return (
            <Grid key={stat.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label={stat.label}
                value={value}
                icon={<Icon size={20} />}
                iconColor={stat.iconColor}
                tooltipText={getStatTooltipText(stat, aggregatedData)}
                isLoading={isEffectiveLoading}
                isError={isError}
                extraContent={renderExtraContent(stat)}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
