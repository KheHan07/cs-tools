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
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@wso2/oxygen-ui";
import { Copy, Eye, EyeOff } from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";

interface TokenSecretDialogProps {
  open: boolean;
  onClose: () => void;
  tokenName: string;
  tokenSecret: string;
}

/**
 * TokenSecretDialog component displays the generated token name and secret.
 *
 * @param {TokenSecretDialogProps} props - The props for the component.
 * @returns {JSX.Element} The TokenSecretDialog component.
 */
export default function TokenSecretDialog({
  open,
  onClose,
  tokenName,
  tokenSecret,
}: TokenSecretDialogProps): JSX.Element {
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, field: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleClose = (): void => {
    setShowSecret(false);
    setCopiedField(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Token Generated Successfully</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Please copy and save the token secret now. You won&apos;t be able to
            see it again after closing this dialog.
          </Typography>
        </Alert>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Token Name */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
              Token Name
            </Typography>
            <TextField
              fullWidth
              value={tokenName}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={copiedField === "name" ? "Copied!" : "Copy"}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(tokenName, "name")}
                      >
                        <Copy size={16} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Token Secret */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
              Token Secret
            </Typography>
            <TextField
              fullWidth
              type={showSecret ? "text" : "password"}
              value={tokenSecret}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showSecret ? "Hide" : "Show"}>
                      <IconButton
                        size="small"
                        onClick={() => setShowSecret((prev) => !prev)}
                      >
                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={copiedField === "secret" ? "Copied!" : "Copy"}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(tokenSecret, "secret")}
                      >
                        <Copy size={16} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
