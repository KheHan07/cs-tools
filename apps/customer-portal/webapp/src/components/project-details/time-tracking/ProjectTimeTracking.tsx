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

import { Box, Grid } from "@wso2/oxygen-ui";
import { type JSX } from "react";
import useGetTimeTrackingDetails from "@api/useGetTimeTrackingDetails";
import useGetProjectTimeTrackingStat from "@api/useGetProjectTimeTrackingStat";
import TimeTrackingStatCards from "@time-tracking/TimeTrackingStatCards";
import TimeTrackingCard from "@time-tracking/TimeTrackingCard";
import TimeTrackingCardSkeleton from "@time-tracking/TimeTrackingCardSkeleton";
import TimeTrackingErrorState from "@time-tracking/TimeTrackingErrorState";
import EmptyState from "@components/common/empty-state/EmptyState";

interface ProjectTimeTrackingProps {
  projectId: string;
}

/**
 * ProjectTimeTracking component manages the display of time tracking statistics and logs.
 * It handles loading skeletons and error reporting via a dedicated error state.
 *
 * @param {ProjectTimeTrackingProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export default function ProjectTimeTracking({
  projectId,
}: ProjectTimeTrackingProps): JSX.Element {
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useGetProjectTimeTrackingStat(projectId);

  const {
    data: details,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useGetTimeTrackingDetails(projectId);

  const timeLogs = details?.timeLogs || [];

  return (
    <Box>
      <TimeTrackingStatCards
        stats={stats}
        isLoading={isStatsLoading}
        isError={isStatsError}
      />

      {isDetailsError ? (
        <TimeTrackingErrorState />
      ) : (
        <Grid container spacing={3}>
          {isDetailsLoading ? (
            Array.from({ length: 7 }).map((_, index) => (
              <Grid key={`skeleton-${index}`} size={12}>
                <TimeTrackingCardSkeleton />
              </Grid>
            ))
          ) : timeLogs.length === 0 ? (
            <Grid size={12}>
              <EmptyState description="No time logs available." />
            </Grid>
          ) : (
            timeLogs.map((log) => (
              <Grid key={log.id} size={12}>
                <TimeTrackingCard log={log} />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
}
