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
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@wso2/oxygen-ui";
import { Clock, Phone } from "@wso2/oxygen-ui-icons-react";
import { type JSX } from "react";
import type { CallRequest } from "@models/responses";
import {
  formatUtcToLocal,
  getCallRequestStatusColor,
  resolveColorFromTheme,
} from "@utils/support";
import { CallRequestStatus } from "@constants/supportConstants";

export interface CallRequestCardProps {
  call: CallRequest;
  onEditClick?: (call: CallRequest) => void;
  onDeleteClick?: (call: CallRequest) => void;
}

/** Renders preferred times (UTC) converted to local. */
function formatPreferredTimes(times: string[] | undefined): string {
  if (!times?.length) return "--";
  const formatted = times
    .map((t) => formatUtcToLocal(t, "short"))
    .filter((s) => s !== "--");
  return formatted.length > 0 ? formatted.join(", ") : "--";
}

/**
 * Individual card for a call request.
 *
 * @param {CallRequestCardProps} props - The call request data.
 * @returns {JSX.Element} The rendered call request card.
 */
export default function CallRequestCard({
  call,
  onEditClick,
  onDeleteClick,
}: CallRequestCardProps): JSX.Element {
  const theme = useTheme();
  const statusLabel = call.state?.label ?? "--";
  const isTerminal =
    statusLabel === CallRequestStatus.CANCELLED ||
    statusLabel === CallRequestStatus.COMPLETED;
  const colorPath = getCallRequestStatusColor(statusLabel);
  const resolvedColor =
    statusLabel === CallRequestStatus.CANCELLED
      ? theme.palette.error.main
      : resolveColorFromTheme(colorPath, theme);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="flex-start"
            sx={{ flex: 1 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                p: 1,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: "info.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Phone size={20} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Typography variant="body2" fontWeight="medium">
                  Call Request
                </Typography>
                <Chip
                  label={statusLabel}
                  size="small"
                  variant="outlined"
                  icon={<Clock size={10} />}
                  sx={{
                    height: 20,
                    fontSize: "0.625rem",
                    bgcolor: alpha(resolvedColor, 0.1),
                    color: resolvedColor,
                    px: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& .MuiChip-icon": {
                      color: "inherit",
                      ml: "6px",
                      mr: "6px",
                      mt: 0,
                      mb: 0,
                      alignSelf: "center",
                    },
                    "& .MuiChip-label": {
                      pl: 0,
                      pr: "6px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Requested on {formatUtcToLocal(call.createdOn, "short")}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              color="warning"
              onClick={() => onEditClick?.(call)}
              disabled={isTerminal}
              sx={{
                minWidth: "auto",
                px: 1,
                py: 0.3,
                fontSize: "0.7rem",
                height: 24,
              }}
            >
              Reschedule
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={() => onDeleteClick?.(call)}
              disabled={isTerminal}
              sx={{
                minWidth: "auto",
                px: 1,
                py: 0.3,
                fontSize: "0.7rem",
                height: 24,
              }}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Preferred Times
            </Typography>
            <Typography variant="body2">
              {formatPreferredTimes(call.preferredTimes)}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Scheduled For
            </Typography>
            <Typography variant="body2">
              {formatUtcToLocal(call.scheduleTime)}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Duration
            </Typography>
            <Typography variant="body2">
              {call.durationMin != null ? `${call.durationMin} minutes` : "--"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, borderColor: "divider" }} />

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mb: 0.5 }}
          >
            Reason / Notes
          </Typography>
          <Typography variant="body2">{call.reason || "--"}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
