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
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@wso2/oxygen-ui";
import { ArrowLeft, Calendar, FileText } from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";
import type { CaseDetails } from "@models/responses";
import {
  formatUtcToLocalNoTimezone,
  getSeverityIcon,
  stripHtml,
} from "@utils/support";
import {
  getSeverityFriendlyLabel,
  getSeverityLegendColor,
} from "@constants/dashboardConstants";
import ErrorIndicator from "@components/common/error-indicator/ErrorIndicator";

export interface AnnouncementDetailsPanelProps {
  data: CaseDetails | undefined;
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
}

/**
 * AnnouncementDetailsPanel displays announcement details in a card layout
 * (title, severity, date, issue type, Affected Products, Related Security Advisories).
 *
 * @param {AnnouncementDetailsPanelProps} props - Data, loading/error state, onBack.
 * @returns {JSX.Element} The rendered announcement details panel.
 */
export default function AnnouncementDetailsPanel({
  data,
  isLoading,
  isError,
  onBack,
}: AnnouncementDetailsPanelProps): JSX.Element {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          sx={{ mb: 0, alignSelf: "flex-start" }}
          variant="text"
        >
          Back
        </Button>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
            <Skeleton variant="rounded" width={64} height={64} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="40%" height={24} sx={{ mb: 1 }} />
              <Skeleton width="90%" height={32} sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2}>
                <Skeleton width={120} height={20} />
                <Skeleton width={80} height={20} />
              </Stack>
            </Box>
          </Stack>
          <Skeleton width="30%" height={20} sx={{ mb: 1 }} />
          <Skeleton width="60%" height={24} sx={{ mb: 2 }} />
          <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
          <Skeleton width={48} height={48} />
        </Paper>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Skeleton width="25%" height={24} sx={{ mb: 2 }} />
          <Skeleton width="100%" height={80} variant="rounded" />
        </Paper>
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          sx={{ mb: 0, alignSelf: "flex-start" }}
          variant="text"
        >
          Back
        </Button>
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <ErrorIndicator entityName="announcement details" size="medium" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Could not load announcement details.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const theme = useTheme();
  const SeverityIcon = getSeverityIcon(data.severity?.label);
  const severityColor = getSeverityLegendColor(data.severity?.label);
  const iconBgColor = alpha(severityColor, 0.1);
  const chipBgColor = alpha(severityColor, 0.1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={onBack}
        sx={{ mb: 0, alignSelf: "flex-start" }}
        variant="text"
      >
        Back
      </Button>

      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Stack direction="row" spacing={3} alignItems="flex-start">
          <Box
            sx={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              bgcolor: iconBgColor,
              color: severityColor,
            }}
          >
            <SeverityIcon size={32} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 2, flexWrap: "wrap" }}
              alignItems="center"
            >
              <Chip
                size="small"
                variant="outlined"
                label={getSeverityFriendlyLabel(data.severity?.label)}
                icon={<SeverityIcon size={12} />}
                sx={{
                  bgcolor: chipBgColor,
                  color: severityColor,
                  height: 20,
                  fontSize: "0.75rem",
                  px: 0,
                  "& .MuiChip-icon": {
                    color: "inherit",
                    ml: "6px",
                    mr: "6px",
                  },
                  "& .MuiChip-label": {
                    pl: 0,
                    pr: "6px",
                  },
                }}
              />
              {data.number && (
                <Typography variant="caption" color="text.secondary">
                  {data.number}
                </Typography>
              )}
            </Stack>

            <Typography
              variant="h6"
              color="text.primary"
              sx={{ mb: 2, fontWeight: 500 }}
            >
              {data.title || "--"}
            </Typography>

            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              sx={{ flexWrap: "wrap", gap: 2 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Calendar
                  size={16}
                  color={theme.palette.text.secondary}
                  aria-hidden
                />
                <Typography variant="body2" color="text.secondary">
                  {formatUtcToLocalNoTimezone(data.createdOn) || "--"}
                </Typography>
              </Stack>
              {data.issueType?.label && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <FileText
                    size={16}
                    color={theme.palette.text.secondary}
                    aria-hidden
                  />
                  <Typography variant="body2" color="text.secondary">
                    {data.issueType.label}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>

        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 500 }}
          >
            Affected Products:
          </Typography>
          {data.deployedProduct?.label ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                variant="outlined"
                label={
                  data.deployedProduct.version
                    ? `${data.deployedProduct.label} ${data.deployedProduct.version}`
                    : data.deployedProduct.label
                }
                sx={{ height: 24, fontSize: "0.8rem" }}
              />
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nothing
            </Typography>
          )}
        </Box>

        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 500 }}
          >
            Related Security Advisories:
          </Typography>
          <ErrorIndicator entityName="related security advisories" />
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="text.primary">
          Description
        </Typography>
        <Typography variant="body2" color="text.primary">
          {data.description ? stripHtml(data.description) : "Nothing"}
        </Typography>
      </Paper>
    </Box>
  );
}
