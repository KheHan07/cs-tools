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
  Avatar,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@wso2/oxygen-ui";
import {
  CircleCheck,
  CirclePause,
  CircleX,
  CirclePlay,
  TriangleAlert,
} from "@wso2/oxygen-ui-icons-react";
import { type JSX } from "react";
import ErrorIndicator from "@components/common/error-indicator/ErrorIndicator";
import { formatValue } from "@utils/support";

export interface CaseDetailsEngineerRowProps {
  assignedEngineer: string | null | undefined;
  engineerInitials: string;
  isError: boolean;
}

/**
 * Support engineer row: avatar, name, "Support Engineer" label, and "Manage case status" action.
 *
 * @param {CaseDetailsEngineerRowProps} props - Engineer display data and error state.
 * @returns {JSX.Element} The engineer row wrapped in Paper.
 */
export default function CaseDetailsEngineerRow({
  assignedEngineer,
  engineerInitials,
  isError,
}: CaseDetailsEngineerRowProps): JSX.Element {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        mb: 1,
        py: 0.5,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1,
        bgcolor: "background.default",
        minHeight: 0,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          sx={{
            width: 18,
            height: 18,
            bgcolor: "primary.light",
            color: "primary.contrastText",
            fontSize: "0.6rem",
          }}
        >
          {engineerInitials}
        </Avatar>
        <Box>
          {isError ? (
            <ErrorIndicator entityName="case details" size="small" />
          ) : (
            <Typography
              variant="caption"
              color="text.primary"
              sx={{ lineHeight: 1.2 }}
            >
              {formatValue(assignedEngineer)}
            </Typography>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.7rem", lineHeight: 1.2, display: "block" }}
          >
            Support Engineer
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CirclePlay size={12} color={theme.palette.primary.main} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.7rem" }}
          >
            Manage case status
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Button
          variant="outlined"
          size="small"
          startIcon={<TriangleAlert size={16} />}
          sx={{
            borderColor: theme.palette.error.light,
            bgcolor: alpha(theme.palette.error.light, 0.1),
            color: theme.palette.error.light,
            "&:hover": {
              borderColor: theme.palette.error.main,
              bgcolor: alpha(theme.palette.error.light, 0.2),
            },
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Escalate Case
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CirclePause size={16} />}
          sx={{
            borderColor: theme.palette.warning.light,
            bgcolor: alpha(theme.palette.warning.light, 0.1),
            color: theme.palette.warning.light,
            "&:hover": {
              borderColor: theme.palette.warning.main,
              bgcolor: alpha(theme.palette.warning.light, 0.2),
            },
            textTransform: "none",
          }}
        >
          Waiting on WSO2
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CircleCheck size={16} />}
          sx={{
            borderColor: theme.palette.success.light,
            bgcolor: alpha(theme.palette.success.light, 0.1),
            color: theme.palette.success.light,
            "&:hover": {
              borderColor: theme.palette.success.main,
              bgcolor: alpha(theme.palette.success.light, 0.2),
            },
            textTransform: "none",
          }}
        >
          Mark as Resolved
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CircleX size={16} />}
          sx={{
            borderColor: theme.palette.info.light,
            bgcolor: alpha(theme.palette.info.light, 0.1),
            color: theme.palette.info.light,
            "&:hover": {
              borderColor: theme.palette.info.main,
              bgcolor: alpha(theme.palette.info.light, 0.2),
            },
            textTransform: "none",
          }}
        >
          Close Case
        </Button>
      </Stack>
    </Paper>
  );
}
