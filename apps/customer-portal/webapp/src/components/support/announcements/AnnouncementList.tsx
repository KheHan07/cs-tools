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
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@wso2/oxygen-ui";
import {
  Calendar,
  ChevronRight,
  Eye,
  Archive,
  FileText,
} from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";
import type { CaseListItem } from "@models/responses";
import {
  formatUtcToLocalNoTimezone,
  getSeverityIcon,
  stripHtml,
} from "@utils/support";
import {
  getSeverityFriendlyLabel,
  getSeverityLegendColor,
} from "@constants/dashboardConstants";
import AllCasesListSkeleton from "@components/support/all-cases/AllCasesListSkeleton";

export interface AnnouncementListProps {
  cases: CaseListItem[];
  isLoading: boolean;
  onCaseClick?: (caseItem: CaseListItem) => void;
}

/**
 * Component to display announcements as cards with severity icons, colors, and action buttons.
 *
 * @param {AnnouncementListProps} props - Announcements array, loading state, and handlers.
 * @returns {JSX.Element} The rendered announcement cards list.
 */
export default function AnnouncementList({
  cases,
  isLoading,
  onCaseClick,
}: AnnouncementListProps): JSX.Element {
  const theme = useTheme();

  if (isLoading) {
    return <AllCasesListSkeleton />;
  }

  if (cases.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          No announcements found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {cases.map((caseItem) => {
        const SeverityIcon = getSeverityIcon(caseItem.severity?.label);
        const severityColor = getSeverityLegendColor(caseItem.severity?.label);
        const iconBgColor = alpha(severityColor, 0.1);

        const paperBg = alpha(severityColor, 0.05);

        return (
          <Paper
            key={caseItem.id}
            role="button"
            tabIndex={0}
            aria-label={caseItem.title ? `View announcement: ${caseItem.title}` : "View announcement"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCaseClick?.(caseItem);
              }
            }}
            elevation={0}
            sx={{
              bgcolor: paperBg,
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: 2,
              },
              cursor: "pointer",
            }}
            onClick={() => onCaseClick?.(caseItem)}
          >
            <Box sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    bgcolor: iconBgColor,
                    color: severityColor,
                  }}
                >
                  <SeverityIcon size={24} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 1, flexWrap: "wrap" }}
                    alignItems="center"
                  >
                    <Chip
                      size="small"
                      variant="outlined"
                      label={getSeverityFriendlyLabel(caseItem.severity?.label)}
                      icon={<SeverityIcon size={12} />}
                      sx={{
                        bgcolor: iconBgColor,
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
                    <Typography variant="caption" color="text.secondary">
                      {caseItem.number || "--"}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="h6"
                    color="text.primary"
                    sx={{ mb: 1, fontWeight: 500, cursor: "pointer" }}
                  >
                    {caseItem.title || "--"}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {stripHtml(caseItem.description) || "--"}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Calendar
                        size={16}
                        color={theme.palette.text.secondary}
                        aria-hidden
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatUtcToLocalNoTimezone(caseItem.createdOn) || "--"}
                      </Typography>
                    </Stack>
                    {caseItem.issueType?.label && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <FileText
                          size={16}
                          color={theme.palette.text.secondary}
                          aria-hidden
                        />
                        <Typography variant="caption" color="text.secondary">
                          {caseItem.issueType.label}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  <Box
                    sx={{
                      pt: 2,
                      borderTop: 1,
                      borderColor: "divider",
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      endIcon={<ChevronRight size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCaseClick?.(caseItem);
                      }}
                      sx={{ textTransform: "none" }}
                    >
                      View Details
                    </Button>
                    {/* TODO: Wire onMarkRead and onArchive handlers when implemented */}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Eye size={16} />}
                      disabled
                      onClick={(e) => e.stopPropagation()}
                      sx={{ textTransform: "none" }}
                    >
                      Mark Read
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Archive size={16} />}
                      disabled
                      onClick={(e) => e.stopPropagation()}
                      sx={{ textTransform: "none" }}
                    >
                      Archive
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
