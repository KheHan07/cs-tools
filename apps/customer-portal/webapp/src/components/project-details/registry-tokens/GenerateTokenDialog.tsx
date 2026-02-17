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

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import type { SelectChangeEvent } from "@wso2/oxygen-ui";
import type { JSX } from "react";
import { TOKEN_TYPES, USER_ROLES } from "@constants/projectDetailsConstants";
import useGetServiceUsers from "@api/useGetServiceUsers";

interface GenerateTokenDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (data: {
    tokenName: string;
    tokenType: string;
    serviceUser?: string;
  }) => void;
  userRole: string;
  projectId: string;
}

/**
 * GenerateTokenDialog component provides a dialog for generating new tokens.
 * Admin users can choose between User and Service token types.
 *
 * @param {GenerateTokenDialogProps} props - The props for the component.
 * @returns {JSX.Element} The GenerateTokenDialog component.
 */
export default function GenerateTokenDialog({
  open,
  onClose,
  onGenerate,
  userRole,
  projectId,
}: GenerateTokenDialogProps): JSX.Element {
  const [tokenName, setTokenName] = useState<string>("");
  const [tokenType, setTokenType] = useState<string>(TOKEN_TYPES.USER);
  const [serviceUser, setServiceUser] = useState<string>("");
  const [tokenNameError, setTokenNameError] = useState<string>("");

  const isAdmin = userRole === USER_ROLES.ADMIN;
  const isServiceToken = tokenType === TOKEN_TYPES.SERVICE;

  const { data: serviceUsers = [] } = useGetServiceUsers(projectId);

  const resetForm = (): void => {
    setTokenName("");
    setTokenType(TOKEN_TYPES.USER);
    setServiceUser("");
    setTokenNameError("");
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const handleGenerate = (): void => {
    if (!tokenName.trim()) {
      setTokenNameError("Token name is required.");
      return;
    }

    if (isAdmin && isServiceToken && !serviceUser) {
      return;
    }

    onGenerate({
      tokenName: tokenName.trim(),
      tokenType: isAdmin ? tokenType : TOKEN_TYPES.USER,
      serviceUser: isServiceToken ? serviceUser : undefined,
    });

    resetForm();
  };

  const handleTokenTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setTokenType(event.target.value);
    setServiceUser("");
  };

  const handleServiceUserChange = (event: SelectChangeEvent<string>): void => {
    setServiceUser(event.target.value);
  };

  const isGenerateDisabled =
    !tokenName.trim() || (isAdmin && isServiceToken && !serviceUser);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate New Token</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Token Name */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
              Token Name{" "}
              <Box component="span" sx={{ color: "error.main" }}>
                *
              </Box>
            </Typography>
            <TextField
              autoFocus
              fullWidth
              placeholder="Enter a descriptive token name"
              value={tokenName}
              onChange={(e) => {
                setTokenName(e.target.value);
                if (tokenNameError) setTokenNameError("");
              }}
              error={!!tokenNameError}
              helperText={tokenNameError}
            />
          </Box>

          {/* Token Type (Admin only) */}
          {isAdmin && (
            <FormControl component="fieldset">
              <FormLabel component="legend">
                <Typography variant="body2" fontWeight="medium">
                  Token Type
                </Typography>
              </FormLabel>
              <RadioGroup
                row
                value={tokenType}
                onChange={handleTokenTypeChange}
              >
                <FormControlLabel
                  value={TOKEN_TYPES.USER}
                  control={<Radio size="small" />}
                  label="User Token"
                />
                <FormControlLabel
                  value={TOKEN_TYPES.SERVICE}
                  control={<Radio size="small" />}
                  label="Service Token"
                />
              </RadioGroup>
            </FormControl>
          )}

          {/* Service User Dropdown (Admin + Service Token) */}
          {isAdmin && isServiceToken && (
            <Box>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                Service User{" "}
                <Box component="span" sx={{ color: "error.main" }}>
                  *
                </Box>
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={serviceUser}
                  onChange={handleServiceUserChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select a service user
                  </MenuItem>
                  {serviceUsers.map((email) => (
                    <MenuItem key={email} value={email}>
                      {email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="text" color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
        >
          Generate Token
        </Button>
      </DialogActions>
    </Dialog>
  );
}